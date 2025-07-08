'use client';

import { useState } from "react";

interface StockResult {
  summary?: string;
  symbol?: string;
  name?: string;
  price?: number;
  change?: number | string;
  changePercent?: string;
  marketCap?: number | string;
  peRatio?: number | string;
  sector?: string;
  description?: string;
}

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState<string>("RELIANCE.NS");
  const [result, setResult] = useState<StockResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
    { symbol: "INFY.NS", name: "Infosys" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
    { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
    { symbol: "ITC.NS", name: "ITC Limited" },
    { symbol: "LT.NS", name: "Larsen & Toubro" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!symbol.trim()) {
      setError("Please enter a stock symbol");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/stock/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-6 animate-pulse-slow">
              <span className="text-2xl">📈</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Stock Analysis
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Research and analyze individual stocks with detailed market data and AI-powered insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Stock Symbol</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter Stock Symbol
                    </label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 backdrop-blur-sm text-black placeholder:text-gray-300"
                      placeholder="RELIANCE.NS"
                    />
                    <p className="text-xs text-gray-500">
                      Use NSE format (e.g., RELIANCE.NS) for Indian stocks
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Stock"
                    )}
                  </button>
                </form>

                {/* Popular Stocks */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Popular Stocks</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {popularStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => setSymbol(stock.symbol)}
                        className="text-left p-3 rounded-lg border border-blue-200/50 hover:bg-blue-50 transition-all bg-white/30"
                      >
                        <div className="font-medium text-blue-700">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 text-red-800">
                    <span>⚠️</span>
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-2">{error}</p>
                </div>
              )}

              {result && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-200/50 p-8 animate-slide-up">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Stock Analysis Report</h3>
                  </div>
                  {/* Structured Stock Report */}
                  {typeof result === 'object' && result !== null && (result.symbol || result.price) ? (
                    <div className="space-y-2 text-gray-800 text-base">
                      <div className="font-bold text-lg">{result.symbol} {result.name && <span className="text-gray-500 font-normal">({result.name})</span>}</div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div><span className="font-medium">💰 Current Price:</span> ₹{result.price ?? 'N/A'}</div>
                        <div><span className="font-medium">🔻 Change:</span> {result.change ?? 'N/A'} ({result.changePercent ?? 'N/A'})</div>
                        <div><span className="font-medium">🏢 Market Cap:</span> ₹{result.marketCap ?? 'N/A'}</div>
                        <div><span className="font-medium">📊 PE Ratio:</span> {result.peRatio ?? 'N/A'}</div>
                        <div><span className="font-medium">🏷️ Sector:</span> {result.sector ?? 'N/A'}</div>
                      </div>
                      {result.description && <div className="mt-4 text-gray-600">{result.description}</div>}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                          {result.summary}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result && !error && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-200/50 p-8">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <p>Enter a stock symbol to get detailed analysis and insights</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock Analysis Features */}
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📊</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Technical Analysis</h4>
                <p className="text-sm text-gray-600">Charts, indicators, and price patterns analysis.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">💰</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Financial Metrics</h4>
                <p className="text-sm text-gray-600">P/E ratio, market cap, and key financial ratios.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📈</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Price Movement</h4>
                <p className="text-sm text-gray-600">Historical price data and trend analysis.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">AI Insights</h4>
                <p className="text-sm text-gray-600">AI-powered recommendations and predictions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
