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

    console.log(`Received request for Twitter analytics from ${startDate} to ${endDate}`);

    // Fetch Twitter analytics data
    const twitterData = await fetchTwitterAnalytics(startDate, endDate);

    console.log('Fetched Twitter data:', twitterData);

    // Store the data in MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("analytics");
    const result = await db.collection("twitter_analytics").insertOne({
      date: new Date(),
      data: twitterData
    });

    console.log('Inserted Twitter data into MongoDB:', result);

    return NextResponse.json({ twitterAnalytics: twitterData });
  } catch (error) {
    console.error('Error in Twitter analytics GET route:', error);
    return NextResponse.json({ error: 'Failed to fetch Twitter analytics' }, { status: 500 });
  }
}

async function fetchTwitterAnalytics(startDate, endDate) {
  console.log(`Fetching Twitter analytics from ${startDate} to ${endDate}`);
  
  try {
    // Example: Fetching tweet metrics for a specific tweet
    const tweetId = '1234567890'; // Replace with your actual tweet ID
    console.log(`Fetching metrics for tweet ID: ${tweetId}`);
    
    const response = await client.get(`tweets/${tweetId}`, {
      "tweet.fields": "public_metrics"
    });
    
    console.log('Twitter API response:', response);

    return {
      impressions: response.data.public_metrics.impression_count,
      likes: response.data.public_metrics.like_count,
      retweets: response.data.public_metrics.retweet_count,
      replies: response.data.public_metrics.reply_count
    };
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
}