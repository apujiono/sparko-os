
---

## ✅ 6. Plugin: `plugins/login.py`

```python
# plugins/login.py
# Plugin: Login User

from flask import Blueprint, render_template_string, request, session
import sqlite3

login_bp = Blueprint('login', __name__)

HTML = '''
<div class="card">
    <h2>🔐 Login SPARKO-OS</h2>
    <form method="post">
        <label>Username:<br><input type="text" name="username" required></label><br><br>
        <label>Password:<br><input type="password" name="password" required></label><br><br>
        <button type="submit" class="btn">🔓 Masuk</button>
    </form>
</div>
'''

@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect('database/sparko.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, nama FROM users WHERE username=? AND password=?', (username, password))
        user = cursor.fetchone()
        conn.close()
        if user:
            session['user_id'] = user[0]
            session['nama'] = user[1]
            return '<script>location.href="/"</script>'
        else:
            return '<p style="color:red;">❌ Login gagal!</p>'
    return render_template_string(HTML)

def register(app):
    app.register_blueprint(login_bp)