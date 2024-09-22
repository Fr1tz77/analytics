import dynamic from 'next/dynamic';
import Head from 'next/head';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
const Testimonials = dynamic(() => import('./components/Testimonials'), { ssr: false });
const FAQ = dynamic(() => import('./components/FAQ'), { ssr: false });
import CTA from './components/CTA';
import Footer from './components/Footer';
const PricingSection = dynamic(() => import('./components/PricingSection'), { ssr: false });

export default function Home() {
  return (
    <main>
      <Head>
        <title>Analytics Pro | Website Analytics SaaS</title>
        <meta name="description" content="Get deep insights into your website's performance and boost your business with Analytics Pro. Try it free today!" />
        <meta property="og:title" content="Analytics Pro - Website Analytics SaaS" />
        <meta property="og:description" content="Get deep insights into your website's performance." />
        <meta property="og:image" content="/social-preview.png" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <div className="fixed bottom-4 right-4">
        <a href="/signup" className="btn btn-primary">Start Free Trial</a>
      </div>
    </main>
  );
}
