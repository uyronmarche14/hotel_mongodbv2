require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  // Get the original URI from .env
  const originalUri = process.env.MONGO_URI;
  
  if (!originalUri) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
  }

  // Modify the URI to use the secure transport option (HTTPS/443)
  const proxyUri = originalUri.replace('mongodb+srv://', 'mongodb+srv://') + '&proxyHost=proxy.mongodb.net&proxyPort=443&proxyUsername=username&proxyPassword=password';

  console.log('Testing MongoDB connection with proxy...');
  console.log('Using URI pattern:', 
    proxyUri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://USERNAME:PASSWORD@'));

  const client = new MongoClient(proxyUri, {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout for proxy connection
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