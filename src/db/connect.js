const mongoose = require('mongoose');
const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379', // Use IPv4
    socket: {
      tls: false, // Disable TLS for local Redis
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected ');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to Redis
client.on('connect', () => console.log('Redis connected 🔥'));
client.on('error', (err) => console.error('Redis error:', err));
client.connect();

module.exports = { connectDB, client };