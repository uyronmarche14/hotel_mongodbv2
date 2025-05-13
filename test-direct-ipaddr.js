require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  // Get the original URI from .env
  const originalUri = process.env.MONGO_URI;
  
  if (!originalUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  // Extract credentials from the original URI
  const uriMatch = originalUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@.*/);
  if (!uriMatch) {
    console.error('Could not parse username and password from URI');
    process.exit(1);
  }

  const username = uriMatch[1];
  const password = uriMatch[2];
  
  // Use the direct IP address we discovered earlier
  const directUri = `mongodb://${username}:${password}@159.143.173.11:27017/?authSource=admin&retryWrites=true&w=majority`;

  console.log('Testing MongoDB connection with direct IP...');
  console.log('Using URI pattern:', 
    directUri.replace(/mongodb:\/\/[^:]+:[^@]+@/, 'mongodb://USERNAME:PASSWORD@'));

  const client = new MongoClient(directUri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  });

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // List databases to verify connection
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('MongoDB server ping result:', result);
    
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error); 