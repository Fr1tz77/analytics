import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Unlock the Power of Your Website Analytics
          </h1>
          <p className="text-xl mb-8">
            Analytics Pro provides deep insights into your website's performance, helping you make data-driven decisions to grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="btn btn-primary transform hover:scale-105 transition duration-300">
              Start Free Trial
            </Link>
            <Link href="#demo" className="btn btn-secondary transform hover:scale-105 transition duration-300">
              Watch Demo
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2">
          <Image 
            src="/dashboard-preview.png" 
            alt="Analytics Pro Dashboard" 
            width={600} 
            height={400} 
            className="rounded-lg shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
