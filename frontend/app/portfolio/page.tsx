'use client';

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import Navigation from "../../components/Navigation";

interface Stock {
  symbol: string;
  quantity: number;
  buy_price: number;
}

interface PortfolioResult {
  summary: any;
}

export default function PortfolioTracker() {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "RELIANCE.NS", quantity: 10, buy_price: 2500 }
  ]);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStock = () => {
    setStocks([...stocks, { symbol: "", quantity: 0, buy_price: 0 }]);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const updateStock = (index: number, field: keyof Stock, value: string | number) => {
    const updatedStocks = [...stocks];
    updatedStocks[index] = { ...updatedStocks[index], [field]: value };
    setStocks(updatedStocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out empty stocks
    const validStocks = stocks.filter(stock => 
      stock.symbol.trim() !== '' && stock.quantity > 0 && stock.buy_price > 0
    );

    if (validStocks.length === 0) {
      setError("Please add at least one valid stock to your portfolio");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/portfolio/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stocks: validStocks,
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

  // Calculate portfolio metrics
  const validStocks = stocks.filter(stock => 
    stock.symbol.trim() !== '' && stock.quantity > 0 && stock.buy_price > 0
  );

  const portfolioMetrics = validStocks.reduce((acc, stock) => {
    const investment = stock.quantity * stock.buy_price;
    // Simulate current price (in real app, this would come from API)
    const currentPrice = stock.buy_price * (0.95 + Math.random() * 0.3); // Random price between -5% to +25%
    const currentValue = stock.quantity * currentPrice;
    const pnl = currentValue - investment;
    const pnlPercentage = ((pnl / investment) * 100);

    acc.totalInvestment += investment;
    acc.currentValue += currentValue;
    acc.totalPnL += pnl;
    acc.stocks.push({
      ...stock,
      currentPrice: Math.round(currentPrice),
      currentValue: Math.round(currentValue),
      investment: Math.round(investment),
      pnl: Math.round(pnl),
      pnlPercentage: Math.round(pnlPercentage * 100) / 100
    });

    return acc;
  }, {
    totalInvestment: 0,
    currentValue: 0,
    totalPnL: 0,
    stocks: [] as any[]
  });

  const overallPnLPercentage = portfolioMetrics.totalInvestment > 0 
    ? ((portfolioMetrics.totalPnL / portfolioMetrics.totalInvestment) * 100).toFixed(2)
    : 0;

  // Portfolio allocation pie chart data
  const allocationData = portfolioMetrics.stocks.map((stock, index) => ({
    name: stock.symbol.replace('.NS', ''),
    value: stock.currentValue,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Performance comparison chart data
  const performanceData = portfolioMetrics.stocks.map(stock => ({
    stock: stock.symbol.replace('.NS', ''),
    invested: stock.investment,
    current: stock.currentValue,
    pnl: stock.pnl
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full mb-6 animate-pulse-slow">
              <span className="text-2xl">📈</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Portfolio Tracker
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Monitor your investment portfolio performance and get detailed analysis of your holdings.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Portfolio Holdings</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {stocks.map((stock, index) => (
                      <div key={index} className="bg-violet-50/50 rounded-xl p-4 border border-violet-200/50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">Stock {index + 1}</h4>
                          {stocks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStock(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Symbol (e.g., RELIANCE.NS)
                            </label>
                            <input
                              type="text"
                              value={stock.symbol}
                              onChange={(e) => updateStock(index, 'symbol', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all bg-white/70"
                              placeholder="RELIANCE.NS"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={stock.quantity}
                                onChange={(e) => updateStock(index, 'quantity', Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all bg-white/70"
                                placeholder="10"
                                min="1"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Buy Price (₹)
                              </label>
                              <input
                                type="number"
                                value={stock.buy_price}
                                onChange={(e) => updateStock(index, 'buy_price', Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 transition-all bg-white/70"
                                placeholder="2500"
                                min="0.01"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addStock}
                    className="w-full bg-violet-100 text-violet-700 font-medium py-2 rounded-xl hover:bg-violet-200 transition-all border border-violet-200"
                  >
                    + Add Another Stock
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Portfolio"
                    )}
                  </button>
                </form>
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
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-8 animate-slide-up">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Portfolio Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {Array.isArray(result.summary) ? (
                      <div className="space-y-3">
                        {result.summary.map((stock: any, index: number) => (
                          <div key={index} className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200/50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {Object.entries(stock).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium text-gray-600 capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="ml-2 text-gray-800">
                                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200/50">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                          {typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!result && !error && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-8">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📈</span>
                    </div>
                    <p>Add your stocks to get a comprehensive portfolio analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-violet-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📊</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Performance Tracking</h4>
                <p className="text-sm text-gray-600">Monitor real-time performance and returns of your investment portfolio.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-violet-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📈</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Portfolio Insights</h4>
                <p className="text-sm text-gray-600">Get detailed insights into your holdings and investment performance.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-violet-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Real-time Data</h4>
                <p className="text-sm text-gray-600">Access up-to-date market data and portfolio valuations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
