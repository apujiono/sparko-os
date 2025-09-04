# plugins/kalkulator.py
# Plugin: Kalkulator Material

from flask import Blueprint, render_template_string, request

kalkulator_bp = Blueprint('kalkulator', __name__)

HTML = '''
<div class="card">
    <h2>🧮 Kalkulator Material</h2>
    <form method="post">
        <label>Kapasitas (kWp):<br><input type="number" name="kwp" step="0.1" required></label><br><br>
        <button type="submit" class="btn">Hitung</button>
    </form>
    {% if hasil %}
    <div class="feature">
        <h3>🛠️ Kebutuhan Material</h3>
        <p><b>Panel Surya:</b> {{ hasil.panel }} unit ({{ hasil.watt_panel }}W)</p>
        <p><b>Inverter:</b> {{ hasil.inverter }} unit</p>
        <p><b>Kabel DC:</b> {{ hasil.kabel_dc }} meter</p>
        <p><b>Mounting:</b> {{ hasil.mounting }} set</p>
    </div>
    {% endif %}
</div>
'''

@kalkulator_bp.route('/kalkulator', methods=['GET', 'POST'])
def kalkulator():
    hasil = None
    if request.method == 'POST':
        kwp = float(request.form['kwp'])
        watt_panel = 550
        panel = int((kwp * 1000) / watt_panel)
        inverter = 1 if kwp <= 10 else 2
        kabel_dc = kwp * 50
        mounting = panel // 2
        hasil = {
            'panel': panel,
            'watt_panel': watt_panel,
            'inverter': inverter,
            'kabel_dc': kabel_dc,
            'mounting': mounting
        }
    return render_template_string(HTML, hasil=hasil)

def register(app):
    app.register_blueprint(kalkulator_bp)