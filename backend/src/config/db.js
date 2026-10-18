import mongoose from 'mongoose';
import { env } from './env.js';
import { initModels } from '../models/index.js';

function databaseName(uri) {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/);
  return match ? match[1] : '';
}

export async function connectDb() {
  if (!env.mongoUri) {
    throw new Error(
      env.isTest
        ? 'MONGODB_URI_TEST is not set. Copy backend/.env.example to backend/.env and fill it in.'
        : 'MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.',
    );
  }
  // Safety net: tests delete data, so they may only run against a database named "*_test".
  if (env.isTest && !databaseName(env.mongoUri).endsWith('_test')) {
    throw new Error('Refusing to run tests: the MONGODB_URI_TEST database name must end in "_test".');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await initModels(); // make sure unique indexes exist before the first write
  if (!env.isTest) console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
