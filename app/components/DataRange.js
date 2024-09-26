// components/DateRange.js
import DateRangeSelector from './DateRangeSelector';

export default function DateRange({ onDateChange, timeZone, setTimeZone }) {
  return (
    <div className="mb-8">
      <DateRangeSelector onDateChange={onDateChange} />
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
    </div>
  );
}
