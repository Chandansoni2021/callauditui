import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface ScheduledCall {
  date: string; // YYYY-MM-DD format
  count: number;
}

const CallCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchScheduledCalls = async () => {
      try {
        // Replace with your actual API call
        // const response = await fetch('http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/scheduled-calls');
        // const data = await response.json();
        
        // Mock data
        const mockData: ScheduledCall[] = [
          { date: '2024-07-09', count: 3 }, // Example peak day from your image
          { date: '2024-07-10', count: 2 },
          { date: '2024-07-15', count: 1 },
          { date: format(new Date(), 'yyyy-MM-dd'), count: 1 }, // Today
          { date: '2024-07-20', count: 4 },
        ];
        
        setScheduledCalls(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scheduled calls:', error);
        setLoading(false);
      }
    };

    fetchScheduledCalls();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getCallsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return scheduledCalls.find(call => call.date === dateStr)?.count || 0;
  };

  const peakCallDay = scheduledCalls.reduce((peak, current) => 
    current.count > (peak?.count || 0) ? current : peak, {} as ScheduledCall);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {peakCallDay?.date && (
        <div className="mb-3 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">
          Peak Day: {format(new Date(peakCallDay.date), 'MMM d')} ({peakCallDay.count} calls)
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map(day => {
            const callCount = getCallsForDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={day.toString()}
                className={`text-center p-1 rounded-md text-sm 
                  ${isCurrentDay ? 'bg-blue-100 font-semibold' : ''}
                  ${callCount > 0 ? 'bg-green-50' : ''}
                `}
              >
                <div className="mb-1">{format(day, 'd')}</div>
                {callCount > 0 && (
                  <div className="h-6 w-6 mx-auto rounded-full flex items-center justify-center 
                    ${callCount > 2 ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'} 
                    text-xs font-medium"
                  >
                    {callCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Total calls: {scheduledCalls.reduce((sum, call) => sum + call.count, 0)}</span>
          <span>{format(currentDate, 'MMMM yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default CallCalendar;