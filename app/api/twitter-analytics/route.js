import { NextResponse } from 'next/server';

export async function GET(req) {
  console.log('Fetching mock Twitter analytics...');

  const mockTwitterData = [
    {
      id: '1234567890',
      created_at: '2023-09-14T10:00:00Z',
      likes: 50
    },
    {
      id: '1234567891',
      created_at: '2023-09-13T15:30:00Z',
      likes: 75
    },
    {
      id: '1234567892',
      created_at: '2023-09-12T09:15:00Z',
      likes: 100
    }
  ];

  console.log('Mock Twitter data:', JSON.stringify(mockTwitterData, null, 2));

  return NextResponse.json({ twitterAnalytics: mockTwitterData });
}