// 
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

interface CountryCount {
  country_name: string;
  student_count: number;
}

export default function CountryCountChart() {
  const [countries, setCountries] = useState<CountryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading dummy data
    const dummyData: CountryCount[] = [
      { country_name: "USA", student_count: 180 },
      { country_name: "Canada", student_count: 145 },
      { country_name: "UK", student_count: 110 },
      { country_name: "Germany", student_count: 95 },
      { country_name: "Australia", student_count: 85 },
      { country_name: "New Zealand", student_count: 65 },
      { country_name: "France", student_count: 55 },
      { country_name: "Ireland", student_count: 45 },
      { country_name: "Singapore", student_count: 30 },
      { country_name: "UAE", student_count: 20 }
    ];

    setTimeout(() => {
      setCountries(dummyData);
      setLoading(false);
    }, 500); // Simulate slight delay
  }, []);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, speed: 800 }
    },
    colors: ["#6366F1", "#38BDF8", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#64748B"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '60%',
        barHeight: '70%',
        distributed: false,
        dataLabels: { position: 'center' }
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif'
      },
      formatter: val => val,
      offsetX: 0,
      dropShadow: { enabled: false }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    legend: { show: false },
    xaxis: {
      categories: countries.map(country => country.country_name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'Outfit, sans-serif'
        },
        formatter: value => value.length > 15 ? `${value.substring(0, 15)}...` : value
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'Outfit, sans-serif'
        }
      },
      min: 0,
      tickAmount: 5
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 5,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
      yaxis: { lines: { show: false } },
      xaxis: { lines: { show: true } }
    },
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: "horizontal",
        shadeIntensity: 0.25,
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
        formatter: function (val, { dataPointIndex }) {
          const country = countries[dataPointIndex];
          return `<div>
            <strong>${country.country_name}</strong><br/>
            <span>${val} student${val !== 1 ? 's' : ''}</span>
          </div>`;
        }
      },
      marker: { show: true }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: { height: 350 },
        plotOptions: { bar: { barHeight: '60%' } },
        dataLabels: { style: { fontSize: '10px' } }
      }
    }]
  };

  const series = [{
    name: "Student Count",
    data: countries.map(c => c.student_count)
  }];

  const totalStudents = countries.reduce((sum, c) => sum + c.student_count, 0);
  const topCountry = countries.length > 0 ? countries[0] : null;

  return (
    <div className="mt-[-400px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full md:w-[66%]">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Country-wise Student Count</h3>
            <p className="mt-1 text-xs text-gray-600">Top destinations for students</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-1">
        <div className="relative">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="h-[300px] flex items-center justify-center text-red-500 text-sm">
              {error}
            </div>
          ) : countries.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No country data available
            </div>
          ) : (
            <Chart
              options={options}
              series={series}
              type="bar"
              height={300}
              className="relative z-10"
            />
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1">
          {topCountry && (
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
              <span className="text-gray-600">Top:</span>
              <span className="font-semibold ml-1 text-gray-800 truncate max-w-[100px]">
                {topCountry.country_name} ({topCountry.student_count})
              </span>
            </div>
          )}
          <div className="flex items-center">
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold ml-1 text-gray-800">{totalStudents}</span>
          </div>
          <div className="text-blue-600 font-medium">
            {countries.length} countries
          </div>
        </div>
      </div>
    </div>
  );
}