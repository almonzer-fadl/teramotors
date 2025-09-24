import mongoose from "mongoose";

// track the connection
let isConnected = false;
let listenersAdded = false;
let connectionAttempts = 0;
const maxRetries = 3;
const retryDelay = 5000; // 5 seconds

export class DatabaseError extends Error {
  public code: string;
  public retryable: boolean;
  public fallback?: any;

  constructor(code: string, message: string, retryable: boolean, fallback?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.retryable = retryable;
    this.fallback = fallback;
  }
}

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  
  // If already connected, verify the connection is still alive
  if (isConnected && mongoose.connection.readyState === 1) {
    try {
      // Ping the database to check if connection is still alive
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        console.log("DB connection verified");
        return;
      }
    } catch (error) {
      console.log("DB connection lost, reconnecting...");
      isConnected = false;
    }
  }
  
  if (!process.env.MONGODB_URI) {
    throw new DatabaseError("MONGODB_URI_MISSING", "MongoDB URI is not defined", false);
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "teramotors",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
    });
    
    isConnected = true;
    connectionAttempts = 0;
    console.log("MongoDB connected successfully");
    
    // Handle connection events
    if (!listenersAdded) {
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        isConnected = false;
        handleConnectionError(err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        isConnected = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        isConnected = true;
        connectionAttempts = 0;
      });
      
      mongoose.connection.on('close', () => {
        console.log('MongoDB connection closed');
        isConnected = false;
      });
      
      listenersAdded = true;
    }
    
  } catch (error) {
    connectionAttempts++;
    console.error("MongoDB connection error:", error);
    isConnected = false;
    
    if (connectionAttempts < maxRetries) {
      console.log(`Retrying connection in ${retryDelay}ms... (Attempt ${connectionAttempts}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return connectToDatabase();
    } else {
      throw new DatabaseError(
        "CONNECTION_FAILED",
        `Failed to connect to MongoDB after ${maxRetries} attempts`,
        true,
        getFallbackData()
      );
    }
  }
};

export const handleDatabaseError = (error: any): DatabaseError => {
  if (error instanceof DatabaseError) {
    return error;
  }

  // MongoDB specific error codes
  if (error.code === 11000) {
    return new DatabaseError("DUPLICATE_KEY", "Duplicate entry found", false);
  }
  
  if (error.code === 11001) {
    return new DatabaseError("DUPLICATE_KEY", "Duplicate key error", false);
  }
  
  if (error.name === 'ValidationError') {
    return new DatabaseError("VALIDATION_ERROR", "Data validation failed", false);
  }
  
  if (error.name === 'CastError') {
    return new DatabaseError("CAST_ERROR", "Invalid data type", false);
  }
  
  if (error.name === 'MongoNetworkError') {
    return new DatabaseError("NETWORK_ERROR", "Network connection failed", true, getFallbackData());
  }
  
  if (error.name === 'MongoTimeoutError') {
    return new DatabaseError("TIMEOUT_ERROR", "Database operation timed out", true, getFallbackData());
  }
  
  if (error.name === 'MongoServerError') {
    return new DatabaseError("SERVER_ERROR", "Database server error", true, getFallbackData());
  }
  
  return new DatabaseError("UNKNOWN_ERROR", "An unknown error occurred", true, getFallbackData());
};

export const withDatabaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: () => T
): Promise<T> => {
  try {
    await connectToDatabase();
    return await operation();
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('Database operation failed:', dbError);
    
    if (fallback && dbError.retryable) {
      console.log('Using fallback data');
      return fallback();
    }
    
    throw dbError;
  }
};

export const getConnectionStatus = (): {
  connected: boolean;
  readyState: number;
  host: string;
  port: number;
  name: string;
} => {
  const connection = mongoose.connection;
  return {
    connected: isConnected && connection.readyState === 1,
    readyState: connection.readyState,
    host: connection.host || 'unknown',
    port: connection.port || 0,
    name: connection.name || 'unknown'
  };
};

export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return false;
    }
    
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export const gracefulShutdown = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error during database shutdown:', error);
  }
};

// Fallback data for when database is unavailable
const getFallbackData = () => {
  return {
    customers: [],
    vehicles: [],
    appointments: [],
    jobCards: [],
    invoices: [],
    estimates: [],
    parts: [],
    message: "Database temporarily unavailable. Some features may be limited."
  };
};

const handleConnectionError = (error: any) => {
  console.error('Connection error:', error);
  
  // Implement exponential backoff for reconnection
  const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
  
  setTimeout(async () => {
    if (connectionAttempts < maxRetries) {
      console.log(`Attempting to reconnect... (${connectionAttempts + 1}/${maxRetries})`);
      try {
        await connectToDatabase();
      } catch (retryError) {
        console.error('Reconnection failed:', retryError);
      }
    }
  }, delay);
};

// Helper function to reset connection (for debugging)
export const resetConnection = () => {
  isConnected = false;
  connectionAttempts = 0;
  console.log("Connection status reset");
};
