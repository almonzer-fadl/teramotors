import { Resend } from 'resend';
import nodemailer from 'nodemailer';

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

let smtpTransporter: nodemailer.Transporter | null = null;

function getSMTPTransporter(): nodemailer.Transporter | null {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !user || !pass) return null;

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for SSL (e.g. Gmail), false for STARTTLS on 587
      auth: { user, pass },
    });
  }

  return smtpTransporter;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const from = process.env.EMAIL_FROM || 'TeraMotor <noreply@teramotors.com>';

    // 1) Use configured SMTP (e.g. Google) when available
    const transporter = getSMTPTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });
        return { id: info.messageId, message: 'Email sent via SMTP' };
      } catch (smtpError) {
        console.error('[email] SMTP send failed:', smtpError);
        throw smtpError;
      }
    }

    // 2) Fallback to Resend if SMTP is not configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key') {
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    }

    // 3) No provider configured - mock success (no email is sent)
    return { id: 'mock-email-id', message: 'Email sending disabled - no SMTP or Resend configured' };
  } catch (error) {
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
      <title>TeraMotor</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #063479 0%, #2563EB 100%); color: white; padding: 24px 20px; border-radius: 12px 12px 0 0; }
        .header-inner { display: table; width: 100%; }
        .logo-badge { display: table-cell; vertical-align: middle; width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.45); text-align: center; font-size: 26px; font-weight: 800; color: #ffffff; }
        .header-text { display: table-cell; vertical-align: middle; padding-left: 16px; }
        .header-text h1 { margin: 0; font-size: 22px; }
        .header-text p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.85; }
        .content { padding: 24px 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .content h2 { margin: 0 0 12px 0; font-size: 18px; color: #063479; }
        .content p { margin: 0 0 12px 0; color: #374151; }
        .footer { padding: 16px 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .footer a { color: #2563EB; text-decoration: none; font-weight: 600; }
        .button { background: linear-gradient(135deg, #2563EB 0%, #063479 100%); color: white !important; padding: 13px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 700; }
        .highlight { background: #eff6ff; padding: 14px 16px; border-left: 4px solid #2563EB; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #1e3a8a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-inner">
            <div class="logo-badge">T</div>
            <div class="header-text">
              <h1>TeraMotor</h1>
              <p>Professional Auto Repair Services</p>
            </div>
          </div>
        </div>
        <div class="content">
          ${getTemplateContent(template, data)}
        </div>
        <div class="footer">
          <p>TeraMotor Auto Repair Shop</p>
          <p><a href="https://wa.me/905075928117">WhatsApp Support</a> &nbsp;|&nbsp; <a href="mailto:info@teramotors.com">info@teramotors.com</a></p>
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
        <p>You requested a password reset for your TeraMotor account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${data.resetUrl}" class="button">Reset My Password &rarr;</a>
        <div class="highlight">
          <strong>Link expires in 30 minutes.</strong><br>
          If you didn't request this, you can safely ignore this email — your password won't change.
        </div>
      `;
    
    case 'welcome':
      return `
        <h2>Welcome to TeraMotor!</h2>
        <p>Dear ${data.customerName},</p>
        <p>Welcome to TeraMotor! We're excited to serve you.</p>
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
      return `<p>${data.message || 'Thank you for choosing TeraMotor!'}</p>`;
  }
}

function generateTextTemplate(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'appointment-reminder':
      return `
        Appointment Reminder - TeraMotor
        
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
        Invoice Ready - TeraMotor
        
        Dear ${data.customerName},
        
        Your invoice is ready:
        Invoice #: ${data.invoiceNumber}
        Amount: ${data.totalAmount} SAR
        Due Date: ${data.dueDate}
        
        Please review the attached invoice.
        Payment can be made at our workshop.
      `;
    
    case 'password-reset':
      return `
        Password Reset Request - TeraMotor

        You requested a password reset for your TeraMotor account.

        Click the link below to choose a new password:
        ${data.resetUrl}

        This link will expire in 30 minutes.
        If you didn't request this, you can safely ignore this email.
      `;

    default:
      return `Thank you for choosing TeraMotor!`;
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
    subject: 'Password Reset - TeraMotor',
    template: 'password-reset',
    data: { resetUrl }
  });
}

export async function sendWelcomeEmail(customer: any) {
  return sendEmailTemplate({
    to: customer.email,
    subject: 'Welcome to TeraMotor!',
    template: 'welcome',
    data: {
      customerName: customer.firstName
    }
  });
}