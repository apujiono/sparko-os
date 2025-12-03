// AI Core "Moriarty" - Analisis teks dan file
function initAIAnalysis() {
  document.getElementById('analyze-btn').addEventListener('click', async () => {
    const inputText = document.getElementById('ai-input').value.trim();
    const fileInput = document.getElementById('file-upload');
    
    if (!inputText && !fileInput.files.length) {
      showAIAlert('Masukkan teks atau upload file untuk analisis', 'warning');
      return;
    }
    
    const resultBox = document.getElementById('ai-result');
    resultBox.innerHTML = '<div class="loading">🧠 Moriarty sedang menganalisis...</div>';
    
    try {
      // Cek apakah ada file yang diupload
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        await analyzeFileWithAI(file, inputText || 'Analisis file teknis');
      } else {
        // Analisis teks saja
        const response = await fetch('/worker/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText })
        });
        
        const data = await response.json();
        displayAIResult(data.analysis);
      }
      
      // Reset input
      document.getElementById('ai-input').value = '';
      fileInput.value = '';
      
      // Simpan ke Quantum Memory
      saveToQuantumMemory({
        type: 'AI_ANALYSIS',
        content: inputText,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      resultBox.innerHTML = `<div class="ai-alert danger">❌ Error: ${error.message || 'Gagal menghubungi AI'}</div>`;
    }
  });
  
  // Setup drag & drop
  const dropzone = document.getElementById('dropzone');
  dropzone.addEventListener('click', () => document.getElementById('file-upload').click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#00f3ff';
    dropzone.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
    dropzone.style.backgroundColor = '';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    dropzone.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
      document.getElementById('file-upload').files = e.dataTransfer.files;
      showFilePreview(e.dataTransfer.files[0]);
    }
  });
}

async function analyzeFileWithAI(file, context) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context || 'Analisis file teknis untuk proyek energi terbarukan');
  
  const response = await fetch('/worker/analyze-file', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Gagal menganalisis file');
  
  const result = await response.json();
  displayAIResult(result.analysis || result.insights.join('\n\n'));
  
  // Tampilkan preview gambar jika file gambar
  if (file.type.startsWith('image/')) {
    showImagePreview(file);
  }
  
  return result;
}

function displayAIResult(result) {
  const resultBox = document.getElementById('ai-result');
  resultBox.innerHTML = `
    <div class="ai-alert">
      <strong>🔍 Hasil Analisis Moriarty:</strong>
      <p>${formatAsMarkdown(result)}</p>
    </div>
  `;
}

function showAIAlert(message, type = 'info') {
  const resultBox = document.getElementById('ai-result');
  resultBox.innerHTML = `<div class="ai-alert ${type}">${message}</div>`;
}

function formatAsMarkdown(text) {
  // Konversi markdown sederhana ke HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
    .replace(/_(.*?)_/g, '<em>$1</em>') // italic
    .replace(/\n{2,}/g, '<br><br>') // paragraph
    .replace(/•/g, '•'); // bullet points
}

function showFilePreview(file) {
  const preview = document.createElement('div');
  preview.className = 'file-preview';
  preview.innerHTML = `
    <p>📁 ${file.name} (${formatFileSize(file.size)})</p>
    <button class="remove-file" onclick="removeFile()">×</button>
  `;
  document.querySelector('.file-dropzone').appendChild(preview);
}

function showImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgPreview = document.createElement('div');
    imgPreview.className = 'image-preview';
    imgPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; margin-top: 15px; border-radius: 8px;">`;
    document.getElementById('ai-result').appendChild(imgPreview);
  };
  reader.readAsDataURL(file);
}

function removeFile() {
  document.getElementById('file-upload').value = '';
  document.querySelector('.file-preview')?.remove();
  document.querySelector('.image-preview')?.remove();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}