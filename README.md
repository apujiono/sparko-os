# SPARKO OS - Quantum Dashboard

Sistem operasi bisnis untuk energi terbarukan dengan AI Core "Moriarty".  
**Bisa di-deploy dalam 10 menit tanpa install software apapun.**

## 🚀 Cara Deployment (100% Browser-Based)

### Prasyarat:
- Akun [Cloudflare](https://dash.cloudflare.com/sign-up) (gratis)
- Akun [DashScope](https://dashscope.console.aliyun.com/) untuk Qwen API (gratis)
- Akun [GitHub](https://github.com) (gratis)

### Langkah 1: Setup Cloudflare
1. Buat **D1 Database**:
   - Buka [Cloudflare D1 Dashboard](https://dash.cloudflare.com/?to=/:account/d1)
   - Klik "Create database"
   - Nama: `SPARKO_DB`
   - Salin **Database ID** dan masukkan ke `wrangler.toml`

2. Buat **R2 Bucket**:
   - Buka [Cloudflare R2 Dashboard](https://dash.cloudflare.com/?to=/:account/r2)
   - Klik "Create bucket"
   - Nama: `sparko-archive`

3. Dapatkan **Qwen API Key**:
   - Buka [DashScope Console](https://dashscope.console.aliyun.com/)
   - API Key → Create Key
   - Salin key dan masukkan ke `wrangler.toml` di bagian `QWEN_API_KEY`

### Langkah 2: Deploy via GitHub
1. Fork repo ini ke akun GitHub Anda
2. Buka [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
3. Klik "Create project" → Hubungkan repo GitHub Anda
4. Konfigurasi:
   - Framework preset: **None**
   - Build command: **kosongkan**
   - Output directory: `public`
5. Klik "Save and Deploy"

### Langkah 3: Setup Worker
1. Buka [Cloudflare Workers Dashboard](https://dash.cloudflare.com/?to=/:account/workers)
2. Klik "Create application" → "Hello World worker"
3. Hapus kode default, paste kode dari `worker/sparko-core.worker.js`
4. Di tab "Settings" → "Variables":
   - Tambahkan Environment Variables sesuai `wrangler.toml`
   - Setup D1 Database binding (pilih `SPARKO_DB`)
   - Setup R2 Bucket binding (pilih `sparko-archive`)
5. Klik "Save and Deploy"

### Langkah 4: Test Sistem
1. Buka URL Pages yang di-generate (misal: `https://sparko-os.pages.dev`)
2. Test fitur:
   - Upload foto site survey → dapat analisis AI
   - Generate proposal untuk klien contoh
   - Cek Quantum Memory untuk arsip

## 💻 Requirements Hardware
- **Minimal**: Laptop/HP dengan RAM 2GB
- **Browser**: Chrome/Firefox terbaru
- **Koneksi Internet**: 5 Mbps untuk upload file

## 🌐 Teknologi yang Digunakan
- **Frontend**: Vanilla JS + CSS (tanpa framework)
- **Backend**: Cloudflare Workers (Edge Functions)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Object Storage)
- **AI**: Qwen API (DashScope)
- **Cuaca**: Open-Meteo API (gratis)

## 💰 Estimasi Biaya
| Layanan | Gratis | Premium |
|---------|--------|---------|
| Cloudflare Pages | 100% | - |
| Cloudflare Workers | 100k req/hari | $5/bulan |
| Cloudflare D1 | 1 GB storage | $0.15/GB |
| Cloudflare R2 | 10 GB storage | $0.015/GB |
| Qwen API | 1 juta token/bulan | $0.0005/1k token |

**Total biaya bulan pertama: Rp 0,-** (selama di bawah kuota gratis)

## 🆘 Troubleshooting
- **Error CORS**: Pastikan semua Worker endpoint memiliki CORS headers
- **File tidak terupload**: Periksa binding R2 Bucket di Worker settings
- **AI tidak merespons**: Pastikan Qwen API Key valid dan memiliki kuota
- **Jam tidak update**: Izinkan akses lokasi di browser

## 📞 Support
Untuk bantuan deployment:
- Telegram: @sparko_support
- Email: support@sparko-os.dev

**SPARKO OS v3.1 - Quantum Ready**