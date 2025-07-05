# app.py
import streamlit as st
from tools.sip import sip_projection
from tools.loan import loan_projection
from tools.budget import budget_projection
from tools.pdf_generator import generate_pdf_summary
from tools.stock import stock_summary_and_chart
from tools.goal_planner import goal_projection
from tools.portfolio import analyze_portfolio
from agent import run_gpt_agent
import os
from datetime import datetime
import plotly.graph_objects as go
import openai
import pdfplumber
import re
import json

# --- Initialize OpenAI API Key ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- Session State ---
if "session_result" not in st.session_state:
    st.session_state.session_result = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "tool_results" not in st.session_state:
    st.session_state.tool_results = {}
if "clear_input" not in st.session_state:
    st.session_state.clear_input = False

st.set_page_config(page_title="💸 Financial AI Assistant", layout="wide")

# --- Main Chat Section ---
st.markdown("""
<div style='text-align:center; margin-bottom: 2rem'>
    <h1 style='color:#2563eb;'>💸 Financial AI Chat Assistant</h1>
    <p style='font-size:1.1rem; color:#334155;'>
        Welcome! Ask me anything about finance, investments, planning, or budgeting.<br>
        <span style='color:#16a34a;'>Type your question below and get instant, smart answers!</span>
    </p>
</div>
""", unsafe_allow_html=True)

st.header("🧠 Chat with your Financial Assistant")

def run_chat():
    user_query = st.session_state.get("user_query", "")
    if not user_query.strip():
        st.warning("Please enter a query.")
        return
    with st.spinner("GPT thinking..."):
        try:
            response = run_gpt_agent(user_query, st.session_state.chat_history)
            st.session_state.session_result = response
            st.session_state.chat_history.append((user_query, response))
            st.session_state.clear_input = True
        except Exception as e:
            st.error(f"❌ GPT Error: {e}")

# Clear input before rendering widget if flag is set
if st.session_state.clear_input:
    st.session_state.user_query = ""
    st.session_state.clear_input = False

# Chat input and send button in a row
chat_col1, chat_col2 = st.columns([8,1])
with chat_col1:
    st.text_input(
        "Type your message...",
        key="user_query",
        placeholder="e.g. How much SIP for 1 crore in 10 years?",
        label_visibility="collapsed",
        on_change=run_chat
    )
with chat_col2:
    if st.button("Send"):
        run_chat()

# --- Improved Chat History Visualization ---
if st.session_state.chat_history:
    st.markdown("---")
    st.markdown("#### 💬 Conversation")
    for i, (q, a) in enumerate(st.session_state.chat_history[-10:]):
        st.markdown(
            f"""
<div style='margin-bottom:18px'>
  <div style='background:#dbeafe;padding:14px 18px 10px 18px;
              border-radius:16px 16px 6px 16px;
              margin-bottom:4px;
              box-shadow:0 2px 8px #0001;'>
    <span style='font-weight:bold;color:#2563eb;'>You:</span>
    <span style='color:#1e293b;font-size:1.08em;'>{q}</span>
  </div>
  <div style='background:#f0fdf4;padding:14px 18px 10px 18px;
              border-radius:16px 16px 16px 6px;
              box-shadow:0 2px 8px #0001;'>
    <span style='font-weight:bold;color:#16a34a;'>Assistant:</span>
    <span style='color:#1e293b;font-size:1.08em;'>{a}</span>
  </div>
</div>
""",
            unsafe_allow_html=True
        )

st.divider()

