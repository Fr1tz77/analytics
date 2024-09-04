import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("your_database_name");

    const body = await req.json();
    console.log('Received request:', req.method, req.url);
    console.log('Request body:', body);

    // Insert the event into MongoDB
    await db.collection("analytics_events").insertOne(body);

    return NextResponse.json({ message: 'Event recorded successfully' });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}