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
import json

app = FastAPI()

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
    answer = run_gpt_agent(query)
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
    summary, _ = sip_projection(amount, years, rate)
    return {"summary": summary}

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
    
    summary = tax_summary_gpt(
        salary, rent, deductions_80c, deductions_80d, 
        hra_received, basic_salary
    )
    return {"summary": summary}

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
    
    summary, _ = budget_projection(income, rent, food, transport, entertainment, other)
    return {"summary": summary}

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
    summary, _ = stock_summary_and_chart(symbol)
    return {"summary": summary}

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