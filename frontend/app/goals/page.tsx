'use client';

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import Navigation from "../../components/Navigation";

interface GoalResult {
  summary: string;
}

export default function GoalPlanner() {
  const [goalAmount, setGoalAmount] = useState<number>(1000000);
  const [years, setYears] = useState<number>(5);
  const [income, setIncome] = useState<number>(50000);
  const [annualReturn, setAnnualReturn] = useState<number>(12);
  const [result, setResult] = useState<GoalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/goal-planner/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal_amount: goalAmount,
          years: years,
          income: income,
          annual_return: annualReturn,
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

  // Calculate goal metrics
  const monthlyReturn = annualReturn / 100 / 12;
  const totalMonths = years * 12;
  const requiredMonthlySIP = goalAmount / (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn));
  const totalInvestment = requiredMonthlySIP * totalMonths;
  const totalReturns = goalAmount - totalInvestment;
  
  // Generate progress chart data
  const chartData = [];
  let currentValue = 0;
  let totalInvested = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    currentValue = currentValue * (1 + monthlyReturn) + requiredMonthlySIP;
    totalInvested = requiredMonthlySIP * month;
    
    if (month % 12 === 0 || month === totalMonths) {
      chartData.push({
        year: Math.ceil(month / 12),
        value: Math.round(currentValue),
        invested: totalInvested,
        target: (goalAmount / years) * Math.ceil(month / 12)
      });
    }
  }

  // Pie chart data for goal breakdown
  const pieData = [
    { name: 'Investment', value: totalInvestment, color: '#3B82F6' },
    { name: 'Returns', value: totalReturns, color: '#10B981' }
  ];

  const COLORS = ['#3B82F6', '#10B981'];

  // Monthly budget breakdown
  const budgetData = [
    { category: 'Goal SIP', amount: requiredMonthlySIP, percentage: ((requiredMonthlySIP / income) * 100).toFixed(1) },
    { category: 'Available', amount: income - requiredMonthlySIP, percentage: (((income - requiredMonthlySIP) / income) * 100).toFixed(1) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <Navigation />
      
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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full mb-6"
            >
              <span className="text-2xl">🎯</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4"
            >
              Goal Planner
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Plan and achieve your financial goals with smart investment strategies and timeline projections.
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
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Goal Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Goal Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="1000000"
                      min="1000"
                      step="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Time Period (Years)
                    </label>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="5"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="50000"
                      min="1000"
                      step="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Expected Annual Return (%)
                    </label>
                    <input
                      type="number"
                      value={annualReturn}
                      onChange={(e) => setAnnualReturn(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="12"
                      min="1"
                      max="50"
                      step="0.1"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Planning...</span>
                      </div>
                    ) : (
                      "Plan My Goal"
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-200/50 text-center">
                  <div className="text-2xl font-bold text-yellow-600">₹{Math.round(requiredMonthlySIP).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly SIP Required</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-200/50 text-center">
                  <div className="text-2xl font-bold text-orange-600">{((requiredMonthlySIP / income) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Of Monthly Income</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-200/50 text-center">
                  <div className="text-2xl font-bold text-green-600">₹{Math.round(totalInvestment).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Investment</div>
                </div>
                <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-200/50 text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{Math.round(totalReturns).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Expected Returns</div>
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
              {/* Goal Progress Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Goal Progress Projection
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
                        tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                        labelFormatter={(label) => `Year ${label}`}
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
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
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

              {/* Goal Breakdown Pie Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Investment vs Returns
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
                  <div className="w-1/2 space-y-3">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{entry.name}</div>
                          <div className="text-sm text-gray-600">₹{entry.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Income Allocation Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-200/50 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Monthly Income Allocation
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                      <YAxis dataKey="category" type="category" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                      <Tooltip 
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Bar dataKey="amount" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* API Result */}
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-200/50 p-6"
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    AI Goal Analysis
                  </h3>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200/50">
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

          {/* Additional Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">💡</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Smart Planning</h4>
                <p className="text-sm text-gray-600">Get AI-powered recommendations for achieving your financial goals efficiently.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">⏰</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Timeline Analysis</h4>
                <p className="text-sm text-gray-600">Understand how much time and investment you need for your goals.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📈</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Growth Projection</h4>
                <p className="text-sm text-gray-600">See how your investments can grow over time with compound returns.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}