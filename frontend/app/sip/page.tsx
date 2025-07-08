'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface SIPResult {
  summary: string;
  monthly_investment?: number;
  years?: number;
  rate?: number;
  total_invested?: number;
  projected_value?: number;
  estimated_gain?: number;
}

export default function SIPPage() {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [result, setResult] = useState<SIPResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend-matching SIP calculation
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  let runningValue = 0;
  let totalInvested = 0;
  const chartData = [];

  for (let i = 1; i <= totalMonths; i++) {
    runningValue = runningValue * (1 + monthlyRate) + amount;
    totalInvested = amount * i;
    if (i % 12 === 0 || i === totalMonths) {
      chartData.push({
        year: Math.ceil(i / 12),
        value: Math.round(runningValue),
        invested: totalInvested,
        returns: Math.round(runningValue - totalInvested)
      });
    }
  }

  const futureValue = runningValue;
  const returns = futureValue - totalInvested;

  // Pie chart data
  const pieData = [
    { name: 'Total Investment', value: totalInvested, color: '#3B82F6' },
    { name: 'Returns', value: returns, color: '#10B981' }
  ];
  const COLORS = ['#3B82F6', '#10B981'];

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/sip/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, years, rate })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
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
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full mb-6"
            >
              <span className="text-2xl">📈</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4"
            >
              SIP Calculator
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Plan your systematic investment strategy with visual projections and detailed analysis.
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
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Investment Details</h2>
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleCalculate(); }}>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Monthly Investment (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="10000"
                      min="500"
                      step="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Investment Period (Years)</label>
                    <input
                      type="number"
                      value={years}
                      onChange={e => setYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="10"
                      min="1"
                      max="40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Expected Annual Return (%)</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={e => setRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="12"
                      min="1"
                      max="30"
                      step="0.1"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      'Calculate SIP'
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
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-green-200/50 text-center">
                  <div className="text-2xl font-bold text-green-600">₹{totalInvested.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-600">Total Investment</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-green-200/50 text-center">
                  <div className="text-2xl font-bold text-teal-600">₹{Math.round(returns).toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-600">Returns</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-green-200/50 text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{Math.round(futureValue).toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-600">Final Value</div>
                </div>
              </motion.div>
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
            {/* Charts and Results */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* Growth Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  SIP Growth Projection
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="year" 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={value => `₹${(value/100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={value => [`₹${value.toLocaleString()}`, '']}
                        labelFormatter={label => `Year ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Investment Breakdown Pie Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Investment Breakdown
                </h3>
                <div className="h-64 flex items-center">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={value => [`₹${value.toLocaleString()}`, '']}
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
                  <div className="w-1/2 space-y-3">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{entry.name}</div>
                          <div className="text-sm text-gray-600">₹{entry.value.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* API Result */}
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200/50 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    AI Analysis
                  </h3>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-200/50">
                    <div className="space-y-2 text-gray-800 text-sm font-medium leading-relaxed">
                      <div><span className="font-semibold">📈 SIP Projection</span></div>
                      <div>- Monthly Investment: ₹{result.monthly_investment?.toLocaleString('en-IN')}</div>
                      <div>- Years: {result.years}</div>
                      <div>- Annual Return: {result.rate}%</div>
                      <div className="mt-2">💰 <span className="font-semibold">Total Invested:</span> ₹{result.total_invested?.toLocaleString('en-IN')}</div>
                      <div>📈 <span className="font-semibold">Projected Value:</span> ₹{result.projected_value?.toLocaleString('en-IN')}</div>
                      <div>📊 <span className="font-semibold">Estimated Gain:</span> ₹{result.estimated_gain?.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
