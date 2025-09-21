import mongoose from "mongoose";

// track the connection
let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  
  // If already connected, verify the connection is still alive
  if (isConnected && mongoose.connection.readyState === 1) {
    try {
      // Ping the database to check if connection is still alive
      await mongoose.connection.db.admin().ping();
      console.log("DB connection verified");
      return;
    } catch (error) {
      console.log("DB connection lost, reconnecting...");
      isConnected = false;
    }
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  
  try {
    // Only disconnect if we're in a connected state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "teramotors",
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    });
    
    isConnected = true;
    console.log("MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

// Helper function to reset connection (for debugging)
export const resetConnection = () => {
  isConnected = false;
  console.log("Connection status reset");
};