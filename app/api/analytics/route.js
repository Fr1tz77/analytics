import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(req) {
  console.log("GET request received");
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const metric = searchParams.get('metric') || 'pageviews'
    const interval = searchParams.get('interval') || 'day'

    console.log(`Fetching ${metric} from ${start} to ${end} with interval ${interval}`);

    const client = await clientPromise
    const db = client.db("analytics")

    console.log("Connected to database:", db.databaseName);

    const startDate = new Date(start);
    const endDate = new Date(end);

    console.log('Start date:', startDate);
    console.log('End date:', endDate);

    const totalDocs = await db.collection("events").countDocuments();
    console.log("Total documents in collection:", totalDocs);

    // Fetch all events
    const allEvents = await db.collection("events").find().toArray();

    console.log(`Found ${allEvents.length} total events`);

    // Filter events within the date range
    const filteredEvents = allEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });

    console.log(`Found ${filteredEvents.length} events in date range`);

    if (filteredEvents.length > 0) {
      console.log("Sample event:", filteredEvents[0]);
    }

    // Process events
    const processedEvents = filteredEvents.reduce((acc, event) => {
      const date = interval === 'hour'
        ? new Date(event.timestamp).toISOString().slice(0, 13) // YYYY-MM-DDTHH
        : new Date(event.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = { date, pageviews: 0, uniqueVisitors: new Set(), totalDuration: 0, bounces: 0 };
      }
      acc[date].pageviews++;
      acc[date].uniqueVisitors.add(event.userAgent);
      acc[date].totalDuration += event.duration || 0;
      if (event.duration === 0) {
        acc[date].bounces++;
      }
      return acc;
    }, {});

    const events = Object.values(processedEvents).map(event => ({
      date: event.date,
      pageviews: event.pageviews,
      uniqueVisitors: event.uniqueVisitors.size,
      avgDuration: event.pageviews > 0 ? event.totalDuration / event.pageviews : 0, // Keep in milliseconds
      bounceRate: event.pageviews > 0 ? (event.bounces / event.pageviews * 100).toFixed(2) : 0 // Calculate bounce rate as percentage
    }));

    console.log('Processed events:', events);

    // Process top sources, pages, countries, and browsers
    const topSources = processTopData(filteredEvents, 'referrer', 'Direct');
    const topPages = processTopData(filteredEvents, 'path');
    const countries = processTopData(filteredEvents, 'country');
    const browsers = processTopData(filteredEvents, 'browser');

    console.log('Top Sources:', topSources);
    console.log('Top Pages:', topPages);
    console.log('Countries:', countries);
    console.log('Browsers:', browsers);

    return NextResponse.json({ 
      events, 
      topSources, 
      topPages, 
      countries, 
      browsers 
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function processTopData(events, field, defaultValue = 'Unknown') {
  const data = events.reduce((acc, event) => {
    const value = event[field] || defaultValue;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(data)
    .map(([_id, count]) => ({ _id, count }))
    .sort((a, b) => b.count - a.count);
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