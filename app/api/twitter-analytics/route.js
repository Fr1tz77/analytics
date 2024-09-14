import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import axios from 'axios';

const API_BASE_URL = 'https://api.twitter.com/2'; // Make sure this is correct

async function getAccessToken() {
  try {
    console.log('Attempting to get access token...');
    const response = await axios.post(`${API_BASE_URL}/oauth2/token`, 
      'grant_type=client_credentials',
      {
        auth: {
          username: process.env.TWITTER_CONSUMER_KEY,
          password: process.env.TWITTER_CONSUMER_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Access token response:', response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function getBusinessUnits(token) {
  try {
    console.log('Attempting to get business units...');
    const response = await axios.get(`${API_BASE_URL}/users/${process.env.TWITTER_USER_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Business units response:', response.data);
    return [{ id: process.env.TWITTER_USER_ID }]; // Return user ID as business unit for now
  } catch (error) {
    console.error('Error getting business units:', error.response?.data || error.message);
    throw error;
  }
}

async function getEnterpriseReport(token, businessUnitId) {
  try {
    console.log('Attempting to get enterprise report...');
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const response = await axios.get(`${API_BASE_URL}/users/${businessUnitId}/tweets`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        'tweet.fields': 'public_metrics,created_at',
        'max_results': 100,
        'start_time': startDate,
        'end_time': endDate
      }
    });
    console.log('Enterprise report response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting enterprise report:', error.response?.data || error.message);
    throw error;
  }
}

export async function GET(req) {
  try {
    console.log('Fetching Twitter analytics...');

    // Step 1: Get access token
    const accessToken = await getAccessToken();
    console.log('Access token obtained');

    // Step 2: Get business units (user info in this case)
    const businessUnits = await getBusinessUnits(accessToken);
    console.log('Business units:', businessUnits);

    const businessUnitId = businessUnits[0]?.id;

    if (!businessUnitId) {
      throw new Error('No business unit found');
    }

    // Step 3: Get enterprise report (user tweets in this case)
    const report = await getEnterpriseReport(accessToken, businessUnitId);
    console.log('Enterprise report:', JSON.stringify(report, null, 2));

    // Process the report data
    const twitterData = processReportData(report);

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

function processReportData(report) {
  if (!report.data || report.data.length === 0) {
    console.log('No tweet data found in the report');
    return [];
  }

  return report.data.map(tweet => ({
    id: tweet.id,
    created_at: tweet.created_at,
    text: tweet.text,
    impressions: tweet.public_metrics.impression_count,
    likes: tweet.public_metrics.like_count,
    retweets: tweet.public_metrics.retweet_count,
    replies: tweet.public_metrics.reply_count
  }));
}