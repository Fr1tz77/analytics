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
    console.error('Error in Twitter analytics GET route:', error.errors || error);
    return NextResponse.json({ error: 'Failed to fetch Twitter analytics', details: error.errors || error.message }, { status: 500 });
  }
}

async function fetchTwitterAnalytics(startDate, endDate) {
  console.log(`Fetching Twitter analytics from ${startDate} to ${endDate}`);
  
  try {
    // Fetch user's tweets within the date range
    const tweets = await client.get('tweets/search/recent', {
      query: 'from:your_twitter_username',
      start_time: new Date(startDate).toISOString(),
      end_time: new Date(endDate).toISOString(),
      max_results: 100,
      'tweet.fields': 'public_metrics,created_at'
    });

    console.log('Twitter API response:', tweets);

    if (!tweets.data || tweets.data.length === 0) {
      console.log('No tweets found in the specified date range');
      return [];
    }

    // Process and return the analytics data for each tweet
    return tweets.data.map(tweet => ({
      id: tweet.id,
      created_at: tweet.created_at,
      text: tweet.text,
      impressions: tweet.public_metrics.impression_count,
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      replies: tweet.public_metrics.reply_count
    }));
  } catch (error) {
    console.error('Error fetching Twitter data:', error.errors || error);
    throw error;
  }
}