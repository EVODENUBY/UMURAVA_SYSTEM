import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API available at http://localhost:${PORT}/api-docs`);
      
      if (!process.env.GEMINI_API_KEY) {
        logger.warn('GEMINI_API_KEY not set and AI features will fail. configure the api key ');
      }
      if (!process.env.MONGODB_URI) {
        logger.warn('MONGODB_URI not set - Database connection will fail. Copy .env.example to .env and configure your database.');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
