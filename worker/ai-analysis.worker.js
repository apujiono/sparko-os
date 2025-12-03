// AI Analysis Worker - Khusus analisis file & gambar
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/worker/ai-analysis') {
      return await this.handleFileAnalysis(request, env);
    }
    
    return new Response('Endpoint not found', { status: 404 });
  },
  
  async handleFileAnalysis(request, env) {
    try {
      const contentType = request.headers.get('Content-Type') || '';
      let file, context;
      
      if (contentType.includes('multipart/form-data')) {
        // Handle form upload
        const formData = await request.formData();
        file = formData.get('file');
        context = formData.get('context') || 'Analisis teknis umum';
      } else {
        // Handle JSON payload
        const { base64File, filename, context: ctx } = await request.json();
        const buffer = Buffer.from(base64File, 'base64');
        file = new File([buffer], filename, { type: 'application/octet-stream' });
        context = ctx || 'Analisis teknis umum';
      }
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Analisis berdasarkan tipe file
      let analysisResult;
      
      if (file.type.startsWith('image/')) {
        analysisResult = await this.analyzeImage(file, context, env.QWEN_API_KEY);
      } else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('excel')) {
        analysisResult = await this.analyzeDocument(file, context, env.QWEN_API_KEY);
      } else {
        analysisResult = await this.analyzeGeneralFile(file, context, env.QWEN_API_KEY);
      }
      
      // Simpan ke Quantum Memory
      if (env.R2_BUCKET) {
        const memoryId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await env.R2_BUCKET.put(memoryId, JSON.stringify({
          type: 'FILE_ANALYSIS',
          filename: file.name,
          size: file.size,
          context,
          analysis: analysisResult,
          timestamp: new Date().toISOString()
        }));
      }
      
      return new Response(JSON.stringify({
        ...analysisResult,
        filename: file.name,
        size: file.size,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('AI Analysis Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal menganalisis file',
        message: error.message,
        stack: env.DEBUG_MODE ? error.stack : undefined
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async analyzeImage(file, context, apiKey) {
    // Simulasi analisis gambar (di production gunakan Qwen Vision API)
    return {
      insights: [
        `Kualitas gambar: ${file.size > 1000000 ? 'TINGGI' : 'CUKUP'}`,
        `Kondisi lokasi: SESUAI untuk instalasi PLTS`,
        `Potensi bayangan: MINIMAL (estimasi 10-15%)`
      ],
      recommendation: `✅ REKOMENDASI MORIARTY: Proyek layak dilanjutkan. Estimasi kapasitas: 40kW dengan ROI 2.1 tahun.`,
      visualization: 'https://i.imgur.com/sparko-analysis-visual.png' // URL visualisasi simulasi
    };
  },
  
  async analyzeDocument(file, context, apiKey) {
    // Simulasi analisis dokumen
    return {
      insights: [
        `Dokumen mengandung RAB proyek PLTS`,
        `Total anggaran: Rp ${Math.floor(Math.random() * 1000000000) + 500000000}`,
        `Margin terdeteksi: ${Math.floor(Math.random() * 15) + 20}%`
      ],
      recommendation: `💡 REKOMENDASI MORIARTY: Proposal kompetitif. Saran: tambahkan jaminan kinerja 10 tahun untuk tingkatkan nilai jual.`,
    };
  },
  
  async analyzeGeneralFile(file, context, apiKey) {
    // Simulasi analisis file umum
    return {
      insights: [
        `Tipe file: ${file.type || 'tidak dikenali'}`,
        `Ukuran file: ${formatFileSize(file.size)}`,
        `Konteks analisis: ${context}`
      ],
      recommendation: `🔍 REKOMENDASI MORIARTY: File memerlukan verifikasi manual oleh tim teknis.`,
    };
  }
};

// Helper function
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}