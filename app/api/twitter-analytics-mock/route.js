import { NextResponse } from 'next/server';

export async function GET(req) {
  console.log('Fetching mock Twitter analytics...');

  const mockTwitterData = [
    {
      id: '1234567890',
      created_at: '2023-09-14T10:00:00Z',
      text: 'This is a test tweet #1',
      impressions: 1000,
      likes: 50,
      retweets: 10,
      replies: 5
    },
    {
      id: '1234567891',
      created_at: '2023-09-13T15:30:00Z',
      text: 'Another test tweet #2',
      impressions: 1500,
      likes: 75,
      retweets: 20,
      replies: 8
    },
    {
      id: '1234567892',
      created_at: '2023-09-12T09:15:00Z',
      text: 'Yet another test tweet #3',
      impressions: 2000,
      likes: 100,
      retweets: 30,
      replies: 15
    }
  ];

  console.log('Mock Twitter data:', JSON.stringify(mockTwitterData, null, 2));

  return NextResponse.json({ twitterAnalytics: mockTwitterData });
}