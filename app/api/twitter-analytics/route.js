import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import axios from 'axios';

const API_BASE_URL = 'https://api.twitter.com/2'; // Replace with the actual base URL

async function getAccessToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/oauth2/token`, {
      grant_type: 'client_credentials',
    }, {
      auth: {
        username: process.env.TWITTER_CONSUMER_KEY,
        password: process.env.TWITTER_CONSUMER_SECRET,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function getBusinessUnits(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/business_units`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting business units:', error.response?.data || error.message);
    throw error;
  }
}

async function getEnterpriseReport(token, businessUnitId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/enterprise/latest_report`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { business_unit_id: businessUnitId },
    });
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

    // Step 2: Get business units
    const businessUnits = await getBusinessUnits(accessToken);
    console.log('Business units:', businessUnits);

    // Assuming we want the first business unit, adjust as needed
    const businessUnitId = businessUnits[0]?.id;

    if (!businessUnitId) {
      throw new Error('No business unit found');
    }

    // Step 3: Get enterprise report
    const report = await getEnterpriseReport(accessToken, businessUnitId);
    console.log('Enterprise report:', JSON.stringify(report, null, 2));

    // Process the report data as needed
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
  // Process the report data to extract relevant information
  // This function should be implemented based on the structure of the enterprise report
  // For now, we'll return a placeholder
  return [
    {
      id: 'placeholder',
      created_at: new Date().toISOString(),
      text: 'Placeholder tweet',
      impressions: 0,
      likes: 0,
      retweets: 0,
      replies: 0
    }
  ];
}