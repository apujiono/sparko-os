# plugins/register.py
# Plugin: Daftar User Baru

from flask import Blueprint, render_template_string, request
import sqlite3

register_bp = Blueprint('register', __name__)

HTML = '''
<div class="card">
    <h2>📝 Daftar Pengguna Baru</h2>
    <form method="post">
        <label>Nama Lengkap:<br><input type="text" name="nama" required></label><br><br>
        <label>Username:<br><input type="text" name="username" required></label><br><br>
        <label>Password:<br><input type="password" name="password" required></label><br><br>
        <label>Role:<br>
        <select name="role">
            <option value="teknisi">Teknisi</option>
            <option value="helper">Helper</option>
            <option value="koordinator">Koordinator</option>
        </select>
        </label><br><br>
        <button type="submit" class="btn">➕ Daftar</button>
    </form>
</div>
'''

@register_bp.route('/register', methods=['GET', 'POST'])
def register_user():
    if request.method == 'POST':
        nama = request.form['nama']
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']
        conn = sqlite3.connect('database/sparko.db')
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)',
                           (nama, username, password, role))
            conn.commit()
            conn.close()
            return '<p style="color:green;">✅ Berhasil daftar! <a href="/login">Masuk sekarang</a></p>'
        except sqlite3.IntegrityError:
            conn.close()
            return '<p style="color:red;">❌ Username sudah ada!</p>'
    return render_template_string(HTML)

def register(app):
    app.register_blueprint(register_bp)