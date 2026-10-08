import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { User } from './models/User.js';
import { seedDatabase } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed database if empty (ensures zero-setup experience for evaluators)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Empty database detected. Auto-seeding initial banking demo records...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` Aegis Secure Online Banking API Server running on port ${PORT}`);
      logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(` API Health:  http://localhost:${PORT}/api/health`);
      logger.info(`=======================================================`);
    });

    // Graceful shutdown handlers
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`Fatal error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
