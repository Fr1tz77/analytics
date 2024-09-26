// components/AnalyticsMetrics.js
export default function AnalyticsMetrics({ selectedMetric, setSelectedMetric }) {
    const metrics = ['uniqueVisitors', 'pageviews', 'avgDuration', 'bounceRate'];
    return (
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:justify-between mb-8">
        {metrics.map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors duration-200 ${
              selectedMetric === metric ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {metric === 'avgDuration' ? 'Avg Duration' : metric === 'bounceRate' ? 'Bounce Rate' : metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>
    );
  }
  