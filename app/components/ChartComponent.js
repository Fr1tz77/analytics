// components/ChartComponent.js
import { Line, Bar } from 'react-chartjs-2';

export default function ChartComponent({ data, options, type = 'Line' }) {
  if (type === 'Bar') {
    return <Bar data={data} options={options} />;
  }
  return <Line data={data} options={options} />;
}
