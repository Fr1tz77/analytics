'use client'; // Ensure this is a Client Component

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment-timezone';
import { signOut } from 'next-auth/react';
import ProtectedPage from "../components/ProtectedPage";
import DarkModeToggle from '../components/DarkModeToggle';
import FileUploader from '../components/FileUploader';
import DateRange from '../components/DateRange';
import AnalyticsMetrics from '../components/AnalyticsMetrics';
import WidgetRenderer from '../components/WidgetRenderer';

const D3Chart = dynamic(() => import('../components/D3Chart').then(mod => mod.D3Chart), { ssr: false });
const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });
const { DragDropContext, Droppable, Draggable } = dynamic(() => import('react-beautiful-dnd'), { ssr: false });

export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Default to last 7 days
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
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [timeZone, setTimeZone] = useState('UTC');
  const fileInputRef = useRef(null);
  const [dashboardLayout, setDashboardLayout] = useState([
    { id: 'chart', title: 'Main Chart' },
    { id: 'topSources', title: 'Top Sources' },
    { id: 'topPages', title: 'Top Pages' },
    { id: 'countries', title: 'Visitors by Country' },
    { id: 'browsers', title: 'Browsers' }
  ]);

  // Fetch timezone on initial mount
  useEffect(() => setTimeZone(moment.tz.guess()), []);

  // Fetch analytics data when date, metric, or timezone changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, selectedMetric, timeZone]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const currentPeriodStart = startDate.toISOString();
      const currentPeriodEnd = endDate.toISOString();
      const duration = moment(endDate).diff(moment(startDate), 'days');

      // Adjust for daily comparison
      const previousPeriodStart = moment(startDate).subtract(duration + 1, 'days').toISOString();
      const previousPeriodEnd = moment(endDate).subtract(duration + 1, 'days').toISOString();

      const [currentResponse, previousResponse] = await Promise.all([
        fetch(`/api/analytics?start=${currentPeriodStart}&end=${currentPeriodEnd}&metric=${selectedMetric}&timeZone=${timeZone}`),
        fetch(`/api/analytics?start=${previousPeriodStart}&end=${previousPeriodEnd}&metric=${selectedMetric}&timeZone=${timeZone}`)
      ]);

      if (!currentResponse.ok || !previousResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const currentData = await currentResponse.json();
      const previousData = await previousResponse.json();

      setAnalyticsData(currentData);
      setComparisonData(previousData.events || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          // Process and merge imported data with existing analytics data
          setAnalyticsData(prevData => ({
            ...prevData,
            events: [...prevData.events, ...jsonData.events],
            // You can merge other data as needed (topPages, topSources, etc.)
          }));
          setError(null);
        } catch (error) {
          console.error('Error parsing uploaded file:', error);
          setError('Failed to import data. Ensure the JSON is valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle dragging and dropping of widgets
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(dashboardLayout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardLayout(items);
  };

  const renderSection = (title, content) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : content}
    </div>
  );

  return (
    <ProtectedPage>
      <div className={`min-h-screen p-4 transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              <FileUploader fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
          <DateRange onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }} timeZone={timeZone} setTimeZone={setTimeZone} />
          <AnalyticsMetrics selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric} />
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dashboard">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardLayout.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <WidgetRenderer
                            widget={widget}
                            renderSection={renderSection}
                            analyticsData={analyticsData}
                            comparisonData={comparisonData}
                            selectedMetric={selectedMetric}
                            timeZone={timeZone}
                            loading={loading}
                            error={error}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="my-8">
            <D3Chart data={analyticsData.topPages.map(page => ({ label: page._id, value: page.count }))} />
          </div>
          <div className="my-8">
            <WorldMap data={analyticsData.countries} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
