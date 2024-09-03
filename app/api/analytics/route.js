import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const start = new Date(searchParams.get('start'));
  const end = new Date(searchParams.get('end'));

  try {
    const client = await clientPromise;
    const db = client.db("analytics");
    
    const pageviews = await db.collection("events")
      .aggregate([
        { $match: { name: 'pageview', timestamp: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
      .toArray();

    // Similar aggregations for sources, topPages, locations, and devices...

    return NextResponse.json({
      pageviews: pageviews.map(pv => ({ date: pv._id, count: pv.count })),
      // Add other aggregated data here...
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 });
  }
}