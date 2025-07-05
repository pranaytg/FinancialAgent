# tools/goal_planner.py

import plotly.graph_objects as go
from math import ceil
from langchain.tools import tool

def calculate_required_sip(goal_amount: float, years: int, annual_return: float = 12.0) -> float:
    """
    Calculate monthly SIP required to reach a goal using future value formula.
    """
    r = annual_return / 100 / 12
    n = years * 12
    sip = goal_amount * r / (((1 + r) ** n - 1))
    return round(sip, 2)

def goal_projection(goal_amount: float, years: int, income: float, annual_return: float = 12.0):
    required_sip = calculate_required_sip(goal_amount, years, annual_return)

    can_afford = required_sip <= income * 0.4  # max 40% of income for investment

    summary = f"""
🎯 **Goal-Based Plan**

- 🧾 Goal Amount: ₹{int(goal_amount):,}
- 📅 Time Horizon: {years} years
- 📈 Expected Return: {annual_return:.2f}% annually

💰 **Required SIP**: ₹{int(required_sip):,} / month

{"✅ You can afford this plan." if can_afford else "❌ This may not be feasible with your current income."}
(Current income: ₹{int(income):,}/month)
"""

    # Plot future value growth
    values = []
    r = annual_return / 100 / 12
    sip = required_sip
    total = 0

    for i in range(1, years * 12 + 1):
        total = total * (1 + r) + sip
        if i % 12 == 0:
            values.append(round(total))

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=[f"Year {i+1}" for i in range(years)],
        y=values,
        mode="lines+markers",
        name="Investment Growth",
        line=dict(color="green")
    ))
    fig.update_layout(title="📈 SIP Investment Growth Towards Goal", xaxis_title="Year", yaxis_title="Value (₹)")

    return summary, fig

@tool
def run_goal_tool(goal_amount: float, years: int, income: float, annual_return: float = 12.0) -> str:
    """Generate SIP plan for a future goal based on target amount, years, income, and expected return."""
    summary, _ = goal_projection(goal_amount, years, income, annual_return)
    return summary
