const steps = [
  { number: '01', title: 'Sign Up', description: 'Create your account in minutes. No credit card required.' },
  { number: '02', title: 'Install Tracking', description: 'Add our simple tracking code to your website with one click.' },
  { number: '03', title: 'Analyze Data', description: 'Start receiving real-time data and insights immediately.' },
  { number: '04', title: 'Optimize', description: 'Use our actionable insights to improve your website and grow your business.' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          How Analytics Pro Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}