'use client';

import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/lib/services/socket';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
  });

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));

    // Show toast notification
    switch (notification.type) {
      case 'success':
        setTimeout(() => {
          toast.success(notification.message, { duration: 4000 });
        }, 0);
        break;
      case 'error':
        toast.error(notification.message, { duration: 5000 });
        break;
      case 'warning':
        toast(notification.message, { 
          icon: '⚠️',
          duration: 4000,
          style: { background: '#fbbf24', color: '#000' }
        });
        break;
      default:
        toast(notification.message, { duration: 3000 });
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === notificationId);
      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.read 
          ? Math.max(0, prev.unreadCount - 1) 
          : prev.unreadCount,
      };
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  }, []);

  useEffect(() => {
    // Connect to socket service
    socketService.connect();

    // Job Card Events
    const handleJobCardCreated = (jobCard: any) => {
      addNotification({
        type: 'info',
        title: 'New Job Card Created',
        message: `Job card created for ${jobCard.customerId?.firstName} ${jobCard.customerId?.lastName}`,
        data: { jobCard, action: 'view', url: `/job-cards/${jobCard._id}` },
      });
    };

    const handleJobCardStatusUpdated = (jobCard: any) => {
      const statusMessages = {
        'pending': 'Job card is pending',
        'in-progress': 'Job is now in progress',
        'completed': 'Job has been completed',
        'cancelled': 'Job has been cancelled',
      };

      addNotification({
        type: jobCard.status === 'completed' ? 'success' : 'info',
        title: 'Job Status Updated',
        message: `${jobCard.customerId?.firstName} ${jobCard.customerId?.lastName}'s job: ${statusMessages[jobCard.status as keyof typeof statusMessages]}`,
        data: { jobCard, action: 'view', url: `/job-cards/${jobCard._id}` },
      });
    };

    const handleJobCardProgressUpdated = (jobCard: any) => {
      addNotification({
        type: 'info',
        title: 'Job Progress Updated',
        message: `Progress update for ${jobCard.customerId?.firstName} ${jobCard.customerId?.lastName}'s vehicle`,
        data: { jobCard, action: 'view', url: `/job-cards/${jobCard._id}` },
      });
    };

    // Appointment Events
    const handleAppointmentCreated = (appointment: any) => {
      addNotification({
        type: 'info',
        title: 'New Appointment Scheduled',
        message: `Appointment scheduled for ${appointment.customerId?.firstName} ${appointment.customerId?.lastName}`,
        data: { appointment, action: 'view', url: `/appointments/${appointment._id}` },
      });
    };

    const handleAppointmentUpdated = (appointment: any) => {
      addNotification({
        type: 'info',
        title: 'Appointment Updated',
        message: `Appointment updated for ${appointment.customerId?.firstName} ${appointment.customerId?.lastName}`,
        data: { appointment, action: 'view', url: `/appointments/${appointment._id}` },
      });
    };

    const handleAppointmentCancelled = (appointment: any) => {
      addNotification({
        type: 'warning',
        title: 'Appointment Cancelled',
        message: `Appointment cancelled for ${appointment.customerId?.firstName} ${appointment.customerId?.lastName}`,
        data: { appointment, action: 'view', url: `/appointments/${appointment._id}` },
      });
    };

    // Estimate Events
    const handleEstimateCreated = (estimate: any) => {
      addNotification({
        type: 'info',
        title: 'New Estimate Created',
        message: `Estimate created for ${estimate.customerId?.firstName} ${estimate.customerId?.lastName}`,
        data: { estimate, action: 'view', url: `/estimates/${estimate._id}` },
      });
    };

    const handleEstimateStatusUpdated = (estimate: any) => {
      const statusMessages = {
        'pending': 'Estimate is pending approval',
        'approved': 'Estimate has been approved',
        'rejected': 'Estimate has been rejected',
        'expired': 'Estimate has expired',
      };

      addNotification({
        type: estimate.status === 'approved' ? 'success' : estimate.status === 'rejected' ? 'error' : 'info',
        title: 'Estimate Status Updated',
        message: `${estimate.customerId?.firstName} ${estimate.customerId?.lastName}'s estimate: ${statusMessages[estimate.status as keyof typeof statusMessages]}`,
        data: { estimate, action: 'view', url: `/estimates/${estimate._id}` },
      });
    };

    // Invoice Events
    const handleInvoiceCreated = (invoice: any) => {
      addNotification({
        type: 'success',
        title: 'Invoice Created',
        message: `Invoice created for ${invoice.customerId?.firstName} ${invoice.customerId?.lastName}`,
        data: { invoice, action: 'view', url: `/invoices/${invoice._id}` },
      });
    };

    const handleInvoicePaid = (invoice: any) => {
      addNotification({
        type: 'success',
        title: 'Invoice Paid',
        message: `Invoice paid by ${invoice.customerId?.firstName} ${invoice.customerId?.lastName}`,
        data: { invoice, action: 'view', url: `/invoices/${invoice._id}` },
      });
    };

    // Inventory Events
    const handlePartStockLow = (part: any) => {
      addNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${part.name} is running low (${part.stockQuantity} remaining)`,
        data: { part, action: 'view', url: `/inventory/${part._id}` },
      });
    };

    const handlePartStockUpdated = (part: any) => {
      addNotification({
        type: 'info',
        title: 'Stock Updated',
        message: `${part.name} stock updated to ${part.stockQuantity}`,
        data: { part, action: 'view', url: `/inventory/${part._id}` },
      });
    };

    // Customer Events
    const handleCustomerUpdated = (customer: any) => {
      addNotification({
        type: 'info',
        title: 'Customer Updated',
        message: `Customer ${customer.firstName} ${customer.lastName} information updated`,
        data: { customer, action: 'view', url: `/customers/${customer._id}` },
      });
    };

    // Vehicle Events
    const handleVehicleUpdated = (vehicle: any) => {
      addNotification({
        type: 'info',
        title: 'Vehicle Updated',
        message: `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} information updated`,
        data: { vehicle, action: 'view', url: `/vehicles/${vehicle._id}` },
      });
    };

    // Inspection Events
    const handleInspectionCompleted = (inspection: any) => {
      addNotification({
        type: 'success',
        title: 'Inspection Completed',
        message: `Vehicle inspection completed for ${inspection.vehicleId?.make} ${inspection.vehicleId?.model}`,
        data: { inspection, action: 'view', url: `/inspections/${inspection._id}` },
      });
    };

    // Dashboard Events
    const handleDashboardStatsUpdated = (stats: any) => {
      addNotification({
        type: 'info',
        title: 'Dashboard Updated',
        message: 'Dashboard statistics have been updated',
        data: { stats, action: 'refresh' },
      });
    };

    // System Events
    const handleSystemMaintenance = (maintenance: any) => {
      addNotification({
        type: 'warning',
        title: 'System Maintenance',
        message: maintenance.message || 'System maintenance scheduled',
        data: { maintenance },
      });
    };

    const handleSystemAlert = (alert: any) => {
      addNotification({
        type: 'error',
        title: 'System Alert',
        message: alert.message || 'System alert received',
        data: { alert },
      });
    };

    // Generic notification handler
    const handleNotification = (notification: any) => {
      addNotification({
        type: notification.type || 'info',
        title: notification.title || 'Notification',
        message: notification.message || 'You have a new notification',
        data: notification.data,
      });
    };

    const handleBroadcastNotification = (notification: any) => {
      addNotification({
        type: notification.type || 'info',
        title: notification.title || 'Broadcast',
        message: notification.message || 'Broadcast message received',
        data: notification.data,
      });
    };

    // Connection status handler
    const handleConnectionStatus = (connected: boolean) => {
      setState(prev => {
        if (prev.isConnected === connected) {
          return prev;
        }

        if (connected) {
          addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Real-time updates are now active',
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Disconnected',
            message: 'Real-time updates are temporarily unavailable',
          });
        }

        return { ...prev, isConnected: connected };
      });
    };

    // Register event listeners
    socketService.onJobCardCreated(handleJobCardCreated);
    socketService.onJobCardStatusUpdated(handleJobCardStatusUpdated);
    socketService.onJobCardProgressUpdated(handleJobCardProgressUpdated);
    socketService.onAppointmentCreated(handleAppointmentCreated);
    socketService.onAppointmentUpdated(handleAppointmentUpdated);
    socketService.onAppointmentCancelled(handleAppointmentCancelled);
    socketService.onEstimateCreated(handleEstimateCreated);
    socketService.onEstimateStatusUpdated(handleEstimateStatusUpdated);
    socketService.onInvoiceCreated(handleInvoiceCreated);
    socketService.onInvoicePaid(handleInvoicePaid);
    socketService.onPartStockLow(handlePartStockLow);
    socketService.onPartStockUpdated(handlePartStockUpdated);
    socketService.onCustomerUpdated(handleCustomerUpdated);
    socketService.onVehicleUpdated(handleVehicleUpdated);
    socketService.onInspectionCompleted(handleInspectionCompleted);
    socketService.onDashboardStatsUpdated(handleDashboardStatsUpdated);
    socketService.onNotification(handleNotification);
    socketService.onBroadcastNotification(handleBroadcastNotification);
    socketService.onSystemMaintenance(handleSystemMaintenance);
    socketService.onSystemAlert(handleSystemAlert);

    // Connection status listeners
    const handleConnect = () => handleConnectionStatus(true);
    const handleDisconnect = () => handleConnectionStatus(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Set initial state
    handleConnectionStatus(socketService.isConnected());

    return () => {
      // Cleanup event listeners
      socketService.off('jobcard_created', handleJobCardCreated);
      socketService.off('jobcard_status_updated', handleJobCardStatusUpdated);
      socketService.off('jobcard_progress_updated', handleJobCardProgressUpdated);
      socketService.off('appointment_created', handleAppointmentCreated);
      socketService.off('appointment_updated', handleAppointmentUpdated);
      socketService.off('appointment_cancelled', handleAppointmentCancelled);
      socketService.off('estimate_created', handleEstimateCreated);
      socketService.off('estimate_status_updated', handleEstimateStatusUpdated);
      socketService.off('invoice_created', handleInvoiceCreated);
      socketService.off('invoice_paid', handleInvoicePaid);
      socketService.off('part_stock_low', handlePartStockLow);
      socketService.off('part_stock_updated', handlePartStockUpdated);
      socketService.off('customer_updated', handleCustomerUpdated);
      socketService.off('vehicle_updated', handleVehicleUpdated);
      socketService.off('inspection_completed', handleInspectionCompleted);
      socketService.off('dashboard_stats_updated', handleDashboardStatsUpdated);
      socketService.off('notification', handleNotification);
      socketService.off('broadcast_notification', handleBroadcastNotification);
      socketService.off('system_maintenance', handleSystemMaintenance);
      socketService.off('system_alert', handleSystemAlert);
      
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, [addNotification]);

  return {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };
}
