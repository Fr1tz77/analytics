'use client';

import { useState, useEffect } from 'react';

export default function TopSources() {
  const [topSources, setTopSources] = useState([]);

  useEffect(() => {
    async function fetchTopSources() {
      const response = await fetch('/api/top-sources');
      const data = await response.json();
      setTopSources(data.topSources);
    }
    fetchTopSources();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Our Top Traffic Sources</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topSources.map((source, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{source._id}</h3>
              <p className="text-gray-600">{source.count} visits</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}