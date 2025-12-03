// Storage Worker - Khusus upload & manajemen file
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/worker/upload-file' && request.method === 'POST') {
      return await this.handleFileUpload(request, env);
    }
    
    if (path === '/worker/list-files' && request.method === 'GET') {
      return await this.listFiles(env);
    }
    
    if (path === '/worker/get-file' && request.method === 'GET') {
      return await this.getFile(url.searchParams.get('id'), env);
    }
    
    return new Response('Endpoint not found', { status: 404 });
  },
  
  async handleFileUpload(request, env) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const metadata = JSON.parse(formData.get('metadata') || '{}');
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate ID unik
      const fileId = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      // Simpan ke R2
      await env.R2_BUCKET.put(fileId, file.stream(), {
        httpMetadata: {
          contentType: file.type
        },
        customMetadata: {
          ...metadata,
          uploadDate: new Date().toISOString(),
          size: file.size.toString(),
          type: file.type
        }
      });
      
      // Analisis dengan AI jika file teknis
      let aiAnalysis = null;
      if (file.type.includes('image') || file.type.includes('pdf') || file.type.includes('word')) {
        try {
          aiAnalysis = await this.analyzeWithAI(file, metadata.context || 'File teknis umum', env.QWEN_API_KEY);
          
          // Simpan hasil analisis
          await env.R2_BUCKET.put(`${fileId}_analysis.json`, JSON.stringify({
            analysis: aiAnalysis,
            timestamp: new Date().toISOString()
          }));
        } catch (aiError) {
          console.warn('AI Analysis skipped:', aiError.message);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        id: fileId,
        url: `/worker/get-file?id=${fileId}`,
        size: file.size,
        type: file.type,
        aiAnalysis
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('File Upload Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal mengupload file',
        message: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async listFiles(env) {
    try {
      const fileList = await env.R2_BUCKET.list();
      return new Response(JSON.stringify({
        files: fileList.objects.map(obj => ({
          id: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          metadata: obj.customMetadata
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('List Files Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Gagal mengambil daftar file',
        message: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  async getFile(fileId, env) {
    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }
    
    try {
      const object = await env.R2_BUCKET.get(fileId);
      if (!object) {
        return new Response('File not found', { status: 404 });
      }
      
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      
      return new Response(object.body, {
        headers
      });
    } catch (error) {
      console.error('Get File Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
  
  async analyzeWithAI(file, context, apiKey) {
    // Simulasi analisis AI
    return {
      insights: [
        `File terdeteksi sebagai ${file.type.includes('image') ? 'gambar site survey' : 'dokumen teknis'}`,
        `Konteks analisis: ${context}`,
        `Rekomendasi: Perlu verifikasi lebih lanjut oleh tim teknis`
      ],
      recommendation: `🔍 REKOMENDASI OTOMATIS: Lanjutkan proses dengan analisis manual oleh engineer senior.`,
      confidence: '85%'
    };
  }
};