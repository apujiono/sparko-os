# plugins/klien.py
# Plugin: Manajemen Klien

from flask import Blueprint, render_template_string, request
import sqlite3

klien_bp = Blueprint('klien', __name__)

HTML = '''
<div class="card">
    <h2>👥 Manajemen Klien</h2>
    <form method="post">
        <label>Nama:<br><input type="text" name="nama" required></label><br><br>
        <label>Kontak:<br><input type="text" name="kontak"></label><br><br>
        <label>kWp:<br><input type="number" name="kwp" step="0.1"></label><br><br>
        <label>Lokasi:<br><input type="text" name="lokasi"></label><br><br>
        <button type="submit" class="btn">💾 Simpan</button>
    </form>
</div>
'''

@klien_bp.route('/klien', methods=['GET', 'POST'])
def klien():
    if request.method == 'POST':
        nama = request.form['nama']
        kontak = request.form['kontak']
        kwp = request.form['kwp']
        lokasi = request.form['lokasi']
        conn = sqlite3.connect('database/sparko.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO klien (nama, kontak, kwp, lokasi, tanggal) VALUES (?, ?, ?, ?, date("now"))',
                       (nama, kontak, kwp, lokasi))
        conn.commit()
        conn.close()
    return render_template_string(HTML)

def register(app):
    app.register_blueprint(klien_bp)