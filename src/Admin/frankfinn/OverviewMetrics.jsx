import { useState, useEffect } from "react";
import {
  Phone, Users, Target, Star, GraduationCap, Search, User, X
} from 'lucide-react';

const OverviewMetrics = ({ 
  data, 
  className = "", 
  cardHeight = "auto", 
  cardWidth = "auto",
  onFetchStudents,
  onFetchAgentDetail,
  agentPerformance,
  loadingStudents,
  showStudents,
  students,
  searchTerm,
  setSearchTerm,
  selectedAgent,
  setSelectedAgent,
  agentDetail,
  loadingAgentDetail
}) => {
  const [metrics, setMetrics] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [localShowStudents, setLocalShowStudents] = useState(false);

  useEffect(() => {
    if (data) {
      setMetrics([
        {
          title: "Total Calls",
          value: data?.total_calls || "Not Found",
          icon: Phone,
          color: "blue",
          description: "Total inquiries handled",
          trend: "+12%",
          trendDirection: "up",
          change: 32
        },
        {
          title: "Unique Students",
          value: data?.total_students || "Not Found",
          icon: Users,
          color: "green",
          description: "Distinct student inquiries",
          trend: "+8%",
          trendDirection: "up",
          change: 18,
          showStudents: true  // Hover par students list dikhega
        },
        {
          title: "Completion Rate",
          value: `${data?.completion_rate || "Not Found"}%`,
          icon: Target,
          color: "purple",
          description: "Successful call completion",
          trend: "+5%",
          trendDirection: "up",
          change: 4
        },
        {
          title: "Avg Quality Score",
          value: agentPerformance?.overall_average_score || data?.avg_score || "No Avg Score" ,
          icon: Star,
          color: "orange",
          description: "Out of 10 points",
          trend: "+2%",
          trendDirection: "up",
          change: 0.3,
          showAgents: true  // Hover par agents performance dikhega
        },
        {
          title: "Active Agents",
          value: agentPerformance?.total_agents || data?.total_agents || "No Agent",
          icon: GraduationCap,
          color: "indigo",
          description: "Active counseling agents",
          showAgentsList: true  // Hover par agents list dikhega
        }
      ]);
    }
  }, [data, agentPerformance]);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-500/10 to-blue-600/10',
        border: 'border-blue-200/50',
        gradient: 'from-blue-500 to-blue-600',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-600',
        text: 'text-blue-600'
      },
      green: {
        bg: 'from-green-500/10 to-green-600/10',
        border: 'border-green-200/50',
        gradient: 'from-green-500 to-green-600',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-600',
        text: 'text-green-600'
      },
      purple: {
        bg: 'from-purple-500/10 to-purple-600/10',
        border: 'border-purple-200/50',
        gradient: 'from-purple-500 to-purple-600',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-600',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'from-orange-500/10 to-orange-600/10',
        border: 'border-orange-200/50',
        gradient: 'from-orange-500 to-orange-600',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-600',
        text: 'text-orange-600'
      },
      indigo: {
        bg: 'from-indigo-500/10 to-indigo-600/10',
        border: 'border-indigo-200/50',
        gradient: 'from-indigo-500 to-indigo-600',
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-600',
        text: 'text-indigo-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const getCardStyles = () => {
    const styles = {};
    if (cardHeight !== "auto") styles.height = cardHeight;
    if (cardWidth !== "auto") styles.width = cardWidth;
    return styles;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const filteredStudents = students.filter(student =>
    student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Smooth hover handling with delay
  const handleMouseEnter = (index) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    setHoveredCard(index);
    
    // Automatically fetch students when hovering over Unique Students card
    const metric = metrics[index];
    if (metric?.showStudents && students.length === 0) {
      onFetchStudents();
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCard(null);
    }, 300); // 300ms delay before closing
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCard(null);
    }, 300);
    setDropdownTimeout(timeout);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${className}`}>
      {metrics.map((metric, index) => {
        const colorClasses = getColorClasses(metric.color);
        const Icon = metric.icon;
       
        return (
          <div
            key={index}
            style={getCardStyles()}
            className={`
              relative overflow-visible bg-gradient-to-br ${colorClasses.bg}
              border ${colorClasses.border} rounded-xl p-4 shadow-lg
              hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
              group cursor-pointer backdrop-blur-sm
              ${cardHeight === "auto" ? "min-h-[140px]" : ""}
              ${cardWidth === "auto" ? "min-w-[200px]" : ""}
            `}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 mb-1 tracking-wide">
                    {metric.title}
                  </p>
                  <h3 className="text-xl font-bold text-gray-800">
                    {metric.value}
                  </h3>
                </div>
                <div className={`
                  p-2 rounded-xl ${colorClasses.iconBg} shadow-md
                  group-hover:scale-110 transition-all duration-300
                `}>
                  <Icon className={`w-5 h-5 ${colorClasses.iconColor}`} />
                </div>
              </div>

              {/* Bottom Section - No View Button for Any Card */}
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {metric.description}
                  </p>
                  
                  {/* No View Button - All cards will show dropdown on hover only */}
                </div>
              </div>
            </div>

            {/* Hover Dropdown for Avg Quality Score - Agents Performance with Agent Detail */}
            {hoveredCard === index && metric.showAgents && agentPerformance && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 text-sm">Agent Performance</h4>
                    <span className="text-xs text-gray-500">
                      Avg: {agentPerformance.overall_average_score}/10
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {agentPerformance.agents_performance?.map((agent, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedAgent === agent.agent_name 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedAgent(agent.agent_name);
                          onFetchAgentDetail(agent.agent_name);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="w-3 h-3 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-800">
                              {agent.agent_name}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBgColor(agent.average_score)} ${getScoreColor(agent.average_score)}`}>
                            {agent.average_score}/10
                          </div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{agent.total_calls} calls</span>
                          <span className={`text-xs ${
                            agent.overall_category === 'Excellent' ? 'text-green-600' :
                            agent.overall_category === 'Average' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {agent.overall_category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Agent Detail View - Always enabled for detailed view */}
                  {selectedAgent && agentDetail && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-800 text-sm">
                          {agentDetail.agent_name}'s Performance
                        </h5>
                        <button
                          onClick={() => {
                            setSelectedAgent(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {loadingAgentDetail ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : agentDetail.performance_metrics?.total_calls > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-white rounded border">
                              <div className="font-bold text-gray-800">{agentDetail.performance_metrics.average_score}/10</div>
                              <div className="text-gray-500">Avg Score</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border">
                              <div className="font-bold text-gray-800">{agentDetail.performance_metrics.total_calls}</div>
                              <div className="text-gray-500">Total Calls</div>
                            </div>
                          </div>
                          
                          <div>
                            <h6 className="font-medium text-gray-700 text-xs mb-2">Score Breakdown:</h6>
                            <div className="space-y-1 text-xs">
                              {Object.entries(agentDetail.performance_metrics.score_breakdown || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="font-medium">{value}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-gray-500 text-xs">
                          No performance data available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hover Dropdown for Active Agents - Simple Agents List */}
            {hoveredCard === index && metric.showAgentsList && agentPerformance && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 text-sm">Active Agents</h4>
                    <span className="text-xs text-gray-500">
                      {agentPerformance.total_agents} total
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {agentPerformance.agents_performance?.map((agent, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg border border-gray-200 bg-gray-50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="w-3 h-3 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-800">
                              {agent.agent_name}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBgColor(agent.average_score)} ${getScoreColor(agent.average_score)}`}>
                            {agent.average_score}/10
                          </div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{agent.total_calls} calls</span>
                          <span className={`${
                            agent.overall_category === 'Excellent' ? 'text-green-600' :
                            agent.overall_category === 'Average' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {agent.overall_category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hover Dropdown for Unique Students - Students List */}
            {hoveredCard === index && metric.showStudents && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-green-800 text-sm flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Student List ({students.length})
                      </h3>
                      <button
                        onClick={() => onFetchStudents()}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="mt-2 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {loadingStudents ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Loading students...</p>
                      </div>
                    ) : students.length > 0 ? (
                      <div className="p-3">
                        <div className="grid grid-cols-1 gap-1">
                          {filteredStudents.map((student, index) => (
                            <div
                              key={index}
                              className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-semibold text-green-600">
                                  {student.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-800">{student}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-6 text-center text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">No students found</p>
                        {searchTerm && (
                          <p className="text-xs mt-1">Try a different search term</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OverviewMetrics;