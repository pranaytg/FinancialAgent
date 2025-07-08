import os
import requests
import pandas as pd
import yfinance as yf
from agent import run_gpt_agent

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
if not GNEWS_API_KEY:
    # We don't want to stop the whole application if an API key is missing.
    # Instead, we'll continue and simply skip fetching news headlines.
    print("⚠️  GNEWS_API_KEY environment variable not set – continuing without news headlines.")

# Mapping from symbol to company name for better news results
symbol_to_name = {
    "ADANIENT.NS": "Adani Enterprises",
    "INFY.NS": "Infosys",
    "TCS.NS": "Tata Consultancy Services",
    "RELIANCE.NS": "Reliance Industries",
    "HDFCBANK.NS": "HDFC Bank",
    "SBIN.NS": "State Bank of India",
    "ITC.NS": "ITC Limited",
    "ICICIBANK.NS": "ICICI Bank",
    "LT.NS": "Larsen & Toubro",
    "HINDUNILVR.NS": "Hindustan Unilever",
    # Add more as needed
}

def fetch_news(symbol):
    """Fetch up to 5 recent news headlines for the provided stock symbol.

    If the `GNEWS_API_KEY` is not configured or the API call fails, an empty list
    is returned so that downstream logic is unaffected.
    """

    # Short-circuit when the API key is not configured.
    if not GNEWS_API_KEY:
        return []

    query = symbol_to_name.get(symbol.upper(), symbol)
    url = (
        f"https://gnews.io/api/v4/search?"
        f"q={query}&lang=en&max=5&token={GNEWS_API_KEY}"
    )
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            articles = resp.json().get("articles", [])
            return [f"{a['title']} - {a.get('description','')}" for a in articles]
    except Exception:
        pass  # Fail silently – we'll fallback to an empty list below.
    return []

def fetch_price_trend(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="6mo")
        if not hist.empty:
            return hist["Close"].tolist()
    except Exception:
        pass
    return []

def analyze_portfolio_risk(symbols):
    stock_data = []
    for symbol in symbols:
        news = fetch_news(symbol)
        price_trend = fetch_price_trend(symbol)
        company_name = symbol_to_name.get(symbol.upper(), symbol)
        stock_data.append({
            "symbol": symbol,
            "company_name": company_name,
            "news": news,
            "price_trend": price_trend
        })
    # Build prompt for GPT
    prompt = """
You are a financial risk and investment analyst. For each stock below, you are given:
- The stock symbol and company name
- The latest news headlines
- The 6-month historical price trend (as a list of closing prices)

For each stock, analyze the risk and opportunity, and return a JSON object with:
- symbol
- company_name
- news (list of headlines)
- price_trend (list of prices)
- risks (list of concise, actionable risks)
- action: one of 'buy', 'sell', or 'hold' (with a one-line reason)
- prediction: 'up', 'down', or 'neutral' (for the next 1-3 months)
- probability: a confidence score (0-100%) for your prediction
- summary: a 1-2 sentence summary for the investor
- gpt_suggestion: a clear, actionable suggestion for the investor, taking into account both news and historical trend

Example:
[
  {
    "symbol": "RELIANCE.NS",
    "company_name": "Reliance Industries",
    "news": ["Headline 1", "Headline 2"],
    "price_trend": [100, 102, 105, ...],
    "risks": ["Market volatility is high", "Regulatory changes expected"],
    "action": "hold",
    "prediction": "neutral",
    "probability": 70,
    "summary": "Reliance is stable but faces some regulatory risks.",
    "gpt_suggestion": "Hold your position and monitor regulatory news."
  }
]

Here is the data:
"""
    for stock in stock_data:
        prompt += f"\nStock: {stock['symbol']} ({stock['company_name']})\nNews: {stock['news']}\nPrice Trend: {stock['price_trend']}\n"
    prompt += "\nRespond in valid JSON as a list of objects, one per stock."
    gpt_response = run_gpt_agent(prompt, [])
    import json
    try:
        if isinstance(gpt_response, str) and gpt_response.strip().startswith('```json'):
            gpt_response = gpt_response.strip().removeprefix('```json').removesuffix('```').strip()
        structured = json.loads(gpt_response)
        # Attach news and price_trend to each stock in the response if not already present
        for stock, orig in zip(structured, stock_data):
            if 'news' not in stock:
                stock['news'] = orig['news']
            if 'price_trend' not in stock:
                stock['price_trend'] = orig['price_trend']
        # Return the structured list directly; the API layer will wrap it in
        # a single "risk_summary" property so the frontend sees the expected
        # shape without an extra level of nesting.
        return structured
    except Exception as e:
        return [{
            "symbol": None,
            "company_name": None,
            "news": [],
            "price_trend": [],
            "risks": [],
            "action": "error",
            "prediction": "error",
            "probability": 0,
            "summary": f"Error parsing GPT response: {str(e)}",
            "gpt_suggestion": "Please try again later."
        }]