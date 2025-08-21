import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { format, isToday, parseISO } from 'date-fns';
 
interface SentimentData {
  avg_sentiment: number;
  total_calls: number;
  positive_calls: number;
  negative_calls: number;
  neutral_calls: number;
}
 
interface SalesData {
  month: string;
  revenue: number;
}
 
interface CallData {
  date: string;
  count: number;
  events?: string[]; // Added events array to store call details
}
 
interface CalendarResponse {
  success: boolean;
  events: {
    [date: string]: string[];
  };
}
 
export default function SentimentDashboard() {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<CallData[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sentiment data
        const sentimentResponse = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/api/sentiment/summary");
        const sentimentJson = await sentimentResponse.json();
        setSentimentData(sentimentJson);
 
        // Fetch calendar data
        const calendarResponse = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/calendar-events");
        const calendarJson: CalendarResponse = await calendarResponse.json();
       
        // Transform calendar data into CallData format
        const callsData: CallData[] = Object.entries(calendarJson.events).map(([date, events]) => ({
          date,
          count: events.length,
          events
        }));
        setScheduledCalls(callsData);
 
        // Mock sales data
        const salesJson: SalesData[] = [
          { month: '2024-01-01', revenue: 12000 },
          { month: '2024-02-01', revenue: 18000 },
          { month: '2024-03-01', revenue: 24000 },
          { month: '2024-04-01', revenue: 16000 },
          { month: '2024-05-01', revenue: 20000 },
        ];
        setSalesData(salesJson);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  // Calendar functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };
 
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };
 
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
   
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
   
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
   
    return days;
  };
 
  const getCallsForDay = (day: Date | null) => {
    if (!day) return null;
    const dateStr = format(day, 'yyyy-MM-dd');
    return scheduledCalls.find(call => call.date === dateStr);
  };
 
  const daysInMonth = getDaysInMonth();
  const peakCallDay = scheduledCalls.reduce((max, call) =>
    max.count > call.count ? max : call, { date: '', count: 0, events: [] });
 
  const safeSentimentData = {
    avg_sentiment: sentimentData?.avg_sentiment ?? 0,
    total_calls: sentimentData?.total_calls ?? 0,
    positive_calls: sentimentData?.positive_calls ?? 0,
    negative_calls: sentimentData?.negative_calls ?? 0,
    neutral_calls: sentimentData?.neutral_calls ?? 0,
  };
 
  const sentimentScoreSeries = [safeSentimentData.avg_sentiment];
  const sentimentScoreOptions: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 250,
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 200
        }
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '65%',
          background: 'transparent'
        },
        track: {
          background: '#F1F5F9',
          strokeWidth: '100%',
          margin: 0
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "700",
            offsetY: -10,
            color: "#1E293B",
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        gradientToColors: ['#10B981'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      },
      colors: ['#EF4444']
    },
    labels: ['Sentiment Score'],
    colors: [
      safeSentimentData.avg_sentiment <= 33
        ? '#EF4444'
        : safeSentimentData.avg_sentiment <= 66
        ? '#FACC15'
        : '#10B981'
    ]
  };
 
  const sentimentDistributionSeries = [
    safeSentimentData.positive_calls,
    safeSentimentData.negative_calls,
    safeSentimentData.neutral_calls
  ];
 
  const sentimentDistributionOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: "Outfit, sans-serif" },
    colors: ['#10B981', '#EF4444', '#F59E0B'],
    labels: ['Positive', 'Negative', 'Neutral'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Calls',
              formatter: () => safeSentimentData.total_calls.toString()
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 bg-indigo-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="mt-[-15px] p-4 space-y-6">
      {/* Sentiment Score Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-gray-800">Average Sentiment Score</h4>
          <p className="text-sm text-gray-600">
            {safeSentimentData.avg_sentiment.toFixed(1)}% positive sentiment
          </p>
        </div>
        <div className="h-[250px]">
          <Chart
            options={sentimentScoreOptions}
            series={sentimentScoreSeries}
            type="radialBar"
            height="100%"
          />
        </div>
        <div className="mt-[-120px] text-center">
          {safeSentimentData.avg_sentiment > 50 ? (
            <span className="text-green-600 font-medium">Overall positive sentiment</span>
          ) : safeSentimentData.avg_sentiment < 50 ? (
            <span className="text-red-600 font-medium">Overall negative sentiment</span>
          ) : (
            <span className="text-yellow-600 font-medium">Neutral sentiment</span>
          )}
        </div>
      </div>
 
      {/* Sentiment Distribution Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-gray-800">Sentiment Distribution</h4>
        </div>
        <div className="h-[220px]">
          <Chart
            options={sentimentDistributionOptions}
            series={sentimentDistributionSeries}
            type="donut"
            height="100%"
          />
        </div>
      </div>
 
      {/* Calendar Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button onClick={goToPreviousMonth} className="p-1 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button onClick={goToNextMonth} className="p-1 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
 
        {peakCallDay?.date && (
          <div className="mb-3 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">
            Peak Day: {format(parseISO(peakCallDay.date), 'MMM d')} ({peakCallDay.count} calls)
          </div>
        )}
 
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
 
          {/* Calendar days */}
          {daysInMonth.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-1"></div>;
            }
           
            const callData = getCallsForDay(day);
            const callCount = callData?.count || 0;
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
                  <div
                    className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center
                      ${callCount > 2 ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}
                      text-xs font-medium`}
                    title={callData?.events?.join('\n')}
                  >
                    {callCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
 
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total calls: {scheduledCalls.reduce((sum, call) => sum + call.count, 0)}</span>
            <span>{format(currentDate, 'MMMM yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
 