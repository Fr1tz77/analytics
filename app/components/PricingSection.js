import Link from 'next/link';

const plans = [
  {
    name: 'Get Started Free',
    price: '$0',
    features: [
      'Up to 1,000 clicks',
      '1 website',
      'Basic analytics',
    ],
    buttonText: 'Start Free',
    buttonLink: '/signup',
  },
  {
    name: 'Growth',
    price: '$29',
    features: [
      'Up to 10,000 clicks',
      '3 websites',
      'Advanced analytics',
      'Priority support',
    ],
    buttonText: 'Choose Growth',
    buttonLink: '/signup?plan=growth',
  },
  {
    name: 'Pro',
    price: '$79',
    features: [
      'Unlimited clicks',
      '10 websites',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
    buttonText: 'Choose Pro',
    buttonLink: '/signup?plan=pro',
  },
];

export default function PricingSection() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal">/month</span></p>
              <ul className="mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.buttonLink} className="block w-full bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600 transition duration-300">
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">Need a custom solution?</h3>
          <Link href="/contact" className="inline-block bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-900 transition duration-300">
            Contact Sales for Enterprise
          </Link>
        </div>
      </div>
    </section>
  );
}