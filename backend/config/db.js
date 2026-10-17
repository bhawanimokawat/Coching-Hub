const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Database features will be limited.");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState;
    console.log(`MongoDB connected: ${db.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // In serverless, do not hard-exit process.exit(1), let error propagate or retry
    if (process.env.NODE_ENV !== "production") {
      throw error;
    }
  }
};

module.exports = connectDB;
