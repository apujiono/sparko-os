# plugins/ai.py
# Plugin: AI Prediksi Profit

from flask import Blueprint, render_template_string, request
import sqlite3

ai_bp = Blueprint('ai', __name__)

HTML = '''
<div class="card">
    <h2>🤖 SPARKO-AI (Diperkuat)</h2>
    <p><b>Status:</b> ✅ Aktif</p>
    <p><b>Database:</b> {{ total_proyek }} proyek</p>
    <p><b>Rata-rata Profit:</b> Rp{{ avg_profit|format }}</p>
    <p><b>Rata-rata Kapasitas:</b> {{ avg_kwp }} kWp</p>
    <p><b>Saran:</b> Fokus proyek {{ saran_kwp }} kWp</p>
</div>
'''

@ai_bp.route('/ai')
def ai():
    conn = sqlite3.connect('database/sparko.db')
    cursor = conn.cursor()
    cursor.execute('SELECT profit, kwp FROM proyek')
    data = cursor.fetchall()
    conn.close()

    if not data:
        return render_template_string(HTML, total_proyek=0, avg_profit=0, avg_kwp=0, saran_kwp=10)

    total_proyek = len(data)
    total_profit = sum(p[0] for p in data)
    total_kwp = sum(p[1] for p in data)
    avg_profit = total_profit / total_proyek
    avg_kwp = total_kwp / total_proyek
    saran_kwp = 8 if avg_kwp < 10 else 15

    return render_template_string(HTML, 
        total_proyek=total_proyek,
        avg_profit=int(avg_profit),
        avg_kwp=round(avg_kwp, 1),
        saran_kwp=saran_kwp
    )

def register(app):
    app.register_blueprint(ai_bp)