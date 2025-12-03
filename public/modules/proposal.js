// Proposal Generator dengan Pilihan Format
function initProposalGenerator() {
  if (!document.getElementById('proposal-module')) return;
  
  document.getElementById('generate-proposal').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const client = document.getElementById('client-name').value.trim();
    const projectType = document.getElementById('project-type').value;
    const budget = parseFloat(document.getElementById('project-budget').value) || 0;
    const format = document.querySelector('input[name="proposal-format"]:checked').value;
    
    if (!client) {
      showAIAlert('Nama klien wajib diisi', 'warning');
      return;
    }
    
    const resultBox = document.getElementById('proposal-result');
    resultBox.innerHTML = `<div class="loading">📝 Membuat proposal ${format.toUpperCase()}...</div>`;
    
    try {
      const response = await fetch('/worker/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          projectType,
          budget,
          format,
          items: getProjectItems(projectType)
        })
      });
      
      if (format === 'pdf') {
        // Handle PDF download
        const blob = await response.blob();
        downloadBlob(blob, `Proposal_${client}_${Date.now()}.pdf`, 'application/pdf');
      } else if (format === 'docx') {
        const blob = await response.blob();
        downloadBlob(blob, `Proposal_${client}_${Date.now()}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        const result = await response.json();
        displayProposalResult(result, format);
      }
      
      // Simpan ke Quantum Memory
      saveToQuantumMemory({
        type: 'PROPOSAL',
        client,
        projectType,
        budget,
        format,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Proposal Error:', error);
      resultBox.innerHTML = `<div class="ai-alert danger">❌ Gagal membuat proposal: ${error.message}</div>`;
    }
  });
}

function downloadBlob(blob, filename, mimeType) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  document.getElementById('proposal-result').innerHTML = `
    <div class="ai-alert success">
      ✅ Proposal ${filename.split('.').pop().toUpperCase()} berhasil dibuat!<br>
      <button onclick="location.reload()">Buat Proposal Baru</button>
    </div>
  `;
}

function displayProposalResult(result, format) {
  const resultBox = document.getElementById('proposal-result');
  
  let content = '';
  if (format === 'text') {
    content = `<pre style="white-space: pre-wrap; line-height: 1.5;">${result.content}</pre>`;
  } else {
    content = `<code style="display: block; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-top: 10px;">${JSON.stringify(result, null, 2)}</code>`;
  }
  
  resultBox.innerHTML = `
    <div class="ai-alert">
      <h3>📄 Proposal (${format.toUpperCase()})</h3>
      ${content}
      <button onclick="downloadTextProposal(${JSON.stringify(result.content)})" style="margin-top: 15px;">
        💾 Download ${format.toUpperCase()}
      </button>
    </div>
  `;
}

function downloadTextProposal(content) {
  const blob = new Blob([content], { type: 'text/plain' });
  downloadBlob(blob, `Proposal_${Date.now()}.txt`, 'text/plain');
}

function getProjectItems(projectType) {
  const items = {
    'plts': [
      { name: 'Panel Surya Monocrystalline 550W', qty: 20, price: 2200000 },
      { name: 'Inverter Hybrid 10kW', qty: 2, price: 25000000 },
      { name: 'Struktur Mounting Atap', qty: 1, price: 15000000 }
    ],
    'microgrid': [
      { name: 'Panel Surya Polycrystalline 400W', qty: 50, price: 1450000 },
      { name: 'Baterai LiFePO4 10kWh', qty: 5, price: 35000000 },
      { name: 'Charge Controller 100A', qty: 4, price: 8500000 }
    ],
    'solar-water': [
      { name: 'Collector Panel Surya 2m²', qty: 15, price: 3500000 },
      { name: 'Tangki Penyimpanan 1000L', qty: 2, price: 12000000 },
      { name: 'Pompa Sirkulasi', qty: 1, price: 4500000 }
    ]
  };
  return items[projectType] || items['plts'];
}