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

  // Updated color scheme for calendar events
  const statusConfig = {
    "Completed": { color: "#059669" },
    "Overdue": { color: "#dc2626" },
    "Pending": { color: "#10b981" },
    "Today": { color: "#f59e0b" }
  };

  // Fetch call trends data from backend
  useEffect(() => {
    const fetchCallTrends = async () => {
      try {
        const response = await fetch("https://mersols.com/frankfinn-dashboard");
        const data = await response.json();
       
        if (data.success) {
          console.log("Backend call trends data:", data.data.call_trends);
          setCallTrendsData(data.data.call_trends);
        } else {
          throw new Error("Failed to load call trends data");
        }
      } catch (err) {
        console.error("Error fetching call trends:", err);
        // Fallback data with more dates for better weekly view
        setCallTrendsData({
          daily: [
            { date: '2025-11-02', calls: 3, completed: 3, incomplete: 0, completion_rate: 100 },
            { date: '2025-11-07', calls: 1, completed: 1, incomplete: 0, completion_rate: 100 },
            { date: '2025-11-15', calls: 2, completed: 2, incomplete: 0, completion_rate: 100 },
            { date: '2025-11-20', calls: 1, completed: 1, incomplete: 0, completion_rate: 100 },
            { date: '2025-11-25', calls: 3, completed: 2, incomplete: 1, completion_rate: 67 },
            { date: '2025-12-08', calls: 1, completed: 1, incomplete: 0, completion_rate: 100 }
          ]
        });
      }
    };

    fetchCallTrends();
  }, []);

  // Get week number and month for a date
  const getWeekInfo = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    // Get first day of month
    const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    
    // Get week number within month (1-6)
    const firstDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
    const dateOfMonth = d.getDate();
    
    // Calculate week number in month
    const weekNumber = Math.ceil((dateOfMonth + firstDay) / 7);
    
    return {
      weekNumber,
      month: d.getMonth(),
      year: d.getFullYear(),
      monthName: d.toLocaleDateString('en-US', { month: 'long' })
    };
  };

  // Calculate weekly data from daily data - MONTH-WISE WEEKLY DATA
  const calculateWeeklyData = (dailyData) => {
    if (!dailyData || dailyData.length === 0) return [];

    const weeklyMap = {};
    
    dailyData.forEach(day => {
      const weekInfo = getWeekInfo(day.date);
      const weekKey = `${weekInfo.year}-${weekInfo.month}-W${weekInfo.weekNumber}`;
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          weekKey: weekKey,
          weekNumber: weekInfo.weekNumber,
          month: weekInfo.month,
          year: weekInfo.year,
          monthName: weekInfo.monthName,
          displayName: `${weekInfo.monthName} Week ${weekInfo.weekNumber}`,
          calls: 0,
          completed: 0,
          incomplete: 0,
          completion_rate: 0
        };
      }
      
      weeklyMap[weekKey].calls += day.calls;
      weeklyMap[weekKey].completed += day.completed;
      weeklyMap[weekKey].incomplete += day.incomplete;
    });
    
    // Calculate completion rate for each week
    Object.values(weeklyMap).forEach(week => {
      week.completion_rate = week.calls > 0 ? Math.round((week.completed / week.calls) * 100) : 0;
    });
    
    // Sort by year, month, week number
    return Object.values(weeklyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.weekNumber - b.weekNumber;
    });
  };

  // Calculate monthly data from daily data
  const calculateMonthlyData = (dailyData) => {
    if (!dailyData || dailyData.length === 0) return [];

    const monthlyMap = {};
    
    dailyData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          monthName: monthName,
          calls: 0,
          completed: 0,
          incomplete: 0,
          completion_rate: 0
        };
      }
      
      monthlyMap[monthKey].calls += day.calls;
      monthlyMap[monthKey].completed += day.completed;
      monthlyMap[monthKey].incomplete += day.incomplete;
    });
    
    // Calculate completion rate for each month
    Object.values(monthlyMap).forEach(month => {
      month.completion_rate = month.calls > 0 ? Math.round((month.completed / month.calls) * 100) : 0;
    });
    
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Process data for charts based on time filter
  const getProcessedData = () => {
    if (!callTrendsData || !callTrendsData.daily) return [];

    const dailyData = callTrendsData.daily;
    
    if (timeFilter === 'daily') {
      return dailyData.map(item => ({
        ...item,
        displayDate: formatDate(item.date),
        date: item.date
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    if (timeFilter === 'weekly') {
      const weeklyData = calculateWeeklyData(dailyData);
      return weeklyData.map(item => ({
        ...item,
        displayDate: `Week ${item.weekNumber}`,
        date: item.weekKey,
        fullDisplayName: item.displayName
      }));
    }
    
    if (timeFilter === 'monthly') {
      const monthlyData = calculateMonthlyData(dailyData);
      return monthlyData.map(item => ({
        ...item,
        displayDate: item.monthName,
        date: item.month
      }));
    }
    
    return [];
  };

  // Fetch follow-up data from backend for calendar
  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://mersols.com/followups");
       
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
                color: statusConfig[status]?.color || "#10b981",
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
            color: statusConfig["Pending"].color,
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
    const chartData = getProcessedData();
    
    const totalCalls = chartData.reduce((sum, d) => sum + d.calls, 0);
    const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
    const totalIncomplete = chartData.reduce((sum, d) => sum + d.incomplete, 0);
    const overallCompletionRate = totalCalls > 0 ? Math.round((totalCompleted / totalCalls) * 100) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">
              {timeFilter === 'weekly' && data?.fullDisplayName ? data.fullDisplayName : label}
            </p>
            {payload.map((entry, index) => (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
            <p className="text-xs text-green-600 mt-1 font-semibold">
              Completion Rate: {data?.completion_rate || 0}%
            </p>
          </div>
        );
      }
      return null;
    };

    // Choose the right chart based on time filter
    const renderChart = () => {
      if (chartData.length === 0) {
        return (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No data available for {timeFilter} call trends
          </div>
        );
      }

      if (timeFilter === 'monthly' && chartData.length > 1) {
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#6b7280" 
              fontSize={10} 
            />
            <YAxis stroke="#6b7280" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" radius={[2, 2, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
            <Bar dataKey="incomplete" fill="#ef4444" name="Incomplete" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      } else {
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#6b7280" 
              fontSize={10} 
            />
            <YAxis stroke="#6b7280" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="calls" 
              stroke="#3b82f6" 
              name="Total Calls" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10b981" 
              name="Completed" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="incomplete" 
              stroke="#ef4444" 
              name="Incomplete" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
      }
    };

    // Get current month's weekly data for display
    const getCurrentMonthWeeks = () => {
      if (timeFilter !== 'weekly') return null;
      
      const weeklyData = calculateWeeklyData(callTrendsData?.daily || []);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      return weeklyData.filter(week => 
        week.month === currentMonth && week.year === currentYear
      );
    };

    const currentMonthWeeks = getCurrentMonthWeeks();

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
              onClick={() => setTimeFilter('weekly')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                timeFilter === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
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

        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
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
          <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-600">Completion Rate</p>
            <p className="text-lg font-bold text-gray-800">{overallCompletionRate}%</p>
          </div> */}
        </div>

        {/* Current Month Weekly Summary - Only show for weekly view */}
        {timeFilter === 'weekly' && currentMonthWeeks && currentMonthWeeks.length > 0 && (
          <div className="mt-4 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week-wise Summary
            </h4>
            <div className="grid grid-cols-5 gap-1">
              {currentMonthWeeks.map(week => (
                <div key={week.weekKey} className="text-center p-1 bg-white rounded border">
                  <p className="text-xs font-semibold text-gray-600">Week {week.weekNumber}</p>
                  <p className="text-lg font-bold text-blue-600">{week.calls}</p>
                  <p className="text-xs text-green-600">{week.completion_rate}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Data summary */}
        <div className="mt-2 text-xs text-gray-600 text-center">
          Showing {chartData.length} {timeFilter} record(s) • 
          Overall Completion: {overallCompletionRate}%
          {timeFilter === 'weekly' && currentMonthWeeks && (
            <span> • {currentMonthWeeks.length} weeks in current month</span>
          )}
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

        {/* LEGEND */}
        <div className="mt-3 flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-700">Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-700">Upcoming</span>
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