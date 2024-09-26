'use client'; // Add this at the top of the file

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment-timezone';
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
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState({ events: [], topSources: [], topPages: [], countries: [], browsers: [], cohortData: [], funnelData: {}, twitterAnalytics: [] });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [timeZone, setTimeZone] = useState('UTC');
  const fileInputRef = useRef(null);
  const [dashboardLayout, setDashboardLayout] = useState([{ id: 'chart', title: '' }, { id: 'topSources', title: 'Top Sources' }, { id: 'topPages', title: 'Top Pages' }, { id: 'countries', title: 'Visitors by Country' }, { id: 'browsers', title: 'Browsers' }]);

  useEffect(() => setTimeZone(moment.tz.guess()), []);
  useEffect(() => fetchAnalyticsData(), [startDate, endDate, selectedMetric, timeZone]);

  const fetchAnalyticsData = async () => { /* logic here */ };

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
      {loading ? <p>Loading...</p> : content}
    </div>
  );

  return (
    <ProtectedPage>
      <div className={`min-h-screen p-4 transition-colors ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              <FileUploader fileInputRef={fileInputRef} handleFileUpload={() => { /* logic */ }} />
            </div>
          </div>
          <DateRange onDateChange={setStartDate} timeZone={timeZone} setTimeZone={setTimeZone} />
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
                            selectedMetric={selectedMetric}
                            timeZone={timeZone}
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
        </div>
      </div>
    </ProtectedPage>
  );
}
