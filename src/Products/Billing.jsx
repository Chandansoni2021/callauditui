import { useState, useEffect } from "react";
import {
  Clock, DollarSign, Calendar, TrendingUp, Download,
  Users, CreditCard, RefreshCw, Zap, PieChart, Sparkles,
  Check, Star, Crown, Shield, Infinity, FileText, BarChart3,
  MessageSquare, Mail, Database, Settings
} from 'lucide-react';

const Billing = ({ isSidebarCollapsed }) => {
  const [quotaData, setQuotaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fetch quota data from backend
  useEffect(() => {
    const fetchQuotaData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://65.0.95.155:8000/quota-summary-with-history/frankfinn?include_history=true', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuotaData(data);
      } catch (err) {
        console.error("Error fetching quota data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotaData();
  }, []);

  // Updated pricing plans based on your structure
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      tagline: 'Light Snapshot, Low Cost',
      target: 'Small teams & startups',
      price: '₹',
      period: '/month',
      calls: '1500 calls/month',
      icon: FileText,
      color: 'from-blue-500 to-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      badge: 'ESSENTIAL FEATURES',
      features: [
        'Call Metadata (agent, duration, date/time)',
        'Transcript + AI Summary (short + detailed)',
        'Sentiment & Emotion Analysis',
        'Agent Performance Score (basic)',
        'Customer Satisfaction Prediction',
        'Basic Dashboard (calls, duration, trends)'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      tagline: 'Deep Insights & Actions',
      target: 'Growing businesses',
      price: '₹',
      period: '/month',
      calls: '1500 calls/month',
      icon: BarChart3,
      color: 'from-green-500 to-green-700',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      popular: true,
      badge: 'MOST POPULAR',
      features: [
        'All Basic Plan features',
        'Q&A Extraction (customer questions vs agent answers)',
        'Follow-up Suggestions',
        'Next Plan Recommendations',
        'Audio Markers (timestamp-based highlights)',
        'Advanced Dashboard Analytics',
        'Report Export (PDF/Excel)'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      tagline: 'Automation & Compliance',
      target: 'Enterprise organizations',
      price: '₹',
      period: '/month',
      calls: '1500 calls/month',
      icon: Settings,
      color: 'from-purple-500 to-purple-700',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      badge: 'ENTERPRISE GRADE',
      features: [
        'All Standard Plan features',
        'Q&A Validation (compare with knowledge base)',
        'Improved Answer Generation (company data)',
        'Automated Feedback Mail to agents',
        'Custom KPIs + Advanced Reports',
        'CRM & Helpdesk Integrations',
        'Real-time API Access',
        'Dedicated Manager + 24/7 Support'
      ]
    }
  ];

  // Progress bar color based on usage percentage
  const getProgressColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent < 50) return 'from-blue-400 to-blue-600';
    if (percent < 80) return 'from-green-400 to-green-600';
    return 'from-orange-400 to-orange-600';
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div
        className="relative mt-12 py-8 space-y-8 min-h-screen transition-all duration-300 pr-6 bg-gray-50"
        style={{
          marginLeft: isSidebarCollapsed ? '6rem' : '14rem',
          width: `calc(100% - ${isSidebarCollapsed ? '11rem' : '15rem'})`,
          minHeight: '100vh'
        }}
      >
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-10 h-10 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-800">
              Loading Your Dashboard
            </p>
            <p className="text-gray-600 text-lg">Preparing your usage insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex justify-center items-center min-h-screen bg-gray-50"
        style={{
          marginLeft: isSidebarCollapsed ? '5rem' : '16rem',
          width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})`
        }}
      >
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Unable to Load Data
          </h3>
          <p className="text-red-500 mb-6 font-medium bg-red-50 py-2 px-4 rounded-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center mx-auto font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mt-8 py-8 space-y-8 min-h-screen transition-all duration-300 pr-6 bg-gray-50"
      style={{
        marginLeft: isSidebarCollapsed ? '6rem' : '14rem',
        width: `calc(100% - ${isSidebarCollapsed ? '6rem' : '15rem'})`,
        minHeight: '100vh'
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              BILLING DASHBOARD
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800">
            Usage & Quota Dashboard
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Track your call processing minutes and consumption analytics
          </p>
        </div>
        
        {/* <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 border border-gray-300 font-medium">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 font-medium">
            <RefreshCw className="w-4 h-4" />
            <span>Buy More Minutes</span>
          </button>
        </div> */}
      </div>

      {/* Main Quota Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Quota */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Quota</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{quotaData.quota_summary.total_quota} min</h3>
              <p className="text-sm text-blue-500 mt-1">Monthly allocation</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Used Minutes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Used Minutes</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{quotaData.quota_summary.used_minutes} min</h3>
              <p className="text-sm text-orange-500 mt-1">Consumed this month</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Remaining Minutes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Remaining Minutes</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">{quotaData.quota_summary.remaining_minutes} min</h3>
              <p className="text-sm text-gray-600 mt-1">Available balance</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Usage Percentage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Usage Percentage</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{quotaData.quota_summary.usage_percent}</h3>
              <p className="text-sm text-gray-600 mt-1">Of total quota</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(quotaData.quota_summary.usage_percent)} transition-all duration-1000 ease-out`}
                  style={{ width: quotaData.quota_summary.usage_percent }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Consumption History */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Consumption History</h2>
              <p className="text-gray-600 text-sm">Track your processed files and usage</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            {quotaData.consumption_history.length} file{quotaData.consumption_history.length !== 1 ? 's' : ''} processed
          </span>
        </div>
        
        {quotaData.consumption_history.length > 0 ? (
          <div className="space-y-3">
            {quotaData.consumption_history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.file_name}</p>
                    <p className="text-sm text-gray-600">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-500 text-white">
                    {item.used_minutes} min
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Consumed</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-600 font-medium">No consumption history available</p>
            <p className="text-sm text-gray-500 mt-1">Your processed files will appear here</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">User ID</p>
              <h3 className="text-lg font-bold text-gray-800 mt-2">{quotaData.user_id}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Efficiency Score</p>
              <h3 className="text-lg font-bold text-gray-800 mt-2">Excellent</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Next Billing</p>
              <h3 className="text-lg font-bold text-gray-800 mt-2">1st Nov 2025</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Billing;