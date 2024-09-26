// components/WidgetRenderer.js
export default function WidgetRenderer({ widget, renderSection, analyticsData, comparisonData, selectedMetric, timeInterval, timeZone, loading, error }) {
  const calculateTrend = () => {
    const currentSum = analyticsData.events?.reduce((sum, item) => sum + item[selectedMetric], 0) || 0;
    const previousSum = comparisonData.reduce((sum, item) => sum + item[selectedMetric], 0);
    if (previousSum === 0) {
      return currentSum > 0 ? 100 : 0;
    }
    const trend = ((currentSum - previousSum) / previousSum) * 100;
    return trend.toFixed(2);
  };

  const trend = calculateTrend();

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
    // Handle other widgets similarly...
    default:
      return null;
  }
}
