import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || 'https://appbars.co';

export async function POST(request) {
  console.log('Received event request');  // Debug log
  const eventData = await request.json();
  console.log('Event data:', eventData);  // Debug log
  
  try {
    const client = await clientPromise;
    const db = client.db("analytics");
    const result = await db.collection("events").insertOne({
      ...eventData,
      timestamp: new Date()
    });
    console.log('Event inserted:', result);  // Debug log
    
    return new NextResponse(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (e) {
    console.error('Error recording event:', e);
    return new NextResponse(JSON.stringify({ status: 'error', message: e.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}