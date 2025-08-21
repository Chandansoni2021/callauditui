  import Chart from "react-apexcharts";
  import { ApexOptions } from "apexcharts";
  import { useEffect, useState } from "react";

  export default function DailyCallsChart() {
    const [seriesData, setSeriesData] = useState<number[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCallData = async () => {
        try {
          const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/calls-per-day/");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          // Sort dates in ascending order
          const sortedDates = Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
          
          // Format dates for display (e.g., "Jun 27")
          const formattedDates = sortedDates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          
          // Get counts in the same order
          const counts = sortedDates.map(date => data[date]);
          
          setCategories(formattedDates);
          setSeriesData(counts);
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setLoading(false);
        }
      };

      fetchCallData();
    }, []);

    const options: ApexOptions = {
      colors: ["#6366F1"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 240,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false
        },
        animations: {
          enabled: true,
          speed: 800,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          distributed: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: '#64748B',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Outfit, sans-serif'
          },
          formatter: function(value) {
            // Show only day number for more compact display
            return value.split(' ')[1];
          }
        }
      },
      legend: {
        show: false,
      },
      yaxis: {
        labels: {
          style: {
            colors: '#64748B',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Outfit, sans-serif'
          },
          formatter: function(val) {
            return val.toFixed(0);
          }
        },
        min: 0,
        tickAmount: 5
      },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 5,
        padding: {
          top: 20,
          right: 20,
          bottom: 0,
          left: 20
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      fill: {
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: ["#818CF8"],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.7,
          stops: [0, 100]
        }
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontFamily: 'Outfit, sans-serif'
        },
        y: {
          formatter: function(val) {
            return val + (val === 1 ? " call" : " calls");
          }
        },
        x: {
          formatter: function(val, opts) {
            // Show full date in tooltip
            return categories[opts.dataPointIndex];
          }
        },
        marker: {
          show: true
        }
      },
      responsive: [{
        breakpoint: 640,
        options: {
          chart: {
            height: 200
          }
        }
      }]
    };

    const series = [{
      name: "Calls",
      data: seriesData
    }];

    // Calculate peak day for footer
    const peakDay = seriesData.length > 0 ? {
      date: categories[seriesData.indexOf(Math.max(...seriesData))],
      count: Math.max(...seriesData)
    } : null;

    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Daily Call Volume</h3>
              <p className="mt-1 text-sm text-gray-600">Total calls by day</p>
            </div>
            <div className="flex items-center">
              <span className="flex items-center mr-4">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-sm text-gray-600">Calls</span>
              </span>
              <button className="text-indigo-600 hover:text-indigo-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chart container */}
        <div className="px-4 py-2">
          <div className="relative">
            {loading ? (
              <div className="h-60 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="h-60 flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : (
              <Chart
                options={options}
                series={series}
                type="bar"
                height={240}
              />
            )}
          </div>
        </div>

        {/* Summary footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            {peakDay ? (
              <>
                <div className="text-gray-600">
                  <span className="font-medium">Peak Day: </span>
                  <span className="font-semibold text-gray-800">{peakDay.date} ({peakDay.count} calls)</span>
                </div>
                <div className="text-blue-600 font-medium">
                  Total: {seriesData.reduce((a, b) => a + b, 0)} calls
                </div>
              </>
            ) : (
              <div className="text-gray-600 w-full text-center">
                {loading ? 'Loading data...' : 'No call data available'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }