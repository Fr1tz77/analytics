'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { WorldMap } from 'react-svg-worldmap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch analytics data. Please try again later.');
      setAnalyticsData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analyticsData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Page Views',
        data: analyticsData.map(item => item.count || 1), // Default to 1 if count is not present
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
        text: 'Page Views Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
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
      <div className="w-full h-64">
        <Line options={options} data={chartData} />
      </div>
      {!loading && !error && analyticsData.length === 0 && (
        <p className="text-gray-600 mt-4">No data available for the selected date range.</p>
      )}
      {!loading && !error && analyticsData.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Data Summary</h2>
          <p>Total events: {analyticsData.length}</p>
          <p>Date range: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
