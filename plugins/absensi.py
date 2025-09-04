# plugins/absensi.py
# Plugin: Absensi Digital

from flask import Blueprint, render_template_string, request
import sqlite3

absensi_bp = Blueprint('absensi', __name__)

HTML = '''
<div class="card">
    <h2>📅 Absensi Harian</h2>
    <form method="post">
        <label>Nama:<br>
        <select name="nama" required>
            <option value="">Pilih</option>
            {% for nama in tim %}
            <option value="{{ nama }}">{{ nama }}</option>
            {% endfor %}
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
</div>
'''

@absensi_bp.route('/absensi', methods=['GET', 'POST'])
def absensi():
    tim = ["Agung", "Julian", "Rifqi", "Sadewa", "Irvan", "Reno", "Alhela", "Fajar"]
    if request.method == 'POST':
        nama = request.form['nama']
        status = request.form['status']
        conn = sqlite3.connect('database/sparko.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO absensi (nama, status, tanggal) VALUES (?, ?, date("now"))', (nama, status))
        conn.commit()
        conn.close()
    return render_template_string(HTML, tim=tim)

def register(app):
    app.register_blueprint(absensi_bp)