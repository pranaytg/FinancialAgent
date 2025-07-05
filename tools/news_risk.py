import os
import requests
from agent import run_gpt_agent

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
if not GNEWS_API_KEY:
    raise ValueError("GNEWS_API_KEY environment variable not set. Please set it in your .env file.")

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
    query = symbol_to_name.get(symbol.upper(), symbol)
    url = (
        f"https://gnews.io/api/v4/search?"
        f"q={query}&lang=en&max=5&token={GNEWS_API_KEY}"
    )
    resp = requests.get(url)
    if resp.status_code == 200:
        articles = resp.json().get("articles", [])
        return [f"{a['title']} - {a.get('description','')}" for a in articles]
    return []

def analyze_portfolio_risk(symbols):
    all_news = []
    for symbol in symbols:
        news = fetch_news(symbol)
        if news:
            all_news.append(f"News for {symbol}:\n" + "\n".join(news))
    news_text = "\n\n".join(all_news)
    if not news_text:
        return "No recent news found for the given symbols."
    prompt = f"""
You are a financial risk analyst. Based on the following recent news headlines about these stocks, summarize any risks or red flags for an Indian investor. Be concise and actionable.

{news_text}

Respond in bullet points, mentioning the stock symbol and the risk.
"""
    return run_gpt_agent(prompt, [])