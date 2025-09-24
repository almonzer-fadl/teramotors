import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key');

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    // Check if API key is properly configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key') {
      console.warn('Resend API key not configured. Email sending disabled.');
      return { id: 'mock-email-id', message: 'Email sending disabled - no API key configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TeraMotors <noreply@teramotors.com>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendEmailTemplate({ to, subject, template, data }: EmailTemplate) {
  const html = generateEmailTemplate(template, data);
  const text = generateTextTemplate(template, data);
  
  return sendEmail({ to, subject, html, text });
}

// Email Templates
export function generateEmailTemplate(template: string, data: Record<string, any>): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TeraMotors</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 TeraMotors</h1>
          <p>Professional Auto Repair Services</p>
        </div>
        <div class="content">
          ${getTemplateContent(template, data)}
        </div>
        <div class="footer">
          <p>TeraMotors Auto Repair Shop</p>
          <p>Contact: +966 XX XXX XXXX | Email: info@teramotors.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return baseTemplate;
}

function getTemplateContent(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'appointment-reminder':
      return `
        <h2>Appointment Reminder</h2>
        <p>Dear ${data.customerName},</p>
        <p>This is a reminder that you have an appointment scheduled:</p>
        <div class="highlight">
          <strong>Date:</strong> ${data.appointmentDate}<br>
          <strong>Time:</strong> ${data.appointmentTime}<br>
          <strong>Service:</strong> ${data.serviceName}<br>
          <strong>Vehicle:</strong> ${data.vehicleInfo}
        </div>
        <p>Please arrive 10 minutes early. If you need to reschedule, please contact us.</p>
      `;
    
    case 'invoice-notification':
      return `
        <h2>Invoice Ready</h2>
        <p>Dear ${data.customerName},</p>
        <p>Your invoice is ready for review:</p>
        <div class="highlight">
          <strong>Invoice #:</strong> ${data.invoiceNumber}<br>
          <strong>Amount:</strong> ${data.totalAmount} SAR<br>
          <strong>Due Date:</strong> ${data.dueDate}
        </div>
        <p>Please review the attached invoice. Payment can be made at our workshop.</p>
        <a href="${data.invoiceUrl}" class="button">View Invoice</a>
      `;
    
    case 'estimate-notification':
      return `
        <h2>Service Estimate Ready</h2>
        <p>Dear ${data.customerName},</p>
        <p>Your service estimate is ready:</p>
        <div class="highlight">
          <strong>Estimate #:</strong> ${data.estimateNumber}<br>
          <strong>Total:</strong> ${data.totalAmount} SAR<br>
          <strong>Valid Until:</strong> ${data.validUntil}
        </div>
        <p>Please review the estimate and let us know if you'd like to proceed.</p>
        <a href="${data.estimateUrl}" class="button">View Estimate</a>
      `;
    
    case 'password-reset':
      return `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your TeraMotors account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${data.resetUrl}" class="button">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    
    case 'welcome':
      return `
        <h2>Welcome to TeraMotors!</h2>
        <p>Dear ${data.customerName},</p>
        <p>Welcome to TeraMotors! We're excited to serve you.</p>
        <p>Your account has been created successfully.</p>
        <p>You can now:</p>
        <ul>
          <li>Schedule appointments online</li>
          <li>View your service history</li>
          <li>Track your vehicle maintenance</li>
          <li>Receive service notifications</li>
        </ul>
      `;
    
    default:
      return `<p>${data.message || 'Thank you for choosing TeraMotors!'}</p>`;
  }
}

function generateTextTemplate(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'appointment-reminder':
      return `
        Appointment Reminder - TeraMotors
        
        Dear ${data.customerName},
        
        You have an appointment scheduled:
        Date: ${data.appointmentDate}
        Time: ${data.appointmentTime}
        Service: ${data.serviceName}
        Vehicle: ${data.vehicleInfo}
        
        Please arrive 10 minutes early.
        Contact us if you need to reschedule.
      `;
    
    case 'invoice-notification':
      return `
        Invoice Ready - TeraMotors
        
        Dear ${data.customerName},
        
        Your invoice is ready:
        Invoice #: ${data.invoiceNumber}
        Amount: ${data.totalAmount} SAR
        Due Date: ${data.dueDate}
        
        Please review the attached invoice.
        Payment can be made at our workshop.
      `;
    
    default:
      return `Thank you for choosing TeraMotors!`;
  }
}

// Email Service Functions
export async function sendAppointmentReminder(appointment: any) {
  return sendEmailTemplate({
    to: appointment.customer.email,
    subject: `Appointment Reminder - ${appointment.service.name}`,
    template: 'appointment-reminder',
    data: {
      customerName: appointment.customer.firstName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.startTime,
      serviceName: appointment.service.name,
      vehicleInfo: `${appointment.vehicle.make} ${appointment.vehicle.model} (${appointment.vehicle.licensePlate})`
    }
  });
}

export async function sendInvoiceNotification(invoice: any) {
  return sendEmailTemplate({
    to: invoice.customer.email,
    subject: `Invoice Ready - ${invoice.invoiceNumber}`,
    template: 'invoice-notification',
    data: {
      customerName: invoice.customer.firstName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      invoiceUrl: `${process.env.NEXT_PUBLIC_URL}/invoices/${invoice._id}`
    }
  });
}

export async function sendEstimateNotification(estimate: any) {
  return sendEmailTemplate({
    to: estimate.customer.email,
    subject: `Service Estimate Ready - ${estimate.estimateNumber}`,
    template: 'estimate-notification',
    data: {
      customerName: estimate.customer.firstName,
      estimateNumber: estimate.estimateNumber,
      totalAmount: estimate.totalAmount,
      validUntil: estimate.validUntil,
      estimateUrl: `${process.env.NEXT_PUBLIC_URL}/estimates/${estimate._id}`
    }
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;
  
  return sendEmailTemplate({
    to: email,
    subject: 'Password Reset - TeraMotors',
    template: 'password-reset',
    data: { resetUrl }
  });
}

export async function sendWelcomeEmail(customer: any) {
  return sendEmailTemplate({
    to: customer.email,
    subject: 'Welcome to TeraMotors!',
    template: 'welcome',
    data: {
      customerName: customer.firstName
    }
  });
}