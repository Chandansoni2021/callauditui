import { useState, useEffect } from "react";

const Tabs = ({ call_id, isSidebarCollapsed }) => {
  const [selectedTab, setSelectedTab] = useState("AI Summary");
  const [callData, setCallData] = useState(null);
  const [qaPairs, setQaPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  // Function to extract phone numbers from the nested structure
  const extractPhoneNumbers = (phoneData) => {
    if (!phoneData) return "No phone numbers available";
    
    try {
      // If it's an array of phone number objects
      if (Array.isArray(phoneData)) {
        const validNumbers = phoneData
          .filter(item => item.number && item.number !== "discussed" && item.number !== "not provided")
          .map(item => ({
            number: item.number,
            type: item.type || 'unknown',
            context: item.context || ''
          }));
        
        if (validNumbers.length === 0) {
          return "No valid phone numbers found";
        }
        
        // Return formatted phone numbers
        return validNumbers.map(phone => 
          `${phone.number} (${phone.type})`
        ).join(', ');
      }
      
      // If it's a simple string (fallback)
      if (typeof phoneData === 'string' && phoneData !== "not provided") {
        return phoneData;
      }
      
      return "No phone numbers available";
    } catch (error) {
      console.error("Error parsing phone numbers:", error);
      return "Error loading phone numbers";
    }
  };

  // Function to get primary company number
  const getCompanyNumber = (phoneData) => {
    if (!phoneData || !Array.isArray(phoneData)) return null;
    
    const companyNumber = phoneData.find(item => 
      item.type === "company_number" && 
      item.number && 
      item.number !== "discussed" && 
      item.number !== "not provided"
    );
    
    return companyNumber ? companyNumber.number : null;
  };

  // Function to get student number
  const getStudentNumber = (phoneData) => {
    if (!phoneData || !Array.isArray(phoneData)) return null;
    
    const studentNumber = phoneData.find(item => 
      item.type === "student_number" && 
      item.number && 
      item.number !== "discussed" && 
      item.number !== "not provided"
    );
    
    return studentNumber ? studentNumber.number : null;
  };

  // Add the handleSendFeedback function here
  const handleSendFeedback = async () => {
    if (!callData?.Call_Metadata?.Agent_Name || callData.Call_Metadata.Agent_Name === "not provided") {
      setFeedbackStatus({ type: "error", message: "No agent name found to send feedback" });
      return;
    }

    setIsSendingFeedback(true);
    setFeedbackStatus(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Access token not found.");

      const response = await fetch("https://mersols.com/audit-call/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          call_id: call_id,
          agent_name: callData.Call_Metadata.Agent_Name,
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
        const response = await fetch(`https://mersols.com/get-all-call-details?call_id=${call_id}`);
       
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error: ${response.status}`);
        }

        const result = await response.json();
       
        if (result.call_audit_details && result.call_audit_details.length > 0) {
          const callDetails = result.call_audit_details[0];
          setCallData(callDetails);
         
          // Parse Q/A pairs
          if (callDetails.QA_pairs && callDetails.QA_pairs !== "[]") {
            try {
              // Handle both stringified JSON and direct array
              let parsedQaPairs = callDetails.QA_pairs;
              if (typeof parsedQaPairs === 'string') {
                parsedQaPairs = JSON.parse(parsedQaPairs);
              }
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

  // Fixed height container for all tabs content
  const tabContentStyle = {
    height: 'calc(100vh - 200px)', // Adjust this value as per your needs
    minHeight: '500px',
    overflowY: 'auto'
  };

  const renderSummary = () => {
    if (!callData?.Call_Summary) {
      return (
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 h-full flex items-center justify-center">
          <div>
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Summary Available</h4>
            <p className="text-gray-500">Call summary will appear here once generated</p>
          </div>
        </div>
      );
    }

    const summary = callData.Call_Summary;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Call Summary</h3>
            <p className="text-gray-600">AI-generated overview of the conversation</p>
          </div>
        </div>

        {/* Summary Points */}
        {summary.Summary_Bullet_Points && Array.isArray(summary.Summary_Bullet_Points) && (
          <div className="space-y-4 mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Key Conversation Points
            </h4>
            <div className="grid gap-3">
              {summary.Summary_Bullet_Points.map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex-shrink-0 mt-1 mr-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {item.replace(/^[•\-]\s*/, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Score */}
        {callData.Scores && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 mb-6">
            <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Performance Score
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600">
                  {callData.Scores.TotalScore}/10
                </div>
                <div className={`text-lg font-semibold mt-1 ${
                  callData.Scores.Category === "Excellent" ? "text-green-600" :
                  callData.Scores.Category === "Average" ? "text-yellow-600" : "text-red-600"
                }`}>
                  {callData.Scores.Category}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Breakdown</div>
                <div className="text-sm text-gray-700">
                  Professionalism: {callData.Scores.Professionalism}/10
                </div>
                <div className="text-sm text-gray-700">
                  Product Knowledge: {callData.Scores.Product_Knowledge}/10
                </div>
                <div className="text-sm text-gray-700">
                  Communication: {callData.Scores.Communication_Skills}/10
                </div>
                <div className="text-sm text-gray-700">
                  Problem Solving: {callData.Scores.Problem_Solving}/10
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTranscript = () => {
    if (!callData?.Transcript) {
      return (
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 h-full flex items-center justify-center">
          <div>
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Transcript Available</h4>
            <p className="text-gray-500">Call transcript is not available for this call</p>
          </div>
        </div>
      );
    }

    const lines = callData.Transcript.split("\n")
      .filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 italic">No transcript content available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 h-full overflow-y-auto p-4 bg-gray-50 rounded-2xl">
        {lines.map((line, index) => {
          const isAgent = line.includes("Agent:") || line.includes("Executive:") ||
                         (line.includes("This is") && line.includes("from"));

          return (
            <div
              key={index}
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl shadow-sm ${
                isAgent
                  ? "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none shadow-md"
              }`}>
                <div className="flex items-center mb-1">
                  {isAgent ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs font-semibold text-green-600">Agent</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-xs font-semibold text-purple-200">Student</span>
                    </>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{line}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyDetails = () => {
    if (!callData) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 italic">No details available</p>
        </div>
      );
    }

    // Extract phone numbers
    const phoneNumbers = callData.Call_Metadata?.Phone_Numbers;
    const formattedPhoneNumbers = extractPhoneNumbers(phoneNumbers);
    const companyNumber = getCompanyNumber(phoneNumbers);
    const studentNumber = getStudentNumber(phoneNumbers);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
        {/* Student Information */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            Student Information
          </h3>
         
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-blue-700">Name</span>
              <span className="font-semibold text-gray-800">{callData.Call_Metadata.Student_Name}</span>
            </div>
           
            {/* Enhanced Phone Numbers Display */}
            <div className="space-y-3">
              {/* Main Phone Display */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-green-700">Phone Numbers</span>
                <span className="font-semibold text-gray-800 text-right">
                  {formattedPhoneNumbers}
                </span>
              </div>

              {/* Detailed Phone Breakdown */}
              {companyNumber && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm font-medium text-blue-700">Company Number</span>
                  <span className="font-semibold text-gray-800">{companyNumber}</span>
                </div>
              )}

              {studentNumber && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm font-medium text-purple-700">Student Number</span>
                  <span className="font-semibold text-gray-800">{studentNumber}</span>
                </div>
              )}
            </div>
           
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm font-medium text-purple-700">Date of Birth</span>
              <span className="font-semibold text-gray-800">{callData.Eligibility.DOB}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-sm font-medium text-yellow-700">Qualification</span>
              <span className="font-semibold text-gray-800">{callData.Eligibility.Qualification_Stream}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-pink-700">Next plan</span>
              <span className="font-semibold text-gray-800">{callData.Call_Metadata.Next_Plan}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <span className="text-sm font-medium text-red-700">Eligibility</span>
              <span className={`font-semibold ${
                callData.Eligibility.Was_Student_Eligible === "Yes" ? "text-green-600" :
                callData.Eligibility.Was_Student_Eligible === "No" ? "text-red-600" : "text-yellow-600"
              }`}>
                {callData.Eligibility.Was_Student_Eligible}
              </span>
            </div>
          </div>
        </div>

        {/* Call Information */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            Call Information
          </h3>
         
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-blue-700">Call ID</span>
              <span className="font-semibold text-gray-800">{callData.call_id}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-sm font-medium text-green-700">Agent</span>
              <span className="font-semibold text-gray-800">{callData.Call_Metadata.Agent_Name}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm font-medium text-purple-700">Date</span>
              <span className="font-semibold text-gray-800">{callData.Call_Metadata.Date_of_Call}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-sm font-medium text-yellow-700">Completion</span>
              <span className={`font-semibold ${
                callData.Call_Status.Call_Completion_Status === "True" ? "text-green-600" : "text-red-600"
              }`}>
                {callData.Call_Status.Call_Completion_Status === "True" ? "Completed" : "Incomplete"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-medium text-pink-700">Call_Purpose</span>
              <span className="font-semibold text-gray-800">{callData.Call_Metadata.Call_Purpose}</span>
            </div>
           
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <span className="text-sm font-medium text-red-700">Disconnected</span>
              <span className={`font-semibold ${
                callData.Call_Status.Call_Disconnected === "False" ? "text-green-600" : "text-red-600"
              }`}>
                {callData.Call_Status.Call_Disconnected === "False" ? "No" : "Yes"}
              </span>
            </div>

            {/* Phone Number Discussions */}
            {callData.Call_Metadata.Phone_Number_Discussions && 
             Array.isArray(callData.Call_Metadata.Phone_Number_Discussions) && 
             callData.Call_Metadata.Phone_Number_Discussions.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-xl">
                <span className="text-sm font-medium text-orange-700 block mb-2">Phone Discussions</span>
                <div className="space-y-2">
                  {callData.Call_Metadata.Phone_Number_Discussions.map((discussion, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <div className="font-semibold">{discussion.context}</div>
                      <div className="text-xs text-gray-500 mt-1">{discussion.segment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Parameters */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
            Audit Parameters
          </h3>
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(callData.Audit_Parameters).map(([key, value]) => (
              <div key={key} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                value === "Yes" || value === "Good" || value === "High"
                  ? "bg-green-50 border-green-200 hover:border-green-300"
                  : value === "No" || value === "Poor" || value === "Low"
                  ? "bg-red-50 border-red-200 hover:border-red-300"
                  : "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
              }`}>
                <div className="text-sm font-medium text-gray-600 mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className={`text-lg font-bold ${
                  value === "Yes" || value === "Good" || value === "High"
                    ? "text-green-600"
                    : value === "No" || value === "Poor" || value === "Low"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

 const renderQAPairs = () => {
    if (qaPairs.length === 0) {
      return (
        <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 h-full flex items-center justify-center">
          <div>
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Q/A Analysis Available</h4>
            <p className="text-gray-500">Question and answer analysis will appear here once processed</p>
          </div>
        </div>
      );
    }
 
    return (
      <div className="space-y-6 h-full overflow-y-auto">
        {qaPairs.map((pair, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            {/* Header with Score */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Question {index + 1}</h4>
                <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white font-bold mr-1">Score:</span>
                  <span className={`text-lg font-bold ${
                    pair.score >= 7 ? 'text-green-300' :
                    pair.score >= 4 ? 'text-yellow-300' :
                    'text-red-300'
                  }`}>
                    {pair.score}/10
                  </span>
                </div>
              </div>
            </div>
 
            <div className="p-6 space-y-6">
              {/* Customer Question */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <div className="bg-blue-500 p-3 rounded-lg mr-4 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-800 mb-2">Customer Question</h5>
                    <p className="text-gray-700 leading-relaxed">{pair.customer_question}</p>
                  </div>
                </div>
              </div>
 
              {/* Executive Answer */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-start">
                  <div className="bg-green-500 p-3 rounded-lg mr-4 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-green-800 mb-2">Executive Answer</h5>
                    <p className="text-gray-700 leading-relaxed">{pair.executive_answer}</p>
                  </div>
                </div>
              </div>
 
              {/* AI Suggested Answer */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-start">
                  <div className="bg-purple-500 p-3 rounded-lg mr-4 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-2">AI Suggested Answer</h5>
                    <p className="text-gray-700 leading-relaxed">{pair.ai_answer}</p>
                  </div>
                </div>
              </div>
 
              {/* Analysis Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                {pair.strengths?.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Strengths
                    </h5>
                    <ul className="space-y-2">
                      {pair.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
 
                {/* Improvements */}
                {pair.improvements?.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-2">
                      {pair.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
 

  return (
    <section
      className={`bg-gradient-to-br from-white-50 to-white-50 p-6 h-full flex flex-col rounded-xl mb-8 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-00' : 'ml-60'
      }`}
      style={{
          marginLeft: isSidebarCollapsed ? '6rem' : '14rem',
          width: `calc(100% - ${isSidebarCollapsed ? '6rem' : '14rem'})`,
        }}
    >
      {/* Enhanced Tab Navigation */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
          <div className="flex">
            {["AI Summary", "Transcript", "Key Details", "Q/A Pairs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-4 px-6 text-base font-semibold rounded-xl relative z-10 transition-all duration-300 ${
                  selectedTab === tab
                    ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center">
                  {tab === "AI Summary" && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {tab === "Transcript" && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )}
                  {tab === "Key Details" && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {tab === "Q/A Pairs" && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex flex-col items-center justify-center mt-12">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-3 border-4 border-purple-500 border-b-transparent rounded-full animate-spin animation-delay-200"></div>
            <div className="absolute inset-6 border-4 border-pink-500 border-l-transparent rounded-full animate-spin animation-delay-400"></div>
          </div>
          <p className="text-2xl font-bold text-gray-700 mb-2">Loading Call Details</p>
          <p className="text-gray-500 text-lg">Fetching comprehensive analysis for call ID: {call_id}</p>
        </div>
      )}

      {error && (
        <div className="text-center p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 max-w-2xl mx-auto shadow-lg">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h3>
          <p className="text-red-500 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
          </button>
        </div>
      )}

      {!loading && !error && callData && (
        <div className="mt-4 flex-1" style={tabContentStyle}>
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