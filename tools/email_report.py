# tools/email_report.py

from langchain.tools import tool
import smtplib
from email.message import EmailMessage

def send_email_report(to_email: str, subject: str, body: str, attachment_path: str):
    """
    Send an email with a PDF attachment.
    """
    EMAIL = "your_email@gmail.com"
    PASSWORD = "your_app_password"  # Use Gmail App Password

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    with open(attachment_path, "rb") as f:
        msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename="FinancialReport.pdf")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL, PASSWORD)
        smtp.send_message(msg)

@tool
def run_email_report_tool(to_email: str, subject: str, body: str, attachment_path: str) -> str:
    """Send a financial report PDF to the specified email address."""
    try:
        send_email_report(to_email, subject, body, attachment_path)
        return f"✅ Email sent to {to_email}."
    except Exception as e:
        return f"❌ Failed to send email: {e}"
