# plugins/proyek_baru.py
# Plugin: Info Proyek yang Akan Datang

from flask import Blueprint, render_template_string, request
import sqlite3

proyek_baru_bp = Blueprint('proyek_baru', __name__)

HTML = '''
<div class="card">
    <h2>🎯 Proyek yang Akan Datang</h2>
    <form method="post">
        <label>Nama Klien:<br><input type="text" name="nama" required></label><br><br>
        <label>Lokasi:<br><input type="text" name="lokasi" required></label><br><br>
        <label>Kapasitas (kWp):<br><input type="number" name="kwp" step="0.1" required></label><br><br>
        <label>Tanggal Target:<br><input type="date" name="target"></label><br><br>
        <button type="submit" class="btn">➕ Tambah Proyek</button>
    </form>
    <h3>Daftar Proyek Mendatang</h3>
    <table>
        <tr><th>Klien</th><th>Lokasi</th><th>kWp</th><th>Target</th></tr>
        {% for p in proyek %}
        <tr><td>{{ p[0] }}</td><td>{{ p[1] }}</td><td>{{ p[2] }}kWp</td><td>{{ p[3] }}</td></tr>
        {% endfor %}
    </table>
</div>
'''

@proyek_baru_bp.route('/proyek_baru', methods=['GET', 'POST'])
def proyek_baru():
    conn = sqlite3.connect('database/sparko.db')
    if request.method == 'POST':
        nama = request.form['nama']
        lokasi = request.form['lokasi']
        kwp = request.form['kwp']
        target = request.form['target']
        cursor = conn.cursor()
        cursor.execute('INSERT INTO proyek_baru (nama, lokasi, kwp, target) VALUES (?, ?, ?, ?)',
                       (nama, lokasi, kwp, target))
        conn.commit()
    cursor = conn.cursor()
    cursor.execute('SELECT nama, lokasi, kwp, target FROM proyek_baru ORDER BY target')
    proyek = cursor.fetchall()
    conn.close()
    return render_template_string(HTML, proyek=proyek)

def register(app):
    app.register_blueprint(proyek_baru_bp)