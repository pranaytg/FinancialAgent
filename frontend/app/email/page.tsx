'use client';

import { useState } from 'react';

interface EmailResult {
  success: boolean;
  message: string;
}

export default function FinancialReports() {
  const [formData, setFormData] = useState({
    email: '',
    portfolio_value: '',
    monthly_income: '',
    monthly_expenses: '',
    financial_goals: '',
    risk_tolerance: 'moderate',
    report_type: 'comprehensive'
  });
  
  const [result, setResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Financial Report' },
    { value: 'portfolio', label: 'Portfolio Analysis Report' },
    { value: 'budget', label: 'Budget & Expense Analysis' },
    { value: 'goals', label: 'Financial Goals Progress' },
    { value: 'tax', label: 'Tax Planning Summary' },
    { value: 'risk', label: 'Risk Assessment Report' }
  ];

  const riskTolerances = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Create form data as expected by the backend
      const reportContent = `Financial Report Summary:
- Portfolio Value: ₹${formData.portfolio_value}
- Monthly Income: ₹${formData.monthly_income}
- Monthly Expenses: ₹${formData.monthly_expenses}
- Financial Goals: ${formData.financial_goals}
- Risk Tolerance: ${formData.risk_tolerance}
- Report Type: ${formData.report_type}`;

      // Create a simple text file for the report
      const reportBlob = new Blob([reportContent], { type: 'text/plain' });
      const reportFile = new File([reportBlob], 'financial_report.txt', { type: 'text/plain' });

      const formDataObj = new FormData();
      formDataObj.append('to_email', formData.email);
      formDataObj.append('subject', `Your ${formData.report_type} Financial Report`);
      formDataObj.append('body', `Please find your ${formData.report_type} financial report attached.`);
      formDataObj.append('file', reportFile);

      const response = await fetch('http://localhost:8000/api/send-email/', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error('Failed to generate and send report');
      }

      const data = await response.json();
      setResult({ success: true, message: data.result });
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const quickScenarios = [
    { 
      portfolio: 1000000, 
      income: 80000, 
      expenses: 50000, 
      goals: 'Buy a house in 5 years, retirement planning',
      label: 'Young Professional' 
    },
    { 
      portfolio: 2500000, 
      income: 150000, 
      expenses: 90000, 
      goals: 'Children education, early retirement at 50',
      label: 'Mid-Career Executive' 
    },
    { 
      portfolio: 5000000, 
      income: 250000, 
      expenses: 120000, 
      goals: 'Wealth preservation, legacy planning',
      label: 'Senior Professional' 
    },
  ];

  const handleQuickFill = (scenario: typeof quickScenarios[0]) => {
    setFormData(prev => ({
      ...prev,
      portfolio_value: scenario.portfolio.toString(),
      monthly_income: scenario.income.toString(),
      monthly_expenses: scenario.expenses.toString(),
      financial_goals: scenario.goals
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Financial Reports
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Generate comprehensive financial reports and get them delivered to your email
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Report Configuration
            </h2>

            {/* Quick Scenarios */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Quick Fill:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickScenarios.map((scenario) => (
                  <button
                    key={scenario.label}
                    onClick={() => handleQuickFill(scenario)}
                    className="p-3 text-sm bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 text-left"
                  >
                    <div className="font-medium text-purple-700 dark:text-purple-300">{scenario.label}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Portfolio: ₹{(scenario.portfolio / 100000).toFixed(1)}L | Income: ₹{(scenario.income / 1000).toFixed(0)}K/month
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={generateReport} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Report Type
                </label>
                <select
                  name="report_type"
                  value={formData.report_type}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Portfolio Value (₹)
                  </label>
                  <input
                    type="number"
                    name="portfolio_value"
                    value={formData.portfolio_value}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 80000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Monthly Expenses (₹)
                </label>
                <input
                  type="number"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 50000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Risk Tolerance
                </label>
                <select
                  name="risk_tolerance"
                  value={formData.risk_tolerance}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  {riskTolerances.map(tolerance => (
                    <option key={tolerance.value} value={tolerance.value}>
                      {tolerance.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Financial Goals
                </label>
                <textarea
                  name="financial_goals"
                  value={formData.financial_goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="e.g., Buy a house in 5 years, children's education, retirement planning..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating Report...
                  </div>
                ) : (
                  'Generate & Send Report'
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
              Report Status
            </h2>

            {result ? (
              <div className="space-y-6">
                {result.success ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                      ✅
                    </div>
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Report Sent Successfully!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {result.message}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                      ❌
                    </div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                      Report Generation Failed
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {result.message}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Ready to Generate
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Fill in your details to generate a personalized financial report
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Types Info */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
              Available Report Types
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  📊
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Comprehensive Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete financial overview with all aspects covered
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  💼
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Portfolio Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detailed investment portfolio performance and recommendations
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl">
                  🎯
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Goals & Tax Planning</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Progress tracking and tax optimization strategies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
              Report Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📈
                </div>
                <span className="text-slate-700 dark:text-slate-300">Performance Analytics</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                  💡
                </div>
                <span className="text-slate-700 dark:text-slate-300">AI Recommendations</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📊
                </div>
                <span className="text-slate-700 dark:text-slate-300">Visual Charts</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm">
                  🔒
                </div>
                <span className="text-slate-700 dark:text-slate-300">Secure Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
