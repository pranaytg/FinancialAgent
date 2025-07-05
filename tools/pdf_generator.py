# type: ignore
from fpdf import FPDF
import uuid
import os
from langchain.tools import tool

@tool
def generate_pdf_summary(text: str) -> str:
    """Generates a PDF summary from the provided text and returns the file path."""
    # Ensure the output directory exists
    output_dir = "generated"
    os.makedirs(output_dir, exist_ok=True)

    filename = f"report_{uuid.uuid4().hex[:6]}.pdf"
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="📄 Financial Summary", ln=True, align='C')
    pdf.ln(10)
    pdf.multi_cell(0, 10, txt=text)

    output_path = os.path.join(output_dir, filename)
    pdf.output(output_path)
    return output_path
