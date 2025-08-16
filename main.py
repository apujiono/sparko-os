# main.py
# 🔥 SPARKO-OS v51.4 - SISTEM MANAJEMEN PROYEK (SIAP DEPLOY)
# ✅ Login, Dashboard, Proposal PDF, AI, Chat, Absensi, Gaji
# ✅ Jalan di Railway.app
# "Satu Percikan, Jutaan Energi" - SPARKO Team

import os
import json
import threading
import datetime
from flask import Flask, render_template_string, request, session, send_file, redirect, url_for
from fpdf import FPDF

app = Flask(__name__)
app.secret_key = "sparko_super_secret_2025"

# =============== 1. DATA TIM SPARKO ===============
tim_sparko = [
    {"nama": "Agung", "jabatan": "Founder/Teknisi PLTS", "pengalaman": 2, "tarif": 250000},
    {"nama": "Julian", "jabatan": "Koordinator", "pengalaman": 7, "tarif": 300000},
    {"nama": "Rifqi", "jabatan": "Teknisi PLTS", "pengalaman": 2, "tarif": 250000},
    {"nama": "Sadewa", "jabatan": "Teknisi PLTS", "pengalaman": 3, "tarif": 250000},
    {"nama": "Irvan", "jabatan": "Teknisi PLTS", "pengalaman": 2, "tarif": 250000},
    {"nama": "Reno", "jabatan": "Helper", "pengalaman": 1, "tarif": 200000},
    {"nama": "Alhela", "jabatan": "Helper", "pengalaman": 1, "tarif": 200000},
    {"nama": "Fajar", "jabatan": "Helper", "pengalaman": 0.2, "tarif": 200000},
]

# =============== 2. DATABASE FILES ===============
PROYEK_DB = "proyek_sparko.json"
MATERIAL_DB = "material_sparko.json"
ABSENSI_DB = "absensi_sparko.json"
KLIEN_DB = "klien_sparko.json"
CHAT_DB = "chat_sparko.json"
CUTI_DB = "cuti_sparko.json"
USER_DB = "user_sparko.json"

# Buat file database jika belum ada
for file in [PROYEK_DB, MATERIAL_DB, ABSENSI_DB, KLIEN_DB, CHAT_DB, CUTI_DB, USER_DB]:
    if not os.path.exists(file):
        with open(file, "w") as f:
            if file == USER_DB:
                json.dump({"admin": {"password": "sparko2025", "role": "admin"}}, f, indent=2)
            else:
                json.dump([], f, indent=2)

# =============== 3. FUNGSI SIMPAN & MUAT ===============
def simpan_data(file, data):
    with open(file, "r+") as f:
        db = json.load(f)
        db.append(data)
        f.seek(0)
        json.dump(db, f, indent=2)

def muat_data(file):
    with open(file, "r") as f:
        return json.load(f)

def simpan_user(data):
    with open(USER_DB, "r+") as f:
        db = json.load(f)
        db.update(data)
        f.seek(0)
        json.dump(db, f, indent=2)

def cek_user(username):
    users = muat_data(USER_DB)
    return users.get(username)

# =============== 4. AI PREDIKSI PROFIT (DIPERKUAT) ===============
def prediksi_profit(kwp, medan):
    db = muat_data(PROYEK_DB)
    if not db:
        faktor = {"mudah": 1, "sedang": 1.1, "sulit": 1.4}[medan]
        return int(kwp * 10_000_000 * faktor * 0.3)
    else:
        total_profit = sum(p['profit'] for p in db)
        avg_profit_per_kwp = total_profit / sum(p['kwp'] for p in db)
        return int(kwp * avg_profit_per_kwp * (1.1 if medan=="sedang" else 0.9 if medan=="mudah" else 1.4))

