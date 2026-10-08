import mongoose from 'mongoose';
import { logger } from './logger.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_banking_db';

    // In test environment or if forced, use memory server
    if (process.env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const testUri = mongodInstance.getUri();
      await mongoose.connect(testUri);
      logger.info(`Connected to in-memory MongoDB for testing at ${testUri}`);
      return;
    }

    try {
      // Attempt connection to specified Mongo URI with 3 second timeout
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      logger.info(`MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    } catch (primaryErr) {
      logger.warn(`Could not connect to external MongoDB at ${mongoUri}. Falling back to embedded MongoMemoryServer for development sandbox...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const fallbackUri = mongodInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      logger.info(`Embedded MongoDB Memory Server connected successfully at: ${fallbackUri}`);
    }
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (error) {
    logger.error(`Error disconnecting database: ${error.message}`);
  }
};
