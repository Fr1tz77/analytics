import { useMemo } from 'react';
import AnalyticsChart from './path/to/AnalyticsChart'; // Ensure this is correct

export default function WidgetRenderer({
  widget,
  renderSection,
  analyticsData,
  comparisonData,
  selectedMetric,
  timeInterval,
  timeZone,
  loading,
  error
}) {
  // Check if renderSection is a function
  if (typeof renderSection !== 'function') {
    console.error('renderSection is not defined or is not a function');
  }

  // Validate widget object
  console.log('Widget:', widget);
  if (!widget || !widget.id) {
    console.error('Widget is missing or invalid:', widget);
    return null; // or some fallback UI
  }

  const calculateTrend = () => {
    const currentSum = Array.isArray(analyticsData.events)
        ? analyticsData.events.reduce((sum, item) => sum + item[selectedMetric], 0) || 0
        : 0;

    const previousSum = comparisonData && comparisonData.length > 0
        ? comparisonData.reduce((sum, item) => sum + item[selectedMetric], 0)
        : 0;

    if (previousSum === 0) {
      return currentSum > 0 ? 100 : 0;
    }

    const trend = ((currentSum - previousSum) / previousSum) * 100;
    return trend.toFixed(2);
  };

  const trend = useMemo(() => calculateTrend(), [analyticsData, comparisonData, selectedMetric]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  switch (widget.id) {
    case 'chart':
      return renderSection(widget.title, (
        <div className="w-full h-96 px-4">
          <AnalyticsChart
            analyticsData={analyticsData}
            comparisonData={comparisonData}
            selectedMetric={selectedMetric}
            timeInterval={timeInterval}
            timeZone={timeZone}
          />
          <div className="mt-1 text-center text-sm">
            <span className={`font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">compared to previous period</span>
          </div>
        </div>
      ));
    default:
      return <div className="text-center text-gray-600">Widget type not supported.</div>;
  }
}
