'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface BudgetResult {
  summary: string;
}

export default function BudgetAnalyzer() {
  const [formData, setFormData] = useState({
    income: 50000,
    rent: 15000,
    food: 8000,
    transport: 5000,
    entertainment: 3000,
    other: 2000
  });
  
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const analyzeBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/budget/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze budget');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate budget metrics
  const totalExpenses = formData.rent + formData.food + formData.transport + formData.entertainment + formData.other;
  const savings = formData.income - totalExpenses;
  const savingsPercentage = formData.income > 0 ? ((savings / formData.income) * 100).toFixed(1) : 0;

  // Expense breakdown data for pie chart
  const expenseData = [
    { name: 'Rent', value: formData.rent, color: '#EF4444' },
    { name: 'Food', value: formData.food, color: '#F97316' },
    { name: 'Transport', value: formData.transport, color: '#EAB308' },
    { name: 'Entertainment', value: formData.entertainment, color: '#22C55E' },
    { name: 'Other', value: formData.other, color: '#3B82F6' },
    { name: 'Savings', value: savings > 0 ? savings : 0, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'];

  // Budget recommendations data
  const recommendedBudget = {
    rent: Math.min(formData.income * 0.3, formData.rent),
    food: Math.min(formData.income * 0.15, formData.food),
    transport: Math.min(formData.income * 0.1, formData.transport),
    entertainment: Math.min(formData.income * 0.05, formData.entertainment),
    other: Math.min(formData.income * 0.1, formData.other),
    savings: formData.income * 0.3
  };

  const comparisonData = [
    { category: 'Rent', current: formData.rent, recommended: recommendedBudget.rent },
    { category: 'Food', current: formData.food, recommended: recommendedBudget.food },
    { category: 'Transport', current: formData.transport, recommended: recommendedBudget.transport },
    { category: 'Entertainment', current: formData.entertainment, recommended: recommendedBudget.entertainment },
    { category: 'Other', current: formData.other, recommended: recommendedBudget.other },
    { category: 'Savings', current: savings, recommended: recommendedBudget.savings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full mb-6"
            >
              <span className="text-2xl">💰</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4"
            >
              Budget Analyzer
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Track and optimize your monthly budget with AI-powered insights and visual analytics.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Monthly Budget</h2>
                
                <form onSubmit={analyzeBudget} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Monthly Income (₹)</label>
                    <input
                      type="number"
                      name="income"
                      value={formData.income}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="50000"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Rent (₹)</label>
                      <input
                        type="number"
                        name="rent"
                        value={formData.rent}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="15000"
                        min="0"
                        step="500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Food (₹)</label>
                      <input
                        type="number"
                        name="food"
                        value={formData.food}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="8000"
                        min="0"
                        step="500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Transport (₹)</label>
                      <input
                        type="number"
                        name="transport"
                        value={formData.transport}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="5000"
                        min="0"
                        step="500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Entertainment (₹)</label>
                      <input
                        type="number"
                        name="entertainment"
                        value={formData.entertainment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="3000"
                        min="0"
                        step="500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Other Expenses (₹)</label>
                    <input
                      type="number"
                      name="other"
                      value={formData.other}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="2000"
                      min="0"
                      step="500"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Budget"
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-200/50 text-center">
                  <div className="text-2xl font-bold text-emerald-600">₹{formData.income.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly Income</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-200/50 text-center">
                  <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-emerald-200/50 text-center">
                  <div className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{savings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Savings ({savingsPercentage}%)</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Charts and Results */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* Expense Breakdown Pie Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Expense Breakdown
                </h3>
                <div className="h-64 flex items-center">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-2">
                    {expenseData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{entry.name}</div>
                          <div className="text-xs text-gray-600">₹{entry.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget vs Recommended Comparison */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Budget vs Recommended
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="category" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Bar dataKey="current" fill="#10B981" name="Current" />
                      <Bar dataKey="recommended" fill="#3B82F6" name="Recommended" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* API Result */}
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    AI Budget Analysis
                  </h3>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200/50">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                      {result.summary}
                    </pre>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 text-red-800">
                    <span>⚠️</span>
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-2">{error}</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
