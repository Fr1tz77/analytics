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

    const startDate = moment.tz(start, timeZone).toDate();
    const endDate = moment.tz(end, timeZone).toDate();

    console.log(`Start date: ${startDate}, End date: ${endDate}`);

    // Check if there are any events in the database
    const totalEvents = await db.collection("events").countDocuments();
    console.log(`Total events in database: ${totalEvents}`);

    // Fetch all events without date filtering for debugging
    const allEvents = await db.collection("events").find({}).toArray();
    console.log(`Total fetched events: ${allEvents.length}`);
    if (allEvents.length > 0) {
      console.log('Sample event:', allEvents[0]);
    }

    // Now apply the date filter
    const filteredEvents = allEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });

    console.log(`Filtered events: ${filteredEvents.length}`);

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
      avgDuration: event.pageviews > 0 ? event.totalDuration / event.pageviews : 0,
      bounceRate: event.pageviews > 0 ? (event.bounces / event.pageviews * 100) : 0
    }));

    // Process top sources, pages, countries, and browsers
    const topSources = processTopData(filteredEvents, 'referrer', 'Direct', metric);
    const topPages = processTopData(filteredEvents, 'path', undefined, metric);
    const countries = processTopData(filteredEvents, 'country', undefined, metric);
    const browsers = processTopData(filteredEvents, 'browser', undefined, metric);

    // Add cohort analysis
    const cohortData = await getCohortData(db, startDate, endDate);

    // Add funnel analysis
    const funnelSteps = ['homepage', 'product', 'cart', 'checkout', 'purchase'];
    const funnelData = await getFunnelData(db, funnelSteps, startDate, endDate);

    // Fetch Twitter analytics data
    console.log('Fetching Twitter analytics data');
    const twitterAnalytics = await db.collection("twitter_analytics")
      .find({
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: 1 })
      .toArray();

    console.log('Fetched Twitter analytics:', twitterAnalytics);

    const result = { 
      events, 
      topSources, 
      topPages, 
      countries, 
      browsers,
      cohortData,
      funnelData,
      twitterAnalytics // Add this line
    };

    console.log('Sending response:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function processTopData(events, field, defaultValue = 'Unknown', metric) {
  const data = events.reduce((acc, event) => {
    let value = event[field] || defaultValue;
    
    if (field === 'referrer' && value.includes('t.co')) {
      value = 'Twitter / X';
    }
    
    if (!acc[value]) {
      acc[value] = { pageviews: 0, uniqueVisitors: new Set() };
    }
    acc[value].pageviews++;
    acc[value].uniqueVisitors.add(event.userAgent);
    return acc;
  }, {});

  return Object.entries(data)
    .map(([_id, counts]) => ({ 
      _id, 
      count: metric === 'uniqueVisitors' ? counts.uniqueVisitors.size : counts.pageviews 
    }))
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