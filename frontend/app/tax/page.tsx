'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TaxResult {
  summary?: string;
  old_regime?: {
    taxable_income: number;
    tax_payable: number;
  };
  new_regime?: {
    taxable_income: number;
    tax_payable: number;
  };
  best?: string;
  suggestions?: string[];
  gpt_suggestions?: string;
  gpt_suggestions_list?: string[];
  gpt_suggestions_raw?: string;
}

export default function TaxOptimizer() {
  const [formData, setFormData] = useState({
    salary: '',
    rent: '',
    deductions_80c: '',
    deductions_80d: '',
    hra_received: '',
    basic_salary: ''
  });
  
  const [result, setResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/tax/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salary: parseFloat(formData.salary),
          rent: parseFloat(formData.rent),
          deductions_80c: parseFloat(formData.deductions_80c),
          deductions_80d: parseFloat(formData.deductions_80d),
          hra_received: parseFloat(formData.hra_received),
          basic_salary: parseFloat(formData.basic_salary)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tax optimization');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to calculate tax optimization. Please try again.');
      console.error('Tax calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickScenarios = [
    { salary: 800000, rent: 180000, deductions_80c: 100000, deductions_80d: 0, hra_received: 120000, basic_salary: 400000, label: 'Young Professional' },
    { salary: 1500000, rent: 300000, deductions_80c: 150000, deductions_80d: 25000, hra_received: 200000, basic_salary: 750000, label: 'Mid-Career' },
    { salary: 2500000, rent: 500000, deductions_80c: 150000, deductions_80d: 50000, hra_received: 350000, basic_salary: 1250000, label: 'Senior Executive' },
  ];

  const handleQuickFill = (scenario: typeof quickScenarios[0]) => {
    setFormData({
      salary: scenario.salary.toString(),
      rent: scenario.rent.toString(),
      deductions_80c: scenario.deductions_80c.toString(),
      deductions_80d: scenario.deductions_80d.toString(),
      hra_received: scenario.hra_received.toString(),
      basic_salary: scenario.basic_salary.toString()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">🧾</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Tax Optimizer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Optimize your tax savings with comprehensive analysis of your income and deductions
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Your Financial Details
            </h2>

            {/* Quick Scenarios */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Quick Fill:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {quickScenarios.map((scenario) => (
                  <button
                    key={scenario.label}
                    onClick={() => handleQuickFill(scenario)}
                    className="p-3 text-sm bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 transition-all duration-200"
                  >
                    <div className="font-medium text-indigo-700 dark:text-indigo-300">{scenario.label}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      ₹{(scenario.salary / 100000).toFixed(1)}L salary
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={calculateTax} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Annual Salary (₹)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 1200000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  House Rent Paid (₹)
                </label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 180000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Section 80C Deductions (₹)
                </label>
                <input
                  type="number"
                  name="deductions_80c"
                  value={formData.deductions_80c}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 150000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Section 80D Deductions (₹)
                </label>
                <input
                  type="number"
                  name="deductions_80d"
                  value={formData.deductions_80d}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 25000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  HRA Received (₹)
                </label>
                <input
                  type="number"
                  name="hra_received"
                  value={formData.hra_received}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 120000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Basic Salary (₹)
                </label>
                <input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 600000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Optimizing...
                  </div>
                ) : (
                  'Optimize My Taxes'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Tax Optimization Report
            </h2>

            {result ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center">
                    <span className="mr-2">🧠</span>
                    Tax Analysis Summary
                  </h3>
                  {result.old_regime && result.new_regime ? (
                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-white/70 dark:bg-slate-900/40 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                          <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Old Regime</div>
                          <div>Taxable Income: <span className="font-mono">₹{result.old_regime.taxable_income.toLocaleString()}</span></div>
                          <div>Tax Payable: <span className="font-mono">₹{result.old_regime.tax_payable.toLocaleString()}</span></div>
                        </div>
                        <div className="flex-1 bg-white/70 dark:bg-slate-900/40 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                          <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">New Regime</div>
                          <div>Taxable Income: <span className="font-mono">₹{result.new_regime.taxable_income.toLocaleString()}</span></div>
                          <div>Tax Payable: <span className="font-mono">₹{result.new_regime.tax_payable.toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div className="mt-4 text-lg font-bold text-green-700 dark:text-green-300">
                        Best for you: <span className="underline underline-offset-2">{result.best}</span>
                      </div>
                      <div className="mt-4">
                        <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Suggestions</div>
                        <ul className="list-disc pl-6 space-y-1">
                          {result.suggestions?.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      {result.gpt_suggestions_list && result.gpt_suggestions_list.length > 0 ? (
                        <div className="mt-4">
                          <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">GPT Suggestions</div>
                          <ul className="list-disc pl-6 space-y-1 bg-indigo-100 dark:bg-indigo-900/30 rounded p-3 text-slate-800 dark:text-slate-200">
                            {result.gpt_suggestions_list.map((tip, i) => (
                              <li key={i}><ReactMarkdown>{tip}</ReactMarkdown></li>
                            ))}
                          </ul>
                        </div>
                      ) : result.gpt_suggestions_raw ? (
                        <div className="mt-4">
                          <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">GPT Suggestions</div>
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded p-3 text-slate-800 dark:text-slate-200 prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{result.gpt_suggestions_raw}</ReactMarkdown>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {result.summary}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Ready to Optimize
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Enter your income details to get personalized tax-saving recommendations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tax Tips */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
              Smart Tax Planning Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  💡
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Section 80C</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Maximize deductions up to ₹1.5L through PPF, ELSS, life insurance
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  💡
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Section 80D</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Save up to ₹25K on health insurance premiums for family
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  🏠
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">HRA Benefits</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Claim HRA exemption based on rent paid and salary structure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
