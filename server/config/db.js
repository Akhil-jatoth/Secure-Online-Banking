import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from './logger.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_banking_db';
    let mongoUri = rawUri.trim();

    // If srv URI, configure public DNS servers for Windows compatibility
    if (mongoUri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch {
        // Ignore DNS config errors
      }
      if (!mongoUri.includes('?') && !mongoUri.endsWith('/')) {
        mongoUri += '/secure_banking_db?retryWrites=true&w=majority';
      } else if (mongoUri.endsWith('/')) {
        mongoUri += 'secure_banking_db?retryWrites=true&w=majority';
      }
    }

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
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
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
