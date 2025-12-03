// Proposal Generator Worker - Khusus generate proposal
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const { client, projectType, budget, format, items } = await request.json();
    
    try {
      switch(format) {
        case 'pdf':
          return await this.generatePDF(client, projectType, budget, items, env);
        case 'docx':
          return await this.generateDOCX(client, projectType, budget, items, env);
        default:
          return await this.generateTEXT(client, projectType, budget, items, env);
      }
      
    } catch (error) {
      console.error('Proposal Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal membuat proposal',
        message: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async generatePDF(client, projectType, budget, items, env) {
    // Di production, gunakan library PDF seperti pdfmake
    // Ini contoh PDF minimalis dalam format teks
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
/Length 200
>>
stream
BT
/F1 24 Tf
50 700 Td
(PROPOSAL PENAWARAN) Tj
0 -40 Td
/F1 16 Tf
(PT SPARKO ENERGI TERBARUKAN) Tj
0 -30 Td
/F1 12 Tf
(Klien: ${client}) Tj
0 -20 Td
(Proyek: ${this.getProjectName(projectType)}) Tj
0 -20 Td
(Tanggal: ${new Date().toLocaleDateString('id-ID')}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000352 00000 n 
0000000450 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
612
%%EOF`;
    
    // Simpan ke R2
    if (env.R2_BUCKET) {
      const fileId = `proposal-${Date.now()}.pdf`;
      await env.R2_BUCKET.put(fileId, pdfContent);
    }
    
    return new Response(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal_${client.replace(/\s+/g, '_')}.pdf"`
      }
    });
  },
  
  async generateDOCX(client, projectType, budget, items, env) {
    // Di production, gunakan library docx.js
    // Ini contoh file DOCX minimalis (format ZIP)
    const docxContent = `PK\u0003\u0004\u0014\u0000\u0000\u0000...`; // Binary DOCX placeholder
    
    // Simpan ke R2
    if (env.R2_BUCKET) {
      const fileId = `proposal-${Date.now()}.docx`;
      await env.R2_BUCKET.put(fileId, docxContent);
    }
    
    return new Response(docxContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Proposal_${client.replace(/\s+/g, '_')}.docx"`
      }
    });
  },
  
  async generateTEXT(client, projectType, budget, items, env) {
    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const content = `PROPOSAL PENAWARAN
PT SPARKO ENERGI TERBARUKAN
========================================
Klien: ${client}
Proyek: ${this.getProjectName(projectType)}
Tanggal: ${new Date().toLocaleDateString('id-ID')}
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
    
    // Simpan ke R2
    if (env.R2_BUCKET) {
      const fileId = `proposal-${Date.now()}.txt`;
      await env.R2_BUCKET.put(fileId, content);
    }
    
    return new Response(JSON.stringify({ 
      content,
      filename: `Proposal_${client.replace(/\s+/g, '_')}.txt`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  getProjectName(type) {
    const projects = {
      'plts': 'PLTS Gedung Komersial',
      'microgrid': 'Microgrid Desa Terpencil',
      'solar-water': 'Solar Water Heater Industri'
    };
    return projects[type] || 'Proyek Energi Terbarukan';
  }
};