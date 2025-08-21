import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaEye, FaTimes, FaStar, FaFilter, FaSort, FaChartBar, FaEnvelope } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 
const CallAnalysis = ({ isSidebarCollapsed }) => {
  const location = useLocation();
  const selectedFiles = location.state?.files || [];
  const navigate = useNavigate();
 
  const [showModal, setShowModal] = useState(selectedFiles.length > 0);
  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [agents, setAgents] = useState([]);
  const [showSentimentPopup, setShowSentimentPopup] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [scoreFilter, setScoreFilter] = useState([0, 10]);
  const [username, setUsername] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
 
  useEffect(() => {
    fetchCallAudit();
  }, []);
 
  const fetchCallAudit = async () => {
    try {
      setLoading(true);
      setError(null);
 
      const response = await axios.get("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-call-audit/");
      console.log("API Response:", response.data);
 
      if (!response.data || !response.data.success) {
        throw new Error("Invalid or failed response from server");
      }
 
      // Transform the response data object into an array
      const callsObject = response.data.data;
      const callDataArray = Object.keys(callsObject).map(callId => {
        const callDetails = callsObject[callId];
        return {
          call_id: callDetails.call_id,
          consultant_name: callDetails.agent_name || "Not Provided",
          student_name: callDetails.customer_name || "Not Provided",
          call_duration: callDetails.call_duration,
          call_disconnected:callDetails.Call_Completion_Status === "True"
    ? "Complete"
    : "Incomplete",
 
          total_score: callDetails.score || 0,
          positive_score: callDetails.positive_sentiment_score || 0,
          negative_score: callDetails.negative_sentiment_score || 0,
          neutral_score: callDetails.neutral_sentiment_score || 0,
          updated_at: callDetails.updated_at,
          product_interest: callDetails.Product_Interest || "Not Provided",
          rawData: callDetails // Store the complete raw data for each call
        };
      });
 
      console.log("Transformed call data:", callDataArray);
      setCallData(callDataArray);
 
      const uniqueAgents = [...new Set(
        callDataArray
          .map(item => item?.consultant_name)
          .filter(name => name && name !== "Not Provided")
      )];
 
      console.log("Unique agents:", uniqueAgents);
      setAgents(uniqueAgents);
    } catch (error) {
      console.error("Error fetching call audit data:", error);
      setError(error.message || "Failed to fetch call data");
    } finally {
      setLoading(false);
    }
  };
 
  const handleGetReport = async () => {
    if (!showUsernameInput) {
      setShowUsernameInput(true);
      return;
    }
 
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }
 
    setIsSendingReport(true);
    try {
      const response = await fetch("https://ft7xj64b-8000.inc1.devtunnels.ms/send-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_name: username }),
      });
 
      const data = await response.json();
      if (response.ok) {
        toast.success("Report sent to your email successfully!");
        setShowUsernameInput(false);
        setUsername("");
      } else {
        throw new Error(data.detail || "Failed to send report");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSendingReport(false);
    }
  };
 
  const isNameMissing = (name) => {
    return !name || name === "Not Provided" || name.trim() === "";
  };
 
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
 
  const sortedData = React.useMemo(() => {
    let sortableData = [...callData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
       
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [callData, sortConfig]);
 
  const filteredData = sortedData.filter(item => {
    const scoreMatch = item.total_score <= scoreFilter[1];
    const agentMatch = selectedAgent === "All" ||
                     item.consultant_name === selectedAgent ||
                     (selectedAgent === "Unknown" && isNameMissing(item.consultant_name));
    return scoreMatch && agentMatch;
  });
 
  const handleSentimentClick = (e, call) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setCurrentSentiment(call);
    setShowSentimentPopup(true);
  };
 
  const closeSentimentPopup = () => {
    setShowSentimentPopup(false);
  };
 
  const formatDuration = (duration) => {
    if (!duration) return '0';
   
    const num = parseFloat(duration);
    if (isNaN(num) || num <= 0) return '0';
 
    const parts = duration.toString().split('.');
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
 
    if (mins === 0) {
      return `${secs} sec`;
    } else if (secs === 0) {
      return `${mins} min`;
    } else {
      return `${mins} min ${secs} sec`;
    }
  };
 
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 7) return 'bg-green-100 text-green-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
 
  const getSentimentColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 7) return 'bg-green-100 text-green-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
 
  const getCompletionStatusColor = (status) => {
    return status === "Complete"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
 
  return (
    <div className="flex h-full w-full min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
 
      {showModal && selectedFiles.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="rounded-xl shadow-2xl p-6 w-full max-w-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Selected Files</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="mb-6 max-h-64">
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="p-2 rounded-lg bg-gray-100"
                  >
                    <span className="text-sm">📁 {file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-500 transition duration-300 shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
 
      <div
        className="mt-16 p-6 transition-all duration-300 w-full"
        style={{
          marginLeft: isSidebarCollapsed ? '5rem' : '11.6rem',
          width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '11rem'})`
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-600 flex items-center">
            <FaChartBar className="mr-3" /> Call Analysis Dashboard
          </h2>
         
          <div className="flex items-center gap-3">
            {showUsernameInput && (
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="px-4 py-2 rounded-lg transition bg-gray-100 text-gray-800 placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleGetReport()}
                />
                {username && (
                  <button
                    onClick={() => setUsername("")}
                    className="absolute right-2 top-2.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
           
            <button
              onClick={handleGetReport}
              disabled={isSendingReport}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white ${isSendingReport ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FaEnvelope />
              {isSendingReport ? 'Sending...' : 'Get Report'}
            </button>
          </div>
        </div>
 
        {error ? (
          <div className="p-6 rounded-xl shadow-md mb-6 bg-red-100">
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div>
                <h3 className="font-bold">Error loading data</h3>
                <p>{error}</p>
                <button
                  onClick={fetchCallAudit}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 rounded-xl shadow-md mb-6 bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Showing <span className="text-blue-600 font-bold">{filteredData.length}</span> calls
                    {selectedAgent !== "All" && (
                      <span className="ml-2">
                        for <span className="font-bold">{selectedAgent}</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
 
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-55">
                    <select
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 w-full appearance-none bg-white cursor-pointer"
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                      <option value="All">All Agents</option>
                      <option value="Unknown">Unknown/Not Provided</option>
                      {agents.map((agent, index) => (
                        <option key={index} value={agent}>{agent}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                  </div>
 
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      showFilters
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    >
                    <FaFilter /> Filters
                  </button>
                </div>
              </div>
 
              {showFilters && (
                <div className="mt-6 p-6 rounded-lg bg-gray-100">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Maximum Score: {scoreFilter[1]}
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">0</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={scoreFilter[1]}
                        onChange={(e) => setScoreFilter([0, parseInt(e.target.value)])}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-300"
                      />
                      <span className="text-xs text-gray-500">10</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Showing calls with score ≤ {scoreFilter[1]}
                    </div>
                  </div>
                </div>
              )}
            </div>
 
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold">Loading call data...</h2>
                <p className="text-gray-500">
                  Please wait while we fetch the latest records
                </p>
              </div>
            ) : (
              <div className="rounded-xl shadow-md w-full">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left cursor-pointer w-32" onClick={() => handleSort('call_id')}>
                        <div className="flex items-center gap-1">
                          Call ID
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('consultant_name')}>
                        <div className="flex items-center gap-1">
                          Agent
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th className="p-4 text-left">Customer</th>
                      <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('updated_at')}>
                        <div className="flex items-center gap-1">
                          Date/Time
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('call_duration')}>
                        <div className="flex items-center gap-1">
                          Duration
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th className="p-4 text-center">Call Status</th>
                      <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('total_score')}>
                        <div className="flex items-center gap-1 justify-center">
                          Score
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th className="p-4 text-center">Sentiment</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-4 w-32">
                            <div className="max-w-[120px] overflow-hidden hover:overflow-x-auto">
                              <button
                                onClick={() => navigate(`/call-details/${encodeURIComponent(item.call_id)}`, { state: { callData: item.rawData } })}
                                className="hover:text-blue-600 text-blue-600 hover:text-blue-500 whitespace-nowrap"
                              >
                                {item.call_id || 'N/A'}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 font-medium">
                            {isNameMissing(item.consultant_name) ? (
                              <span className="text-red-500 underline">Not Provided</span>
                            ) : (
                              item.consultant_name
                            )}
                          </td>
                          <td className="p-4 font-medium">
                            {isNameMissing(item.student_name) ? (
                              <span className="text-red-500 underline">Not Provided</span>
                            ) : (
                              item.student_name
                            )}
                          </td>
                          <td className="p-4 text-sm">{formatDate(item.updated_at)}</td>
                          <td className="p-4">{formatDuration(item.call_duration)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              getCompletionStatusColor(item.call_disconnected)
                            }`}>
                              {item.call_disconnected || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              getScoreColor(item.total_score)
                            }`}>
                              <FaStar className="mr-1" /> {item.total_score || '0'}
                            </span>
                          </td>
                          <td className="p-4 text-center relative">
                            <button
                              onClick={(e) => handleSentimentClick(e, item)}
                              className="p-2 rounded-full transition hover:bg-gray-200"
                              aria-label="View sentiment analysis"
                            >
                              <FaEye className="text-blue-600" />
                            </button>
                          </td>
                          <td className="p-4 text-center space-x-2">
                            <button
                              onClick={() => navigate(`/call-evaluation/${encodeURIComponent(item.call_id)}`, { state: { callData: item.rawData } })}
                              className="px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition bg-blue-500 hover:bg-blue-400 text-white"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                              alt="No data"
                              className="w-24 h-24 opacity-50 mb-4"
                            />
                            <h3 className="text-lg font-medium">No calls found matching your criteria</h3>
                            <p className="text-gray-500">
                              Try adjusting your filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
 
        {showSentimentPopup && currentSentiment && (
          <div
            className="fixed z-50 rounded-xl shadow-2xl p-4 border bg-white border-gray-200 w-[200px]"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative">
              <button
                onClick={closeSentimentPopup}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={14} />
              </button>
              <h4 className="font-semibold mb-3 text-blue-600">
                Sentiment Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Positive</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      getSentimentColor(currentSentiment.positive_score)
                    }`}>
                      {currentSentiment.positive_score || '0'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(currentSentiment.positive_score || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Negative</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      getSentimentColor(currentSentiment.negative_score)
                    }`}>
                      {currentSentiment.negative_score || '0'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${(currentSentiment.negative_score || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Neutral</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      getSentimentColor(currentSentiment.neutral_score)
                    }`}>
                      {currentSentiment.neutral_score || '0'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-yellow-500"
                      style={{ width: `${(currentSentiment.neutral_score || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default CallAnalysis;
 