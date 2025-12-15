import { socketService } from './services/socket';
import { sendEmail } from './email';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  role?: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationTemplate {
  appointment_reminder: {
    title: string;
    message: string;
    email: boolean;
  };
  invoice_ready: {
    title: string;
    message: string;
    email: boolean;
  };
  estimate_ready: {
    title: string;
    message: string;
    email: boolean;
  };
  job_status_update: {
    title: string;
    message: string;
    email: boolean;
  };
  inventory_alert: {
    title: string;
    message: string;
    email: boolean;
  };
  system_alert: {
    title: string;
    message: string;
    email: boolean;
  };
}

export class NotificationService {
  private static notifications: Notification[] = [];
  private static templates: NotificationTemplate = {
    appointment_reminder: {
      title: 'Appointment Reminder',
      message: 'You have an appointment scheduled for {date} at {time}',
      email: true
    },
    invoice_ready: {
      title: 'Invoice Ready',
      message: 'Your invoice #{invoiceNumber} is ready for review',
      email: true
    },
    estimate_ready: {
      title: 'Estimate Ready',
      message: 'Your service estimate #{estimateNumber} is ready',
      email: true
    },
    job_status_update: {
      title: 'Job Status Update',
      message: 'Job #{jobNumber} status has been updated to {status}',
      email: false
    },
    inventory_alert: {
      title: 'Inventory Alert',
      message: 'Part {partName} is running low (Stock: {quantity})',
      email: true
    },
    system_alert: {
      title: 'System Alert',
      message: '{message}',
      email: true
    }
  };

  static async createNotification(
    type: keyof NotificationTemplate,
    userId?: string,
    role?: string,
    data?: any,
    customMessage?: string
  ): Promise<Notification> {
    const template = this.templates[type];
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: this.getNotificationType(type),
      title: template.title,
      message: customMessage || this.formatMessage(template.message, data),
      userId,
      role,
      data,
      read: false,
      createdAt: new Date(),
      expiresAt: this.getExpirationDate(type)
    };

    // Add to local storage
    this.notifications.push(notification);

    // Send real-time notification
    if (userId) {
      socketService.emit('notification', {
        userId,
        notification
      });
    } else if (role) {
      socketService.emit('notification', {
        role,
        notification
      });
    } else {
      socketService.emit('broadcast_notification', notification);
    }

    // Send email if configured
    if (template.email && userId) {
      try {
        await this.sendEmailNotification(type, userId, data);
      } catch (error) {
      }
    }

    return notification;
  }

  static async sendEmailNotification(
    type: keyof NotificationTemplate,
    userId: string,
    data?: any
  ): Promise<void> {
    // This would integrate with your user service to get user email
    // For now, we'll assume the email is in the data
    if (!data?.email) return;

    const template = this.templates[type];
    const subject = `TeraMotors - ${template.title}`;
    const html = this.generateEmailHTML(template.title, template.message, data);
    const text = this.generateEmailText(template.title, template.message, data);

    await sendEmail({
      to: data.email,
      subject,
      html,
      text
    });
  }

  static getNotifications(userId?: string, role?: string): Notification[] {
    if (userId) {
      return this.notifications.filter(n => n.userId === userId);
    } else if (role) {
      return this.notifications.filter(n => n.role === role);
    }
    return this.notifications;
  }

  static getUnreadCount(userId?: string, role?: string): number {
    const notifications = this.getNotifications(userId, role);
    return notifications.filter(n => !n.read).length;
  }

  static markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  static markAllAsRead(userId?: string, role?: string): void {
    const notifications = this.getNotifications(userId, role);
    notifications.forEach(n => n.read = true);
  }

  static deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  static clearExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
  }

  // Specific notification methods
  static async notifyAppointmentReminder(appointment: any): Promise<void> {
    await this.createNotification(
      'appointment_reminder',
      appointment.customerId,
      undefined,
      {
        date: appointment.appointmentDate,
        time: appointment.startTime,
        service: appointment.service.name,
        vehicle: appointment.vehicle.make + ' ' + appointment.vehicle.model,
        email: appointment.customer.email
      }
    );
  }

  static async notifyInvoiceReady(invoice: any): Promise<void> {
    await this.createNotification(
      'invoice_ready',
      invoice.customerId,
      undefined,
      {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        email: invoice.customer.email
      }
    );
  }

  static async notifyEstimateReady(estimate: any): Promise<void> {
    await this.createNotification(
      'estimate_ready',
      estimate.customerId,
      undefined,
      {
        estimateNumber: estimate.estimateNumber,
        amount: estimate.totalAmount,
        validUntil: estimate.validUntil,
        email: estimate.customer.email
      }
    );
  }

  static async notifyJobStatusUpdate(job: any, status: string): Promise<void> {
    await this.createNotification(
      'job_status_update',
      job.customerId,
      undefined,
      {
        jobNumber: job.jobNumber,
        status: status,
        vehicle: job.vehicle.make + ' ' + job.vehicle.model
      }
    );
  }

  static async notifyInventoryAlert(part: any): Promise<void> {
    await this.createNotification(
      'inventory_alert',
      undefined,
      'admin',
      {
        partName: part.name,
        quantity: part.stockQuantity,
        minLevel: part.minStockLevel
      }
    );
  }

  static async notifySystemAlert(message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    await this.createNotification(
      'system_alert',
      undefined,
      'admin',
      { message },
      message
    );
  }

  // Helper methods
  private static getNotificationType(type: keyof NotificationTemplate): Notification['type'] {
    switch (type) {
      case 'appointment_reminder':
      case 'invoice_ready':
      case 'estimate_ready':
        return 'info';
      case 'job_status_update':
        return 'success';
      case 'inventory_alert':
        return 'warning';
      case 'system_alert':
        return 'error';
      default:
        return 'info';
    }
  }

  private static formatMessage(message: string, data?: any): string {
    if (!data) return message;
    
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private static getExpirationDate(type: keyof NotificationTemplate): Date | undefined {
    const now = new Date();
    
    switch (type) {
      case 'appointment_reminder':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'invoice_ready':
      case 'estimate_ready':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'job_status_update':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'inventory_alert':
        return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      case 'system_alert':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      default:
        return undefined;
    }
  }

  private static generateEmailHTML(title: string, message: string, data?: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TeraMotors Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 TeraMotors</h1>
            <p>Auto Repair Shop</p>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>${this.formatMessage(message, data)}</p>
          </div>
          <div class="footer">
            <p>TeraMotors Auto Repair Shop</p>
            <p>Contact: +966 XX XXX XXXX | Email: info@teramotors.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateEmailText(title: string, message: string, data?: any): string {
    return `
      TeraMotors Notification
      
      ${title}
      
      ${this.formatMessage(message, data)}
      
      ---
      TeraMotors Auto Repair Shop
      Contact: +966 XX XXX XXXX | Email: info@teramotors.com
    `;
  }
}

export default NotificationService;
