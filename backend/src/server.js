import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  await connectDb();
  const server = createApp().listen(env.port, () => {
    console.log(`EcoTrace API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  let closing = false;
  const shutdown = (signal) => {
    if (closing) return;
    closing = true;
    console.log(`${signal} received, shutting down.`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // do not hang forever on open connections
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

main().catch((err) => {
  console.error(`Could not start the API: ${err.message}`);
  process.exit(1);
});
