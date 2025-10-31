import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import {
  TrendingUp, Calendar as CalendarIcon
} from 'lucide-react';
 
const CallTrendsAndCalendar = ({ dashboardData }) => {
  const [callTrendsData, setCallTrendsData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('daily');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const calendarRef = useRef(null);
 
  // Updated color scheme for calendar events - PENDING KO GREEN KAR DIYA
  const statusConfig = {
    "Completed": { color: "#059669" },    // Green - for completed follow-ups
    "Overdue": { color: "#dc2626" },      // Red - for past overdue follow-ups
    "Pending": { color: "#10b981" },      // Green - for upcoming calls (CHANGED FROM BLUE TO GREEN)
    "Today": { color: "#f59e0b" }         // Yellow - for today's follow-ups
  };
 
  // Fetch call trends data
  useEffect(() => {
    const fetchCallTrends = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/frankfinn-dashboard");
        const data = await response.json();
       
        if (data.success) {
          setCallTrendsData(data.data?.call_trends || {
            monthly: [
              { month: 'Jan', calls: 4500, completed: 3200, incomplete: 1300 },
              { month: 'Feb', calls: 5200, completed: 3800, incomplete: 1400 },
              { month: 'Mar', calls: 4800, completed: 3500, incomplete: 1300 },
              { month: 'Apr', calls: 5500, completed: 4200, incomplete: 1300 },
            ],
            daily: [
              { date: 'Mon', calls: 300, completed: 200, incomplete: 100 },
              { date: 'Tue', calls: 450, completed: 350, incomplete: 100 },
              { date: 'Wed', calls: 400, completed: 300, incomplete: 100 },
              { date: 'Thu', calls: 500, completed: 400, incomplete: 100 },
              { date: 'Fri', calls: 350, completed: 250, incomplete: 100 },
              { date: 'Sat', calls: 200, completed: 150, incomplete: 50 },
              { date: 'Sun', calls: 150, completed: 100, incomplete: 50 },
            ]
          });
        } else {
          throw new Error("Failed to load call trends data");
        }
      } catch (err) {
        console.error("Error fetching call trends:", err);
        setCallTrendsData({
          monthly: [
            { month: 'Jan', calls: 4500, completed: 3200, incomplete: 1300 },
            { month: 'Feb', calls: 5200, completed: 3800, incomplete: 1400 }
          ],
          daily: [
            { date: 'Mon', calls: 300, completed: 200, incomplete: 100 },
            { date: 'Tue', calls: 450, completed: 350, incomplete: 100 }
          ]
        });
      }
    };
 
    fetchCallTrends();
  }, []);
 
  // Fetch follow-up data from backend for calendar
  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/followups");
       
        if (response.data.success) {
          const followUps = response.data.data;
         
          const mappedEvents = followUps
            .filter(fu => fu.follow_up_or_callback_date && fu.follow_up_or_callback_date !== "not provided")
            .map(fu => {
              const followUpDate = new Date(fu.follow_up_or_callback_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
             
              let status = "Pending";
             
              if (followUpDate.toDateString() === today.toDateString()) {
                status = "Today";
              } else if (followUpDate < today) {
                status = "Overdue";
              }
 
              return {
                id: fu.call_id,
                title: fu.purpose_of_follow_up !== "not provided"
                  ? fu.purpose_of_follow_up
                  : "Follow-up",
                start: fu.follow_up_or_callback_date,
                extendedProps: {
                  status: status,
                  purpose: fu.purpose_of_follow_up,
                  notes: fu.next_plan || "",
                  customer: fu.agent_name !== "not provided" ? fu.agent_name : "Customer",
                  callId: fu.call_id,
                  nextPlan: fu.next_plan
                },
                color: statusConfig[status]?.color || "#10b981", // Default bhi green kar diya
                textColor: "#ffffff"
              };
            });
         
          setEvents(mappedEvents);
          setError(null);
        } else {
          throw new Error("Failed to fetch follow-ups from backend");
        }
      } catch (error) {
        console.error("Error fetching follow-ups:", error);
        setError("Failed to load follow-ups from server.");
       
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
       
        setEvents([
          {
            id: "demo-1",
            title: "Student Counseling",
            start: today.toISOString().split('T')[0],
            extendedProps: {
              status: "Today",
              purpose: "Student Counseling",
              notes: "Student will visit center for counseling",
              customer: "Rahul Sharma",
              callId: "DEMO001"
            },
            color: statusConfig["Today"].color,
            textColor: "#ffffff"
          },
          {
            id: "demo-2",
            title: "Seminar Follow-up",
            start: tomorrow.toISOString().split('T')[0],
            extendedProps: {
              status: "Pending",
              purpose: "Seminar Follow-up",
              notes: "Student will attend seminar",
              customer: "Priya Patel",
              callId: "DEMO002"
            },
            color: statusConfig["Pending"].color, // Ab ye green hoga
            textColor: "#ffffff"
          },
          {
            id: "demo-3",
            title: "Course Details",
            start: yesterday.toISOString().split('T')[0],
            extendedProps: {
              status: "Overdue",
              purpose: "Course Details",
              notes: "Provide course curriculum details",
              customer: "Amit Kumar",
              callId: "DEMO003"
            },
            color: statusConfig["Overdue"].color,
            textColor: "#ffffff"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
 
    fetchFollowUps();
  }, []);
 
  const handleDateClick = (info) => {
    alert(`Selected Date: ${info.dateStr}\n\nBackend integration ke through follow-up manage hoga.`);
  };
 
  const handleEventClick = (info) => {
    const event = info.event;
    const eventDetails = `
Follow-up Details:
 
Purpose: ${event.title}
Customer: ${event.extendedProps.customer}
Call ID: ${event.extendedProps.callId}
Date: ${event.start ? event.start.toLocaleDateString() : 'N/A'}
Status: ${event.extendedProps.status}
Next Plan: ${event.extendedProps.nextPlan || "No specific plan"}
    `;
    alert(eventDetails);
  };
 
  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1">
        <div className="font-semibold text-xs truncate text-white">
          {eventInfo.event.title}
        </div>
        <div className="text-xs opacity-90 truncate text-white">
          {eventInfo.event.extendedProps.customer}
        </div>
      </div>
    );
  };
 
  // Function to style today's date cell
  const dayCellClassNames = (info) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
   
    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
   
    if (cellDate.getTime() === today.getTime()) {
      return ['bg-blue-100', 'border-2', 'border-blue-300'];
    }
    return [];
  };
 
  const CallTrends = () => {
    const trends = callTrendsData || {
      monthly: [],
      daily: []
    };
 
    const chartData = trends[timeFilter] || [];
    const totalCalls = chartData.reduce((sum, d) => sum + d.calls, 0);
    const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
    const totalIncomplete = chartData.reduce((sum, d) => sum + d.incomplete, 0);
 
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">{label}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
 
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            Call Trends & Analytics
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setTimeFilter('daily')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                timeFilter === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                timeFilter === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
 
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-600">Total Calls</p>
            <p className="text-lg font-bold text-gray-800">{totalCalls}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-600">Completed</p>
            <p className="text-lg font-bold text-gray-800">{totalCompleted}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-lg border border-red-200">
            <p className="text-xs font-medium text-red-600">Incomplete</p>
            <p className="text-lg font-bold text-gray-800">{totalIncomplete}</p>
          </div>
        </div>
 
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {timeFilter === 'monthly' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
                <Bar dataKey="incomplete" fill="#ef4444" name="Incomplete" radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" name="Total Calls" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="incomplete" stroke="#ef4444" name="Incomplete" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
 
  const CalendarComponent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-blue-700 text-sm font-medium">Loading calendar...</p>
        </div>
      );
    }
 
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
            Follow-up Calendar
          </h3>
          <p className="text-xs text-gray-500">
            {events.length} follow-up(s) scheduled
          </p>
        </div>
 
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded-lg mb-3 text-xs">
            <div className="flex items-center">
              <span className="text-red-500 font-bold mr-2">!</span>
              {error}
            </div>
          </div>
        )}
 
        <div className="bg-white rounded-lg border border-gray-200">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date()}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek"
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="300px"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            nowIndicator={true}
            editable={true}
            selectable={true}
            dayMaxEvents={2}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day"
            }}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short'
            }}
            dayHeaderClassNames="bg-blue-50 text-blue-800 font-semibold text-xs"
            dayCellClassNames={dayCellClassNames}
          />
        </div>
 
        {/* LEGEND UPDATE KAR DIYA - PENDING KO GREEN DIKHAYEGA */}
        <div className="mt-3 flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-700">Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div> {/* Yahan blue ki jagah green */}
            <span className="text-gray-700">Upcoming</span> {/* Pending ki jagah Upcoming */}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-700">Overdue</span>
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <div className="flex gap-7">
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4">
        <CallTrends />
      </div>
     
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4">
        <CalendarComponent />
      </div>
    </div>
  );
};
 
export default CallTrendsAndCalendar;
 