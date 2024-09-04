import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const client = await clientPromise;
    const db = client.db("analytics_db");

    const events = await db.collection("events").find({
      timestamp: { $gte: new Date(start), $lte: new Date(end) }
    }).toArray();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("analytics_db");

    const body = await req.json();
    console.log('Received event:', body);

    await db.collection("events").insertOne({
      ...body,
      timestamp: new Date()
    });

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}