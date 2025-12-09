import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { isDatabaseHealthy, connectToDatabase } from '@/lib/db';

export async function GET() {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response: {
    overallStatus: 'operational' | 'degraded' | 'outage';
    components: Array<{ name: string; status: 'operational' | 'degraded' | 'outage'; message: string }>;
  } = {
    overallStatus: 'operational',
    components: [],
  };

  // --- Database Health Check ---
  let dbStatus: 'operational' | 'degraded' | 'outage' = 'outage';
  let dbMessage = 'Database connection failed';
  try {
    await connectToDatabase(); // Ensure connection before checking health
    if (await isDatabaseHealthy()) {
      dbStatus = 'operational';
      dbMessage = 'Connection successful';
    } else {
      dbStatus = 'outage';
      dbMessage = 'Database is not connected or not responding to pings.';
    }
  } catch (error: any) {
    dbStatus = 'outage';
    dbMessage = `Connection error: ${error.message}`;
  }
  response.components.push({ name: 'Database', status: dbStatus, message: dbMessage });
  if (dbStatus !== 'operational') response.overallStatus = 'degraded';


  // --- Authentication Service Health Check ---
  let authStatus: 'operational' | 'degraded' | 'outage' = 'outage';
  let authMessage = 'Authentication service is not functional';
  try {
    // Check for the critical AUTH_SECRET environment variable
    if (process.env.AUTH_SECRET) {
      authStatus = 'operational';
      authMessage = 'Configuration valid';
    } else {
      authStatus = 'degraded';
      authMessage = 'AUTH_SECRET is not set. Service is running with a default, insecure key.';
    }
  } catch (error: any) {
    authStatus = 'outage';
    authMessage = `Error checking auth config: ${error.message}`;
  }
  response.components.push({ name: 'Authentication Service', status: authStatus, message: authMessage });
  if (authStatus !== 'operational' && response.overallStatus === 'operational') response.overallStatus = 'degraded';


  // --- In-App Notifications (Socket.IO) Health Check ---
  let socketStatus: 'operational' | 'degraded' | 'outage' = 'outage';
  let socketMessage = 'Socket.IO server is not responsive';
  try {
    const socketServerUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:5000/health';
    const response = await fetch(socketServerUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      socketStatus = 'operational';
      socketMessage = 'Real-time service is active';
    } else {
      socketStatus = 'degraded';
      socketMessage = `Server responded with status ${response.status}`;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      socketStatus = 'degraded';
      socketMessage = 'Request timed out. Server is slow or unresponsive.';
    } else {
      socketStatus = 'outage';
      socketMessage = 'Server is not reachable.';
    }
  }
  response.components.push({ name: 'In-App Notifications', status: socketStatus, message: socketMessage });
  if (socketStatus !== 'operational' && response.overallStatus === 'operational') response.overallStatus = 'degraded';


  // --- Backend API Health Check ---
  // If this handler is running, the backend API is at least responsive
  const apiStatus: 'operational' | 'degraded' | 'outage' = 'operational';
  const apiMessage = 'API is responsive';
  response.components.push({ name: 'Backend API', status: apiStatus, message: apiMessage });


  // --- Frontend Application Health Check ---
  // If the frontend can make this request, it's generally accessible
  const frontendStatus: 'operational' | 'degraded' | 'outage' = 'operational';
  const frontendMessage = 'Application accessible';
  response.components.push({ name: 'Frontend Application', status: frontendStatus, message: frontendMessage });

  // Determine overall status based on component statuses
  if (response.components.some(comp => comp.status === 'outage')) {
    response.overallStatus = 'outage';
  } else if (response.components.some(comp => comp.status === 'degraded')) {
    response.overallStatus = 'degraded';
  } else {
    response.overallStatus = 'operational';
  }

  return NextResponse.json(response);
}