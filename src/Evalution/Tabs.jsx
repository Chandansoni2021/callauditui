import { useState, useEffect } from "react";

const Tabs = ({ call_id, isSidebarCollapsed }) => {
  const [selectedTab, setSelectedTab] = useState("AI Summary");
  const [callData, setCallData] = useState(null);
  const [qaPairs, setQaPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [agentName, setAgentName] = useState("");


    // Add the handleSendFeedback function here
  const handleSendFeedback = async () => {
    if (!agentName) {
      setFeedbackStatus({ type: "error", message: "No agent name found to send feedback" });
      return;
    }

    setIsSendingFeedback(true);
    setFeedbackStatus(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Access token not found.");

      const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/audit-call/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          call_id: call_id,
          agent_name: agentName,
          qa_pairs: qaPairs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      const result = await response.json();
      setFeedbackStatus({
        type: "success",
        message: "Feedback sent successfully!",
        details: result,
      });
    } catch (err) {
      setFeedbackStatus({
        type: "error",
        message: err.message || "Failed to send feedback",
      });
      console.error("Feedback Error:", err);
    } finally {
      setIsSendingFeedback(false);
    }
  };
  useEffect(() => {
    if (!call_id) return;

    const fetchCallDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/get-call-details/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            call_id: call_id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.data) {
          setCallData(result.data);
          
          // Extract agent name
          if (result.data.summary?.Sales_Agent?.Name) {
            setAgentName(result.data.summary.Sales_Agent.Name);
          } else if (result.data.transcription) {
            const transcript = result.data.transcription;
            const lines = transcript.split("\n").slice(0, 5);
            for (const line of lines) {
              if (line.includes("This is") && line.includes("from")) {
                const nameMatch = line.match(/This is (\w+) from/);
                if (nameMatch && nameMatch[1]) {
                  setAgentName(nameMatch[1]);
                  break;
                }
              }
            }
          }
          
          // Parse Q/A pairs
          if (result.data.QA_Pairs && result.data.QA_Pairs !== "Not Provided") {
            try {
              const parsedQaPairs = JSON.parse(result.data.QA_Pairs);
              setQaPairs(Array.isArray(parsedQaPairs) ? parsedQaPairs : []);
            } catch (e) {
              console.error("Failed to parse QA pairs:", e);
              setQaPairs([]);
            }
          } else {
            setQaPairs([]);
          }
        } else {
          throw new Error("No data found for this Call ID.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch call details. Please try again.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [call_id]);

  const renderSummary = () => {
    if (!callData?.summary) {
      return (
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-lg font-medium text-gray-600 mt-3">No Summary Available</h4>
          <p className="text-sm text-gray-400">Call summary will appear here</p>
        </div>
      );
    }

    const summary = callData.summary;

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-200/50">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg w-8 h-8 flex items-center justify-center mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Call Summary</h3>
        </div>

        {/* Summary Points */}
        {summary.Summary && Array.isArray(summary.Summary) && (
          <ul className="space-y-3 mb-6">
            {summary.Summary.map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <p className="ml-3 text-gray-700">
                  {item.replace(/^[•\-]\s*/, '')}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Overall Sentiment */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-bold text-blue-600 mb-2">Overall Sentiment</h4>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              summary.Overall_Customer_Sentiment === "Positive" 
                ? "bg-green-100 text-green-800" 
                : summary.Overall_Customer_Sentiment === "Negative" 
                  ? "bg-red-100 text-red-800" 
                  : "bg-gray-100 text-gray-800"
            }`}>
              {summary.Overall_Customer_Sentiment || "Neutral"}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              ({summary.Overall_Customer_Emotion || "No emotion detected"})
            </span>
          </div>
        </div>

        {/* Purpose of Call */}
        {summary.Purpose_of_call && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-purple-600 mb-2">Purpose of Call</h4>
            <p className="text-gray-700">{summary.Purpose_of_call}</p>
          </div>
        )}
      </div>
    );
  };

  const renderTranscript = () => {
    if (!callData?.transcription) {
      return <p className="text-gray-500 italic">No transcript available</p>;
    }

    const lines = callData.transcription.split("\n")
      .filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return <p className="text-gray-500 italic">No transcript content</p>;
    }

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          const isAgent = line.includes(agentName) || 
                         (line.includes("This is") && line.includes("from")) ||
                         line.startsWith("Agent:");

          return (
            <div 
              key={index} 
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                isAgent 
                  ? "bg-gray-100 text-gray-800 rounded-bl-none" 
                  : "bg-blue-600 text-white rounded-br-none"
              }`}>
                <p>{line}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyDetails = () => {
    if (!callData?.summary) {
      return <p className="text-gray-500 italic">No details available</p>;
    }

    const summary = callData.summary;
    const customer = summary.Customer || {};

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h3>
          
          <div className="space-y-3">
            {customer.Name && (
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{customer.Name}</p>
              </div>
            )}
            {customer.Email && (
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href={`mailto:${customer.Email}`} className="font-medium text-blue-600 hover:underline">
                  {customer.Email}
                </a>
              </div>
            )}
            {customer.Contact_Details && (
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{customer.Contact_Details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Call Details Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Details
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-medium">{callData.call_duration || "N/A"} minutes</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500">Quality</p>
              <p className="font-medium">{summary.Call_Quality || "Not rated"}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500">User Satisfaction</p>
              <p className="font-medium">{summary.User_Satisfaction === "Yes" ? "Satisfied" : "Not Satisfied"}</p>
            </div>
            
            {summary.follow_up_call && (
              <div>
                <p className="text-xs text-gray-500">Follow-up Scheduled</p>
                <p className="font-medium">{new Date(summary.follow_up_call).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Agent Information
          </h3>
          
          <div className="space-y-3">
            {summary.Sales_Agent?.Name && (
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{summary.Sales_Agent.Name}</p>
              </div>
            )}
            
            {summary.Sales_Agent?.Company && (
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="font-medium">{summary.Sales_Agent.Company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Next Steps
          </h3>
          
          <div className="space-y-3">
            {summary.Next_Steps && (
              <div>
                <p className="text-xs text-gray-500">Action Items</p>
                <p className="font-medium">{summary.Next_Steps}</p>
              </div>
            )}
            
            {customer.Pricing_Details && (
              <div>
                <p className="text-xs text-gray-500">Pricing</p>
                <p className="font-medium">{customer.Pricing_Details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Performance */}
        {summary.Sales_Agent_Score && (
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Agent Performance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(summary.Sales_Agent_Score).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-bold ${
                      value >= 8 ? 'text-green-600' :
                      value >= 5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {value}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        value >= 8 ? 'bg-green-500' :
                        value >= 5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${value * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQAPairs = () => {
    if (qaPairs.length === 0) {
      return (
        <div className="text-center py-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-600">No Q/A pairs available</h4>
          <p className="text-sm text-gray-400 mt-1">Questions and answers will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {qaPairs.map((pair, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Question Section */}
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Customer Query</h4>
                  <p className="text-gray-700 mt-1">{pair.customer_question || "No question provided"}</p>
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="p-4 space-y-4">
              {/* Executive Answer */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start mb-2">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Executive Answer</h4>
                    <p className="text-gray-700 mt-1">{pair.executive_answer || "No answer provided"}</p>
                  </div>
                </div>
              </div>

              {/* AI Answer */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">AI Suggested Answer</h4>
                    <p className="text-gray-700 mt-1">{pair.ai_answer || "No AI answer provided"}</p>
                  </div>
                </div>
              </div>

              {/* Score and Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Score */}
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-semibold text-gray-800 mb-2">Quality Score</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className={`h-3 rounded-full ${
                            pair.score >= 7 ? 'bg-green-500' :
                            pair.score >= 4 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${pair.score * 10}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${
                        pair.score >= 7 ? 'text-green-600' :
                        pair.score >= 4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {pair.score}/10
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  {pair.strengths?.length > 0 && (
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {pair.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {pair.improvements?.length > 0 && (
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-semibold text-yellow-600 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Improvements
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {pair.improvements.map((improvement, i) => (
                          <li key={i}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Feedback Section */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Send Performance Feedback
          </h3>
          
          <div className="space-y-4">
            {agentName ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Agent:</p>
                <p className="text-lg font-semibold text-blue-600">{agentName}</p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                <p>No agent name found in call details</p>
              </div>
            )}

            {feedbackStatus && (
              <div className={`p-4 rounded-lg ${
                feedbackStatus.type === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                <div className="flex items-center">
                  {feedbackStatus.type === "success" ? (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <p>{feedbackStatus.message}</p>
                </div>
                {feedbackStatus.details && (
                  <div className="mt-2 text-sm bg-white/50 p-2 rounded">
                    <p className="font-medium">Email preview:</p>
                    <p className="text-gray-600">{feedbackStatus.details.feedback_email_preview}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSendFeedback}
              disabled={isSendingFeedback || !agentName}
              className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
                isSendingFeedback
                  ? "bg-blue-400 cursor-not-allowed"
                  : !agentName
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              }`}
            >
              {isSendingFeedback ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Feedback to Agent
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              This will send an email to {agentName || "the agent"} with performance feedback based on the Q/A pairs above.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`bg-white p-4 h-full flex flex-col rounded-xl mb-8 transition-all duration-300 shadow-lg ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
      style={{
        width: isSidebarCollapsed ? 'calc(100% - 5rem)' : 'calc(100% - 16rem)'
      }}
    >
      {/* Enhanced Tab Navigation */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-full max-w-4xl bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-1 shadow-inner border border-blue-100">
          <div className="flex">
            {["AI Summary", "Transcript", "Key Details", "Q/A Pairs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg relative z-10 transition-all duration-300 ${
                  selectedTab === tab
                    ? "text-blue-700 bg-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center justify-center">
                  {tab === "AI Summary" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {tab === "Transcript" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )}
                  {tab === "Key Details" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {tab === "Q/A Pairs" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {tab}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-500 border-b-transparent rounded-full animate-spin animation-delay-200"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg font-semibold">Loading call details...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
        </div>
      )}

      {error && (
        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Error Loading Data</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
          </button>
        </div>
      )}

      {!loading && !error && callData && (
        <div className="mt-2 flex-1 overflow-y-auto">
          {selectedTab === "AI Summary" && renderSummary()}
          {selectedTab === "Transcript" && renderTranscript()}
          {selectedTab === "Key Details" && renderKeyDetails()}
          {selectedTab === "Q/A Pairs" && renderQAPairs()}
        </div>
      )}
    </section>
  );
};

export default Tabs;