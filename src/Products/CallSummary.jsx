import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallSummary = ({ isSidebarCollapsed }) => {
  const [stats, setStats] = useState({ total_calls: 0, total_agents: 0 });
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState([
    { label: "Completed Calls", count: 0, percent: 0, color: "from-green-400 to-green-600" },
    { label: "Incomplete Calls", count: 0, percent: 0, color: "from-red-400 to-red-600" }
  ]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callDetails, setCallDetails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-agent-names/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          const filteredAgents = ["All", ...data.agents.filter(agent =>
            agent && agent !== "Not Provided" && agent !== "None"
          )];
          setAgents(filteredAgents);
        } else {
          throw new Error(data.message || "Failed to load agent data");
        }
      } catch (error) {
        console.error("Fetch agents error:", error);
        setError("Failed to load agent data. Please try again later.");
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (agents.length === 0) return;
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsUrl = selectedAgent !== "All"
          ? `http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-total-calls-agents/?agent_name=${encodeURIComponent(selectedAgent)}`
          : "http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-total-calls-agents/";

        const statsResponse = await fetch(statsUrl);
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsResponse.json();
        if (!statsData.success) throw new Error(statsData.message || "Stats data error");

        setStats({
          total_calls: statsData.data.total_calls || 0,
          total_agents: selectedAgent === "All" ? (statsData.data.total_agents || 0) : 1
        });

        const callStatusUrl = selectedAgent !== "All"
          ? `http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-call-status-count/?agent_name=${encodeURIComponent(selectedAgent)}`
          : "http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-call-status-count/";

        const callStatusResponse = await fetch(callStatusUrl);
        if (!callStatusResponse.ok) throw new Error("Failed to fetch call status");
        const callStatusData = await callStatusResponse.json();
        if (!callStatusData.success) throw new Error(callStatusData.message || "Call status data error");

        const completed = callStatusData.data?.call_completion_status_count?.true || 0;
        const incomplete = callStatusData.data?.call_completion_status_count?.not_provided_or_false || 0;
        const total = completed + incomplete;

        setCallData([
          {
            label: "Completed Calls",
            count: completed,
            percent: total > 0 ? (completed / total) * 100 : 0,
            color: "from-green-400 to-green-600"
          },
          {
            label: "Incomplete Calls",
            count: incomplete,
            percent: total > 0 ? (incomplete / total) * 100 : 0,
            color: "from-red-400 to-red-600"
          },
        ]);

        const contactDetailsUrl = selectedAgent !== "All"
          ? `http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-contact-details-count/?agent_name=${encodeURIComponent(selectedAgent)}`
          : "http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-contact-details-count/";

        const contactDetailsResponse = await fetch(contactDetailsUrl);
        if (!contactDetailsResponse.ok) throw new Error("Failed to fetch contact details");
        const contactDetailsData = await contactDetailsResponse.json();
        if (!contactDetailsData.success) throw new Error(contactDetailsData.message || "Contact details error");

        setCustomerData(contactDetailsData.data.map(item => ({
          title: item.title,
          achieved: item.achieved || 0,
          missed: item.missed || 0,
          achievedPercent: item.achievedPercent || 0,
          missedPercent: item.missedPercent || 0,
        })));

        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedAgent, agents]);

  const fetchCallDetails = async (category) => {
    setIsModalOpen(true);
    setSelectedCategory(category);
    setIsLoadingDetails(true);
    setError(null);

    try {
      let endpoint = '', valueField = '', modalTitle = '', responseDataKey = '';
      const normalizedCategory = category.toLowerCase().trim();

      if (normalizedCategory.includes('contact')) {
        endpoint = 'fetch_contacts_agent';
        valueField = 'Contact_Details';
        modalTitle = 'Contact Details';
        responseDataKey = 'contacts';
      } else if (normalizedCategory.includes('email')) {
        endpoint = 'fetch_email_agent';
        valueField = 'email';
        modalTitle = 'Email Details';
        responseDataKey = 'emails';
      } else if (normalizedCategory.includes('name')) {
        endpoint = 'fetch_customer_name_agent';
        valueField = 'customer_name';
        modalTitle = 'Customer Name Details';
        responseDataKey = 'customer_names';
      } else {
        throw new Error('Invalid category');
      }

      const params = {};
      if (selectedAgent !== "All") {
        params.agent_name = selectedAgent;
      }

      const url = `http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/${endpoint}/?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "No data returned");

      const responseData = data.data && data.data[responseDataKey]
        ? Array.isArray(data.data[responseDataKey])
          ? data.data[responseDataKey]
          : []
        : [];

      const transformedData = responseData.map(item => ({
        call_id: item.call_id || 'N/A',
        agent_name: item.agent_name || selectedAgent || 'N/A',
        detail_value: item[valueField] || 'Not Provided',
        status: item[valueField] && item[valueField] !== 'Not Provided' ? "Achieved" : "Missed"
      }));

      setSelectedCategory(modalTitle);
      setCallDetails(transformedData);
    } catch (error) {
      console.error("Error fetching call details:", error);
      setError("Failed to load call details: " + error.message);
      setCallDetails([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Render
  if (!initialLoadComplete || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
        style={{
          marginLeft: isSidebarCollapsed ? '5rem' : '16rem',
          width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})`
        }}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-indigo-800 animate-pulse">Loading call analytics...</p>
          <p className="text-gray-500">Please wait while we prepare your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
        style={{
          marginLeft: isSidebarCollapsed ? '5rem' : '16rem',
          width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})`
        }}>
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

return (
  <div
    className="relative mt-12 py-10 space-y-14 min-h-screen transition-all duration-300 pr-6"
    style={{
      marginLeft: isSidebarCollapsed ? '8rem' : '16rem',
      width: `calc(100% - ${isSidebarCollapsed ? '8rem' : '16rem'})`,
      minHeight: '100vh'
    }}
  >



      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Call Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze call performance metrics</p>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="agent-select" className="block text-sm font-medium text-gray-700 mb-1">Filter by Agent</label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full md:w-64 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            {agents.map((agent, index) => (
              <option key={index} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Calls</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_calls}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Agents</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_agents}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Calls</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{callData[0].count}</h3>
              <p className="text-sm text-green-600 mt-1">{callData[0].percent.toFixed(1)}% success rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Incomplete Calls</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{callData[1].count}</h3>
              <p className="text-sm text-red-600 mt-1">{callData[1].percent.toFixed(1)}% of total</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Call Completion Status - Improved Card */}
        

        {/* Customer Information Collection - Full Width */}
  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Information Collection</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {customerData.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800 mb-3 text-center">{item.title}</h3>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-blue-600">Collected</span>
              <span className="text-xs font-semibold">{item.achieved} ({item.achievedPercent}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${item.achievedPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-amber-500">Not Collected</span>
              <span className="text-xs font-semibold">{item.missed} ({item.missedPercent}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-400 h-2 rounded-full" 
                style={{ width: `${item.missedPercent}%` }}
              ></div>
            </div>
          </div>
          
          <button
            onClick={() => fetchCallDetails(item.title)}
            className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium flex items-center justify-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* Modal for Call Details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-indigo-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {selectedCategory} {selectedAgent !== "All" ? `for ${selectedAgent}` : ''}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-indigo-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              
              {isLoadingDetails ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {selectedCategory.includes('Contact') ? 'Phone' :
                           selectedCategory.includes('Email') ? 'Email' : 'Customer Name'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {callDetails.length > 0 ? (
                        callDetails.map((call, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {call.call_id.length > 20 ? `${call.call_id.substring(0, 20)}...` : call.call_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {call.agent_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {call.detail_value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                call.status === "Achieved" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {call.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => navigate(`/call-evaluation/${call.call_id}`)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Review
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            No {selectedCategory.toLowerCase()} details available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallSummary;