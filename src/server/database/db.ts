import mongoose from 'mongoose';

let isConnected = false;

/**
 * Initializes MongoDB connection using Mongoose
 * Reads MONGODB_URI from environment variables.
 */
export async function connectToDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  // Validate scheme: must start with mongodb:// or mongodb+srv://
  if (
    !uri ||
    (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) ||
    uri.includes('<username>')
  ) {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[MongoDB Configuration] No valid MONGODB_URI detected (expected connection string starting with "mongodb://" or "mongodb+srv://"). Using resilient in-memory store.'
    );
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('\x1b[32m%s\x1b[0m', `[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn('\x1b[33m%s\x1b[0m', `[MongoDB Notice] Database connection unavailable: ${error?.message}. Continuing with in-memory storage.`);
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export default connectToDatabase;
