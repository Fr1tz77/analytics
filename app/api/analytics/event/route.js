import { NextResponse } from 'next/server';

export async function POST(request) {
  const eventData = await request.json();
  
  // Here, you would typically save this data to your database
  // For now, we'll just log it
  console.log('Received event:', eventData);

  // You might want to implement rate limiting, data validation, etc. here

  return NextResponse.json({ status: 'ok' });
}