const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(uri, {
        autoIndex: process.env.NODE_ENV !== 'production', // disable auto-index in prod
      });
      logger.info('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      retries -= 1;
      logger.warn(`MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`);
      if (retries === 0) throw err;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

module.exports = connectDB;
