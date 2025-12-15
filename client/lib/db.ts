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
        return;
      }
    } catch (error) {
      isConnected = false;
    }
  }
  
  if (!process.env.MONGODB_URI) {
    throw new DatabaseError("MONGODB_URI_MISSING", "MongoDB URI is not defined", false);
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "teramotors",
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 60000, // Increased to 60 seconds
      connectTimeoutMS: 30000, // Increased to 30 seconds
      maxPoolSize: 5, // Reduced pool size
      minPoolSize: 1, // Reduced min pool size
      maxIdleTimeMS: 60000, // Increased idle time
      retryWrites: true,
      retryReads: true,
      bufferCommands: true, // Enable mongoose buffering to queue commands until connection is ready
    });
    
    isConnected = true;
    connectionAttempts = 0;
    
    // Handle connection events (only add once)
    if (!listenersAdded) {
      // Remove any existing listeners first
      mongoose.connection.removeAllListeners();
      
      mongoose.connection.on('error', (err) => {
        isConnected = false;
        handleConnectionError(err);
      });
      
      mongoose.connection.on('disconnected', () => {
        isConnected = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        isConnected = true;
        connectionAttempts = 0;
      });
      
      mongoose.connection.on('close', () => {
        isConnected = false;
      });
      
      listenersAdded = true;
    }
    
  } catch (error) {
    connectionAttempts++;
    isConnected = false;
    
    if (connectionAttempts < maxRetries) {
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
    
    if (fallback && dbError.retryable) {
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
    return false;
  }
};

export const gracefulShutdown = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    isConnected = false;
  } catch (error) {
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
  
  // Implement exponential backoff for reconnection
  const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
  
  setTimeout(async () => {
    if (connectionAttempts < maxRetries) {
      try {
        await connectToDatabase();
      } catch (retryError) {
      }
    }
  }, delay);
};

// Helper function to reset connection (for debugging)
export const resetConnection = () => {
  isConnected = false;
  connectionAttempts = 0;
  listenersAdded = false;
  // Remove all listeners to prevent memory leaks
  if (mongoose.connection) {
    mongoose.connection.removeAllListeners();
  }
};

// Helper function to check if we need to reconnect
export const shouldReconnect = (): boolean => {
  return !isConnected || mongoose.connection.readyState !== 1;
};

// Helper function to get connection info
export const getConnectionInfo = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    listenersAdded,
    connectionAttempts,
    maxRetries
  };
};
