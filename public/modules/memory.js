// Quantum Memory Management
function loadQuantumMemory() {
  fetchMemoryData();
  
  document.getElementById('refresh-memory')?.addEventListener('click', fetchMemoryData);
  document.getElementById('memory-search')?.addEventListener('input', fetchMemoryData);
}

async function fetchMemoryData() {
  const searchQuery = document.getElementById('memory-search')?.value.toLowerCase() || '';
  const memoryList = document.getElementById('memory-list');
  
  try {
    const response = await fetch('/worker/get-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: searchQuery })
    });
    
    const data = await response.json();
    
    if (data.error) {
      memoryList.innerHTML = `<div class="ai-alert warning">${data.error}</div>`;
      return;
    }
    
    displayMemoryItems(data.items);
    
    // Update last backup time
    if (data.lastBackup) {
      document.getElementById('last-backup').textContent = 
        new Date(data.lastBackup).toLocaleString('id-ID');
    }
    
  } catch (error) {
    console.error('Memory Error:', error);
    memoryList.innerHTML = `<div class="ai-alert danger">❌ Gagal memuat Quantum Memory: ${error.message}</div>`;
  }
}

function displayMemoryItems(items) {
  const memoryList = document.getElementById('memory-list');
  
  if (items.length === 0) {
    memoryList.innerHTML = '<p class="no-data">Tidak ada data di Quantum Memory</p>';
    return;
  }
  
  memoryList.innerHTML = items.map(item => {
    const timestamp = new Date(item.timestamp || item.uploaded_at);
    return `
      <div class="memory-item">
        <h4>${getTypeIcon(item.type)} ${item.client || item.filename || 'Arsip'}</h4>
        <p>${item.project || item.analysis || item.filename}</p>
        <div class="memory-meta">
          <span>💾 ${item.size ? formatFileSize(item.size) : ''}</span>
          <span>🕒 ${timestamp.toLocaleDateString('id-ID')} ${timestamp.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <button class="view-btn" onclick="viewMemoryItem('${item.id}')">Lihat Detail</button>
      </div>
    `;
  }).join('');
}

function getTypeIcon(type) {
  const icons = {
    'PROPOSAL': '📄',
    'FILE_UPLOAD': '📁',
    'AI_ANALYSIS': '🧠',
    'PLTS_CALCULATION': '☀️'
  };
  return icons[type] || '💾';
}

function viewMemoryItem(id) {
  // Implementasi untuk melihat detail item
  showAIAlert(`Membuka detail arsip: ${id}`, 'info');
  
  // Di production, ini akan fetch detail dari Worker
  setTimeout(() => {
    showAIAlert(`Detail arsip ${id} akan ditampilkan dalam versi lengkap`, 'success');
  }, 500);
}

function saveToQuantumMemory(data) {
  // Simpan ke memory (akan diproses oleh Worker)
  fetch('/worker/save-memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(console.error);
}