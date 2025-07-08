from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from tools.email_report import run_email_report_tool
from agent import run_gpt_agent
from tools.sip import sip_projection
from tools.loan import loan_projection
from tools.tax_saver import tax_summary_gpt
from tools.news_risk import analyze_portfolio_risk
from tools.budget import budget_projection
from tools.goal_planner import goal_projection
from tools.portfolio import analyze_portfolio
from tools.stock import stock_summary_and_chart
from tools.expense_categorizer import run_expense_categorizer
from tools.pdf_generator import generate_pdf_summary
import json
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Ensure output directory exists before mounting
os.makedirs("generated", exist_ok=True)

# Serve generated reports so the frontend can download them
app.mount("/generated", StaticFiles(directory="generated"), name="generated")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat/")
async def chat(request: dict):
    query = request.get("query", "")
    history = request.get("history", [])
    answer = run_gpt_agent(query, history)
    return {"answer": answer}

@app.post("/api/send-email/")
async def send_email(
    to_email: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    file: UploadFile = File(...)
):
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    result = run_email_report_tool(to_email, subject, body, temp_path)
    return {"result": result}

@app.post("/api/sip/")
async def calculate_sip(request: dict):
    amount = request.get("amount", 10000)
    years = request.get("years", 10)
    rate = request.get("rate", 12)
    result, _ = sip_projection(amount, years, rate)
    return result

@app.post("/api/loan/")
async def calculate_loan(request: dict):
    principal = request.get("principal", 500000)
    years = request.get("years", 5)
    rate = request.get("rate", 10)
    result, _ = loan_projection(principal, years, rate)
    return {"result": result}

@app.post("/api/tax/")
async def optimize_tax(request: dict):
    salary = request.get("salary", 800000)
    rent = request.get("rent", 180000)
    deductions_80c = request.get("deductions_80c", 100000)
    deductions_80d = request.get("deductions_80d", 0)
    hra_received = request.get("hra_received", 120000)
    basic_salary = request.get("basic_salary", 400000)
    
    result = tax_summary_gpt(
        salary, rent, deductions_80c, deductions_80d, 
        hra_received, basic_salary
    )
    return result

@app.post("/api/news-risk/")
async def news_risk_analysis(request: dict):
    symbols = request.get("symbols", [])
    risk_summary = analyze_portfolio_risk(symbols)
    return {"risk_summary": risk_summary}

@app.post("/api/budget/")
async def analyze_budget(request: dict):
    income = request.get("income", 50000)
    rent = request.get("rent", 15000)
    food = request.get("food", 8000)
    transport = request.get("transport", 5000)
    entertainment = request.get("entertainment", 3000)
    other = request.get("other", 2000)
    
    result, _ = budget_projection(income, rent, food, transport, entertainment, other)
    return result

@app.post("/api/goal-planner/")
async def plan_goal(request: dict):
    goal_amount = request.get("goal_amount", 1000000)
    years = request.get("years", 5)
    income = request.get("income", 50000)
    annual_return = request.get("annual_return", 12.0)
    
    summary, _ = goal_projection(goal_amount, years, income, annual_return)
    return {"summary": summary}

@app.post("/api/portfolio/")
async def analyze_user_portfolio(request: dict):
    stocks = request.get("stocks", [])
    # stocks should be list of {"symbol": "RELIANCE.NS", "quantity": 10, "buy_price": 2500}
    summary = analyze_portfolio(stocks)
    return {"summary": summary.to_dict('records') if hasattr(summary, 'to_dict') else str(summary)}

@app.post("/api/stock/")
async def get_stock_info(request: dict):
    symbol = request.get("symbol", "RELIANCE.NS")
    result, _ = stock_summary_and_chart(symbol)
    return result

@app.post("/api/expense-categorizer/")
async def categorize_expenses(
    file: UploadFile = File(...)
):
    # Save uploaded file temporarily
    temp_path = f"temp_expenses_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    result = run_expense_categorizer(temp_path)
    return {"result": result}

# ---------------------------------------------------------------------------
# NEW: Unified Report Generation + Email Endpoint
# ---------------------------------------------------------------------------

@app.post("/api/generate-report/")
async def generate_report(request: dict):
    """Generate a PDF financial report and email it to the user.

    Expected JSON body:
    {
        "email": "user@example.com",
        "portfolio_value": 1000000,
        "monthly_income": 80000,
        "monthly_expenses": 50000,
        "financial_goals": "Buy a house in 5 years",
        "risk_tolerance": "moderate",
        "report_type": "comprehensive"
    }
    """

    email = request.get("email")
    report_type = request.get("report_type", "comprehensive")
    portfolio_value = request.get("portfolio_value", 0)
    monthly_income = request.get("monthly_income", 0)
    monthly_expenses = request.get("monthly_expenses", 0)
    financial_goals = request.get("financial_goals", "-")
    risk_tolerance = request.get("risk_tolerance", "moderate")

    # Basic summary – this could be replaced by a GPT-generated section if desired
    summary_text = (
        f"Financial Report ({report_type.title()})\n\n"
        f"Portfolio Value: ₹{portfolio_value}\n"
        f"Monthly Income: ₹{monthly_income}\n"
        f"Monthly Expenses: ₹{monthly_expenses}\n"
        f"Risk Tolerance: {risk_tolerance.title()}\n"
        f"Financial Goals: {financial_goals}\n"
    )

    try:
        # Generate PDF
        pdf_path = generate_pdf_summary(summary_text)

        # Send via email (if email provided)
        if email:
            subject = f"Your {report_type.title()} Financial Report"
            body = "Please find your financial report attached."
            send_status = run_email_report_tool(email, subject, body, pdf_path)
            success = send_status.startswith("✅")
            return JSONResponse({
                "success": success,
                "message": send_status,
                "file_path": pdf_path
            })

        # If no email – just return the path so the frontend can offer a download
        return JSONResponse({
            "success": True,
            "message": "Report generated successfully.",
            "file_path": pdf_path
        })
    except Exception as e:
        # Capture any unexpected server-side errors so the client gets a
        # structured response instead of a network failure (which shows up as
        # "Failed to fetch" in the browser).
        print("[generate_report] Error:", e)
        return JSONResponse({
            "success": False,
            "message": f"Server error while generating report: {str(e)}"
        }, status_code=500)