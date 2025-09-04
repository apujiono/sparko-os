# plugins/notifikasi.py
# Plugin: Notifikasi WhatsApp & Email

from flask import Blueprint, render_template_string, request
import requests

notifikasi_bp = Blueprint('notifikasi', __name__)

HTML = '''
<div class="card">
    <h2>📢 Kirim Notifikasi</h2>
    <form method="post">
        <label>Pesan:<br><textarea name="pesan" rows="4" style="width:100%" required></textarea></label><br><br>
        <label>Tujuan:<br><input type="text" name="tujuan" placeholder="Nomor WA atau Email" required></label><br><br>
        <button type="submit" class="btn">📤 Kirim</button>
    </form>
</div>
'''

@notifikasi_bp.route('/notifikasi', methods=['GET', 'POST'])
def notifikasi():
    if request.method == 'POST':
        pesan = request.form['pesan']
        tujuan = request.form['tujuan']
        # Simulasi kirim WA (gunakan API seperti Twilio, WhatsApp Business, dll)
        try:
            # requests.post("https://api.whatsapp.com/send", data={"to": tujuan, "text": pesan})
            return '<p style="color:green;">✅ Notifikasi terkirim!</p>'
        except:
            return '<p style="color:red;">❌ Gagal kirim notifikasi.</p>'
    return render_template_string(HTML)

def register(app):
    app.register_blueprint(notifikasi_bp)