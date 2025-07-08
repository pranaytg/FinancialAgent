'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { FaArrowUp, FaArrowDown, FaMinus, FaCheck, FaTimes, FaPause } from 'react-icons/fa';

type RiskSummary = string | any[] | object;
interface RiskResult {
  risk_summary: RiskSummary;
}

export default function RiskAnalysis() {
  const [symbols, setSymbols] = useState<string[]>(['RELIANCE.NS', 'TCS.NS', 'INFY.NS']);
  const [newSymbol, setNewSymbol] = useState('');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'ITC.NS', name: 'ITC Limited' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' }
  ];

  const addSymbol = () => {
    if (newSymbol.trim() && !symbols.includes(newSymbol.trim().toUpperCase())) {
      setSymbols([...symbols, newSymbol.trim().toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (symbolToRemove: string) => {
    setSymbols(symbols.filter(symbol => symbol !== symbolToRemove));
  };

  const addPopularStock = (symbol: string) => {
    if (!symbols.includes(symbol)) {
      setSymbols([...symbols, symbol]);
    }
  };

  const analyzeRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symbols.length === 0) {
      setError('Please add at least one stock symbol');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/news-risk/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze portfolio risk');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze portfolio risk. Please try again.');
      console.error('Risk analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Portfolio Risk Analysis
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Get AI-powered risk analysis based on latest market news and trends
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stock Selection Form */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Select Portfolio Stocks</h2>
              
              <form onSubmit={analyzeRisk} className="space-y-6">
                {/* Add New Symbol */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Add Stock Symbol
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      placeholder="e.g., TATASTEEL.NS"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addSymbol}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Popular Stocks */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Quick Add Popular Stocks
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {popularStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        type="button"
                        onClick={() => addPopularStock(stock.symbol)}
                        disabled={symbols.includes(stock.symbol)}
                        className="p-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-left"
                      >
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs opacity-75">{stock.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Symbols */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Selected Stocks ({symbols.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {symbols.map((symbol) => (
                      <div
                        key={symbol}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm"
                      >
                        <span>{symbol}</span>
                        <button
                          type="button"
                          onClick={() => removeSymbol(symbol)}
                          className="hover:bg-white/20 rounded-full p-1 transition-colors duration-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || symbols.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 glow font-semibold"
                >
                  {loading ? 'Analyzing Risk...' : 'Analyze Portfolio Risk'}
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {result && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Risk Analysis Report</h2>
                  <div className="space-y-6">
                    {Array.isArray(result.risk_summary) ? (
                      <div className="grid grid-cols-1 gap-6">
                        {result.risk_summary.map((stock: any) => (
                          <div key={stock.symbol || stock.company_name} className="bg-white dark:bg-slate-900/80 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-800 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                                  {stock.company_name || 'Unknown Company'}
                                  <span className="text-xs text-slate-500 font-normal">({stock.symbol || '-'})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {stock.action === 'buy' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1"><FaCheck /> Buy</span>}
                                {stock.action === 'sell' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1"><FaTimes /> Sell</span>}
                                {stock.action === 'hold' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1"><FaPause /> Hold</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Prediction:</span>
                                {stock.prediction === 'up' && <span className="text-green-600 flex items-center gap-1"><FaArrowUp /> Up</span>}
                                {stock.prediction === 'down' && <span className="text-red-600 flex items-center gap-1"><FaArrowDown /> Down</span>}
                                {stock.prediction === 'neutral' && <span className="text-yellow-600 flex items-center gap-1"><FaMinus /> Neutral</span>}
                              </div>
                              {typeof stock.probability === 'number' && (
                                <span className="ml-2 text-xs text-slate-500">Confidence: {stock.probability}%</span>
                              )}
                            </div>
                            {stock.price_trend && Array.isArray(stock.price_trend) && stock.price_trend.length > 0 && (
                              <div className="mb-3">
                                <span className="font-semibold text-xs text-slate-500">6-Month Price Trend</span>
                                <Sparklines data={stock.price_trend} height={40} width={120} margin={4}>
                                  <SparklinesLine color="#7c3aed" style={{ fill: "none" }} />
                                </Sparklines>
                              </div>
                            )}
                            {stock.news && Array.isArray(stock.news) && stock.news.length > 0 && (
                              <div className="mb-2">
                                <span className="font-semibold">Latest News:</span>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                                  {stock.news.map((headline: string, i: number) => (
                                    <li key={i}>{headline}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {stock.risks && Array.isArray(stock.risks) && stock.risks.length > 0 && (
                              <div className="mb-2">
                                <span className="font-semibold">Risks:</span>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                                  {stock.risks.map((risk: string, i: number) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {stock.summary && (
                              <div className="mt-2 text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                                <strong>Summary:</strong> {stock.summary}
                              </div>
                            )}
                            {stock.gpt_suggestion && (
                              <div className="mt-2 text-purple-800 dark:text-purple-200 font-semibold">
                                <strong>GPT Suggestion:</strong> {stock.gpt_suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : typeof result.risk_summary === 'string' ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                            AI Risk Summary
                          </h3>
                          <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {result.risk_summary}
                          </div>
                        </div>
                      </div>
                    ) : result.risk_summary && typeof result.risk_summary === 'object' ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                            AI Risk Summary (JSON)
                          </h3>
                          <pre className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {JSON.stringify(result.risk_summary, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Risk Analysis Tips */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white animate-slide-up">
                <h3 className="text-xl font-bold mb-4">💡 Risk Analysis Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Monitor news and market sentiment regularly</li>
                  <li>• Diversify across different sectors and market caps</li>
                  <li>• Consider macroeconomic factors in your analysis</li>
                  <li>• Use risk analysis as one part of your investment strategy</li>
                  <li>• Stay updated with company-specific developments</li>
                </ul>
              </div>

              {/* Market Info */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 animate-slide-up">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">📈 About Risk Analysis</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our AI-powered risk analysis examines recent news, market trends, and sentiment 
                  analysis for your selected stocks. This helps identify potential risks and 
                  opportunities in your portfolio based on current market conditions.
                </p>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Disclaimer:</strong> This analysis is for informational purposes only 
                    and should not be considered as financial advice. Always consult with a 
                    qualified financial advisor before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
