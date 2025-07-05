from langchain.tools import tool
import plotly.graph_objs as go

# 📋 UI summary function (text only)
def loan_summary(principal: float, years: int, rate: float) -> str:
    """Calculate EMI, total payment, and interest for UI use."""
    annual_rate = rate / 100
    r = annual_rate / 12
    n = years * 12

    emi = principal * r * ((1 + r) ** n) / ((1 + r) ** n - 1)
    total_payment = emi * n
    total_interest = total_payment - principal

    return f"""🏦 **Loan EMI Breakdown**
- Principal: ₹{int(principal):,}
- Interest Rate: {rate:.2f}%
- Term: {years} years

💰 EMI: ₹{int(emi):,}/month
📈 Total Payment: ₹{int(total_payment):,}
📉 Total Interest: ₹{int(total_interest):,}
"""

# 🧠 LangChain tool (GPT only)
@tool
def run_loan_tool(principal: float, years: int, rate: float) -> str:
    """LangChain agent tool to calculate EMI, interest, and total payment."""
    return loan_summary(principal, years, rate)

# 📊 UI function with plotly visualization
def loan_projection(principal: float, years: int, rate: float) -> tuple[str, go.Figure]:
    """Returns loan summary with pie chart visualization for Streamlit UI."""
    annual_rate = rate / 100
    r = annual_rate / 12
    n = years * 12

    emi = principal * r * ((1 + r) ** n) / ((1 + r) ** n - 1)
    total_payment = emi * n
    total_interest = total_payment - principal

    summary = f"""🏦 **Loan EMI Breakdown**
- Principal: ₹{int(principal):,}
- Interest Rate: {rate:.2f}%
- Term: {years} years

💰 EMI: ₹{int(emi):,}/month
📈 Total Payment: ₹{int(total_payment):,}
📉 Total Interest: ₹{int(total_interest):,}
"""

    fig = go.Figure(
        data=[
            go.Pie(
                labels=["Principal", "Total Interest"],
                values=[principal, total_interest],
                hole=0.4,
                marker=dict(colors=["#636EFA", "#EF553B"]),
                hoverinfo="label+percent+value",
            )
        ]
    )
    fig.update_layout(
        title="💸 Loan Repayment Breakdown",
        annotations=[{"text": "Loan", "font": {"size": 20}, "showarrow": False}],
        showlegend=True
    )

    return summary, fig
