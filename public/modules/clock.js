// Jam Realtime dengan GPS
function initRealtimeClock() {
  updateClock();
  setInterval(updateClock, 1000);
  
  // Dapatkan lokasi untuk cuaca (hanya jika izin diberikan)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        initWeatherMonitor();
      },
      (error) => {
        console.warn('GPS tidak diizinkan:', error);
        // Gunakan lokasi default Jakarta
        window.userLocation = { lat: -6.2088, lon: 106.8456 };
        initWeatherMonitor();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    // Fallback jika browser tidak support GPS
    window.userLocation = { lat: -6.2088, lon: 106.8456 };
    initWeatherMonitor();
  }
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
  
  const dateString = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
  
  document.getElementById('realtime-clock').innerHTML = `
    <strong>Jakarta Time:</strong> ${timeString}<br>
    <small>${dateString}</small>
  `;
}

// Fungsi helper untuk cuaca
function kelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(1);
}