import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold mb-4">
          Ready to Supercharge Your Website Analytics?
        </h2>
        <p className="text-xl mb-8">
          Join thousands of businesses that trust Analytics Pro for their data-driven decision making.
        </p>
        <Link href="/signup" className="btn btn-white">
          Start Your Free Trial
        </Link>
      </div>
    </section>
  );
}