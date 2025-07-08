# tools/portfolio.py

import yfinance as yf
import pandas as pd
from nsepy import get_quote


def get_nse_price(symbol):
    """
    Try to fetch the latest price from NSE using nsepy. Returns 0 if fails.
    """
    try:
        # NSE symbols are usually uppercase and without ".NS"
        nse_symbol = symbol.replace(".NS", "").upper()
        quote = get_quote(nse_symbol)
        return quote.get("lastPrice", 0) or 0
    except Exception:
        return 0


def analyze_portfolio(stocks: list[dict]):
    """
    Takes list of {symbol, quantity, buy_price} and returns summary DataFrame.
    """
    results = []

    for stock in stocks:
        current_price = 0
        try:
            ticker = yf.Ticker(stock["symbol"])
            info = ticker.info
            current_price = info.get("regularMarketPrice", 0)
            # Fetch 6-month historical close prices
            hist = ticker.history(period="6mo")
            # Use only the closing prices, convert to list for JSON serialization
            history_prices = hist["Close"].tolist() if not hist.empty else []
            history_dates = pd.Series(hist.index).dt.strftime('%Y-%m-%d').tolist() if not hist.empty else []
        except Exception:
            current_price = 0
            history_prices = []
            history_dates = []

        # If yfinance fails, try NSE as fallback (for Indian stocks)
        if not current_price:
            current_price = get_nse_price(stock["symbol"])

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
            "Return %": round(pct_change, 2),
            "History": history_prices,
            "HistoryDates": history_dates
        })

    return pd.DataFrame(results)