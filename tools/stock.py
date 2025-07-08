# tools/stock.py
import yfinance as yf
import plotly.graph_objs as go
from langchain.tools import tool

def stock_summary_and_chart(symbol="AAPL"):
    """
    Fetch real-time stock data, basic metrics, and show 6-month chart.
    Returns: dict with structured fields, Plotly chart
    """
    try:
        stock = yf.Ticker(symbol)
        info = stock.info

        current_price = info.get("regularMarketPrice", 0)
        previous_close = info.get("previousClose", 0)
        diff = current_price - previous_close
        pct = (diff / previous_close) * 100 if previous_close else 0

        result = {
            "symbol": symbol.upper(),
            "name": info.get("longName", symbol),
            "price": current_price,
            "change": diff,
            "changePercent": f"{pct:.2f}%",
            "marketCap": info.get("marketCap", 0),
            "peRatio": info.get("trailingPE", "N/A"),
            "sector": info.get("sector", "N/A"),
            "description": info.get("longBusinessSummary", "")
        }

        # For legacy fallback
        result["summary"] = f"""\n📈 **{result['name']} ({result['symbol']})**\n\n- 💰 Current Price: ₹{current_price:.2f}\n- 🔻 Change: ₹{diff:.2f} ({pct:.2f}%)\n- 🏷️ Market Cap: ₹{info.get('marketCap', 0):,}\n- 📊 PE Ratio: {info.get('trailingPE', 'N/A')}\n- 🧾 Sector: {info.get('sector', 'N/A')}\n"""

        # Get historical data
        hist = stock.history(period="6mo")
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=hist.index, y=hist["Close"], mode="lines", name="Close Price"))
        fig.update_layout(title=f"{symbol.upper()} - 6 Month Performance", xaxis_title="Date", yaxis_title="Price (₹)")

        return result, fig

    except Exception as e:
        return {"summary": f"❌ Failed to fetch stock data: {e}"}, None

@tool
def run_stock_tool(symbol: str = "AAPL") -> dict:
    """Fetch real-time stock data, basic metrics, and 6-month performance for a given symbol (default: AAPL)."""
    result, _ = stock_summary_and_chart(symbol)
    return result
