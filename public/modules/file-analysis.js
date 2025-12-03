// Analisis file dengan AI Core
function initFileAnalysis() {
  if (!document.getElementById('file-analysis-module')) return;
  
  document.getElementById('analyze-file-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('analysis-file');
    if (!fileInput.files.length) {
      showAIAlert('Pilih file terlebih dahulu', 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    const context = document.getElementById('analysis-context').value || 'Analisis teknis umum';
    const resultBox = document.getElementById('file-analysis-result');
    
    resultBox.innerHTML = '<div class="loading">🧠 Moriarty sedang menganalisis file...</div>';
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);
      
      const response = await fetch('/worker/ai-analysis', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Gagal menganalisis file');
      
      const result = await response.json();
      displayFileAnalysisResult(result);
      
      // Simpan ke Quantum Memory
      saveToQuantumMemory({
        type: 'FILE_ANALYSIS',
        filename: file.name,
        context,
        insights: result.insights,
        recommendation: result.recommendation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('File Analysis Error:', error);
      resultBox.innerHTML = `<div class="ai-alert danger">❌ ${error.message}</div>`;
    }
  });
  
  // Preview gambar
  document.getElementById('analysis-file').addEventListener('change', (e) => {
    if (e.target.files.length && e.target.files[0].type.startsWith('image/')) {
      showImagePreview(e.target.files[0], 'file-analysis-preview');
    }
  });
}

function displayFileAnalysisResult(result) {
  const resultBox = document.getElementById('file-analysis-result');
  
  resultBox.innerHTML = `
    <div class="ai-alert">
      <h3>🔍 Hasil Analisis File</h3>
      <p><strong>Nama File:</strong> ${result.filename}</p>
      <p><strong>Ukuran:</strong> ${formatFileSize(result.size)}</p>
      
      <h4>💡 Insight Utama:</h4>
      <ul>
        ${result.insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
      
      <div class="recommendation">
        <strong>🚀 Rekomendasi Moriarty:</strong>
        <p>${result.recommendation}</p>
      </div>
      
      ${result.visualization ? 
        `<div class="visualization">
          <img src="${result.visualization}" alt="Visualisasi Analisis" style="max-width: 100%; border-radius: 8px; margin-top: 15px;">
        </div>` : ''
      }
    </div>
  `;
}

function showImagePreview(file, containerId) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const container = document.getElementById(containerId);
    container.innerHTML = ``
    container.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
  };
  reader.readAsDataURL(file);
}