'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import ParticleSystem from "../components/ParticleSystem";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const tools = [
    {
      name: "AI Chat Assistant",
      href: "/chat",
      icon: "🧠",
      desc: "Get intelligent financial guidance powered by AI",
      gradient: "from-blue-600 to-purple-600",
      delay: "delay-100"
    },
    {
      name: "SIP Calculator",
      href: "/sip",
      icon: "📈",
      desc: "Plan your systematic investment strategy",
      gradient: "from-green-600 to-teal-600",
      delay: "delay-200"
    },
    {
      name: "Loan Calculator",
      href: "/loan",
      icon: "🏦",
      desc: "Calculate EMI and plan your loans",
      gradient: "from-orange-600 to-red-600",
      delay: "delay-300"
    },
    {
      name: "Tax Optimizer",
      href: "/tax",
      icon: "🧾",
      desc: "Maximize your tax savings efficiently",
      gradient: "from-indigo-600 to-blue-600",
      delay: "delay-[400ms]"
    },
    {
      name: "Risk Analysis",
      href: "/news",
      icon: "📊",
      desc: "Real-time portfolio risk assessment",
      gradient: "from-purple-600 to-pink-600",
      delay: "delay-500"
    },
    {
      name: "Financial Reports",
      href: "/email",
      icon: "📧",
      desc: "Automated insights and PDF reports",
      gradient: "from-teal-600 to-cyan-600",
      delay: "delay-[600ms]"
    },
    {
      name: "Budget Analyzer",
      href: "/budget",
      icon: "💰",
      desc: "Track and optimize your monthly budget",
      gradient: "from-emerald-600 to-green-600",
      delay: "delay-700"
    },
    {
      name: "Goal Planner",
      href: "/goals",
      icon: "🎯",
      desc: "Plan and achieve your financial goals",
      gradient: "from-yellow-600 to-orange-600",
      delay: "delay-[800ms]"
    },
    {
      name: "Portfolio Tracker",
      href: "/portfolio",
      icon: "📈",
      desc: "Monitor your investment portfolio performance",
      gradient: "from-violet-600 to-purple-600",
      delay: "delay-[900ms]"
    },
    {
      name: "Stock Analysis",
      href: "/stocks",
      icon: "📈",
      desc: "Research and analyze individual stocks",
      gradient: "from-blue-600 to-indigo-600",
      delay: "delay-1000"
    },
    {
      name: "Expense Categorizer",
      href: "/expenses",
      icon: "🧾",
      desc: "Automatically categorize your expenses",
      gradient: "from-pink-600 to-rose-600",
      delay: "delay-[1100ms]"
    },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-grid-enhanced">
      {/* Particle System */}
      <ParticleSystem />
      
      {/* Mouse follower effect */}
      <div 
        className="fixed top-0 left-0 w-4 h-4 bg-blue-400 rounded-full pointer-events-none z-50 opacity-50 animate-pulse transition-all duration-100 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 8}px, ${mousePosition.y - 8}px)`,
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)`
        }}
      />
      <div 
        className="fixed top-0 left-0 w-8 h-8 border border-purple-400 rounded-full pointer-events-none z-40 opacity-30 transition-all duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px)`,
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:60px_60px] opacity-30"></div>
      
      {/* Floating orbs with enhanced animations */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animate-morph"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animate-morph" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animate-morph" style={{ animationDelay: '4s' }}></div>
      
      {/* Sparkle effects */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-sparkle"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        {/* Hero Section with Enhanced Animations */}
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg animate-bounce-in animate-glow-pulse">
            <span className="text-2xl animate-heartbeat">💰</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 animate-slide-up animate-text-shimmer animate-gradient-shift">
            FinanceAI
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 animate-slide-up animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Your intelligent financial companion for smarter investment decisions, 
            comprehensive planning, and automated insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/chat"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 glow animate-magnetic overflow-hidden"
            >
              <span className="relative z-10">Start Financial Chat</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700 transform skew-x-12"></div>
            </Link>
            
            <Link
              href="/sip"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:animate-wiggle"
            >
              <span className="mr-2 group-hover:animate-bounce">📈</span>
              Try SIP Calculator
            </Link>
          </div>
        </div>

        {/* Tools Grid with Enhanced Animations */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4 animate-fade-in animate-text-shimmer">
            Financial Tools & Services
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-12 animate-fade-in animate-slide-up">
            Comprehensive suite of AI-powered financial tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:rotate-1 animate-scale-in ${tool.delay}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transformOrigin: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) rotate(1deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 animate-gradient-shift`}></div>
                
                {/* Shimmer effect */}
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700 transform skew-x-12"></div>
                
                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${tool.gradient} rounded-xl mb-6 text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in`} style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                    <span className="group-hover:animate-wiggle">{tool.icon}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 animate-slide-in-left" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                    {tool.name}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed animate-slide-in-right" style={{ animationDelay: `${index * 0.1 + 0.4}s` }}>
                    {tool.desc}
                  </p>
                  
                  <div className="mt-6 inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.5}s` }}>
                    <span>Explore</span>
                    <svg className="w-4 h-4 ml-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {/* Floating particles on hover */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section with Mind-blowing Animations */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-12 animate-fade-in animate-text-shimmer">
            Why Choose FinanceAI?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-8 group hover:scale-105 transition-all duration-500 animate-flip-in hover:animate-glow-pulse cursor-pointer relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shimmer effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000 transform skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 animate-bounce-in group-hover:animate-heartbeat">
                  🔒
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Secure & Private</h3>
                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">Your financial data is protected with enterprise-grade security</p>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-6 right-6 w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-6 left-6 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>
            
            <div className="glass rounded-2xl p-8 group hover:scale-105 transition-all duration-500 animate-flip-in hover:animate-glow-pulse cursor-pointer relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shimmer effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000 transform skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 animate-bounce-in group-hover:animate-magnetic">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Lightning Fast</h3>
                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">Get instant calculations and real-time market insights</p>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-6 right-6 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-6 left-6 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>
            
            <div className="glass rounded-2xl p-8 group hover:scale-105 transition-all duration-500 animate-flip-in hover:animate-glow-pulse cursor-pointer relative overflow-hidden" style={{ animationDelay: '0.5s' }}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shimmer effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000 transform skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 animate-bounce-in group-hover:animate-wiggle">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">AI-Powered</h3>
                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">Advanced AI algorithms for personalized financial advice</p>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-6 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-6 left-6 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
