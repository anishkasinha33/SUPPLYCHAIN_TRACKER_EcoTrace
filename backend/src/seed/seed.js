// Usage: npm run seed            (development: also creates the demo account)
//        npm run seed -- --demo-user   (force the demo account, e.g. in production)
import { connectDb, disconnectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { seedDemoUser, seedReferenceData } from './seedData.js';

if (env.isTest) {
  console.error('Do not run the seed script with NODE_ENV=test.');
  process.exit(1);
}

try {
  await connectDb();
  const counts = await seedReferenceData();
  console.log('Seeded reference data:', counts);
  if (!env.isProd || process.argv.includes('--demo-user')) {
    console.log((await seedDemoUser()) ? 'Created the demo account (demo@koraandkin.example).' : 'Demo account already exists, left unchanged.');
  } else {
    console.log('Production mode: demo account not created (add --demo-user to create it).');
  }
} catch (err) {
  console.error(`Seeding failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
