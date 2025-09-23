import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Make sure to use NEXT_PUBLIC_ for client-side environment variables
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
    });
  }

  // Job Card Events
  onJobCardCreated(callback: (jobCard: any) => void) {
    this.socket?.on('jobcard_created', callback);
  }

  onJobCardStatusUpdated(callback: (jobCard: any) => void) {
    this.socket?.on('jobcard_status_updated', callback);
  }

  onJobCardProgressUpdated(callback: (jobCard: any) => void) {
    this.socket?.on('jobcard_progress_updated', callback);
  }

  // Appointment Events
  onAppointmentCreated(callback: (appointment: any) => void) {
    this.socket?.on('appointment_created', callback);
  }

  onAppointmentUpdated(callback: (appointment: any) => void) {
    this.socket?.on('appointment_updated', callback);
  }

  onAppointmentCancelled(callback: (appointment: any) => void) {
    this.socket?.on('appointment_cancelled', callback);
  }

  // Estimate Events
  onEstimateCreated(callback: (estimate: any) => void) {
    this.socket?.on('estimate_created', callback);
  }

  onEstimateStatusUpdated(callback: (estimate: any) => void) {
    this.socket?.on('estimate_status_updated', callback);
  }

  // Invoice Events
  onInvoiceCreated(callback: (invoice: any) => void) {
    this.socket?.on('invoice_created', callback);
  }

  onInvoicePaid(callback: (invoice: any) => void) {
    this.socket?.on('invoice_paid', callback);
  }

  // Inventory Events
  onPartStockLow(callback: (part: any) => void) {
    this.socket?.on('part_stock_low', callback);
  }

  onPartStockUpdated(callback: (part: any) => void) {
    this.socket?.on('part_stock_updated', callback);
  }

  // Customer Events
  onCustomerUpdated(callback: (customer: any) => void) {
    this.socket?.on('customer_updated', callback);
  }

  // Vehicle Events
  onVehicleUpdated(callback: (vehicle: any) => void) {
    this.socket?.on('vehicle_updated', callback);
  }

  // Inspection Events
  onInspectionCompleted(callback: (inspection: any) => void) {
    this.socket?.on('inspection_completed', callback);
  }

  // Dashboard Events
  onDashboardStatsUpdated(callback: (stats: any) => void) {
    this.socket?.on('dashboard_stats_updated', callback);
  }

  // Notification Events
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  onBroadcastNotification(callback: (notification: any) => void) {
    this.socket?.on('broadcast_notification', callback);
  }

  // System Events
  onSystemMaintenance(callback: (maintenance: any) => void) {
    this.socket?.on('system_maintenance', callback);
  }

  onSystemAlert(callback: (alert: any) => void) {
    this.socket?.on('system_alert', callback);
  }

  // Generic update events (for backward compatibility)
  onUpdateJobs(callback: () => void) {
    this.socket?.on('update-jobs', callback);
  }

  onUpdateAppointments(callback: () => void) {
    this.socket?.on('update-appointments', callback);
  }

  onUpdateCustomers(callback: () => void) {
    this.socket?.on('update-customers', callback);
  }

  onUpdateVehicles(callback: () => void) {
    this.socket?.on('update-vehicles', callback);
  }

  onUpdateEstimates(callback: () => void) {
    this.socket?.on('update-estimates', callback);
  }

  onUpdateParts(callback: () => void) {
    this.socket?.on('update-parts', callback);
  }

  onUpdateServices(callback: () => void) {
    this.socket?.on('update-services', callback);
  }

  onUpdateInspections(callback: () => void) {
    this.socket?.on('update-inspections', callback);
  }

  // Emit events
  emitJobCreated() {
    this.socket?.emit('job-created');
  }

  emitAppointmentCreated() {
    this.socket?.emit('appointment-created');
  }

  emitCustomerCreated() {
    this.socket?.emit('customer-created');
  }

  emitVehicleCreated() {
    this.socket?.emit('vehicle-created');
  }

  emitEstimateCreated() {
    this.socket?.emit('estimate-created');
  }

  emitPartCreated() {
    this.socket?.emit('part-created');
  }

  emitServiceCreated() {
    this.socket?.emit('service-created');
  }

  emitInspectionCreated() {
    this.socket?.emit('inspection-created');
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Cleanup method
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  // Remove specific listener
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export both the service and the raw socket for backward compatibility
export { socketService };
export const socket = socketService;

// React hook for using socket service
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>();

  useEffect(() => {
    socketService.connect();

    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socketService.getSocketId());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(undefined);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    socket: socketService,
    isConnected,
    socketId,
  };
}
