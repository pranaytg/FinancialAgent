from langchain.tools import tool
import plotly.graph_objs as go

@tool
def run_budget_tool(income: float, rent: float, food: float, transport: float, entertainment: float, other: float) -> str:
    """Analyze monthly income and expenses to suggest budget optimization."""
    total_expenses = rent + food + transport + entertainment + other
    savings = income - total_expenses
    savings_percent = (savings / income) * 100 if income > 0 else 0

    advice = "✅ Great! You're saving well." if savings_percent >= 20 else "⚠️ Try to reduce expenses or increase income."

    return f"""📊 **Budget Summary**
- Income: ₹{int(income):,}
- Total Expenses: ₹{int(total_expenses):,}
- Savings: ₹{int(savings):,} ({savings_percent:.1f}%)

💡 Advice: {advice}
"""

def budget_projection(income: float, rent: float, food: float, transport: float, entertainment: float, other: float):
    """Returns budget summary + pie chart for Streamlit UI."""
    total_expenses = rent + food + transport + entertainment + other
    savings = income - total_expenses
    savings_percent = (savings / income) * 100 if income > 0 else 0

    summary = f"""📊 **Budget Summary**
- Income: ₹{int(income):,}
- Total Expenses: ₹{int(total_expenses):,}
- Savings: ₹{int(savings):,} ({savings_percent:.1f}%)

💡 {"✅ Great! You're saving well." if savings_percent >= 20 else "⚠️ Try to reduce expenses or increase income."}
"""

    fig = go.Figure(
        data=[
            go.Pie(
                labels=["Rent", "Food", "Transport", "Entertainment", "Other", "Savings"],
                values=[rent, food, transport, entertainment, other, max(savings, 0)],
                marker=dict(colors=["#FF6384", "#36A2EB", "#FFCE56", "#8E44AD", "#2ECC71", "#3498DB"]),
                hole=0.4,
            )
        ]
    )
    fig.update_layout(
        title="💸 Expense Breakdown",
        annotations=[{"text": "₹ Budget", "font": {"size": 20}, "showarrow": False}]
    )

    return summary, fig
