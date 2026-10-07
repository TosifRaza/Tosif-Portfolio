import mongoose from 'mongoose';

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
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI is required in production');
      }
      console.log('[db] No MONGO_URI set — starting in-memory MongoDB…');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
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
    throw new Error('Database connection failed', { cause: err });
  }
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (memoryServer) {
    await memoryServer.stop();
    console.log('[db] In-memory MongoDB stopped');
  }
}