# =============== 5. TEMPLATE HTML ===============
HTML = '''
<!DOCTYPE html>
<html>
<head>
    <title>SPARKO-OS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI'; margin:0; background:#001f3f; color:#fff; }
        .container { max-width:1200px; margin:auto; padding:20px; }
        header { text-align:center; color:#FFD700; }
        h2 { color:#0074D9; border-bottom:2px solid #FFD700; }
        table { width:100%; border-collapse:collapse; margin:15px 0; }
        th, td { padding:12px; text-align:left; border:1px solid #0074D9; }
        th { background:#0074D9; }
        .btn { background:#FFD700; color:black; border:none; padding:10px 20px; margin:5px;
               cursor:pointer; border-radius:5px; font-weight:bold; }
        .card { background:#003366; border:1px solid #0074D9; padding:15px; margin:10px 0; border-radius:10px; }
        .metric { font-size:1.3em; font-weight:bold; color:#FFD700; }
        input, select { padding:8px; width:100%; }
        .progress-bar {
            width: 100%; background: #ddd; border-radius: 5px; overflow: hidden; height: 20px;
        }
        .progress-fill {
            height: 100%; background: #0074D9; text-align: center; color: white; line-height: 20px;
        }
    </style>
    <script>
        function notif(title, msg) {
            if (Notification.permission === "granted") {
                new Notification(title, {body: msg});
            }
        }
        window.onload = function() {
            if (Notification) Notification.requestPermission();
            notif("SPARKO-OS", "Sistem siap digunakan!");
        }
    </script>
</head>
<body>
<div class="container">
    <header>
        <h1>SPARKO-OS v51.4</h1>
        <p>Sistem Manajemen Proyek Cerdas</p>
    </header>
    <hr>
    <h2>🚀 Menu Utama</h2>
    <button class="btn" onclick="location.href='/tim'">👥 Tim</button>
    <button class="btn" onclick="location.href='/proyek'">📥 Input Proyek</button>
    <button class="btn" onclick="location.href='/dashboard'">📊 Dashboard</button>
    <button class="btn" onclick="location.href='/ai'">🤖 AI</button>
    <button class="btn" onclick="location.href='/proposal'">📄 Proposal</button>
    <button class="btn" onclick="location.href='/klien'">👥 Klien</button>
    <button class="btn" onclick="location.href='/absensi'">📅 Absensi</button>
    <button class="btn" onclick="location.href='/gaji'">💰 Gaji</button>
    <button class="btn" onclick="location.href='/chat'">💬 Chat</button>
    <button class="btn" onclick="location.href='/material'">📦 Material</button>
    {% if session.user.role == 'admin' %}
    <button class="btn" onclick="location.href='/register'">🔐 Register</button>
    {% endif %}
    <button class="btn" onclick="location.href='/logout'">🔓 Logout</button>
    <br><br>
    <div style="color:#aaa;">Halo, <b>{{ nama_user }}</b> | Role: {{ role }}</div>
    <hr>
    {{ content|safe }}
    <div style="text-align:center; margin-top:50px; color:#aaa;">
        SPARKO - Satu Percikan, Jutaan Energi | 0858-2780-8391
    </div>
</div>
</body>
</html>
'''

# =============== 6. LOGIN & REGISTER ===============
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = cek_user(username)
        if user and user['password'] == password:
            session['user'] = user
            session['nama'] = username
            return redirect('/')
        else:
            return '<p style="color:red;">❌ Login gagal!</p>'
    return '''
    <div class="card">
        <h2>🔐 Login SPARKO-OS</h2>
        <form method="post">
            <label>Username:<br><input type="text" name="username" required></label><br><br>
            <label>Password:<br><input type="password" name="password" required></label><br><br>
            <button type="submit" class="btn">🔓 Masuk</button>
        </form>
    </div>
    '''

