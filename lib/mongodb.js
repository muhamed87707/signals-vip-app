import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

const options = {};

let client;
let clientPromise;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not defined - using mock data');
  // Create a mock client promise that resolves to a mock client
  clientPromise = Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: async () => null,
        find: () => ({ sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
        insertOne: async () => ({ insertedId: 'mock' }),
        updateOne: async () => ({ modifiedCount: 1 }),
        deleteMany: async () => ({ deletedCount: 0 }),
        countDocuments: async () => 0,
      }),
    }),
  });
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;