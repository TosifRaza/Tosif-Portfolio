import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Pick a MongoDB version that has binaries for modern Debian (>=7.0.3)
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '8.0.4';

let memoryServer = null;

/**
 * Connect to MongoDB.
 * - If MONGO_URI is set, connect to that real instance.
 * - Otherwise, spin up an in-memory MongoDB (great for dev / preview).
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  try {
    if (uri && uri.length > 0) {
      console.log('[db] Connecting to external MongoDB…');
      await mongoose.connect(uri, { autoIndex: true });
    } else {
      console.log('[db] No MONGO_URI set — starting in-memory MongoDB…');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[db] In-memory MongoDB ready at ${memoryUri}`);
    }

    console.log('[db] ✓ MongoDB connected');
    mongoose.connection.on('error', (err) =>
      console.error('[db] MongoDB error:', err)
    );
    mongoose.connection.on('disconnected', () =>
      console.warn('[db] MongoDB disconnected')
    );
  } catch (err) {
    console.error('[db] Failed to connect:', err);
    process.exit(1);
  }
}

export async function closeDB() {
  if (memoryServer) {
    await mongoose.connection.close();
    await memoryServer.stop();
    console.log('[db] In-memory MongoDB stopped');
  }
}
