import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const faqs = [
  {
    question: "What makes Analytics Pro different from other analytics tools?",
    answer: "Analytics Pro offers real-time data processing, advanced custom reporting, and intuitive visualizations that make it easy to understand your website's performance at a glance. Our focus on user-friendly interfaces and actionable insights sets us apart from traditional analytics tools."
  },
  {
    question: "Is my data secure with Analytics Pro?",
    answer: "Absolutely. We use industry-standard encryption and security practices to protect your data. Our servers are hosted in secure, SOC 2 compliant data centers, and we never share your data with third parties. We also offer data anonymization options for enhanced privacy."
  },
  {
    question: "Can I try Analytics Pro before committing to a paid plan?",
    answer: "Yes! We offer a 14-day free trial on all our plans. You can explore all features and decide which plan best fits your needs without any commitment. No credit card is required to start your trial."
  },
  {
    question: "How does Analytics Pro handle high-traffic websites?",
    answer: "Our infrastructure is built to scale. Whether you have 100 or 10 million daily visitors, Analytics Pro can handle it with ease. We use distributed systems and efficient data processing techniques to ensure fast performance even with high traffic volumes."
  },
  {
    question: "Does Analytics Pro offer integration with other tools?",
    answer: "Yes, we offer integrations with a wide range of popular marketing and business tools, including CRM systems, email marketing platforms, and e-commerce solutions. We also provide a robust API for custom integrations."
  }
];

export default function FAQ() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                    <span>{faq.question}</span>
                    <ChevronDownIcon
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-blue-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-600">
                    {faq.answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}