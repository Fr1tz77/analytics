import { BoltIcon, ChartBarIcon, GlobeAltIcon, ScaleIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Real-time Analytics',
    description: 'Get instant insights with our real-time data processing. Make quick decisions based on up-to-the-minute information.',
    icon: BoltIcon,
  },
  {
    name: 'Advanced Reporting',
    description: 'Create custom reports tailored to your needs. Visualize your data with our powerful reporting tools.',
    icon: ChartBarIcon,
  },
  {
    name: 'Global Insights',
    description: 'Understand your audience from around the world with our detailed geographical data analysis.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Scalable Solution',
    description: 'Whether you have 100 or 1 million daily visitors, our platform scales to meet your needs.',
    icon: ScaleIcon,
  },
];

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Powerful Features to Boost Your Analytics
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition duration-300">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <p className="text-sm text-blue-500 mt-2">Why this matters: Drive faster decision making with real-time data.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
