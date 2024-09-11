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

const DateRangeSelector = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    const interval = determineInterval(startDate, endDate);
    onDateChange(startDate, endDate, interval);
  }, [startDate, endDate, onDateChange]);

  const determineInterval = (start, end) => {
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'hour';
    if (diffHours <= 72) return '3hour';
    if (diffHours <= 168) return '12hour';
    if (diffHours <= 720) return 'day';
    return 'week';
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset.label);
    let end = new Date();
    let start = new Date();

    if (preset.days === 0) {
      // Today: set start to beginning of current day
      start.setHours(0, 0, 0, 0);
    } else if (preset.days === 1) {
      // Yesterday: set start and end to yesterday
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end = new Date(end.getFullYear(), end.getMonth(), 0);
    } else {
      start.setDate(end.getDate() - preset.days);
      start.setHours(0, 0, 0, 0);
    }

    setStartDate(start);
    setEndDate(end);
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
    </div>
  );
};

export default DateRangeSelector;