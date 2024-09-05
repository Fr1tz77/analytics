'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getCountryFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function getCountryCode(countryName) {
  const countryCodes = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Germany': 'DE',
    'France': 'FR',
    'Canada': 'CA',
    'Australia': 'AU',
    'Japan': 'JP',
    'China': 'CN',
    'India': 'IN',
    'Brazil': 'BR',
    'Unknown': 'UN',
    // Add more mappings as needed
  };
  return countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
}

function formatChartLabel(dateString, interval) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // If the date is invalid, return the original string
    return dateString;
  }
  if (interval === 'hour') {
    return date.toLocaleString('en-US', { hour: 'numeric', hour12: true });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export default function Home() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState({ events: [], topSources: [], topPages: [], countries: [], browsers: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [timeInterval, setTimeInterval] = useState('day');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('last7days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, selectedMetric, timeInterval]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}&metric=${selectedMetric}&interval=${timeInterval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      console.log('Sample event:', data.events[0]);  // Log a sample event
      setAnalyticsData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (timeframe) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (timeframe) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        start.setDate(start.getDate() - 30);
        break;
      case 'last12months':
        start.setMonth(start.getMonth() - 12);
        break;
      default: // last7days
        start.setDate(start.getDate() - 7);
    }

    setStartDate(start);
    setEndDate(end);
    setSelectedTimeframe(timeframe);
  };

  const chartData = {
    labels: analyticsData.events?.map(item => {
      // Check if the date is already formatted (e.g., "3 PM" or "Sep 5")
      if (typeof item.date === 'string' && (item.date.includes('AM') || item.date.includes('PM') || item.date.includes(' '))) {
        return item.date;
      }
      return formatChartLabel(item.date, timeInterval);
    }) || [],
    datasets: [
      {
        label: selectedMetric === 'avgDuration' 
          ? 'Average Duration (minutes)' 
          : selectedMetric === 'bounceRate'
            ? 'Bounce Rate (%)'
            : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
        data: analyticsData.events?.map(item => 
          selectedMetric === 'avgDuration'
            ? Number((item[selectedMetric] / 60000).toFixed(2)) // Convert ms to minutes
            : item[selectedMetric]
        ) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedMetric === 'avgDuration' 
          ? 'Average Duration (minutes)' 
          : selectedMetric === 'bounceRate'
            ? 'Bounce Rate (%)'
            : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time`,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value, index, values) {
            if (selectedMetric === 'avgDuration') {
              return value.toFixed(2) + 'm';
            } else if (selectedMetric === 'bounceRate') {
              return value + '%';
            }
            return value;
          }
        }
      }
    }
  };

  const renderSection = (title, content) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        content
      )}
    </div>
  );

  return (
    <ProtectedPage>
      <div className={`min-h-screen p-4 transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
          <div className="mb-6 flex flex-wrap items-center space-x-4">
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            />
            <select
              value={selectedTimeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last12months">Last 12 months</option>
            </select>
            <select
              value={timeInterval}
              onChange={e => setTimeInterval(e.target.value)}
              className="p-2 border rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="day">Day</option>
              <option value="hour">Hour</option>
            </select>
          </div>
          <div className="flex justify-between mb-6">
            {['uniqueVisitors', 'pageviews', 'avgDuration', 'bounceRate'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedMetric === metric 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {metric === 'avgDuration' ? 'Avg Duration (m)' : 
                 metric === 'bounceRate' ? 'Bounce Rate (%)' :
                 metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          {renderSection("Analytics Over Time", 
            <div className="w-full h-96 px-4">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : analyticsData.events && analyticsData.events.length > 0 ? (
                <Line options={options} data={chartData} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No data available for the selected period.</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {renderSection("Top Sources", 
              analyticsData.topSources && analyticsData.topSources.length > 0 ? (
                <ul className="space-y-2">
                  {analyticsData.topSources.map(source => (
                    <li key={source._id} className="flex justify-between">
                      <span>{source._id || 'Direct'}</span>
                      <span className="font-semibold">{source.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No source data available for the selected period.</p>
              )
            )}
            {renderSection("Top Pages", 
              analyticsData.topPages && analyticsData.topPages.length > 0 ? (
                <ul className="space-y-2">
                  {analyticsData.topPages.map(page => (
                    <li key={page._id} className="flex justify-between">
                      <span>{page._id}</span>
                      <span className="font-semibold">{page.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No page data available for the selected period.</p>
              )
            )}
          </div>
          {renderSection("Visitors by Country", 
            analyticsData.countries && analyticsData.countries.length > 0 ? (
              <ul className="space-y-2">
                {analyticsData.countries.map(country => (
                  <li key={country._id} className="flex justify-between items-center">
                    <span>
                      {getCountryFlagEmoji(getCountryCode(country._id))} {country._id}
                    </span>
                    <span className="font-semibold">{country.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No country data available for the selected period.</p>
            )
          )}
          {renderSection("Browsers", 
            analyticsData.browsers && analyticsData.browsers.length > 0 ? (
              <ul className="space-y-2">
                {analyticsData.browsers.map(browser => (
                  <li key={browser._id} className="flex justify-between">
                    <span>{browser._id}</span>
                    <span className="font-semibold">{browser.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No browser data available for the selected period.</p>
            )
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
