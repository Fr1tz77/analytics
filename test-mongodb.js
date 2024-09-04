const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set in .env.local file");
  process.exit(1);
}

console.log("Attempting to connect to MongoDB...");

async function run() {
  const client = new MongoClient(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 second timeout
  });

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const database = client.db("analytics");
    const collection = database.collection("events");

    // Perform a simple operation (e.g., count documents)
    const count = await collection.countDocuments();
    console.log(`Number of documents in the 'events' collection: ${count}`);

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await client.close();
    console.log("Closed MongoDB connection");
  }
}

run().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});