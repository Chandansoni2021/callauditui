import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaEye, FaTimes, FaStar, FaFilter, FaSort, FaChartBar, FaEnvelope, FaInfoCircle, FaArrowLeft, FaArrowRight, FaUser, FaPhone, FaCalendar, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaCog, FaSearch, FaCalendarAlt, FaDownload } from "react-icons/fa";
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [scoreFilter, setScoreFilter] = useState([0, 10]);
  const [username, setUsername] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState({
    basic: true,
    eligibility: false,
    audit: false,
    status: false
  });
  const [tooltip, setTooltip] = useState({ show: false, content: "", x: 0, y: 0 });
  
  // Search functionality states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  
  // Date Range Filter States
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showDateRange, setShowDateRange] = useState(false);

  useEffect(() => {
    fetchCallAudit();
  }, []);

  // Fetch call audit data - UPDATED WITH PROPER PHONE NUMBER EXTRACTION
  const fetchCallAudit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("http://127.0.0.1:8000/fetch_all_analysis_details");
      console.log("API Response:", response.data);

      if (!response.data) {
        throw new Error("Invalid or failed response from server");
      }

      const callAuditDetails = response.data.call_audit_details || [];
      const callDataArray = callAuditDetails.map(callDetails => {
        const auditParams = callDetails.Audit_Parameters || {};
        const yesCount = Object.values(auditParams).filter(val => val === 'Yes').length;
        const totalParams = Object.values(auditParams).length;
        const calculatedScore = totalParams > 0 ? Math.round((yesCount / totalParams) * 10) : 0;

        // UPDATED: Extract phone numbers from Phone_Numbers array
        const extractPhoneNumbers = () => {
          const phoneNumbers = callDetails.Call_Metadata?.Phone_Numbers;
          
          if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
            return "Not Provided";
          }
          
          // Extract all valid phone numbers from the array
          const validNumbers = phoneNumbers
            .filter(phone => 
              phone.number && 
              phone.number !== "not provided" &&
              phone.number !== "discussed" &&
              phone.number !== "partial" &&
              phone.number.trim() !== "" &&
              phone.number !== "Not Provided"
            )
            .map(phone => phone.number);
          
          if (validNumbers.length === 0) {
            return "Not Provided";
          }
          
          // Return all numbers separated by comma
          return validNumbers.join(', ');
        };

        const phoneNumbers = extractPhoneNumbers();

        return {
          // Basic Info - ALWAYS VISIBLE
          call_id: callDetails.call_id,
          consultant_name: callDetails.Call_Metadata?.Agent_Name || "Not Provided",
          student_name: callDetails.Call_Metadata?.Student_Name || "Not Provided",
          phone_no: phoneNumbers, // Use extracted phone numbers
          date_of_call: callDetails.Call_Metadata?.Date_of_Call || "Not Provided",
         
          // Eligibility
          dob: callDetails.Eligibility?.DOB || "Not Provided",
          qualification_stream: callDetails.Eligibility?.Qualification_Stream || "Not Provided",
          was_student_eligible: callDetails.Eligibility?.Was_Student_Eligible || "Unknown",
         
          // Audit Parameters
          call_flow_adherence: callDetails.Audit_Parameters?.Call_Flow_Adherence || "No",
          greeting: callDetails.Audit_Parameters?.Greeting || "No",
          parent_invitation: callDetails.Audit_Parameters?.Parent_Invitation || "No",
          rebuttals_objection_handling: callDetails.Audit_Parameters?.Rebuttals_Objection_Handling || "No",
          probing_career_plan: callDetails.Audit_Parameters?.Probing_Career_Plan || "No",
          incorrect_incomplete_info_shared: callDetails.Audit_Parameters?.Incorrect_Incomplete_Info_Shared || "No",
          course_info_shared: callDetails.Audit_Parameters?.Course_Info_Shared || "No",
          closing_further_assistance: callDetails.Audit_Parameters?.Closing_Further_Assistance || "No",
          reason_free_counseling_seminar: callDetails.Audit_Parameters?.Reason_Free_Counseling_Seminar || "No",
          irrelevant_info_shared: callDetails.Audit_Parameters?.Irrelevant_Info_Shared || "No",
          active_listening: callDetails.Audit_Parameters?.Active_Listening || "No",
          rate_of_speech: callDetails.Audit_Parameters?.Rate_of_Speech || "Not Rated",
          scholarship_need_creation: callDetails.Audit_Parameters?.Scholarship_Need_Creation || "No",
          reason_industry_info: callDetails.Audit_Parameters?.Reason_Industry_Info || "No",
          fake_appointment: callDetails.Audit_Parameters?.Fake_Appointment || "No",
          opening_in_english: callDetails.Audit_Parameters?.Opening_in_English || "No",
          consent_for_seminar: callDetails.Audit_Parameters?.Consent_for_Seminar || "No",
          politeness: callDetails.Audit_Parameters?.Politeness || "No",
          self_introduction_branding: callDetails.Audit_Parameters?.Self_Introduction_Branding || "No",
          language_adherence: callDetails.Audit_Parameters?.Language_Adherence || "No",
          mti_grammar_errors: callDetails.Audit_Parameters?.MTI_Grammar_Errors || "No",
          energy_level: callDetails.Audit_Parameters?.Energy_Level || "Not Rated",
          fumbling_fillers: callDetails.Audit_Parameters?.Fumbling_Fillers || "No",
          job_data_manipulation: callDetails.Audit_Parameters?.Job_Data_Manipulation || "No",
          seat_importance_pitched: callDetails.Audit_Parameters?.Seat_Importance_Pitched || "No",
          rude_abusive_behavior: callDetails.Audit_Parameters?.Rude_Abusive_Behavior || "No",
          tagging_disposition: callDetails.Audit_Parameters?.Tagging_Disposition || "No",
          appointment_center_address_provided: callDetails.Audit_Parameters?.Appointment_Center_Address_Provided || "No",
         
          // Call Status
          call_disconnected: callDetails.Call_Status?.Call_Disconnected === "False" ? "No" : "Yes",
          call_completion_status: callDetails.Call_Status?.Call_Completion_Status === "True" ? "Complete" : "Incomplete",
         
          // Score
          total_score: calculatedScore,
         
          rawData: callDetails
        };
      });

      setCallData(callDataArray);

      const uniqueAgents = [...new Set(
        callDataArray
          .map(item => item?.consultant_name)
          .filter(name => name && name !== "Not Provided")
      )];
      setAgents(uniqueAgents);
    } catch (error) {
      console.error("Error fetching call audit data:", error);
      setError(error.message || "Failed to fetch call data");
    } finally {
      setLoading(false);
    }
  };

  // Direct Download Report Function
  const handleDownloadReport = async () => {
    if (filteredData.length === 0) {
      toast.warning("No data available to download");
      return;
    }

    setIsDownloadingReport(true);
    try {
      // Create CSV content from the current filtered data
      const csvContent = convertToCSV(filteredData);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `call_analysis_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Report downloaded successfully! ${filteredData.length} records exported.`);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = [
      'Call ID',
      'Agent Name', 
      'Student Name',
      'Contact Number',
      'Call Date',
      'Date of Birth',
      'Qualification Stream',
      'Eligibility Status',
      'Quality Score',
      'Call Completion Status',
      'Call Disconnected',
      // Audit parameters
      'Call Flow Adherence',
      'Greeting',
      'Parent Invitation',
      'Rebuttals Objection Handling',
      'Probing Career Plan',
      'Incorrect Incomplete Info Shared',
      'Course Info Shared',
      'Closing Further Assistance',
      'Reason Free Counseling Seminar',
      'Irrelevant Info Shared',
      'Active Listening',
      'Rate of Speech',
      'Scholarship Need Creation',
      'Reason Industry Info',
      'Fake Appointment',
      'Opening in English',
      'Consent for Seminar',
      'Politeness',
      'Self Introduction Branding',
      'Language Adherence',
      'MTI Grammar Errors',
      'Energy Level',
      'Fumbling Fillers',
      'Job Data Manipulation',
      'Seat Importance Pitched',
      'Rude Abusive Behavior',
      'Tagging Disposition',
      'Appointment Center Address Provided'
    ];
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = [
        `"${item.call_id || ''}"`,
        `"${item.consultant_name || ''}"`,
        `"${item.student_name || ''}"`,
        `"${item.phone_no || ''}"`,
        `"${item.date_of_call || ''}"`,
        `"${item.dob || ''}"`,
        `"${item.qualification_stream || ''}"`,
        `"${item.was_student_eligible || ''}"`,
        `"${item.total_score || 0}"`,
        `"${item.call_completion_status || ''}"`,
        `"${item.call_disconnected || ''}"`,
        // Audit parameters
        `"${item.call_flow_adherence || ''}"`,
        `"${item.greeting || ''}"`,
        `"${item.parent_invitation || ''}"`,
        `"${item.rebuttals_objection_handling || ''}"`,
        `"${item.probing_career_plan || ''}"`,
        `"${item.incorrect_incomplete_info_shared || ''}"`,
        `"${item.course_info_shared || ''}"`,
        `"${item.closing_further_assistance || ''}"`,
        `"${item.reason_free_counseling_seminar || ''}"`,
        `"${item.irrelevant_info_shared || ''}"`,
        `"${item.active_listening || ''}"`,
        `"${item.rate_of_speech || ''}"`,
        `"${item.scholarship_need_creation || ''}"`,
        `"${item.reason_industry_info || ''}"`,
        `"${item.fake_appointment || ''}"`,
        `"${item.opening_in_english || ''}"`,
        `"${item.consent_for_seminar || ''}"`,
        `"${item.politeness || ''}"`,
        `"${item.self_introduction_branding || ''}"`,
        `"${item.language_adherence || ''}"`,
        `"${item.mti_grammar_errors || ''}"`,
        `"${item.energy_level || ''}"`,
        `"${item.fumbling_fillers || ''}"`,
        `"${item.job_data_manipulation || ''}"`,
        `"${item.seat_importance_pitched || ''}"`,
        `"${item.rude_abusive_behavior || ''}"`,
        `"${item.tagging_disposition || ''}"`,
        `"${item.appointment_center_address_provided || ''}"`
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  // Email Report Function
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
      const response = await fetch("http://127.0.0.1:8000/send-email/", {
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

  const showTooltip = (content, event) => {
    setTooltip({
      show: true,
      content,
      x: event.clientX,
      y: event.clientY
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, content: "", x: 0, y: 0 });
  };

  // Tooltip content definitions
  const tooltipContent = {
    callId: "Unique identifier for each call recording",
    agent: "Name of the agent who handled the call",
    student: "Name of the student/customer",
    phone: "Contact number of the student",
    date: "Date when the call was conducted",
    dob: "Student's date of birth for eligibility verification",
    qualification: "Student's educational qualification and stream",
    eligible: "Whether the student meets eligibility criteria",
    score: "Overall quality score based on audit parameters (0-10)",
    disconnected: "Whether the call was disconnected prematurely",
    completion: "Overall completion status of the call",
    callFlow: "Adherence to standard call flow procedures",
    greeting: "Professional greeting and introduction",
    parentInvite: "Invitation to involve parents in discussion",
    rebuttals: "Handling of objections and rebuttals",
    careerPlan: "Probing about student's career plans",
    correctInfo: "Accuracy and completeness of information shared",
    courseInfo: "Relevant course information provided",
    closing: "Proper call closing and follow-up arrangement",
    seminarReason: "Reason provided for free counseling/seminar",
    relevantInfo: "Relevance of information shared to student's needs",
    activeListening: "Active listening and engagement",
    speechRate: "Appropriate rate of speech",
    scholarship: "Scholarship information and need creation",
    industryInfo: "Relevant industry information shared",
    fakeAppointment: "Any fake appointment booking",
    englishOpening: "Call opening in English language",
    consent: "Consent taken for seminar/counseling",
    politeness: "Overall politeness and courtesy",
    branding: "Proper self-introduction and company branding",
    language: "Adherence to language guidelines",
    grammar: "Grammar and language errors",
    energy: "Energy level and enthusiasm",
    fumbling: "Fumbling or use of filler words",
    jobData: "Accuracy of job data shared",
    seatPitch: "Importance of seat pitching",
    behavior: "Any rude or abusive behavior",
    tagging: "Proper tagging and disposition",
    address: "Center address provided for appointment"
  };

  // Search functionality
  const handleSearch = (item, term, column) => {
    if (!term.trim()) return true;
    
    const searchTermLower = term.toLowerCase();
    
    switch (column) {
      case 'call_id':
        return item.call_id?.toLowerCase().includes(searchTermLower);
      case 'consultant_name':
        return item.consultant_name?.toLowerCase().includes(searchTermLower);
      case 'student_name':
        return item.student_name?.toLowerCase().includes(searchTermLower);
      case 'phone_no':
        return item.phone_no?.toLowerCase().includes(searchTermLower);
      case 'date_of_call':
        return item.date_of_call?.toLowerCase().includes(searchTermLower);
      case 'dob':
        return item.dob?.toLowerCase().includes(searchTermLower);
      case 'qualification_stream':
        return item.qualification_stream?.toLowerCase().includes(searchTermLower);
      case 'all':
        return (
          item.call_id?.toLowerCase().includes(searchTermLower) ||
          item.consultant_name?.toLowerCase().includes(searchTermLower) ||
          item.student_name?.toLowerCase().includes(searchTermLower) ||
          item.phone_no?.toLowerCase().includes(searchTermLower) ||
          item.date_of_call?.toLowerCase().includes(searchTermLower) ||
          item.dob?.toLowerCase().includes(searchTermLower) ||
          item.qualification_stream?.toLowerCase().includes(searchTermLower)
        );
      default:
        return true;
    }
  };

  // Date range filter function
  const isDateInRange = (dateString, startDate, endDate) => {
    if (!dateString || dateString === "Not Provided") return false;
    
    try {
      const callDate = new Date(dateString);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return callDate >= start && callDate <= end;
    } catch {
      return false;
    }
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
    const searchMatch = handleSearch(item, searchTerm, searchColumn);
    
    // Date range filter
    const dateMatch = dateRange.startDate && dateRange.endDate 
      ? isDateInRange(item.date_of_call, dateRange.startDate, dateRange.endDate)
      : true;
    
    return scoreMatch && agentMatch && searchMatch && dateMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusColor = (value) => {
    if (value === 'Yes' || value === 'Complete' || value === 'Good' || value === 'High' || value === 'True') 
      return 'bg-green-100 text-green-800 border border-green-200';
    if (value === 'No' || value === 'Incomplete' || value === 'Low' || value === 'False') 
      return 'bg-red-100 text-red-800 border border-red-200';
    if (value === 'Medium') 
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 7) return 'bg-green-100 text-green-800 border border-green-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    return 'bg-red-100 text-red-800 border border-red-200';
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Not Provided") return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  const ColumnToggle = () => (
    <div className="mb-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
        <FaCog className="text-blue-600" />
        Column Visibility Settings
      </h3>
      <div className="flex flex-wrap gap-4">
        {[
          { key: 'basic', label: 'Basic Information', icon: FaUser, color: 'blue' },
          { key: 'eligibility', label: 'Eligibility Criteria', icon: FaGraduationCap, color: 'green' },
          { key: 'audit', label: 'Audit Parameters', icon: FaCheckCircle, color: 'purple' },
          { key: 'status', label: 'Call Status', icon: FaInfoCircle, color: 'orange' }
        ].map(({ key, label, icon: Icon, color }) => (
          <label key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300 hover:border-blue-400 transition-colors duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleColumns[key]}
              onChange={(e) => setVisibleColumns(prev => ({
                ...prev,
                [key]: e.target.checked
              }))}
              className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <Icon className={`text-${color}-500`} />
            <span className="font-semibold text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const getColumnCount = () => {
    let count = 5; // Basic info columns (always visible)
    if (visibleColumns.eligibility) count += 3;
    if (visibleColumns.audit) count += 28;
    if (visibleColumns.status) count += 3;
    count += 1; // Actions column
    return count;
  };

  return (
    <div className="flex h-full w-full min-h-screen bg-white">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        toastClassName="rounded-lg shadow-md"
        progressClassName="bg-blue-500"
      />

      {/* Tooltip Component */}
      {tooltip.show && (
        <div 
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10
          }}
        >
          {tooltip.content}
          <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -left-1 top-2"></div>
        </div>
      )}

      {showModal && selectedFiles.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="rounded-xl shadow-lg p-6 w-full max-w-md bg-white border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Selected Files for Analysis</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="mb-6 max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-sm font-medium">📁 {file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md"
              >
                Continue to Analysis
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
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-md">
              <FaChartBar className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Call Analysis Dashboard
              </h2>
              <p className="text-gray-600 mt-1">Comprehensive call performance analytics and quality assessment</p>
            </div>
          </div>
         
          <div className="flex items-center gap-3 flex-wrap">
            {/* Direct Download Button */}
            <button
              onClick={handleDownloadReport}
              disabled={isDownloadingReport || filteredData.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-md ${
                (isDownloadingReport || filteredData.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FaDownload />
              {isDownloadingReport ? 'Downloading...' : 'Download Report'}
            </button>

            {/* Email Report Button */}
            {showUsernameInput && (
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleGetReport()}
                />
              </div>
            )}
           
            {/* <button
              onClick={handleGetReport}
              disabled={isSendingReport}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md ${
                isSendingReport ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FaEnvelope />
              {isSendingReport ? 'Sending Report...' : 'Email Report'}
            </button> */}
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="p-6 rounded-xl shadow-sm mb-6 bg-white border border-gray-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Search Section */}
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search across all records..."
                  className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full bg-white shadow-sm"
                />
              </div>

              <div className="relative flex-1 lg:w-48">
                <select
                  value={searchColumn}
                  onChange={(e) => {
                    setSearchColumn(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full appearance-none bg-white shadow-sm cursor-pointer"
                >
                  <option value="all">🔍 All Columns</option>
                  <option value="call_id">📞 Call ID</option>
                  <option value="consultant_name">👨‍💼 Agent Name</option>
                  <option value="student_name">👤 Student Name</option>
                  <option value="phone_no">📱 Contact Number</option>
                  <option value="date_of_call">📅 Call Date</option>
                  <option value="dob">🎂 Date of Birth</option>
                  <option value="qualification_stream">🎓 Qualification</option>
                </select>
                <FaChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <select
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full appearance-none bg-white shadow-sm cursor-pointer"
                  value={selectedAgent}
                  onChange={(e) => {
                    setSelectedAgent(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">👨‍💼 All Agents</option>
                  <option value="Unknown">❓ Unknown Agents</option>
                  {agents.map((agent, index) => (
                    <option key={index} value={agent}>👤 {agent}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" />
              </div>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm"
              >
                <option value="5">5 Records Per Page</option>
                <option value="10">10 Records Per Page</option>
                <option value="20">20 Records Per Page</option>
                <option value="50">50 Records Per Page</option>
              </select>

              <button
                onClick={() => setShowDateRange(!showDateRange)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors duration-300 ${
                  showDateRange 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
                }`}
              >
                <FaCalendarAlt />
                Date Range
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors duration-300 ${
                  showFilters 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
              >
                <FaFilter />
                More Filters
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          {showDateRange && (
            <div className="mt-6 p-6 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Filter by Date Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDateRange({ startDate: "", endDate: "" });
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300"
                  >
                    Clear
                  </button>
                  {dateRange.startDate && dateRange.endDate && (
                    <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                      {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 text-sm text-green-600">
                {dateRange.startDate && dateRange.endDate 
                  ? `Showing calls between ${formatDate(dateRange.startDate)} and ${formatDate(dateRange.endDate)}`
                  : 'Select start and end date to filter by date range'
                }
              </div>
            </div>
          )}

          {showFilters && (
            <div className="mt-6 p-6 rounded-lg bg-gray-50 border border-gray-200">
              <div>
                <label className="block text-sm font-semibold mb-4 text-gray-700">
                  📊 Quality Score Range: {scoreFilter[1]}/10
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">0</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={scoreFilter[1]}
                    onChange={(e) => {
                      setScoreFilter([0, parseInt(e.target.value)]);
                      setCurrentPage(1);
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                  />
                  <span className="text-sm text-gray-500">10</span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Displaying calls with quality score ≤ {scoreFilter[1]}
                </div>
              </div>
            </div>
          )}

          {/* Search Info */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <FaSearch className="text-blue-500" />
                <span>
                  Searching for "<strong>{searchTerm}</strong>" in <strong>
                    {searchColumn === 'all' ? 'all columns' : 
                     searchColumn === 'call_id' ? 'Call ID' :
                     searchColumn === 'consultant_name' ? 'Agent Name' :
                     searchColumn === 'student_name' ? 'Student Name' :
                     searchColumn === 'phone_no' ? 'Contact Number' :
                     searchColumn === 'date_of_call' ? 'Call Date' :
                     searchColumn === 'dob' ? 'Date of Birth' :
                     searchColumn === 'qualification_stream' ? 'Qualification' : 'selected column'}
                  </strong>
                </span>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchColumn("all");
                  }}
                  className="ml-auto text-blue-500 hover:text-blue-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </div>

        <ColumnToggle />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Call Analysis Data</h2>
            <p className="text-gray-500">Please wait while we fetch the latest call records</p>
          </div>
        ) : (
          <div className="rounded-xl shadow-md overflow-hidden bg-white border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full bg-white min-w-max">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* Basic Information Columns - ALWAYS VISIBLE */}
                    <th 
                      className="p-4 text-left cursor-pointer border-r border-gray-200" 
                      onClick={() => handleSort('call_id')}
                      onMouseEnter={(e) => showTooltip(tooltipContent.callId, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FaInfoCircle className="text-blue-500" />
                        Call ID
                        <FaSort className="text-gray-400" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left cursor-pointer border-r border-gray-200" 
                      onClick={() => handleSort('consultant_name')}
                      onMouseEnter={(e) => showTooltip(tooltipContent.agent, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FaUser className="text-green-500" />
                        Agent Name
                        <FaSort className="text-gray-400" />
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left border-r border-gray-200"
                      onMouseEnter={(e) => showTooltip(tooltipContent.student, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FaUser className="text-purple-500" />
                        Student Name
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left border-r border-gray-200"
                      onMouseEnter={(e) => showTooltip(tooltipContent.phone, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FaPhone className="text-orange-500" />
                        Contact Number
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left cursor-pointer border-r border-gray-200" 
                      onClick={() => handleSort('date_of_call')}
                      onMouseEnter={(e) => showTooltip(tooltipContent.date, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <FaCalendar className="text-red-500" />
                        Call Date
                        <FaSort className="text-gray-400" />
                      </div>
                    </th>

                    {/* Eligibility Criteria Columns */}
                    {visibleColumns.eligibility && (
                      <>
                        <th 
                          className="p-4 text-left border-r border-gray-200"
                          onMouseEnter={(e) => showTooltip(tooltipContent.dob, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaCalendar className="text-blue-400" />
                            Date of Birth
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left border-r border-gray-200"
                          onMouseEnter={(e) => showTooltip(tooltipContent.qualification, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaGraduationCap className="text-green-400" />
                            Qualification
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left border-r border-gray-200"
                          onMouseEnter={(e) => showTooltip(tooltipContent.eligible, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <FaCheckCircle className="text-purple-400" />
                            Eligibility Status
                          </div>
                        </th>
                      </>
                    )}

                    {/* Audit Parameters Columns */}
                    {visibleColumns.audit && (
                      <>
                        {[
                          { key: 'call_flow_adherence', label: 'Call Flow', short: 'Flow', tooltip: tooltipContent.callFlow },
                          { key: 'greeting', label: 'Greeting', short: 'Greet', tooltip: tooltipContent.greeting },
                          { key: 'parent_invitation', label: 'Parent Invite', short: 'Parent', tooltip: tooltipContent.parentInvite },
                          { key: 'rebuttals_objection_handling', label: 'Rebuttals', short: 'Rebuttal', tooltip: tooltipContent.rebuttals },
                          { key: 'probing_career_plan', label: 'Career Plan', short: 'Career', tooltip: tooltipContent.careerPlan },
                          { key: 'incorrect_incomplete_info_shared', label: 'Correct Info', short: 'Info', tooltip: tooltipContent.correctInfo },
                          { key: 'course_info_shared', label: 'Course Info', short: 'Course', tooltip: tooltipContent.courseInfo },
                          { key: 'closing_further_assistance', label: 'Closing', short: 'Closing', tooltip: tooltipContent.closing },
                          { key: 'reason_free_counseling_seminar', label: 'Seminar Reason', short: 'Reason', tooltip: tooltipContent.seminarReason },
                          { key: 'irrelevant_info_shared', label: 'Relevant Info', short: 'Relevant', tooltip: tooltipContent.relevantInfo },
                          { key: 'active_listening', label: 'Active Listening', short: 'Listen', tooltip: tooltipContent.activeListening },
                          { key: 'rate_of_speech', label: 'Speech Rate', short: 'Speech', tooltip: tooltipContent.speechRate },
                          { key: 'scholarship_need_creation', label: 'Scholarship', short: 'Scholar', tooltip: tooltipContent.scholarship },
                          { key: 'reason_industry_info', label: 'Industry Info', short: 'Industry', tooltip: tooltipContent.industryInfo },
                          { key: 'fake_appointment', label: 'Fake Appt', short: 'Fake', tooltip: tooltipContent.fakeAppointment },
                          { key: 'opening_in_english', label: 'English Open', short: 'English', tooltip: tooltipContent.englishOpening },
                          { key: 'consent_for_seminar', label: 'Seminar Consent', short: 'Consent', tooltip: tooltipContent.consent },
                          { key: 'politeness', label: 'Politeness', short: 'Polite', tooltip: tooltipContent.politeness },
                          { key: 'self_introduction_branding', label: 'Branding', short: 'Brand', tooltip: tooltipContent.branding },
                          { key: 'language_adherence', label: 'Language', short: 'Lang', tooltip: tooltipContent.language },
                          { key: 'mti_grammar_errors', label: 'Grammar', short: 'Grammar', tooltip: tooltipContent.grammar },
                          { key: 'energy_level', label: 'Energy', short: 'Energy', tooltip: tooltipContent.energy },
                          { key: 'fumbling_fillers', label: 'Fumbling', short: 'Fumble', tooltip: tooltipContent.fumbling },
                          { key: 'job_data_manipulation', label: 'Job Data', short: 'Job', tooltip: tooltipContent.jobData },
                          { key: 'seat_importance_pitched', label: 'Seat Pitch', short: 'Seat', tooltip: tooltipContent.seatPitch },
                          { key: 'rude_abusive_behavior', label: 'Rude Behavior', short: 'Behavior', tooltip: tooltipContent.behavior },
                          { key: 'tagging_disposition', label: 'Tagging', short: 'Tag', tooltip: tooltipContent.tagging },
                          { key: 'appointment_center_address_provided', label: 'Address', short: 'Address', tooltip: tooltipContent.address }
                        ].map(({ key, label, short, tooltip }) => (
                          <th 
                            key={key} 
                            className="p-3 text-center border-r border-gray-200" 
                            title={label}
                            onMouseEnter={(e) => showTooltip(tooltip, e)}
                            onMouseLeave={hideTooltip}
                          >
                            <div className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                              {short}
                            </div>
                          </th>
                        ))}
                      </>
                    )}

                    {/* Status & Score Columns */}
                    {visibleColumns.status && (
                      <>
                        <th 
                          className="p-4 text-center border-r border-gray-200"
                          onMouseEnter={(e) => showTooltip(tooltipContent.disconnected, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 justify-center text-gray-700 font-semibold text-sm">
                            Call Disconnected
                          </div>
                        </th>
                        <th 
                          className="p-4 text-center border-r border-gray-200"
                          onMouseEnter={(e) => showTooltip(tooltipContent.completion, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 justify-center text-gray-700 font-semibold text-sm">
                            Completion Status
                          </div>
                        </th>
                        <th 
                          className="p-4 text-center cursor-pointer border-r border-gray-200" 
                          onClick={() => handleSort('total_score')}
                          onMouseEnter={(e) => showTooltip(tooltipContent.score, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center gap-2 justify-center text-gray-700 font-semibold">
                            <FaStar className="text-yellow-500" />
                            Quality Score
                            <FaSort className="text-gray-400" />
                          </div>
                        </th>
                      </>
                    )}

                    <th className="p-4 text-center">
                      <div className="text-gray-700 font-semibold">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                        {/* Basic Information Data - ALWAYS VISIBLE */}
                        <td className="p-4 border-r border-gray-100">
                          <button
                            onClick={() => navigate(`/call-details/${encodeURIComponent(item.call_id)}`, { state: { callData: item.rawData } })}
                            className="hover:text-blue-600 text-blue-500 font-semibold hover:text-blue-600 whitespace-nowrap text-sm bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            {item.call_id || 'N/A'}
                          </button>
                        </td>
                        <td className="p-4 border-r border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isNameMissing(item.consultant_name) ? 'bg-red-400' : 'bg-green-400'}`}></div>
                            <span className={`font-medium text-sm ${isNameMissing(item.consultant_name) ? 'text-red-500' : 'text-gray-700'}`}>
                              {isNameMissing(item.consultant_name) ? 'Not Provided' : item.consultant_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 border-r border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isNameMissing(item.student_name) ? 'bg-red-400' : 'bg-purple-400'}`}></div>
                            <span className={`font-medium text-sm ${isNameMissing(item.student_name) ? 'text-red-500' : 'text-gray-700'}`}>
                              {isNameMissing(item.student_name) ? 'Not Provided' : item.student_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 border-r border-gray-100 text-sm text-gray-600 font-mono">
                          {item.phone_no}
                        </td>
                        <td className="p-4 border-r border-gray-100 text-sm text-gray-600">
                          {formatDate(item.date_of_call)}
                        </td>

                        {/* Eligibility Data */}
                        {visibleColumns.eligibility && (
                          <>
                            <td className="p-4 border-r border-gray-100 text-sm text-gray-600">
                              {formatDate(item.dob)}
                            </td>
                            <td className="p-4 border-r border-gray-100 text-sm text-gray-600">
                              {item.qualification_stream}
                            </td>
                            <td className="p-4 border-r border-gray-100">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.was_student_eligible)}`}>
                                {item.was_student_eligible}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Audit Parameters Data */}
                        {visibleColumns.audit && (
                          <>
                            {[
                              'call_flow_adherence', 'greeting', 'parent_invitation', 'rebuttals_objection_handling',
                              'probing_career_plan', 'incorrect_incomplete_info_shared', 'course_info_shared',
                              'closing_further_assistance', 'reason_free_counseling_seminar', 'irrelevant_info_shared',
                              'active_listening', 'rate_of_speech', 'scholarship_need_creation', 'reason_industry_info',
                              'fake_appointment', 'opening_in_english', 'consent_for_seminar', 'politeness',
                              'self_introduction_branding', 'language_adherence', 'mti_grammar_errors', 'energy_level',
                              'fumbling_fillers', 'job_data_manipulation', 'seat_importance_pitched', 'rude_abusive_behavior',
                              'tagging_disposition', 'appointment_center_address_provided'
                            ].map(key => (
                              <td key={key} className="p-2 border-r border-gray-100 text-center">
                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item[key])}`}>
                                  {item[key]}
                                </span>
                              </td>
                            ))}
                          </>
                        )}

                        {/* Status & Score Data */}
                        {visibleColumns.status && (
                          <>
                            <td className="p-4 border-r border-gray-100 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.call_disconnected)}`}>
                                {item.call_disconnected}
                              </span>
                            </td>
                            <td className="p-4 border-r border-gray-100 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.call_completion_status)}`}>
                                {item.call_completion_status}
                              </span>
                            </td>
                            <td className="p-4 border-r border-gray-100 text-center">
                              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-bold ${getScoreColor(item.total_score)}`}>
                                <FaStar className="mr-1 text-yellow-500" /> 
                                {item.total_score || '0'}/10
                              </span>
                            </td>
                          </>
                        )}

                        <td className="p-4 text-center">
                          <button
                            onClick={() => navigate(`/call-evaluation/${encodeURIComponent(item.call_id)}`, { state: { callData: item.rawData } })}
                            className="px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-colors duration-300 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm"
                          >
                            Detailed Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={getColumnCount()} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <FaTimesCircle className="text-gray-500 text-3xl" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Call Records Found</h3>
                          <p className="text-gray-500 max-w-md">
                            {searchTerm ? `No calls found matching "${searchTerm}" in your search criteria.` : 'No calls match your current filter criteria.'}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="text-sm text-gray-600 font-medium">
              Displaying <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredData.length)}</span> of{" "}
              <span className="font-bold text-purple-600">{filteredData.length}</span> total records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-lg bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors duration-300 ${
                        currentPage === pageNumber
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-3 text-gray-500">...</span>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-lg bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <FaArrowRight className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallAnalysis;