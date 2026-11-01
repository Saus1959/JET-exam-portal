import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const g = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache: MongooseCache = (g.mongooseCache ??= { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in .env.local");

  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
