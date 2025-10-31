import { useState, useEffect } from "react";
import OverviewMetrics from './frankfinn/OverviewMetrics';
import CourseAndAgentAnalytics from './frankfinn/CourseAndAgentAnalytics';
import CallTrendsAndEligibility from './frankfinn/CallTrendsAndCalendar';
import { Search, X } from 'lucide-react';
 
const Admin = ({ isSidebarOpen, isSidebarCollapsed }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [agentPerformance, setAgentPerformance] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDetail, setAgentDetail] = useState(null);
  const [loadingAgentDetail, setLoadingAgentDetail] = useState(false);
 
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/frankfinn-dashboard");
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error(data.error || "Failed to load dashboard data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
 
    const fetchAgentPerformance = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/get-all-agents-performance");
        const data = await response.json();
        if (data.success) {
          setAgentPerformance(data);
        }
      } catch (err) {
        console.error("Error fetching agent performance:", err);
      }
    };
 
    fetchDashboardData();
    fetchAgentPerformance();
  }, []);
 
  const fetchStudentNames = async () => {
    if (students.length > 0) {
      setShowStudents(!showStudents);
      return;
    }
 
    setLoadingStudents(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/get-student-names");
      const result = await response.json();
     
      if (result.success) {
        setStudents(result.students || []);
        setShowStudents(true);
      } else {
        throw new Error(result.error || "Failed to load student names");
      }
    } catch (err) {
      console.error("Error fetching student names:", err);
      alert("Failed to load student names: " + err.message);
    } finally {
      setLoadingStudents(false);
    }
  };
 
  const fetchAgentDetail = async (agentName) => {
    setLoadingAgentDetail(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/get-agent-performance/${agentName}`);
      const result = await response.json();
     
      if (result.success) {
        setAgentDetail(result);
      } else {
        throw new Error(result.error || "Failed to load agent details");
      }
    } catch (err) {
      console.error("Error fetching agent details:", err);
      alert("Failed to load agent details: " + err.message);
    } finally {
      setLoadingAgentDetail(false);
    }
  };
 
  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-white transition-all duration-300"
        style={{
          marginLeft: isSidebarCollapsed ? '6rem' : '14rem',
          width: `calc(100% - ${isSidebarCollapsed ? '6rem' : '14rem'})`,
        }}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-800">Loading Frankfinn Dashboard...</p>
          <p className="text-gray-500">Preparing your institute analytics</p>
        </div>
      </div>
    );
  }
 
  return (
    <div
      className="relative mt-8 py-8 space-y-8 min-h-screen transition-all duration-300 pr-6 bg-white"
      style={{
        marginLeft: isSidebarCollapsed ? '6rem' : '14rem',
        width: `calc(100% - ${isSidebarCollapsed ? '6rem' : '14rem'})`,
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Frankfinn Institute Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Comprehensive call analytics and student insights</p>
      </div>
     
      {/* Enhanced Overview Metrics */}
      <div>
        <OverviewMetrics
          data={dashboardData?.overview_metrics}
          cardHeight="140px"
          className="mb-6"
          onFetchStudents={fetchStudentNames}
          onFetchAgentDetail={fetchAgentDetail}
          agentPerformance={agentPerformance}
          loadingStudents={loadingStudents}
          showStudents={showStudents}
          students={students}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          agentDetail={agentDetail}
          loadingAgentDetail={loadingAgentDetail}
        />
      </div>
     
      {/* Course Analytics & Top Performing Agent */}
      <CourseAndAgentAnalytics
        dashboardData={dashboardData}
        agentPerformance={agentPerformance}
      />
 
      {/* Call Trends & Eligibility Statistics */}
      <CallTrendsAndEligibility
        dashboardData={dashboardData}
      />
    </div>
  );
};
 
export default Admin;
 