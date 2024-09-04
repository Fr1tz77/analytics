import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(req) {
  console.log("GET request received");
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const metric = searchParams.get('metric') || 'pageviews'

    console.log(`Fetching ${metric} from ${start} to ${end}`);

    const client = await clientPromise
    const db = client.db("analytics")

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: new Date(start), $lte: new Date(end) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          pageviews: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$userAgent" },
          totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
        }
      },
      {
        $project: {
          date: "$_id",
          pageviews: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          avgDuration: { $cond: [{ $eq: ["$pageviews", 0] }, 0, { $divide: ["$totalDuration", "$pageviews"] }] },
          bounceRate: 0 // We don't have enough info to calculate this accurately
        }
      },
      { $sort: { date: 1 } }
    ];

    const events = await db.collection("events").aggregate(pipeline).toArray();

    // Additional queries for top sources, pages, countries, and browsers
    const topSources = await db.collection("events").aggregate([
      { $match: { timestamp: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: { $ifNull: ["$referrer", "Direct"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const topPages = await db.collection("events").aggregate([
      { $match: { timestamp: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const countries = await db.collection("events").aggregate([
      { $match: { timestamp: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const browsers = await db.collection("events").aggregate([
      { $match: { timestamp: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    console.log(`Found ${events.length} data points`);
    console.log('Top Sources:', topSources);
    console.log('Top Pages:', topPages);
    console.log('Countries:', countries);
    console.log('Browsers:', browsers);

    return NextResponse.json({ events, topSources, topPages, countries, browsers })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(req) {
  console.log("POST request received");
  try {
    const client = await clientPromise
    const db = client.db("analytics")

    const body = await req.json()
    console.log('Received event:', body)

    // Extract browser and country from user agent
    const ua = new UAParser(body.userAgent);
    body.browser = ua.getBrowser().name;
    body.country = body.country || 'Unknown'; // You might want to use a geolocation service here

    const result = await db.collection("events").insertOne(body)

    console.log('Inserted event with ID:', result.insertedId);

    return NextResponse.json({ message: 'Event recorded successfully', id: result.insertedId })
  } catch (error) {
    console.error('Error recording event:', error)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}