# plugins/dokumentasi.py
# Plugin: Upload Foto Proyek

from flask import Blueprint, render_template_string, request
import sqlite3

dokumentasi_bp = Blueprint('dokumentasi', __name__)

HTML = '''
<div class="card">
    <h2>📸 Dokumentasi Proyek</h2>
    <form method="post">
        <label>Kapasitas (kWp):<br><input type="number" name="kwp" step="0.1" required></label><br><br>
        <label>Lokasi:<br><input type="text" name="lokasi" required></label><br><br>
        <label>Status:<br>
        <select name="status">
            <option value="Survey">Survey</option>
            <option value="Persiapan">Persiapan</option>
            <option value="Mounting">Mounting</option>
            <option value="Instalasi">Instalasi</option>
            <option value="Tarik Kabel">Tarik Kabel</option>
            <option value="Final">Final</option>
        </select>
        </label><br><br>
        <label>Catatan:<br><textarea name="catatan" rows="3" style="width:100%"></textarea></label><br><br>
        <label>Link Foto:<br><input type="text" name="foto" placeholder="https://..."></label><br><br>
        <button type="submit" class="btn">💾 Simpan</button>
    </form>
</div>
'''

@dokumentasi_bp.route('/dokumentasi', methods=['GET', 'POST'])
def dokumentasi():
    if request.method == 'POST':
        kwp = request.form['kwp']
        lokasi = request.form['lokasi']
        status = request.form['status']
        catatan = request.form['catatan']
        foto = request.form['foto']
        conn = sqlite3.connect('database/sparko.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO dokumentasi (kwp, lokasi, status, catatan, foto, tanggal)
            VALUES (?, ?, ?, ?, ?, date("now"))
        ''', (kwp, lokasi, status, catatan, foto))
        conn.commit()
        conn.close()
    return render_template_string(HTML)

def register(app):
    app.register_blueprint(dokumentasi_bp)