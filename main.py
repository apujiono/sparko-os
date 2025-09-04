# main.py
# 🔥 SPARKO-OS v56.0 - SISTEM MODULAR DENGAN PLUGIN
# ✅ Auto-load plugin, SQLite, login, daftar user
# "Satu Percikan, Jutaan Energi" - SPARKO Team

import os
import importlib
from flask import Flask, session, redirect, url_for
import sqlite3

app = Flask(__name__)
app.secret_key = "sparko_super_secret_2025"

# =============== 1. DATABASE SQLITE ===============
def init_db():
    conn = sqlite3.connect('database/sparko.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            nama TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS proyek (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kwp REAL,
            lokasi TEXT,
            medan TEXT,
            mode TEXT,
            profit INTEGER,
            status TEXT,
            progress INTEGER,
            timestamp TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS absensi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT,
            status TEXT,
            tanggal TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT,
            waktu TEXT,
            pesan TEXT
        )
    ''')
    conn.commit()
    conn.close()

if not os.path.exists('database/sparko.db'):
    os.makedirs('database', exist_ok=True)
    init_db()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS proyek_baru (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT,
        lokasi TEXT,
        kwp REAL,
        target TEXT
    )
''')
# =============== 2. AUTO-LOAD PLUGIN ===============
def load_plugins():
    plugin_dir = 'plugins'
    if os.path.exists(plugin_dir):
        for filename in os.listdir(plugin_dir):
            if filename.endswith('.py') and filename != '__init__.py':
                module_name = f"plugins.{filename[:-3]}"
                try:
                    module = importlib.import_module(module_name)
                    if hasattr(module, 'register'):
                        module.register(app)
                    print(f"✅ Plugin loaded: {filename}")
                except Exception as e:
                    print(f"❌ Gagal load plugin {filename}: {str(e)}")

# =============== 3. LOGIN & REGISTER ===============
@app.route('/login')
def login():
    return '<h2>Login akan diintegrasikan oleh plugin</h2>'

@app.route('/register')
def register():
    return '<h2>Register akan diintegrasikan oleh plugin</h2>'

@app.before_request
def require_login():
    if request.endpoint in ['login', 'register']:
        return
    if 'user_id' not in session:
        return redirect('/login')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

# =============== 4. HOMEPAGE ===============
@app.route('/')
def index():
    return '''
    <div class="card">
        <h2>🏠 Dashboard SPARKO-OS</h2>
        <p>Selamat datang, <b>{{ session.nama }}</b>!</p>
        <a href="/proyek">📥 Input Proyek</a> |
        <a href="/absensi">📅 Absensi</a> |
        <a href="/chat">💬 Chat</a> |
        <a href="/logout">🔐 Logout</a>
    </div>
    '''

# =============== 5. LOAD PLUGIN & JALANKAN ===============
load_plugins()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)