@app.route('/register', methods=['GET', 'POST'])
def register():
    if session.get('user', {}).get('role') != 'admin':
        return '<h2>❌ Akses Ditolak! Hanya admin yang bisa register.</h2>'
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']
        if cek_user(username):
            return '<p style="color:red;">❌ Username sudah ada!</p>'
        simpan_user({username: {"password": password, "role": role}})
        return '<p style="color:green;">✅ User berhasil dibuat!</p>'
    return '''
    <div class="card">
        <h2>🔐 Register User Baru</h2>
        <form method="post">
            <label>Username:<br><input type="text" name="username" required></label><br><br>
            <label>Password:<br><input type="password" name="password" required></label><br><br>
            <label>Role:<br>
            <select name="role">
                <option value="admin">Admin</option>
                <option value="koordinator">Koordinator</option>
                <option value="teknisi">Teknisi</option>
                <option value="helper">Helper</option>
            </select>
            </label><br><br>
            <button type="submit" class="btn">➕ Tambah User</button>
        </form>
    </div>
    '''

@app.before_request
def require_login():
    if request.path not in ['/login', '/static'] and 'user' not in session and request.endpoint != 'static':
        return redirect('/login')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

# =============== 7. HOMEPAGE ===============
@app.route('/')
def index():
    db = muat_data(PROYEK_DB)
    total = len(db)
    profit = sum([p['profit'] for p in db]) if db else 0
    content = f'''
    <div class="card">
        <h2>⚡ Statistik SPARKO</h2>
        <p><b>Total Proyek:</b> {total}</p>
        <p><b>Total Profit:</b> Rp{profit:,}</p>
        <p><b>Rata-rata:</b> Rp{profit//max(1,total):,}</p>
    </div>
    '''
    return render_template_string(HTML, content=content, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 8. TIM ===============
@app.route('/tim')
def tim():
    table = '<div class="card"><h2>👥 Tim SPARKO</h2><table><tr><th>Nama</th><th>Jabatan</th><th>Pengalaman</th><th>Tarif</th></tr>'
    for t in tim_sparko:
        table += f"<tr><td>{t['nama']}</td><td>{t['jabatan']}</td><td>{t['pengalaman']} tahun</td><td>Rp {t['tarif']:,}</td></tr>"
    table += '</table></div>'
    return render_template_string(HTML, content=table, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 9. INPUT PROYEK ===============
@app.route('/proyek', methods=['GET', 'POST'])
def proyek():
    form = '''
    <div class="card">
        <h2>📥 Input Proyek Baru</h2>
        <form method="post">
            <label>Kapasitas (kWp):<br><input type="number" name="kwp" step="0.1" value="10" required></label><br><br>
            <label>Lokasi:<br><input type="text" name="lokasi" value="Jawa Tengah" required></label><br><br>
            <label>Medan:<br>
            <select name="medan">
                <option value="mudah">Mudah</option>
                <option value="sedang" selected>Sedang</option>
                <option value="sulit">Sulit</option>
            </select>
            </label><br><br>
            <label>Teknisi:<br><input type="number" name="teknisi" value="2" min="1" required></label><br><br>
            <label>Helper:<br><input type="number" name="helper" value="1" min="0" required></label><br><br>
            <label>Durasi (hari):<br><input type="number" name="durasi" value="5" min="1" required></label><br><br>
            <button type="submit" class="btn">Hitung & Simpan</button>
        </form>
    </div>
    '''
    if request.method == 'POST':
        try:
            kwp = float(request.form['kwp'])
            lokasi = request.form['lokasi']
            medan = request.form['medan']
            teknisi = int(request.form['teknisi'])
            helper = int(request.form['helper'])
            durasi = int(request.form['durasi'])
            total_manpower = (teknisi * 250000 + helper * 200000) * durasi
            total_harga = int(kwp * 3_800_000 * (1.1 if medan=="sedang" else 0.9 if medan=="mudah" else 1.4))
            profit = total_harga - total_manpower - (total_harga * 0.5)
            prediksi = prediksi_profit(kwp, medan)
            data = {
                "kwp": kwp,
                "lokasi": lokasi,
                "medan": medan,
                "teknisi": teknisi,
                "helper": helper,
                "durasi": durasi,
                "profit": int(profit),
                "progress": 0,
                "status": "Aktif",
                "timestamp": str(datetime.datetime.now())
            }
            simpan_data(PROYEK_DB, data)
            result = f'''
            <div class="card">
                <h2>✅ Proyek Disimpan!</h2>
                <p><b>Durasi:</b> {durasi} hari</p>
                <p><b>Manpower:</b> {teknisi} teknisi, {helper} helper</p>
                <p class="metric"><b>Profit:</b> Rp{int(profit):,}</p>
                <p><b>Prediksi AI:</b> Rp{int(prediksi):,}</p>
                <form action="/proposal" method="post">
                    <input type="hidden" name="kwp" value="{kwp}">
                    <input type="hidden" name="lokasi" value="{lokasi}">
                    <input type="hidden" name="profit" value="{int(profit)}">
                    <input type="hidden" name="durasi" value="{durasi}">
                    <input type="hidden" name="teknisi" value="{teknisi}">
                    <input type="hidden" name="helper" value="{helper}">
                    <button type="submit" class="btn">📄 Download Proposal</button>
                </form>
            </div>
            '''
            return render_template_string(HTML, content=result, nama_user=session.get('nama'), role=session['user']['role'])
        except Exception as e:
            return f"<h2>Error: {str(e)}</h2><a href='/'>Kembali</a>"
    return render_template_string(HTML, content=form, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 10. PROPOSAL PDF ===============
@app.route('/proposal', methods=['POST'])
def proposal():
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.set_text_color(255, 215, 0)
        pdf.cell(0, 10, "PROPOSAL SPARKO", ln=True, align='C')
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", '', 12)
        pdf.cell(0, 10, f"Proyek: PLTS {request.form['kwp']} kWp", ln=True)
        pdf.cell(0, 10, f"Lokasi: {request.form['lokasi']}", ln=True)
        pdf.cell(0, 10, f"Durasi: {request.form['durasi']} hari", ln=True)
        pdf.cell(0, 10, f"Manpower: {request.form['teknisi']} teknisi, {request.form['helper']} helper", ln=True)
        pdf.cell(0, 10, f"Profit: Rp{request.form['profit']}", ln=True)
        pdf.ln(40)
        pdf.cell(90, 10, "Menyetujui,", align="C")
        pdf.cell(90, 10, "Hormat Kami,", align="C")
        pdf.ln(10)
        pdf.cell(90, 10, "(______________)", align="C")
        pdf.cell(90, 10, "(Agung - SPARKO)", align="C")
        path = "proposal_sparko.pdf"
        pdf.output(path)
        return send_file(path, as_attachment=True)
    except Exception as e:
        return f"<h2>❌ Gagal generate PDF: {str(e)}</h2><a href='/'>Kembali</a>"

# =============== 11. DASHBOARD ===============
@app.route('/dashboard')
def dashboard():
    try:
        db = muat_data(PROYEK_DB)
        if not db:
            content = "<div class='card'>Belum ada proyek</div>"
        else:
            total = len(db)
            aktif = len([p for p in db if p['status'] == 'Aktif'])
            selesai = len([p for p in db if p['status'] == 'Selesai'])
            profit = sum(p['profit'] for p in db)
            avg_progress = sum(p['progress'] for p in db) / len(db) if db else 0
            content = f'''
            <div class="card">
                <h2>📊 Dashboard</h2>
                <p><b>Total Proyek:</b> {total}</p>
                <p><b>Aktif:</b> {aktif} | <b>Selesai:</b> {selesai}</p>
                <p><b>Total Profit:</b> Rp{profit:,}</p>
                <div class="progress-bar"><div class="progress-fill" style="width:{avg_progress}%">{avg_progress:.1f}%</div></div>
                <p><b>Rata-rata Progres:</b> {avg_progress:.1f}%</p>
            </div>
            '''
        return render_template_string(HTML, content=content, nama_user=session.get('nama'), role=session['user']['role'])
    except Exception as e:
        return f"<h2>❌ Error Dashboard: {str(e)}</h2>"

# =============== 12. AI ===============
@app.route('/ai')
def ai():
    try:
        db = muat_data(PROYEK_DB)
        if not db:
            content = '''
            <div class="card">
                <h2>🤖 SPARKO-AI</h2>
                <p><b>Status:</b> ⚠️ Tidak ada data</p>
                <p>Input proyek pertama untuk mengaktifkan AI.</p>
            </div>
            '''
        else:
            rata = sum(p['profit'] for p in db) / len(db)
            total_kwp = sum(p['kwp'] for p in db)
            avg_kwp = total_kwp / len(db)
            content = f'''
            <div class="card">
                <h2>🤖 SPARKO-AI (Diperkuat)</h2>
                <p><b>Status:</b> ✅ Aktif</p>
                <p><b>Database:</b> {len(db)} proyek</p>
                <p><b>Rata-rata Profit:</b> Rp{rata:,.0f}</p>
                <p><b>Rata-rata Kapasitas:</b> {avg_kwp:.1f} kWp</p>
                <p><b>Saran:</b> Fokus proyek {8 if avg_kwp < 10 else 15} kWp</p>
            </div>
            '''
        return render_template_string(HTML, content=content, nama_user=session.get('nama'), role=session['user']['role'])
    except Exception as e:
        return f"<h2>❌ Error AI: {str(e)}</h2>"

# =============== 13. ABSENSI ===============
@app.route('/absensi', methods=['GET', 'POST'])
def absensi():
    if request.method == 'POST':
        nama = request.form['nama']
        status = request.form['status']
        data = {"nama": nama, "status": status, "tanggal": str(datetime.date.today())}
        simpan_data(ABSENSI_DB, data)
    absen = muat_data(ABSENSI_DB)
    hari_ini = [a for a in absen if a['tanggal'] == str(datetime.date.today())]
    form = f'''
    <div class="card">
        <h2>📅 Absensi Harian</h2>
        <form method="post">
            <label>Nama:<br>
            <select name="nama" required>
                <option value="">Pilih</option>
                {''.join([f'<option value="{t["nama"]}">{t["nama"]}</option>' for t in tim_sparko])}
            </select>
            </label><br><br>
            <label>Status:<br>
            <select name="status">
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
            </select>
            </label><br><br>
            <button type="submit" class="btn">✅ Simpan</button>
        </form>
        <h3>Hari Ini</h3>
        <table><tr><th>Nama</th><th>Status</th></tr>
        {''.join([f'<tr><td>{a["nama"]}</td><td>{a["status"]}</td></tr>' for a in hari_ini])}
        </table>
    </div>
    '''
    return render_template_string(HTML, content=form, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 14. GAJI ===============
@app.route('/gaji')
def gaji():
    absen = muat_data(ABSENSI_DB)
    rekap = {t['nama']: {'jabatan': t['jabatan'], 'tarif': t['tarif'], 'hadir': 0, 'total': 0} for t in tim_sparko}
    for a in absen:
        if a['status'] == 'Hadir':
            rekap[a['nama']]['hadir'] += 1
    for nama, d in rekap.items():
        d['total'] = d['hadir'] * d['tarif']
    table = '''
    <div class="card">
        <h2>💰 Rekap Gaji Mingguan</h2>
        <table><tr><th>Nama</th><th>Jabatan</th><th>Hadir</th><th>Tarif</th><th>Total</th></tr>
    '''
    for nama, d in rekap.items():
        table += f'<tr><td>{nama}</td><td>{d["jabatan"]}</td><td>{d["hadir"]}</td><td>Rp{d["tarif"]:,}</td><td>Rp{d["total"]:,}</td></tr>'
    table += '</table></div>'
    return render_template_string(HTML, content=table, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 15. KLIEN ===============
@app.route('/klien', methods=['GET', 'POST'])
def klien():
    if request.method == 'POST':
        simpan_data(KLIEN_DB, {
            "nama": request.form['nama'],
            "kontak": request.form['kontak'],
            "kwp": request.form['kwp'],
            "lokasi": request.form['lokasi'],
            "tanggal": str(datetime.date.today())
        })
    db = muat_data(KLIEN_DB)
    form = f'''
    <div class="card">
        <h2>👥 Manajemen Klien</h2>
        <form method="post">
            <label>Nama:<br><input type="text" name="nama" required></label><br><br>
            <label>Kontak:<br><input type="text" name="kontak"></label><br><br>
            <label>kWp:<br><input type="number" name="kwp" step="0.1"></label><br><br>
            <label>Lokasi:<br><input type="text" name="lokasi"></label><br><br>
            <button type="submit" class="btn">💾 Simpan</button>
        </form>
        <h3>Riwayat Klien</h3>
        <table><tr><th>Nama</th><th>Kontak</th><th>kWp</th><th>Lokasi</th><th>Tanggal</th></tr>
        {''.join([f'<tr><td>{k["nama"]}</td><td>{k["kontak"]}</td><td>{k["kwp"]}kWp</td><td>{k["lokasi"]}</td><td>{k["tanggal"]}</td></tr>' for k in db])}
        </table>
    </div>
    '''
    return render_template_string(HTML, content=form, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 16. CHAT ===============
@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        simpan_data(CHAT_DB, {
            "nama": request.form['nama'],
            "pesan": request.form['pesan'],
            "waktu": datetime.datetime.now().strftime("%H:%M")
        })
    pesan = muat_data(CHAT_DB)[-20:]
    daftar_nama = [t['nama'] for t in tim_sparko]
    html = '''
    <div class="card">
        <h2>💬 Chat Internal</h2>
        <div style="background:#002b4d; height:300px; overflow-y:auto; padding:10px;">'''
    for p in pesan:
        html += f'<p><b>{p["nama"]}</b> <i>({p["waktu"]})</i>: {p["pesan"]}</p>'
    html += '''</div>
    <form method="post">
        <label>Nama:<br>
        <select name="nama" required>'''
    for nama in daftar_nama:
        html += f'<option value="{nama}">{nama}</option>'
    html += '''</select></label><br><br>
    <label>Pesan:<br><input type="text" name="pesan" required style="width:100%"></label><br><br>
    <button type="submit" class="btn">📤 Kirim</button>
    </form></div>'''
    return render_template_string(HTML, content=html, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 17. MATERIAL ===============
@app.route('/material', methods=['GET', 'POST'])
def material():
    if request.method == 'POST':
        simpan_data(MATERIAL_DB, {
            "nama": request.form['nama'],
            "harga": int(request.form['harga']),
            "stok": int(request.form['stok'])
        })
    db = muat_data(MATERIAL_DB)
    form = f'''
    <div class="card">
        <h2>📦 Manajemen Material</h2>
        <form method="post">
            <label>Nama Material:<br><input type="text" name="nama" required></label><br><br>
            <label>Harga:<br><input type="number" name="harga" required></label><br><br>
            <label>Stok:<br><input type="number" name="stok" required></label><br><br>
            <button type="submit" class="btn">➕ Tambah</button>
        </form>
        <h3>Daftar Material</h3>
        <table><tr><th>Nama</th><th>Harga</th><th>Stok</th><th>Total</th></tr>
        {''.join([f'<tr><td>{m["nama"]}</td><td>Rp{m["harga"]:,}</td><td>{m["stok"]}</td><td>Rp{m["harga"]*m["stok"]:,}</td></tr>' for m in db])}
        </table>
    </div>
    '''
    return render_template_string(HTML, content=form, nama_user=session.get('nama'), role=session['user']['role'])

# =============== 18. JALANKAN SERVER ===============
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
