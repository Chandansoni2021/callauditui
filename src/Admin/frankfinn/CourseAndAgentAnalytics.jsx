import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  TrendingUp, BookOpen, Users, Award, Star, Phone, BarChart3, User
} from 'lucide-react';
 
const CourseAndAgentAnalytics = ({ dashboardData, agentPerformance }) => {
  const [courseData, setCourseData] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [chartType, setChartType] = useState('pie');
  const [courseLoading, setCourseLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [courseError, setCourseError] = useState(false);
  const [agentsError, setAgentsError] = useState(false);
 
  // Fetch course analytics data
  // Fetch course analytics data
  useEffect(() => {
    const fetchCourseAnalytics = async () => {
      try {
        setCourseLoading(true);
        setCourseError(false);
        const response = await fetch("http://65.0.95.155:8000/frankfinn-dashboard");
        const data = await response.json();
      
        if (data.success) {
          const courseInterest = data.data?.course_discussed || {};
        
          if (Object.keys(courseInterest).length > 0) {
            // Filter out courses with 0 values
            const formattedData = Object.entries(courseInterest)
              .filter(([name, value]) => value > 0) // यह line 0 values को filter करेगी
              .map(([name, value], idx) => ({
                name,
                value,
                color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"][idx % 8],
                students: value,
              }));
            
            setCourseData(formattedData);
            
            const popular = formattedData
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map(c => ({
                name: c.name,
                inquiries: c.value,
                color: c.color
              }));
            
            setPopularCourses(popular);
          } else {
            setCourseData([]);
            setPopularCourses([]);
          }
        } else {
          setCourseError(true);
          setCourseData([]);
          setPopularCourses([]);
        }
      } catch (err) {
        console.error("Error fetching course analytics:", err);
        setCourseError(true);
        setCourseData([]);
        setPopularCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };
  
    fetchCourseAnalytics();
  }, []);
 
  // Fetch top 5 agents data
  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        setAgentsLoading(true);
        setAgentsError(false);
       
        if (agentPerformance?.agents_performance?.length > 0) {
          // Get top 5 agents by average score
          const topPerformers = agentPerformance.agents_performance
            .sort((a, b) => b.average_score - a.average_score)
            .slice(0, 5);
          setTopAgents(topPerformers);
        } else {
          setTopAgents([]);
        }
      } catch (err) {
        console.error("Error processing top agents:", err);
        setAgentsError(true);
        setTopAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };
 
    fetchTopAgents();
  }, [agentPerformance]);
 
  const CourseAnalytics = () => {
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-800">{payload[0].name}</p>
            <p className="text-sm text-gray-600">{payload[0].value} inquiries</p>
            <p className="text-sm text-gray-600">{payload[0].payload.students} students</p>
          </div>
        );
      }
      return null;
    };
 
    const BarCustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-sm text-gray-600">{payload[0].value} inquiries</p>
            <p className="text-sm text-gray-600">{payload[0].payload.students} students</p>
          </div>
        );
      }
      return null;
    };
 
    if (courseLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading course data...</p>
          </div>
        </div>
      );
    }
 
    if (courseError || courseData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No course data found</p>
            <p className="text-xs mt-1">Failed to fetch course analytics</p>
          </div>
        </div>
      );
    }
 
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Course Analytics
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {/* <button
                onClick={() => setChartType('pie')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'pie' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pie
              </button> */}
              {/* <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bar
              </button> */}
            </div>
         
          </div>
        </div>
       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-64">
          {/* Chart Section */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Interest Distribution</h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={courseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {courseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={courseData.slice(0, 6)} margin={{ top: 5, right: 5, left: 5, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip content={<BarCustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      name="Inquiries"
                      radius={[4, 4, 0, 0]}
                    >
                      {courseData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
 
          {/* Popular Courses */}
          <div className="flex flex-col">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Most Popular Courses</h4>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-44">
              {popularCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-center flex-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 shadow-sm"
                      style={{ backgroundColor: course.color + '20' }}
                    >
                      <Users className="w-3 h-3" style={{ color: course.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.inquiries} inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
           
            {/* Summary Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-600">Total Courses</p>
                <p className="text-lg font-bold text-gray-800">{courseData.length}</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                <p className="text-xs font-medium text-green-600">Total Inquiries</p>
                <p className="text-lg font-bold text-gray-800">
                  {courseData.reduce((sum, course) => sum + course.value, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  const AgentPerformance = () => {
    const getScoreColor = (score) => {
      if (score >= 8.5) return "text-green-600 bg-green-100";
      if (score >= 7.5) return "text-yellow-600 bg-yellow-100";
      return "text-red-600 bg-red-100";
    };
 
    const getCompletionColor = (rate) => {
      if (rate >= 90) return "text-green-600";
      if (rate >= 80) return "text-yellow-600";
      return "text-red-600";
    };
 
    if (agentsLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading agent data...</p>
          </div>
        </div>
      );
    }
 
    if (agentsError || topAgents.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No agent data found</p>
            <p className="text-xs mt-1">Failed to fetch agent performance data</p>
          </div>
        </div>
      );
    }
 
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Top 5 Performing Agents
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            This Month
          </span>
        </div>
 
        <div className="space-y-3 h-64 overflow-y-auto pr-2">
          {/* Top Agent Leaderboard with scroll */}
          <div className="space-y-2">
            {topAgents.map((agent, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{agent.agent_name}</h4>
                      <p className="text-xs text-gray-500">
                        {agent.specialization || "General Counseling"}
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Top Performer
                    </span>
                  )}
                </div>
 
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center justify-center space-x-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="font-bold text-gray-800 text-sm">{agent.total_calls}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Calls</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(agent.average_score)}`}>
                      {agent.average_score}/10
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Performance Summary */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h5 className="font-semibold text-gray-800 text-sm mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Performance Summary
            </h5>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-600">Avg Agent Score</p>
                <p className="font-bold text-lg text-gray-800">
                  {(topAgents.reduce((sum, agent) => sum + agent.average_score, 0) / topAgents.length).toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <div className="flex gap-6 mb-6">
      {/* Course Analytics - Left Side */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4 min-h-[350px]">
        <CourseAnalytics />
      </div>
     
      {/* Top Performing Agents - Right Side with reduced height */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4 min-h-[350px]">
        <AgentPerformance />
      </div>
    </div>
  );
};
 
export default CourseAndAgentAnalytics;
 