# plugins/proposal.py
# Plugin: Proposal PDF

from flask import Blueprint, render_template_string, request, send_file
from fpdf import FPDF

proposal_bp = Blueprint('proposal', __name__)

@proposal_bp.route('/proposal', methods=['POST'])
def proposal():
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.set_text_color(255, 215, 0)
        pdf.cell(0, 10, "PROPOSAL SPARKO", ln=True, align='C')
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", '', 12)
        pdf.cell(0, 10, f"Proyek: PLTS {request.form['kwp']} kWp", ln=True)
        pdf.cell(0, 10, f"Lokasi: {request.form['lokasi']}", ln=True)
        pdf.cell(0, 10, f"Durasi: {request.form['durasi']} hari", ln=True)
        pdf.cell(0, 10, f"Profit: Rp{request.form['profit']}", ln=True)
        path = "proposal_sparko.pdf"
        pdf.output(path)
        return send_file(path, as_attachment=True)
    except Exception as e:
        return f"<h2>❌ Gagal generate PDF: {str(e)}</h2><a href='/'>Kembali</a>"

def register(app):
    app.register_blueprint(proposal_bp)