# --- SIDEBAR: Reports ---
with st.sidebar:
    st.markdown("## 📄 Reports & History")
    st.markdown("---")

    # Multi-tool report button
    if st.button("🧾 Generate Multi-Tool Summary Report", use_container_width=True):
        from fpdf import FPDF
        def remove_emojis(text):
            return re.sub(r'[^\x00-\x7F]+', '', text)
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=14)
        pdf.cell(0, 10, "Multi-Tool Financial Summary", ln=True, align='C')
        pdf.ln(10)
        for tool_name in ["SIP", "Loan", "Budget", "Stock", "Portfolio", "Goal Planner"]:
            if tool_name in st.session_state.tool_results:
                pdf.set_font("Arial", style="B", size=12)
                pdf.cell(0, 10, remove_emojis(tool_name + " Analysis"), ln=True)
                pdf.set_font("Arial", size=11)
                pdf.multi_cell(0, 8, remove_emojis(st.session_state.tool_results[tool_name]))
                pdf.ln(5)
                pdf.set_draw_color(0, 0, 0)
                pdf.set_line_width(0.3)
                pdf.line(10, pdf.get_y(), 200, pdf.get_y())
                pdf.ln(2)
        output_dir = "generated"
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.join(output_dir, f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        pdf.output(filename)
        with open(filename, "rb") as f:
            st.download_button("📥 Download Multi-Tool PDF", data=f, file_name=os.path.basename(filename), mime="application/pdf")

    # Last result PDF
    if st.session_state.session_result:
        if st.button("📄 Download Last Result as PDF", use_container_width=True):
            pdf_path = generate_pdf_summary(st.session_state.session_result)
            with open(pdf_path, "rb") as f:
                st.download_button("📥 Download PDF", data=f, file_name=os.path.basename(pdf_path), mime="application/pdf")

    st.markdown("---")
    with st.expander("💬 Recent Chat History", expanded=False):
        if st.session_state.chat_history:
            for i, (q, a) in enumerate(st.session_state.chat_history[-10:]):
                st.markdown(f"**You:** {q}")
                st.markdown(f"**Assistant:** {a}")
        else:
            st.info("No chat history yet.")

# --- EXTRA TOOLS BELOW CHAT ---

st.markdown("---")
st.markdown("## 🛠️ Explore More Financial Tools")

# --- Loan EMI Calculator ---
with st.expander("🏦 Loan EMI Calculator", expanded=False):
    st.write("Calculate your monthly EMI and see your loan breakdown.")
    col1, col2, col3 = st.columns(3)
    with col1:
        principal = st.number_input("Loan Amount (₹)", min_value=1000.0, step=1000.0, value=500000.0)
    with col2:
        loan_years = st.slider("Tenure (Years)", min_value=1, max_value=30, value=5)
    with col3:
        loan_rate = st.number_input("Interest Rate (%)", min_value=1.0, max_value=20.0, value=10.0)
    if st.button("Calculate EMI"):
        loan_result, loan_fig = loan_projection(principal, loan_years, loan_rate)
        st.markdown(loan_result)
        st.plotly_chart(loan_fig, use_container_width=True)
        st.session_state.session_result = loan_result
        st.session_state.tool_results["Loan"] = loan_result

# --- SIP Calculator ---
with st.expander("📈 SIP Calculator", expanded=False):
    st.write("Estimate your wealth creation with monthly SIP investments.")
    col1, col2, col3 = st.columns(3)
    with col1:
        amount = st.number_input("Monthly Investment (₹)", min_value=100.0, step=100.0, value=10000.0)
    with col2:
        years = st.slider("Investment Duration (Years)", min_value=1, max_value=40, value=10)
    with col3:
        rate = st.number_input("Expected Annual Return (%)", min_value=1.0, max_value=20.0, value=12.0)
    if st.button("Calculate SIP"):
        summary, fig = sip_projection(amount, years, rate)
        st.markdown(summary)
        st.plotly_chart(fig, use_container_width=True)
        st.session_state.session_result = summary
        st.session_state.tool_results["SIP"] = summary

# --- Stock Analysis ---
with st.expander("📊 Stock Analysis", expanded=False):
    st.write("Get real-time data and a 6-month chart for any stock.")
    stock_symbol = st.text_input("Stock Symbol (e.g. AAPL, TSLA, MSFT):", value="AAPL", key="stock_symbol_main")
    if st.button("Analyze Stock"):
        summary, fig = stock_summary_and_chart(stock_symbol)
        st.markdown(summary)
        if fig:
            st.plotly_chart(fig, use_container_width=True)
        st.session_state.session_result = summary
        st.session_state.tool_results["Stock"] = summary

# --- Budget Planner ---
with st.expander("💡 Monthly Budget Planner", expanded=False):
    st.write("Plan your monthly expenses and visualize your savings.")
    col1, col2, col3 = st.columns(3)
    with col1:
        income = st.number_input("Monthly Income (₹)", min_value=1000.0, step=1000.0, value=100000.0)
        rent = st.number_input("Rent (₹)", min_value=0.0, step=500.0, value=30000.0)
    with col2:
        food = st.number_input("Food (₹)", min_value=0.0, step=500.0, value=15000.0)
        transport = st.number_input("Transport (₹)", min_value=0.0, step=500.0, value=5000.0)
    with col3:
        entertainment = st.number_input("Entertainment (₹)", min_value=0.0, step=500.0, value=7000.0)
        other = st.number_input("Other Expenses (₹)", min_value=0.0, step=500.0, value=8000.0)
    if st.button("Analyze Budget"):
        budget_result, budget_fig = budget_projection(income, rent, food, transport, entertainment, other)
        st.markdown(budget_result)
        st.plotly_chart(budget_fig, use_container_width=True)
        st.session_state.session_result = budget_result
        st.session_state.tool_results["Budget"] = budget_result

# --- Goal-Based Planner ---
with st.expander("🎯 Goal-Based Financial Planner", expanded=False):
    st.write("Plan your SIP to reach a future financial goal.")
    goal_amount = st.number_input("Target Goal Amount (₹)", min_value=10000.0, step=10000.0, value=5000000.0)
    goal_years = st.slider("Years to Reach Goal", min_value=1, max_value=40, value=10)
    expected_return = st.slider("Expected Annual Return (%)", min_value=5.0, max_value=20.0, value=12.0)
    monthly_income = st.number_input("Monthly Income (₹)", min_value=5000.0, step=1000.0, value=100000.0)
    if st.button("Generate Goal Plan"):
        goal_result, goal_fig = goal_projection(goal_amount, goal_years, monthly_income, expected_return)
        st.markdown(goal_result)
        st.plotly_chart(goal_fig, use_container_width=True)
        st.session_state.session_result = goal_result
        st.session_state.tool_results["Goal Planner"] = goal_result

# --- Portfolio Analyzer ---
with st.expander("📦 Portfolio Analyzer (Live)", expanded=False):
    st.write("Analyze your stock portfolio's performance.")
    symbols = st.text_area("Stock Symbols (comma-separated)", value="AAPL,TSLA,INFY.NS")
    quantities = st.text_area("Quantities (comma-separated)", value="10,5,20")
    buy_prices = st.text_area("Buy Prices ₹ (comma-separated)", value="150,600,1300")
    if st.button("Analyze Portfolio"):
        try:
            sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
            qty_list = [int(q.strip()) for q in quantities.split(",") if q.strip()]
            price_list = [float(p.strip()) for p in buy_prices.split(",") if p.strip()]
            if not (len(sym_list) == len(qty_list) == len(price_list)):
                raise ValueError("Please ensure the number of symbols, quantities, and buy prices are the same.")
            portfolio_input = [
                {"symbol": sym, "quantity": qty, "buy_price": price}
                for sym, qty, price in zip(sym_list, qty_list, price_list)
            ]
            df = analyze_portfolio(portfolio_input)
            st.dataframe(df, use_container_width=True)
            total_invested = df["Invested ₹"].sum()
            total_now = df["Now ₹"].sum()
            net_gain = df["Profit/Loss ₹"].sum()
            pct_return = (net_gain / total_invested) * 100 if total_invested else 0
            portfolio_summary = f"""
### Portfolio Summary:
- Total Invested: ₹{total_invested:,.2f}
- Current Value: ₹{total_now:,.2f}
- Net Profit/Loss: ₹{net_gain:,.2f}
- Overall Return: {pct_return:.2f}%
"""
            st.markdown(portfolio_summary)
            st.session_state.tool_results["Portfolio"] = portfolio_summary

            # --- Portfolio Pie Chart: Allocation by Stock ---
            fig_pie = go.Figure(
                data=[go.Pie(
                    labels=df["Symbol"],
                    values=df["Now ₹"],
                    hole=0.4,
                    marker=dict(line=dict(color='#fff', width=2))
                )]
            )
            fig_pie.update_layout(
                title="Portfolio Allocation by Stock",
                legend_title="Stock"
            )
            st.plotly_chart(fig_pie, use_container_width=True)

            # --- Portfolio Bar Chart: Profit/Loss per Stock ---
            fig_bar = go.Figure(
                data=[go.Bar(
                    x=df["Symbol"],
                    y=df["Profit/Loss ₹"],
                    marker_color=["#22c55e" if v >= 0 else "#ef4444" for v in df["Profit/Loss ₹"]],
                    text=[f"₹{v:,.2f}" for v in df["Profit/Loss ₹"]],
                    textposition="outside"
                )]
            )
            fig_bar.update_layout(
                title="Profit/Loss by Stock",
                xaxis_title="Stock",
                yaxis_title="Profit/Loss (₹)",
                showlegend=False
            )
            st.plotly_chart(fig_bar, use_container_width=True)

        except Exception as e:
            st.error(f"❌ Invalid input: {e}")

# --- Expense Categorization ---
with st.expander("🧾 Expense Categorization from Bank Statement", expanded=False):
    st.write("Upload your bank or credit card statement (.csv or .pdf) to auto-categorize your expenses.")
    uploaded_file = st.file_uploader("Upload Statement (.csv or .pdf)", type=["csv", "pdf"])
    if uploaded_file:
        filetype = "csv" if uploaded_file.name.endswith(".csv") else "pdf"
        # Save file temporarily
        temp_path = f"temp_statement.{filetype}"
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.read())
        try:
            from tools.expense_categorizer import process_statement, expense_summary
            df = process_statement(temp_path, filetype)
            summary, unusual = expense_summary(df)
            st.subheader("Monthly Expense Breakdown")
            st.bar_chart(summary)
            st.dataframe(df[["Date", "Description", "Amount", "Category"]], use_container_width=True)
            if not unusual.empty:
                st.warning("⚠️ Unusual Expenses Detected:")
                st.dataframe(unusual[["Date", "Description", "Amount"]], use_container_width=True)
        except Exception as e:
            st.error(f"Failed to process statement: {e}")
        finally:
            os.remove(temp_path)

