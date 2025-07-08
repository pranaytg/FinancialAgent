'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

interface LoanResult {
  result: string;
}

export default function LoanPage() {
  const [principal, setPrincipal] = useState(500000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(10);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateLoan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/loan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ principal, years, rate }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error calculating loan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick EMI calculation
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
              (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - principal;
  const interestPercentage = ((totalInterest / principal) * 100).toFixed(1);

  // Generate amortization schedule for chart
  const chartData = [];
  let remainingPrincipal = principal;
  
  for (let month = 1; month <= Math.min(totalMonths, 60); month++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = emi - interestPayment;
    remainingPrincipal -= principalPayment;
    
    if (month % 6 === 0 || month === 1) {
      chartData.push({
        month,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        remaining: Math.round(remainingPrincipal > 0 ? remainingPrincipal : 0)
      });
    }
  }

  // Pie chart data for loan breakdown
  const pieData = [
    { name: 'Principal', value: principal, color: '#3B82F6' },
    { name: 'Interest', value: totalInterest, color: '#EF4444' }
  ];

  const COLORS = ['#3B82F6', '#EF4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-6"
            >
              <span className="text-2xl">🏦</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4"
            >
              Loan Calculator
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Calculate EMI, total interest, and payment schedule for your loans with interactive visualizations.
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
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Loan Details</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Principal Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Loan Tenure (Years)
                    </label>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Interest Rate (% per annum)
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="10"
                      step="0.1"
                    />
                  </div>

                  <button
                    onClick={calculateLoan}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Calculating...' : 'Calculate Loan'}
                  </button>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="text-xl font-bold text-orange-600">₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-xl font-bold text-red-600">₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Total Payment</p>
                    <p className="text-xl font-bold text-gray-800">₹{totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Interest %</p>
                    <p className="text-xl font-bold text-red-600">{interestPercentage}%</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visual Dashboard */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* Loan Breakdown Pie Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Loan Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Schedule Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Schedule</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                      <Bar dataKey="principal" stackId="a" fill="#3B82F6" name="Principal" />
                      <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Remaining Balance Chart */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Remaining Balance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                      <Line 
                        type="monotone" 
                        dataKey="remaining" 
                        stroke="#F97316" 
                        strokeWidth={3}
                        dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                        name="Remaining Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Backend Result */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Detailed Analysis</h3>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                  {result.result}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
