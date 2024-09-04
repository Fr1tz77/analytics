import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// Remove the Edge runtime specification
// export const runtime = 'edge';

export async function GET(req) {
  console.log("GET request received");
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    console.log(`Fetching events from ${start} to ${end}`);

    const client = await clientPromise;
    const db = client.db("analytics");

    const events = await db.collection("events")
      .find({
        timestamp: { $gte: new Date(start), $lte: new Date(end) }
      })
      .limit(1000)  // Limit the number of results to prevent timeouts
      .toArray();

    console.log(`Found ${events.length} events`);

    return NextResponse.json(events || []);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(req) {
  console.log("POST request received");
  try {
    const client = await clientPromise;
    const db = client.db("analytics");

    const body = await req.json();
    console.log('Received event:', body);

    const result = await db.collection("events").insertOne({
      ...body,
      timestamp: new Date()
    });

    console.log('Inserted event with ID:', result.insertedId);

    return NextResponse.json({ message: 'Event recorded successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
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