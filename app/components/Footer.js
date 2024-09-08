import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Analytics Pro</h3>
            <p className="text-gray-400">Empowering businesses with actionable insights since 2023.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="#demo" className="text-gray-400 hover:text-white">Request Demo</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">API Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Case Studies</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Webinars</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; 2024 Analytics Pro. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Add social media icons here */}
          </div>
        </div>
      </div>
    </footer>
  );
}