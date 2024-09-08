import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("analytics");

    const topSources = await db.collection("events")
      .aggregate([
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 } // Adjust this number as needed
      ])
      .toArray();

    // Process t.co links
    const processedSources = topSources.map(source => ({
      _id: source._id.includes('t.co') ? 'Twitter / X' : (source._id || 'Direct'),
      count: source.count
    }));

    return NextResponse.json({ topSources: processedSources });
  } catch (error) {
    console.error('Error fetching top sources:', error);
    return NextResponse.json({ error: 'Failed to fetch top sources' }, { status: 500 });
  }
}