import Image from 'next/image';

const testimonials = [
  {
    content: "Analytics Pro has transformed how we understand our users. The insights we've gained have directly contributed to a 40% increase in our conversion rates.",
    author: "Jane Doe",
    role: "CEO, TechStart Inc.",
    image: "/testimonial-1.jpg"
  },
  {
    content: "The real-time data and custom reports have become indispensable for our marketing team. We can now make data-driven decisions faster than ever.",
    author: "John Smith",
    role: "CMO, GrowthGenius",
    image: "/testimonial-2.jpg"
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          Trusted by Industry Leaders
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-blue-800 rounded-lg p-8 shadow-lg">
              <p className="text-lg mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <Image 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  width={48} 
                  height={48} 
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-blue-300">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}