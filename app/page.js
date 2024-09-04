'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { WorldMap } from 'react-svg-worldmap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProtectedPage from "../components/ProtectedPage";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const getChartData = () => {
    if (!analyticsData) return { dates: [], data: [] };
    return {
      dates: analyticsData.pageviews.map(item => new Date(item.date).toLocaleDateString()),
      data: analyticsData.pageviews.map(item => item.count)
    };
  };

  const { dates, data } = getChartData();

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Pageviews',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ],
  };

  return (
    <main className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`mb-4 px-4 py-2 rounded ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
      >
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>

      <h1 className="text-3xl font-bold mb-8">Website Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-opacity-10 bg-gray-200 p-4 rounded-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Traffic Overview</h2>
          <div className="flex justify-between items-center mb-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="p-2 rounded border"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="p-2 rounded border"
            />
          </div>
          <Line data={chartData} />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedPage>
      <Dashboard />
    </ProtectedPage>
  );
}
