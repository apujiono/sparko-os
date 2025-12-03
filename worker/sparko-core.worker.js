// SPARKO OS - Core Worker Router
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS Headers untuk semua endpoint
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Preflight request handling
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Routing endpoint
      if (path === '/worker/analyze-text') {
        return await handleTextAnalysis(request, env);
      } 
      
      if (path === '/worker/analyze-file') {
        return await handleFileAnalysis(request, env);
      }
      
      if (path === '/worker/generate-proposal') {
        return await handleProposalGeneration(request, env);
      }
      
      if (path === '/worker/get-memory') {
        return await handleGetMemory(request, env);
      }
      
      if (path === '/worker/save-memory') {
        return await handleSaveMemory(request, env);
      }
      
      // Endpoint default
      return new Response(JSON.stringify({ 
        message: 'SPARKO OS Worker Active',
        endpoints: [
          '/worker/analyze-text',
          '/worker/analyze-file',
          '/worker/generate-proposal',
          '/worker/get-memory',
          '/worker/save-memory'
        ]
      }), {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      });
      
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error.message 
      }), {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      });
    }
  },
  
  // Handler untuk analisis teks
  async handleTextAnalysis(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const { text } = await request.json();
    
    if (!text || text.length < 5) {
      return new Response(JSON.stringify({ 
        error: 'Input teks minimal 5 karakter' 
      }), { status: 400 });
    }
    
    try {
      // Gunakan Qwen API untuk analisis
      const analysis = await this.callQwenAPI(
        `Anda adalah MORIARTY, AI analisis bisnis untuk energi terbarukan. Analisis teks berikut untuk potensi risiko dan peluang:\n\n${text}`,
        env.QWEN_API_KEY
      );
      
      return new Response(JSON.stringify({ 
        analysis,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Qwen API Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal menghubungi AI', 
        message: error.message 
      }), { status: 500 });
    }
  },
  
  // Handler untuk analisis file
  async handleFileAnalysis(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const context = formData.get('context') || 'Analisis file teknis';
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), { status: 400 });
    }
    
    try {
      // Untuk gambar, lakukan analisis visual
      if (file.type.startsWith('image/')) {
        const analysis = await this.analyzeImage(file, context, env.QWEN_API_KEY);
        return new Response(JSON.stringify(analysis), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Untuk dokumen, ekstrak teks dulu
      let fileText = '';
      if (file.type.includes('pdf') || file.type.includes('word')) {
        fileText = 'Dokumen teknis terdeteksi - analisis konten...'; // Di production, gunakan library PDF.js
      } else {
        const arrayBuffer = await file.arrayBuffer();
        fileText = new TextDecoder().decode(arrayBuffer).slice(0, 1000); // Ambil 1000 karakter pertama
      }
      
      const analysis = await this.callQwenAPI(
        `Anda adalah MORIARTY. Analisis file teknis ini dengan konteks: ${context}\n\nKonten file (sebagian):\n${fileText}`,
        env.QWEN_API_KEY
      );
      
      return new Response(JSON.stringify({ 
        analysis,
        filename: file.name,
        type: file.type,
        size: file.size
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('File Analysis Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal menganalisis file', 
        message: error.message 
      }), { status: 500 });
    }
  },
  
  // Handler untuk generate proposal
  async handleProposalGeneration(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const data = await request.json();
    const { format = 'pdf' } = data;
    
    try {
      let content;
      
      if (format === 'pdf') {
        // Generate PDF binary
        content = await this.generatePDFProposal(data);
        return new Response(content, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Proposal_${data.client}_${Date.now()}.pdf"`
          }
        });
      } 
      
      // Format text atau JSON
      content = this.generateTextProposal(data);
      
      return new Response(
        format === 'text' ? content : JSON.stringify(content, null, 2),
        {
          headers: {
            'Content-Type': format === 'text' ? 'text/plain' : 'application/json',
            'Content-Disposition': `attachment; filename="Proposal_${data.client}_${Date.now()}.${format}"`
          }
        }
      );
      
    } catch (error) {
      console.error('Proposal Generation Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal membuat proposal', 
        message: error.message 
      }), { status: 500 });
    }
  },
  
  // Handler untuk Quantum Memory
  async handleGetMemory(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const { search = '' } = await request.json();
    
    try {
      // Di production, ambil dari D1 database
      const mockData = [
        {
          id: 'prop-001',
          type: 'PROPOSAL',
          client: 'PT Maju Bersama',
          project: 'PLTS 50kW',
          budget: 650000000,
          timestamp: new Date(Date.now() - 86400000).toISOString() // Kemarin
        },
        {
          id: 'file-002',
          type: 'FILE_UPLOAD',
          filename: 'site_survey.jpg',
          analysis: 'Atap beton dengan bayangan minimal',
          size: 2450000,
          timestamp: new Date().toISOString()
        }
      ];
      
      // Filter berdasarkan pencarian
      const filtered = mockData.filter(item => 
        item.client?.toLowerCase().includes(search) ||
        item.project?.toLowerCase().includes(search) ||
        item.filename?.toLowerCase().includes(search)
      );
      
      return new Response(JSON.stringify({ 
        items: filtered,
        lastBackup: new Date(Date.now() - 3600000).toISOString() // 1 jam lalu
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Memory Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal memuat memori', 
        message: error.message 
      }), { status: 500 });
    }
  },
  
  // Handler untuk simpan ke memory
  async handleSaveMemory(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const data = await request.json();
    
    try {
      // Di production, simpan ke D1 database
      console.log('Menyimpan ke Quantum Memory:', data);
      
      // Simpan juga ke R2 untuk backup
      if (env.R2_BUCKET) {
        const memoryId = `memory-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await env.R2_BUCKET.put(memoryId, JSON.stringify({
          ...data,
          savedAt: new Date().toISOString()
        }));
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        id: `memory-${Date.now()}`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Save Memory Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal menyimpan ke memori', 
        message: error.message 
      }), { status: 500 });
    }
  },
  
  // Fungsi helper: Panggil Qwen API
  async callQwenAPI(prompt, apiKey) {
    if (!apiKey) {
      return `⚠️ Qwen API key tidak dikonfigurasi. Hasil simulasi:\n\nAnalisis untuk: "${prompt.substring(0, 50)}..."\n\n✅ Rekomendasi Moriarty:\n- Margin proyek ini aman di 25%\n- Timeline realistis dengan 3 tim teknis\n- Risiko cuaca rendah untuk lokasi ini`;
    }
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'system', content: 'Anda adalah MORIARTY, AI analisis bisnis energi terbarukan yang sangat detail dan kritis.' },
            { role: 'user', content: prompt }
          ]
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Qwen API error: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.output.choices[0].message.content;
  },
  
  // Fungsi helper: Analisis gambar dengan Qwen Vision
  async analyzeImage(file, context, apiKey) {
    // Di production, konversi gambar ke base64 dan kirim ke Qwen Vision API
    // Untuk demo, kembalikan hasil simulasi
    return {
      insights: [
        `Kondisi atap: AMAN untuk instalasi PLTS`,
        `Area bayangan: MINIMAL (hanya 15% dari total area)`,
        `Akses instalasi: MUDAH dengan tangga standar`
      ],
      recommendation: `✅ REKOMENDASI MORIARTY: Proyek layak dilanjutkan. Estimasi kapasitas: 35kW dengan ROI 2.3 tahun.`,
      filename: file.name,
      type: file.type,
      size: file.size
    };
  },
  
  // Fungsi helper: Generate PDF proposal (simulasi)
  async generatePDFProposal(data) {
    // Di production, gunakan library PDF seperti pdfmake
    // Untuk demo, kembalikan PDF dummy
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 100
>>
stream
BT
/F1 24 Tf
50 700 Td
(PROPOSAL PENAWARAN) Tj
0 -40 Td
/F1 14 Tf
(PT SPARKO ENERGI TERBARUKAN) Tj
0 -30 Td
(Nama Klien: ${data.client}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000210 00000 n 
0000000282 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
432
%%EOF`;

    return new Uint8Array([...pdfContent].map(c => c.charCodeAt(0)));
  },
  
  // Fungsi helper: Generate text proposal
  generateTextProposal(data) {
    const items = data.items || [];
    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    
    return `PROPOSAL PENAWARAN
PT SPARKO ENERGI TERBARUKAN
========================================
Klien: ${data.client}
Proyek: ${data.project}
Tanggal: ${data.date || new Date().toLocaleDateString('id-ID')}
----------------------------------------
Item yang ditawarkan:
${items.map(item => 
  `- ${item.name} x${item.qty} @ Rp ${item.price.toLocaleString('id')} = Rp ${(item.qty * item.price).toLocaleString('id')}`
).join('\n')}
----------------------------------------
TOTAL INVESTASI: Rp ${total.toLocaleString('id')}
ESTIMASI ROI: ${Math.round((total / (total * 0.25)) * 12)} bulan
MARGIN: 25%

Hormat kami,
Tim SPARKO OS
`;
  }
};