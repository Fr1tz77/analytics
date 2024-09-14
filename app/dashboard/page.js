'use client';

import { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";
import { MoonIcon, SunIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import DateRangeSelector from '../components/DateRangeSelector';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import moment from 'moment-timezone';

const D3Chart = dynamic(() => import('../components/D3Chart').then(mod => mod.D3Chart), { ssr: false });
const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });

const DragDropContext = dynamic(() => import('react-beautiful-dnd').then(mod => mod.DragDropContext), { ssr: false });
const Droppable = dynamic(() => import('react-beautiful-dnd').then(mod => mod.Droppable), { ssr: false });
const Draggable = dynamic(() => import('react-beautiful-dnd').then(mod => mod.Draggable), { ssr: false });

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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

function formatChartLabel(dateString, interval, timeZone) {
  const date = moment.tz(dateString, timeZone);
  
  if (interval === 'hour' || interval === '3hour' || interval === '12hour') {
    return date.format('ha'); // e.g., 1am, 2pm
  } else if (interval === 'day' || interval === 'week') {
    return date.format('MM-DD'); // e.g., 09-11
  } else {
    return date.format('YYYY-MM-DD'); // fallback format
  }
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState({
    events: [],
    topSources: [],
    topPages: [],
    countries: [],
    browsers: [],
    cohortData: [],
    funnelData: {},
    twitterAnalytics: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [timeInterval, setTimeInterval] = useState('day');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('last7days');
  const [importedData, setImportedData] = useState(null);
  const fileInputRef = useRef(null);
  const [dashboardLayout, setDashboardLayout] = useState([
    { id: 'chart', title: 'Analytics Over Time' },
    { id: 'topSources', title: 'Top Sources' },
    { id: 'topPages', title: 'Top Pages' },
    { id: 'countries', title: 'Visitors by Country' },
    { id: 'browsers', title: 'Browsers' },
    { id: 'cohortAnalysis', title: 'Cohort Analysis' },
    { id: 'funnelAnalysis', title: 'Funnel Analysis' },
    { id: 'twitterAnalytics', title: 'Twitter Analytics' },
  ]);
  const router = useRouter();
  const [timeZone, setTimeZone] = useState('UTC');

  useEffect(() => {
    // Set default time zone to user's local time zone
    setTimeZone(moment.tz.guess());
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, selectedMetric, timeInterval, timeZone]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === 'd') {
        setDarkMode(!darkMode);
        logAction('toggle_dark_mode', { darkMode: !darkMode });
      } else if (event.ctrlKey && event.key === 'i') {
        fileInputRef.current.click();
      } else if (event.ctrlKey && event.key === 'r') {
        fetchAnalyticsData();
        logAction('refresh_data', {});
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [darkMode]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      console.log(`Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}&metric=${selectedMetric}&interval=${timeInterval}&timeZone=${timeZone}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Fetched analytics data:', data);

      // Fetch real Twitter data
      const twitterResponse = await fetch('/api/twitter-analytics');
      if (!twitterResponse.ok) {
        throw new Error('Failed to fetch Twitter data');
      }
      const twitterData = await twitterResponse.json();
      console.log('Fetched Twitter data:', twitterData);

      // Combine the analytics data with the Twitter data
      setAnalyticsData({
        ...data,
        twitterAnalytics: twitterData.twitterAnalytics
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (start, end, interval) => {
    setStartDate(start);
    setEndDate(end);
    setTimeInterval(interval);
  };

  const chartData = {
    labels: analyticsData.events?.map(item => formatChartLabel(item.date, timeInterval, timeZone)) || [],
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
            : selectedMetric === 'bounceRate'
              ? Number(item[selectedMetric].toFixed(2)) // Round to 2 decimal places
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
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const originalDate = analyticsData.events[index].date;
            return moment.tz(originalDate, timeZone).format('YYYY-MM-DD HH:mm');
          }
        }
      }
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
              return value.toFixed(2) + '%';
            }
            return value;
          }
        }
      }
    }
  };

  const renderSection = (title, content, className = '') => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${className}`}>
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        try {
          const jsonData = JSON.parse(content);
          setImportedData(jsonData);
          // Process and merge imported data with existing analytics data
          setAnalyticsData(prevData => ({
            ...prevData,
            events: [...prevData.events, ...jsonData.events],
            // Merge other data as needed
          }));
        } catch (error) {
          console.error('Error parsing imported data:', error);
          setError('Failed to import data. Please ensure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderCohortAnalysis = (className) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 overflow-x-auto ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Cohort Analysis</h2>
      {analyticsData.cohortData && analyticsData.cohortData.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Cohort</th>
              {[...Array(30)].map((_, i) => (
                <th key={i} className="px-4 py-2">Day {i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analyticsData.cohortData.map((cohort, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{cohort.cohort}</td>
                {cohort.retentionData.map((day, dayIndex) => (
                  <td key={dayIndex} className="border px-4 py-2">
                    {((day.users / cohort.totalUsers) * 100).toFixed(2)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No cohort data available for the selected period.</p>
      )}
    </div>
  );

  const renderFunnelAnalysis = (className) => {
    const funnelData = analyticsData.funnelData;
    if (!funnelData) return null;

    const steps = Object.keys(funnelData);
    const data = {
      labels: steps,
      datasets: [{
        data: steps.map(step => funnelData[step]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Funnel Analysis</h2>
        <div className="h-96">
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  const renderTwitterAnalytics = () => {
    console.log('Twitter Analytics Data:', analyticsData.twitterAnalytics);
    if (!analyticsData.twitterAnalytics || analyticsData.twitterAnalytics.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Twitter Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">No Twitter data available for the selected period.</p>
        </div>
      );
    }

    const twitterChartData = {
      labels: analyticsData.twitterAnalytics.map(tweet => new Date(tweet.created_at).toLocaleDateString()),
      datasets: [
        {
          label: 'Likes',
          data: analyticsData.twitterAnalytics.map(tweet => tweet.likes),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
          text: 'Twitter Likes Over Time'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Likes'
          },
          beginAtZero: true
        }
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Twitter Analytics</h2>
        <div style={{ height: '400px' }}>
          <Line data={twitterChartData} options={options} />
        </div>
      </div>
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(dashboardLayout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardLayout(items);
  };

  const renderWidget = (widget) => {
    const isHalfWidth = ['topSources', 'topPages', 'countries', 'browsers'].includes(widget.id);
    const widgetClass = isHalfWidth ? 'md:col-span-1' : 'md:col-span-2';

    const renderList = (data, label) => (
      data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map(item => (
            <li key={item._id} className="flex justify-between">
              <span>{item._id === 'Twitter / X' ? 'Twitter / X' : (item._id || 'Direct')}</span>
              <span className="font-semibold">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No {label} data available for the selected period.</p>
      )
    );

    switch (widget.id) {
      case 'chart':
        return renderSection(widget.title, 
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
        , widgetClass);
      case 'topSources':
        return renderSection(`Top Sources (${selectedMetric})`, renderList(analyticsData.topSources, 'source'), widgetClass);
      case 'topPages':
        return renderSection(`Top Pages (${selectedMetric})`, renderList(analyticsData.topPages, 'page'), widgetClass);
      case 'countries':
        return renderSection(`Visitors by Country (${selectedMetric})`, 
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
        , widgetClass);
      case 'browsers':
        return renderSection(`Browsers (${selectedMetric})`, renderList(analyticsData.browsers, 'browser'), widgetClass);
      case 'cohortAnalysis':
        return renderCohortAnalysis(widgetClass);
      case 'funnelAnalysis':
        return renderFunnelAnalysis(widgetClass);
      case 'twitterAnalytics':
        return renderTwitterAnalytics();
      default:
        return null;
    }
  };

  const renderD3Chart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-6 mb-4 sm:mb-8 overflow-x-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">D3 Visualization</h2>
      <div className="w-full overflow-x-scroll sm:overflow-x-auto">
        <div className="min-w-[300px]">
          <D3Chart data={analyticsData.topPages.map(page => ({ label: page._id, value: page.count }))} />
        </div>
      </div>
    </div>
  );

  const renderWorldMap = () => {
    console.log("Countries data:", analyticsData.countries);
    const mapData = analyticsData.countries ? analyticsData.countries.map(country => ({
      id: country._id,
      value: country.count,
      coordinates: getCountryCoordinates(country._id)
    })).filter(country => country.coordinates) : [];
    console.log("Map data:", mapData);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Geographical Distribution</h2>
        <div style={{ height: '400px', width: '100%' }}>
          {typeof window !== 'undefined' && <WorldMap data={mapData} darkMode={darkMode} />}
        </div>
      </div>
    );
  };

  // Add this function to get country coordinates
  function getCountryCoordinates(countryName) {
    const coordinates = {
      'United States': [37.0902, -95.7129],
      'United Kingdom': [55.3781, -3.4360],
      'Germany': [51.1657, 10.4515],
      'France': [46.2276, 2.2137],
      'Canada': [56.1304, -106.3468],
      'Australia': [-25.2744, 133.7751],
      'Japan': [36.2048, 138.2529],
      'China': [35.8617, 104.1954],
      'India': [20.5937, 78.9629],
      'Brazil': [-14.2350, -51.9253],
      // Add more countries as needed
    };
    return coordinates[countryName] || null;
  }

  const logAction = async (action, details) => {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, user: 'current_user', details }),
    });
  };

  return (
    <ProtectedPage>
      <div className={`min-h-screen p-2 sm:p-4 transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-apple-gray text-gray-900'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0">Analytics Dashboard</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />}
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                aria-label="Import data"
              >
                <ArrowUpTrayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mb-8">
            <DateRangeSelector onDateChange={handleDateChange} />
          </div>
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:justify-between">
              {['uniqueVisitors', 'pageviews', 'avgDuration', 'bounceRate'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 ${
                    selectedMetric === metric 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {metric === 'avgDuration' ? 'Avg Duration' : 
                   metric === 'bounceRate' ? 'Bounce Rate' :
                   metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Zone</label>
            <select
              id="timezone"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {moment.tz.names().map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          {typeof window !== 'undefined' && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardLayout.map((widget, index) => (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-4"
                          >
                            {renderWidget(widget)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {renderD3Chart()}
          {renderWorldMap()}
        </div>
      </div>
    </ProtectedPage>
  );
}
