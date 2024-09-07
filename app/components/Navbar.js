'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">Analytics Pro</Link>
          </div>
          <div className="flex items-center">
            <Link href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">How it Works</Link>
            <Link href="#pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Pricing</Link>
            {!isLoading && (
              session ? (
                <Link href="/dashboard" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Dashboard</Link>
              ) : (
                <Link href="/auth/signin" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Login</Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}