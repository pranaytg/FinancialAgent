'use client';

import { useState } from "react";
import Navigation from "../../components/Navigation";

interface ExpenseResult {
  result: string;
}

export default function ExpenseCategorizer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExpenseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv') || 
          droppedFile.type === "application/vnd.ms-excel" || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a CSV or Excel file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv') || 
          selectedFile.type === "application/vnd.ms-excel" || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a CSV or Excel file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/expense-categorizer/", {
        method: "POST",
        body: formData,
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full mb-6 animate-pulse-slow">
              <span className="text-2xl">🧾</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
              Expense Categorizer
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Automatically categorize your expenses using AI. Upload your expense file and get intelligent categorization.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-pink-200/50 p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload Expense File</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? "border-pink-500 bg-pink-50"
                        : "border-pink-200 hover:border-pink-400 hover:bg-pink-50/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">📁</span>
                      </div>
                      
                      {file ? (
                        <div>
                          <p className="text-pink-700 font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 font-medium">
                            Drop your expense file here
                          </p>
                          <p className="text-sm text-gray-500">
                            Or click to browse (CSV, Excel files)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Format Info */}
                  <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-200/50">
                    <h4 className="font-medium text-gray-800 mb-2">File Format Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSV or Excel files (.csv, .xlsx, .xls)</li>
                      <li>• Should contain expense data with descriptions</li>
                      <li>• Columns like: Date, Description, Amount, etc.</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Categorizing...</span>
                      </div>
                    ) : (
                      "Categorize Expenses"
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
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-pink-200/50 p-8 animate-slide-up">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Categorization Results</h3>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200/50">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                        {result.result}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {!result && !error && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-pink-200/50 p-8">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🧾</span>
                    </div>
                    <p>Upload your expense file to get AI-powered categorization</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-pink-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">🤖</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">AI-Powered</h4>
                <p className="text-sm text-gray-600">Advanced AI algorithms categorize expenses automatically with high accuracy.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-pink-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Fast Processing</h4>
                <p className="text-sm text-gray-600">Process hundreds of expenses in seconds with intelligent categorization.</p>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 border border-pink-200/50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white">📊</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Smart Insights</h4>
                <p className="text-sm text-gray-600">Get detailed breakdown and insights into your spending patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
