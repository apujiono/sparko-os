// Cuaca Realtime dengan GPS
function initWeatherMonitor() {
  if (!window.userLocation) {
    document.getElementById('weather-status').innerHTML = '📍 Lokasi tidak tersedia';
    return;
  }
  
  fetchWeatherData();
  // Update cuaca setiap 30 menit
  setInterval(fetchWeatherData, 30 * 60 * 1000);
}

async function fetchWeatherData() {
  try {
    const { lat, lon } = window.userLocation;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    
    if (!response.ok) throw new Error('Gagal mengambil data cuaca');
    
    const data = await response.json();
    displayWeather(data.current_weather);
    
  } catch (error) {
    console.error('Weather Error:', error);
    document.getElementById('weather-status').innerHTML = 
      `⚠️ Cuaca tidak tersedia (${error.message})`;
  }
}

function displayWeather(weather) {
  const weatherElement = document.getElementById('weather-status');
  const temp = weather.temperature;
  const windspeed = weather.windspeed;
  const condition = getWeatherCondition(weather.weathercode);
  
  weatherElement.innerHTML = `
    <strong>Cuaca Lokal:</strong> ${condition}<br>
    <small>🌡️ ${temp}°C | 💨 ${windspeed} km/jam</small>
  `;
  
  // Warna berdasarkan kondisi cuaca
  if (temp > 30) {
    weatherElement.style.color = '#ffaa33';
  } else if (temp < 20) {
    weatherElement.style.color = '#00f3ff';
  } else {
    weatherElement.style.color = '#00d97e';
  }
}

function getWeatherCondition(code) {
  const conditions = {
    0: 'Cerah',
    1: 'Cerah Berawan',
    2: 'Berawan',
    3: 'Mendung',
    45: 'Berkabut',
    48: 'Berkabut Es',
    51: 'Hujan Ringan',
    53: 'Hujan Sedang',
    55: 'Hujan Lebat',
    61: 'Hujan Ringan',
    63: 'Hujan Sedang',
    65: 'Hujan Lebat',
    71: 'Salju Ringan',
    73: 'Salju Sedang',
    75: 'Salju Lebat',
    95: 'Badai Petir'
  };
  return conditions[code] || 'Tidak diketahui';
}