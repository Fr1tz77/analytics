// components/VisitorsByCountry.js
import React from 'react';

// Utility functions from the dashboard
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
  };
  return countryCodes[countryName] || countryName.slice(0, 2).toUpperCase();
}

const VisitorsByCountry = ({ countries, selectedMetric, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Visitors by Country ({selectedMetric})</h2>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : countries && countries.length > 0 ? (
        <ul className="space-y-2">
          {countries.map(country => (
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
      )}
    </div>
  );
};

export default VisitorsByCountry;
