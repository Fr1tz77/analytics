import React, { useState } from 'react';

const TopSources = ({ sources, loading, error, selectedMetric }) => {
  // Local state to manage the visibility of all sources
  const [showAll, setShowAll] = useState(false);

  // Slice the array based on the state
  const displayedSources = showAll ? sources : sources.slice(0, 9);

  const renderList = () => (
    displayedSources && displayedSources.length > 0 ? (
      <ul className="space-y-2">
        {displayedSources.map(item => (
          <li key={item._id} className="flex justify-between">
            <span>{item._id === 'Twitter / X' ? 'Twitter / X' : (item._id || 'Direct')}</span>
            <span className="font-semibold">{item.count}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 dark:text-gray-400">No source data available for the selected period.</p>
    )
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Top Sources ({selectedMetric})</h2>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {renderList()}
          {/* Show More / Show Less Button */}
          {sources.length > 9 && (
            <button
              className="mt-4 text-blue-500 hover:underline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TopSources;
