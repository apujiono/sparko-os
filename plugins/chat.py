# plugins/chat.py
# Plugin: Chat Internal

from flask import Blueprint, render_template_string, request
import sqlite3

chat_bp = Blueprint('chat', __name__)

HTML = '''
<div class="card">
    <h2>💬 Chat Internal</h2>
    <div style="background:#002b4d; height:300px; overflow-y:auto; padding:10px;">
    {% for p in pesan %}
    <p><b>{{ p[0] }}</b> ({{ p[1] }}): {{ p[2] }}</p>
    {% endfor %}
    </div>
    <form method="post">
        <label>Nama:<br><input type="text" name="nama" required></label><br><br>
        <label>Pesan:<br><input type="text" name="pesan" required style="width:100%"></label><br><br>
        <button type="submit" class="btn">📤 Kirim</button>
    </form>
</div>
'''

@chat_bp.route('/chat', methods=['GET', 'POST'])
def chat():
    conn = sqlite3.connect('database/sparko.db')
    if request.method == 'POST':
        nama = request.form['nama']
        pesan = request.form['pesan']
        cursor = conn.cursor()
        cursor.execute('INSERT INTO chat (nama, waktu, pesan) VALUES (?, time("now"), ?)', (nama, pesan))
        conn.commit()
    cursor = conn.cursor()
    cursor.execute('SELECT nama, waktu, pesan FROM chat ORDER BY id DESC LIMIT 20')
    pesan = cursor.fetchall()
    conn.close()
    return render_template_string(HTML, pesan=pesan)

def register(app):
    app.register_blueprint(chat_bp)