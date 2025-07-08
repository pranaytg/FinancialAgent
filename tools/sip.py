from langchain.tools import tool
import plotly.graph_objs as go
import pandas as pd

@tool
def run_sip_tool(amount: float, years: int, rate: float) -> str:
    """Calculate SIP projected value based on monthly investment amount, years, and annual interest rate."""
    r = rate / 100 / 12
    months = years * 12
    future_value = 0

    for i in range(1, months + 1):
        future_value = future_value * (1 + r) + amount

    invested = amount * months
    gain = future_value - invested

    return f"""📈 **SIP Projection**
- Monthly Investment: ₹{amount}
- Years: {years}
- Annual Return: {rate}%

💰 Total Invested: ₹{int(invested):,}
📈 Projected Value: ₹{int(future_value):,}
📊 Estimated Gain: ₹{int(gain):,}
"""

# For UI: Return Plotly chart
def sip_projection(amount: float, years: int, rate: float):
    r = rate / 100 / 12
    months = years * 12
    values = []
    future_value = 0

    for i in range(1, months + 1):
        future_value = future_value * (1 + r) + amount
        values.append(future_value)

    df = pd.DataFrame({"Month": list(range(1, months + 1)), "Value": values})

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df["Month"], y=df["Value"], mode="lines", name="SIP Growth"))
    fig.update_layout(title="📈 SIP Growth Over Time", xaxis_title="Month", yaxis_title="Value (₹)")

    invested = amount * months
    gain = future_value - invested

    summary = f"""📈 **SIP Projection**
- Monthly Investment: ₹{amount}
- Years: {years}
- Annual Return: {rate}%

💰 Total Invested: ₹{int(invested):,}
📈 Projected Value: ₹{int(future_value):,}
📊 Estimated Gain: ₹{int(gain):,}
"""

    result = {
        "monthly_investment": amount,
        "years": years,
        "rate": rate,
        "total_invested": invested,
        "projected_value": future_value,
        "estimated_gain": gain,
        "summary": summary
    }

    return result, fig
