import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import Twitter from 'twitter-lite';

const client = new Twitter({
  subdomain: "api", // "api" is the default (change for other subdomains)
  version: "2", // version "1.1" is the default (change for other subdomains)
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Fetch Twitter analytics data
    const twitterData = await fetchTwitterAnalytics(startDate, endDate);

    // Store the data in MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("analytics");
    await db.collection("twitter_analytics").insertOne({
      date: new Date(),
      data: twitterData
    });

    return NextResponse.json({ twitterAnalytics: twitterData });
  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch Twitter analytics' }, { status: 500 });
  }
}

async function fetchTwitterAnalytics(startDate, endDate) {
  // This is a placeholder function. You'll need to implement the actual API calls based on the Twitter API documentation.
  // The exact endpoints and parameters will depend on what data you want to fetch.
  
  // Example: Fetching tweet metrics for a specific tweet
  const tweetId = '1234567890'; // Replace with your actual tweet ID
  const response = await client.get(`tweets/${tweetId}`, {
    "tweet.fields": "public_metrics"
  });

  return {
    impressions: response.data.public_metrics.impression_count,
    likes: response.data.public_metrics.like_count,
    retweets: response.data.public_metrics.retweet_count,
    replies: response.data.public_metrics.reply_count
  };
}