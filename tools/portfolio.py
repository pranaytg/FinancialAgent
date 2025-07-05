# tools/portfolio.py

import yfinance as yf
import pandas as pd

def analyze_portfolio(stocks: list[dict]):
    """
    Takes list of {symbol, quantity, buy_price} and returns summary DataFrame.
    """
    results = []

    for stock in stocks:
        try:
            ticker = yf.Ticker(stock["symbol"])
            info = ticker.info
            current_price = info.get("regularMarketPrice", 0)
        except Exception:
            current_price = 0

        quantity = stock["quantity"]
        buy_price = stock["buy_price"]
        investment = quantity * buy_price
        current_value = quantity * current_price
        gain_loss = current_value - investment
        pct_change = (gain_loss / investment) * 100 if investment else 0

        results.append({
            "Symbol": stock["symbol"],
            "Qty": quantity,
            "Buy ₹": buy_price,
            "Current ₹": round(current_price, 2),
            "Invested ₹": round(investment, 2),
            "Now ₹": round(current_value, 2),
            "Profit/Loss ₹": round(gain_loss, 2),
            "Return %": round(pct_change, 2)
        })

    return pd.DataFrame(results)