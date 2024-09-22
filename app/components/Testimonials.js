import Image from 'next/image';

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          What Our Customers Are Saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image src="/customer1.jpg" alt="Customer testimonial" width={150} height={150} className="rounded-full mx-auto mb-4" />
            <blockquote className="text-gray-700 italic">"Analytics Pro transformed our business. The real-time data is a game changer!"</blockquote>
            <p className="text-sm font-bold mt-4">— John Doe, CEO of Example Corp</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Image src="/customer2.jpg" alt="Customer testimonial" width={150} height={150} className="rounded-full mx-auto mb-4" />
            <blockquote className="text-gray-700 italic">"We&apos;ve seen a 30% increase in conversions thanks to Analytics Pro."</blockquote>
            <p className="text-sm font-bold mt-4">— Jane Smith, Marketing Director at Example Inc.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <video controls className="w-full h-auto rounded-lg shadow-lg" loading="lazy">
              <source src="/testimonial-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
