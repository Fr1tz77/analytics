import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import needle from 'needle';

const API_BASE_URL = 'https://api.twitter.com/2';
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_USERNAME = process.env.TWITTER_USERNAME || 'echo_zenith';

async function getUserInfo(username) {
  try {
    console.log(`Attempting to get user info for username ${username}...`);
    const url = `${API_BASE_URL}/users/by/username/${username}`;
    const response = await needle('get', url, null, {
      headers: { 'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}` }
    });
    
    if (response.statusCode !== 200) {
      console.error('Error response from Twitter API:', response.body);
      return null;
    }
    return response.body.data;
  } catch (error) {
    console.error('Error getting user info:', error.message);
    throw error;
  }
}

async function getUserTweets(userId) {
  try {
    console.log(`Attempting to get tweets for user ID ${userId}...`);
    const url = `${API_BASE_URL}/users/${userId}/tweets`;
    const params = {
      'max_results': 100,
      'tweet.fields': 'created_at,public_metrics'
    };
    const response = await needle('get', url, params, {
      headers: { 'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}` }
    });
    
    if (response.statusCode !== 200) {
      console.error('Error response from Twitter API:', response.body);
      return null;
    }
    return response.body.data;
  } catch (error) {
    console.error('Error getting tweets:', error.message);
    throw error;
  }
}

export async function GET(req) {
  try {
    console.log('Fetching Twitter analytics...');

    const userInfo = await getUserInfo(TWITTER_USERNAME);
    if (!userInfo) {
      throw new Error('Unable to retrieve user info');
    }

    const tweets = await getUserTweets(userInfo.id);
    if (!tweets) {
      throw new Error('Unable to retrieve tweets');
    }

    const twitterData = tweets.map(tweet => ({
      id: tweet.id,
      created_at: tweet.created_at,
      likes: tweet.public_metrics.like_count
    }));

    // Store in MongoDB
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
    return NextResponse.json({ error: 'Failed to fetch Twitter analytics', details: error.message || 'Unknown error' }, { status: 500 });
  }
}