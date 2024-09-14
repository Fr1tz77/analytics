import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import Twitter from 'twitter-lite';

const client = new Twitter({
  subdomain: "api",
  version: "2",
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

export async function GET(req) {
  try {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

    console.log(`Using date range: ${startDate} to ${endDate}`);
    console.log('Twitter API credentials:', {
      consumer_key: process.env.TWITTER_CONSUMER_KEY ? 'Set' : 'Not set',
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET ? 'Set' : 'Not set',
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY ? 'Set' : 'Not set',
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET ? 'Set' : 'Not set',
      user_id: process.env.TWITTER_USER_ID
    });

    const twitterData = await fetchTwitterAnalytics(startDate, endDate);

    console.log('Fetched Twitter data:', twitterData);

    if (twitterData.length === 0) {
      return NextResponse.json({ twitterAnalytics: [], message: 'No Twitter data found for the specified period' });
    }

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
    // Verify credentials
    const user = await client.get('users/me');
    console.log('Current user:', JSON.stringify(user, null, 2));

    // Fetch user's tweets
    const tweets = await client.get('tweets/search/recent', {
      query: `from:${process.env.TWITTER_USER_ID}`,
      start_time: startDate,
      end_time: endDate,
      max_results: 100,
      'tweet.fields': 'public_metrics,created_at'
    });

    console.log('Twitter API response:', JSON.stringify(tweets, null, 2));

    if (!tweets.data || tweets.data.length === 0) {
      console.log('No tweets found in the specified date range');
      return [];
    }

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
    console.error('Error fetching Twitter data:', JSON.stringify(error.errors || error, null, 2));
    if (error.errors) {
      error.errors.forEach(e => console.error(`Twitter API Error: ${e.code} - ${e.message}`));
    }
    throw error;
  }
}