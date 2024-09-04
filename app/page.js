'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState({ events: [], topSources: [], topPages: [], countries: [], browsers: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('pageviews');

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate, selectedMetric]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}&metric=${selectedMetric}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analyticsData.events.map(item => item.date),
    datasets: [
      {
        label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
        data: analyticsData.events.map(item => item[selectedMetric]),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="mb-4 flex space-x-4">
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="p-2 border rounded"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="p-2 border rounded"
        />
      </div>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="flex justify-between mb-4">
            {['uniqueVisitors', 'pageviews', 'avgDuration', 'bounceRate'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded ${selectedMetric === metric ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          <div className="w-full h-64 mb-8">
            <Line options={options} data={chartData} />
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Top Sources</h2>
              <ul>
                {analyticsData.topSources.map(source => (
                  <li key={source._id}>{source._id}: {source.count}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Top Pages</h2>
              <ul>
                {analyticsData.topPages.map(page => (
                  <li key={page._id}>{page._id}: {page.count}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Visitors by Country</h2>
            <ComposableMap>
              <Geographies geography="/world-110m.json">
                {({ geographies }) =>
                  geographies.map(geo => {
                    const country = analyticsData.countries.find(c => c._id === geo.properties.NAME);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={country ? `rgba(75, 192, 192, ${country.count / Math.max(...analyticsData.countries.map(c => c.count))})` : "#F5F4F6"}
                        stroke="#D6D6DA"
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Browsers</h2>
            <ul>
              {analyticsData.browsers.map(browser => (
                <li key={browser._id}>{browser._id}: {browser.count}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