# --- Tax Optimization + GPT Summary ---
with st.expander("🧾 Tax Optimization & GPT Summary", expanded=False):
    st.write("Enter your salary and deductions, or upload Form 16/salary slip for auto-fill.")
    uploaded_form16 = st.file_uploader("Upload Form 16 or Salary Slip (PDF)", type=["pdf"])
    auto_salary, auto_basic, auto_hra, auto_rent = 0, 0, 0, 0
    if uploaded_form16:
        with pdfplumber.open(uploaded_form16) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        match = re.search(r'Gross Salary.*?(\d[\d,]*)', text)
        if match:
            auto_salary = int(match.group(1).replace(',', ''))
        match = re.search(r'Basic.*?(\d[\d,]*)', text)
        if match:
            auto_basic = int(match.group(1).replace(',', ''))
        match = re.search(r'HRA.*?(\d[\d,]*)', text)
        if match:
            auto_hra = int(match.group(1).replace(',', ''))
        match = re.search(r'Rent.*?(\d[\d,]*)', text)
        if match:
            auto_rent = int(match.group(1).replace(',', ''))
        st.success("Auto-filled values from your document. Please review below.")

    col1, col2 = st.columns(2)
    with col1:
        salary = st.number_input("Annual Gross Salary (₹)", min_value=100000, step=10000, value=auto_salary or 800000)
        basic_salary = st.number_input("Annual Basic Salary (₹)", min_value=10000, step=10000, value=auto_basic or 400000)
        rent = st.number_input("Annual Rent Paid (₹)", min_value=0, step=10000, value=auto_rent or 180000)
        hra_received = st.number_input("Annual HRA Received (₹)", min_value=0, step=10000, value=auto_hra or 120000)
    with col2:
        deductions_80c = st.number_input("80C Deductions (₹)", min_value=0, step=10000, value=100000)
        deductions_80d = st.number_input("80D (Health Insurance) (₹)", min_value=0, step=5000, value=0)
        deductions_80e = st.number_input("80E (Education Loan Interest) (₹)", min_value=0, step=5000, value=0)
        deductions_80g = st.number_input("80G (Donations) (₹)", min_value=0, step=5000, value=0)
        nps_employer = st.number_input("Employer NPS Contribution (₹)", min_value=0, step=5000, value=0)
    if st.button("Optimize Tax"):
        from tools.tax_saver import tax_summary_gpt, calc_tax_old_regime, calc_tax_new_regime
        summary = tax_summary_gpt(
            salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
            nps_employer, deductions_80e, deductions_80g
        )
        st.markdown(summary)
        # Visualize tax breakup
        old_tax, old_taxable = calc_tax_old_regime(
            salary, rent, deductions_80c, deductions_80d, hra_received, basic_salary,
            nps_employer, deductions_80e, deductions_80g
        )
        new_tax, new_taxable = calc_tax_new_regime(salary, nps_employer)
        fig = go.Figure(data=[
            go.Bar(name="Old Regime", x=["Taxable Income", "Tax Payable"], y=[old_taxable, old_tax], marker_color="#2563eb"),
            go.Bar(name="New Regime", x=["Taxable Income", "Tax Payable"], y=[new_taxable, new_tax], marker_color="#16a34a")
        ])
        fig.update_layout(barmode='group', title="Tax Comparison: Old vs New Regime")
        st.plotly_chart(fig, use_container_width=True)
        # Save profile for year-on-year comparison
        if st.button("Save Profile for Year-on-Year Comparison"):
            profile = {
                "salary": salary, "basic_salary": basic_salary, "rent": rent, "hra_received": hra_received,
                "deductions_80c": deductions_80c, "deductions_80d": deductions_80d,
                "deductions_80e": deductions_80e, "deductions_80g": deductions_80g,
                "nps_employer": nps_employer, "year": datetime.now().year
            }
            if "tax_profiles" not in st.session_state:
                st.session_state.tax_profiles = []
            st.session_state.tax_profiles.append(profile)
            st.success("Profile saved!")
        if "tax_profiles" in st.session_state and st.session_state.tax_profiles:
            st.markdown("#### 📅 Saved Profiles")
            st.dataframe(st.session_state.tax_profiles)

# --- News-Driven Portfolio Risk Analysis ---
with st.expander("🌐 News-Driven Portfolio Risk Analysis", expanded=False):
    st.write("Get a risk summary for your portfolio based on the latest news.")
    news_symbols = st.text_input("Enter stock symbols (comma-separated)", value="ADANIENT.NS,INFY.NS")
    if st.button("Analyze News Risks"):
        from tools.news_risk import analyze_portfolio_risk
        symbols = [s.strip().upper() for s in news_symbols.split(",") if s.strip()]
        with st.spinner("Fetching news and analyzing risks..."):
            risk_summary = analyze_portfolio_risk(symbols)
        st.markdown(risk_summary)

st.divider()


