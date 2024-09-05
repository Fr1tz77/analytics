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

    const startDate = new Date(start);
    const endDate = new Date(end);

    console.log('Start date:', startDate);
    console.log('End date:', endDate);

    // Fetch all events within the date range
    const allEvents = await db.collection("events").find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).toArray();

    console.log(`Found ${allEvents.length} total events`);

    // Process events
    const processedEvents = allEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, pageviews: 0, uniqueVisitors: new Set(), totalDuration: 0 };
      }
      acc[date].pageviews++;
      acc[date].uniqueVisitors.add(event.userAgent);
      acc[date].totalDuration += event.duration || 0;
      return acc;
    }, {});

    const events = Object.values(processedEvents).map(event => ({
      date: event.date,
      pageviews: event.pageviews,
      uniqueVisitors: event.uniqueVisitors.size,
      avgDuration: event.pageviews > 0 ? event.totalDuration / event.pageviews : 0,
      bounceRate: 0 // We don't have enough info to calculate this accurately
    }));

    console.log('Processed events:', events);

    // Process top sources
    const topSources = allEvents.reduce((acc, event) => {
      const source = event.referrer || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const topSourcesArray = Object.entries(topSources)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process top pages
    const topPages = allEvents.reduce((acc, event) => {
      acc[event.path] = (acc[event.path] || 0) + 1;
      return acc;
    }, {});

    const topPagesArray = Object.entries(topPages)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process countries
    const countries = allEvents.reduce((acc, event) => {
      acc[event.country] = (acc[event.country] || 0) + 1;
      return acc;
    }, {});

    const countriesArray = Object.entries(countries)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    // Process browsers
    const browsers = allEvents.reduce((acc, event) => {
      acc[event.browser] = (acc[event.browser] || 0) + 1;
      return acc;
    }, {});

    const browsersArray = Object.entries(browsers)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log('Top Sources:', topSourcesArray);
    console.log('Top Pages:', topPagesArray);
    console.log('Countries:', countriesArray);
    console.log('Browsers:', browsersArray);

    return NextResponse.json({ 
      events, 
      topSources: topSourcesArray, 
      topPages: topPagesArray, 
      countries: countriesArray, 
      browsers: browsersArray 
    })
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