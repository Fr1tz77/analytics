'use client';

import { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";
import { MoonIcon, SunIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

const D3Chart = dynamic(() => import('@/components/D3Chart').then(mod => mod.D3Chart), { ssr: false });
const GeoHeatmap = dynamic(() => import('@/components/GeoHeatmap').then(mod => mod.GeoHeatmap), { ssr: false });

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
  const [analyticsData, setAnalyticsData] = useState({
    events: [],
    topSources: [],
    topPages: [],
    countries: [],
    browsers: [],
    cohortData: [],
    funnelData: {}
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
  ]);

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
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}&metric=${selectedMetric}&interval=${timeInterval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      if (data.events && data.events.length > 0) {
        console.log('Sample event:', data.events[0]);
      }
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

  const renderCohortAnalysis = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 overflow-x-auto">
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

  const renderFunnelAnalysis = () => {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Funnel Analysis</h2>
        <div className="h-96">
          <Bar data={data} options={options} />
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
        );
      case 'topSources':
        return renderSection(widget.title, 
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
        );
      case 'topPages':
        return renderSection(widget.title, 
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
        );
      case 'countries':
        return renderSection(widget.title, 
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
        );
      case 'browsers':
        return renderSection(widget.title, 
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
        );
      case 'cohortAnalysis':
        return renderCohortAnalysis();
      case 'funnelAnalysis':
        return renderFunnelAnalysis();
      default:
        return null;
    }
  };

  const renderD3Chart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">D3 Visualization</h2>
      <D3Chart data={analyticsData.topPages.map(page => ({ label: page._id, value: page.count }))} />
    </div>
  );

  const renderGeoHeatmap = () => {
    console.log("Countries data:", analyticsData.countries);
    const heatmapData = analyticsData.countries ? analyticsData.countries.map(country => ({
      id: country._id,
      value: country.count
    })) : [];
    console.log("Heatmap data:", heatmapData);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Geographical Heatmap</h2>
        <div style={{ width: "100%", height: "400px" }}>
          <GeoHeatmap data={heatmapData} />
        </div>
      </div>
    );
  };

  const logAction = async (action, details) => {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, user: 'current_user', details }),
    });
  };

  return (
    <ProtectedPage>
      <div className={`min-h-screen p-4 transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-apple-gray text-gray-900'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-700" />}
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                aria-label="Import data"
              >
                <ArrowUpTrayIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
          <div className="mb-6 flex flex-wrap items-center space-x-2 space-y-2">
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
          {renderGeoHeatmap()}
        </div>
      </div>
    </ProtectedPage>
  );
}
