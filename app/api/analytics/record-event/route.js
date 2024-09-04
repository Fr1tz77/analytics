import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  const eventData = await request.json();
  
  try {
    const client = await clientPromise;
    const db = client.db("analytics");
    await db.collection("events").insertOne({
      ...eventData,
      timestamp: new Date()
    });
    
    return new NextResponse(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://appbars.co',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ status: 'error', message: e.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://appbars.co',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://appbars.co',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}