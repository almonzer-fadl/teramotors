import { connectToDatabase } from '@/lib/db';
import Log from '@/lib/models/Log';
import mongoose from 'mongoose';

interface LogData {
  level: 'info' | 'warn' | 'error' | 'audit';
  message: string;
  tenantId?: string | mongoose.Types.ObjectId;
  userId?: string | mongoose.Types.ObjectId;
  resource?: {
    type: string;
    id?: string;
  };
  action: string;
  details?: Record<string, any>;
}

/**
 * Records an activity or event in the system log.
 * Fails silently to prevent crashing the main application flow.
 * @param logData - The data for the log entry.
 */
export async function logActivity(logData: LogData): Promise<void> {
  try {
    await connectToDatabase();
    await Log.create(logData);
  } catch (error) {
    // Log the error to the console, but don't re-throw it.
    // We don't want a logging failure to crash a primary user operation.
    console.error('Failed to write to activity log:', error);
  }
}

// Example Usage:
/*
  await logActivity({
    level: 'audit',
    message: `User logged in successfully.`,
    userId: user._id,
    tenantId: user.tenantId,
    resource: { type: 'user', id: user._id.toString() },
    action: 'login_success',
  });
*/
