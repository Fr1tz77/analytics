import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import moment from 'moment-timezone';

export async function GET(req) {
  console.log("GET request received");
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const metric = searchParams.get('metric') || 'pageviews'
    const interval = searchParams.get('interval') || 'day'
    const timeZone = searchParams.get('timeZone') || 'UTC'

    console.log(`Fetching ${metric} from ${start} to ${end} with interval ${interval} in time zone ${timeZone}`);

    const client = await clientPromise
    const db = client.db("analytics")

    console.log("Connected to database:", db.databaseName);

    const startDate = moment.tz(start, timeZone).toDate();
    const endDate = moment.tz(end, timeZone).toDate();

    console.log('Start date:', startDate);
    console.log('End date:', endDate);

    const totalDocs = await db.collection("events").countDocuments();
    console.log("Total documents in collection:", totalDocs);

    // Fetch all events
    const allEvents = await db.collection("events").find().toArray();

    console.log(`Found ${allEvents.length} total events`);

    // Filter out localhost and development environments
    const filteredEvents = allEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate && !event.url.includes('localhost') && !event.url.includes('.local');
    });

    console.log(`Found ${filteredEvents.length} events in date range`);

    if (filteredEvents.length > 0) {
      console.log("Sample event:", filteredEvents[0]);
    }

    // Process events
    const processedEvents = filteredEvents.reduce((acc, event) => {
      let date;
      const eventMoment = moment.tz(event.timestamp, timeZone);
      switch (interval) {
        case 'hour':
          date = eventMoment.format('YYYY-MM-DDTHH');
          break;
        case '3hour':
          date = eventMoment.startOf('hour').subtract(eventMoment.hour() % 3, 'hours').format('YYYY-MM-DDTHH');
          break;
        case '12hour':
          date = eventMoment.startOf('hour').subtract(eventMoment.hour() % 12, 'hours').format('YYYY-MM-DDTHH');
          break;
        case 'week':
          date = eventMoment.startOf('week').format('YYYY-MM-DD');
          break;
        default: // 'day'
          date = eventMoment.format('YYYY-MM-DD');
      }
      if (!acc[date]) {
        acc[date] = { date, pageviews: 0, uniqueVisitors: new Set(), totalDuration: 0, bounces: 0 };
      }
      acc[date].pageviews++;
      acc[date].uniqueVisitors.add(event.userAgent);
      acc[date].totalDuration += event.duration || 0;
      if (event.duration === 0) {
        acc[date].bounces++;
      }
      return acc;
    }, {});

    const events = Object.values(processedEvents).map(event => ({
      date: event.date,
      pageviews: event.pageviews,
      uniqueVisitors: event.uniqueVisitors.size,
      avgDuration: event.pageviews > 0 ? event.totalDuration / event.pageviews : 0, // Keep in milliseconds
      bounceRate: event.pageviews > 0 ? (event.bounces / event.pageviews * 100) : 0 // Calculate bounce rate as percentage, don't round here
    }));

    console.log('Processed events:', events);

    // Process top sources, pages, countries, and browsers
    const topSources = processTopData(filteredEvents, 'referrer', 'Direct');
    const topPages = processTopData(filteredEvents, 'path');
    const countries = processTopData(filteredEvents, 'country');
    const browsers = processTopData(filteredEvents, 'browser');

    console.log('Top Sources:', topSources);
    console.log('Top Pages:', topPages);
    console.log('Countries:', countries);
    console.log('Browsers:', browsers);

    // Add cohort analysis
    const cohortData = await getCohortData(db, startDate, endDate);

    // Add funnel analysis
    const funnelSteps = ['homepage', 'product', 'cart', 'checkout', 'purchase'];
    const funnelData = await getFunnelData(db, funnelSteps, startDate, endDate);

    return NextResponse.json({ 
      events, 
      topSources, 
      topPages, 
      countries, 
      browsers,
      cohortData,
      funnelData
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function processTopData(events, field, defaultValue = 'Unknown') {
  const data = events.reduce((acc, event) => {
    let value = event[field] || defaultValue;
    
    // Process t.co links
    if (field === 'referrer' && value.includes('t.co')) {
      value = 'Twitter / X';
    }
    
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(data)
    .map(([_id, count]) => ({ _id, count }))
    .sort((a, b) => b.count - a.count);
}

async function getCohortData(db, startDate, endDate) {
  const pipeline = [
    { $match: { timestamp: { $gte: startDate, $lte: endDate }, type: 'pageview' } },
    { $group: {
      _id: {
        cohort: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        user: "$userAgent"
      },
      firstVisit: { $min: "$timestamp" }
    }},
    { $group: {
      _id: "$_id.cohort",
      users: { $addToSet: "$_id.user" },
      retentionData: { 
        $push: { 
          user: "$_id.user", 
          days: { $divide: [{ $subtract: ["$firstVisit", { $dateFromString: { dateString: "$_id.cohort" } } ] }, 86400000] }
        }
      }
    }},
    { $project: {
      cohort: "$_id",
      totalUsers: { $size: "$users" },
      retentionData: {
        $map: {
          input: { $range: [0, 30] },
          as: "day",
          in: {
            day: "$$day",
            users: {
              $size: {
                $filter: {
                  input: "$retentionData",
                  cond: { $lte: ["$$this.days", "$$day"] }
                }
              }
            }
          }
        }
      }
    }},
    { $sort: { cohort: 1 } }
  ];

  return await db.collection("events").aggregate(pipeline).toArray();
}

async function getFunnelData(db, steps, startDate, endDate) {
  const pipeline = steps.map((step, index) => ({
    $group: {
      _id: null,
      [`${step}Count`]: {
        $sum: {
          $cond: [
            { $and: [
              { $eq: ["$type", "pageview"] },
              { $eq: ["$path", `/${step}`] },
              { $gte: ["$timestamp", startDate] },
              { $lte: ["$timestamp", endDate] }
            ]},
            1,
            0
          ]
        }
      }
    }
  }));

  const result = await db.collection("events").aggregate(pipeline).toArray();
  return steps.reduce((acc, step, index) => {
    acc[step] = result[0][`${step}Count`];
    return acc;
  }, {});
}

export async function POST(req) {
  console.log("POST request received");
  try {
    const client = await clientPromise
    const db = client.db("analytics")

    const body = await req.json()
    console.log('Received event:', body)

    const result = await db.collection("events").insertOne(body)

    console.log('Inserted event with ID:', result.insertedId);

    return NextResponse.json({ message: 'Event recorded successfully', id: result.insertedId })
  } catch (error) {
    console.error('Error recording event:', error)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}