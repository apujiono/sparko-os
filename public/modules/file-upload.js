// File Upload Management
function initFileUpload() {
  const fileInput = document.getElementById('file-upload');
  if (!fileInput) return;
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      showFilePreview(e.target.files[0]);
    }
  });
  
  // Tambahkan event listener untuk form proposal
  document.getElementById('generate-proposal')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await generateProposal();
  });
}

async function generateProposal() {
  const client = document.getElementById('client-name').value.trim();
  const projectType = document.getElementById('project-type').value;
  const budget = parseFloat(document.getElementById('project-budget').value) || 0;
  const format = document.querySelector('input[name="format"]:checked').value;
  
  if (!client) {
    showAIAlert('Nama klien wajib diisi', 'warning');
    return;
  }
  
  const resultBox = document.getElementById('proposal-preview');
  resultBox.innerHTML = '<div class="loading">📝 Sedang membuat proposal...</div>';
  
  try {
    // Data proposal contoh (sesuaikan dengan bisnis Anda)
    const proposalData = {
      client,
      project: getProjectName(projectType),
      date: new Date().toLocaleDateString('id-ID'),
      items: getProjectItems(projectType),
      budget,
      format
    };
    
    const response = await fetch('/worker/generate-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    });
    
    if (format === 'pdf') {
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposal_${client.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      resultBox.innerHTML = `<div class="ai-alert success">✅ Proposal PDF berhasil dibuat dan diunduh!</div>`;
    } else {
      // Tampilkan hasil di browser
      const result = format === 'text' ? await response.text() : await response.json();
      displayProposalResult(result, format);
    }
    
    // Simpan ke Quantum Memory
    saveToQuantumMemory({
      type: 'PROPOSAL',
      client,
      project: getProjectName(projectType),
      budget,
      format,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Proposal Error:', error);
    resultBox.innerHTML = `<div class="ai-alert danger">❌ Gagal membuat proposal: ${error.message}</div>`;
  }
}

function getProjectName(type) {
  const projects = {
    'plts': 'PLTS Gedung Komersial',
    'microgrid': 'Microgrid Desa Terpencil',
    'solar-water': 'Solar Water Heater Industri'
  };
  return projects[type] || 'Proyek Energi Terbarukan';
}

function getProjectItems(type) {
  switch(type) {
    case 'plts':
      return [
        { name: 'Panel Surya Monocrystalline 550W', qty: 20, price: 2200000 },
        { name: 'Inverter Hybrid 10kW', qty: 2, price: 25000000 },
        { name: 'Struktur Mounting Atap', qty: 1, price: 15000000 }
      ];
    case 'microgrid':
      return [
        { name: 'Panel Surya Polycrystalline 400W', qty: 50, price: 1450000 },
        { name: 'Baterai LiFePO4 10kWh', qty: 5, price: 35000000 },
        { name: 'Charge Controller 100A', qty: 4, price: 8500000 }
      ];
    case 'solar-water':
      return [
        { name: 'Collector Panel Surya 2m²', qty: 15, price: 3500000 },
        { name: 'Tangki Penyimpanan 1000L', qty: 2, price: 12000000 },
        { name: 'Pompa Sirkulasi', qty: 1, price: 4500000 }
      ];
    default:
      return [];
  }
}

function displayProposalResult(result, format) {
  const resultBox = document.getElementById('proposal-preview');
  
  if (format === 'text') {
    resultBox.innerHTML = `<pre style="white-space: pre-wrap; line-height: 1.5;">${result}</pre>`;
  } else {
    // Format DOCX atau JSON
    resultBox.innerHTML = `
      <div class="ai-alert">
        <strong>📄 Proposal (${format.toUpperCase()})</strong>
        <pre style="white-space: pre-wrap; line-height: 1.5; margin-top: 10px;">${JSON.stringify(result, null, 2)}</pre>
        <button onclick="downloadProposal('${format}', ${JSON.stringify(result)})" style="margin-top: 15px;">
          💾 Download ${format.toUpperCase()}
        </button>
      </div>
    `;
  }
}

function downloadProposal(format, data) {
  let content, filename, mimeType;
  
  if (format === 'text') {
    content = JSON.stringify(data, null, 2);
    filename = `proposal_${Date.now()}.txt`;
    mimeType = 'text/plain';
  } else {
    content = JSON.stringify(data, null, 2);
    filename = `proposal_${Date.now()}.${format}`;
    mimeType = format === 'docx' ? 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
      'application/json';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
}