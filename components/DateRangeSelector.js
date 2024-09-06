import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: 'month' },
  { label: 'Last month', days: 'lastMonth' },
];

const DateRangeSelector = ({ onDateChange, onIntervalChange }) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState('');
  const [interval, setInterval] = useState('day');

  useEffect(() => {
    onDateChange(startDate, endDate);
  }, [startDate, endDate]);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset.label);
    const end = new Date();
    let start = new Date();

    if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end = new Date(end.getFullYear(), end.getMonth(), 0);
    } else {
      start.setDate(end.getDate() - preset.days);
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    onIntervalChange(newInterval);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <span className="text-gray-500 dark:text-gray-400">to</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedPreset === preset.label
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleIntervalChange('hour')}
          className={`px-3 py-1 rounded-full text-sm ${
            interval === 'hour'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => handleIntervalChange('day')}
          className={`px-3 py-1 rounded-full text-sm ${
            interval === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Daily
        </button>
      </div>
    </div>
  );
};

export default DateRangeSelector;