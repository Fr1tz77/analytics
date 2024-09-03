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
    
    return NextResponse.json({ status: 'ok' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 });
  }
}