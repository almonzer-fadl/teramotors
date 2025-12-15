import { IAppointment } from '@/lib/models/Appointment';
import { ICustomer } from '@/lib/models/Customer';
import { ITenant } from '@/lib/models/Tenant';
import { IService } from '@/lib/models/Service';
import { sendEmail } from '@/lib/email';

export class BookingNotificationService {
  /**
   * Send booking confirmation to customer
   */
  static async sendCustomerConfirmation(
    appointment: IAppointment,
    customer: ICustomer,
    tenant: ITenant,
    service: IService
  ): Promise<void> {
    const appointmentDate = new Date(appointment.appointmentDate);
    const startTime = new Date(appointment.startTime);

    const emailContent = this.generateCustomerConfirmationEmail(
      customer,
      tenant,
      service,
      appointmentDate,
      startTime,
      appointment.confirmationNumber,
      customer.language || 'en'
    );

    try {
      await sendEmail({
        to: customer.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (error) {
    }
  }

  /**
   * Send booking notification to shop admin
   */
  static async sendAdminNotification(
    appointment: IAppointment,
    customer: ICustomer,
    tenant: ITenant,
    service: IService
  ): Promise<void> {
    const appointmentDate = new Date(appointment.appointmentDate);
    const startTime = new Date(appointment.startTime);

    const emailContent = this.generateAdminNotificationEmail(
      customer,
      tenant,
      service,
      appointmentDate,
      startTime,
      appointment.confirmationNumber,
      appointment.requiresApproval || false
    );

    try {
      if (tenant.companyInfo?.email) {
        await sendEmail({
          to: tenant.companyInfo.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      }
    } catch (error) {
    }
  }

  /**
   * Generate customer confirmation email
   */
  private static generateCustomerConfirmationEmail(
    customer: ICustomer,
    tenant: ITenant,
    service: IService,
    date: Date,
    time: Date,
    confirmationNumber: string,
    language: 'ar' | 'en'
  ): { subject: string; html: string; text: string } {
    const isArabic = language === 'ar';

    const formattedDate = date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = time.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isArabic) {
      return {
        subject: `تأكيد الموعد - ${confirmationNumber}`,
        text: `تم تأكيد موعدك للخدمة ${service.name} بتاريخ ${formattedDate} الساعة ${formattedTime}. رقم التأكيد: ${confirmationNumber}.`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 30px; margin: 20px 0; }
              .confirmation { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${tenant.companyInfo.nameAr || tenant.companyInfo.name}</h1>
              </div>
              <div class="content">
                <h2>عزيزي/عزيزتي ${customer.firstName} ${customer.lastName},</h2>
                <p>تم تأكيد موعدك بنجاح!</p>

                <div class="confirmation">
                  <h3>تفاصيل الموعد</h3>
                  <div class="detail"><strong>رقم التأكيد:</strong> ${confirmationNumber}</div>
                  <div class="detail"><strong>الخدمة:</strong> ${service.name}</div>
                  <div class="detail"><strong>التاريخ:</strong> ${formattedDate}</div>
                  <div class="detail"><strong>الوقت:</strong> ${formattedTime}</div>
                  <div class="detail"><strong>المدة المقدرة:</strong> ${service.estimatedDuration || 60} دقيقة</div>
                </div>

                <p><strong>يرجى الاحتفاظ برقم التأكيد للرجوع إليه.</strong></p>

                <p>إذا كنت بحاجة إلى إلغاء أو إعادة جدولة موعدك، يرجى الاتصال بنا على:</p>
                <p>الهاتف: ${tenant.companyInfo.phone || 'غير متوفر'}</p>
              </div>
              <div class="footer">
                <p>شكراً لاختيارك ${tenant.companyInfo.nameAr || tenant.companyInfo.name}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    }

    return {
      subject: `Appointment Confirmation - ${confirmationNumber}`,
      text: `Your appointment for ${service.name} is confirmed on ${formattedDate} at ${formattedTime}. Confirmation #${confirmationNumber}.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; margin: 20px 0; }
            .confirmation { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${tenant.companyInfo.name}</h1>
            </div>
            <div class="content">
              <h2>Dear ${customer.firstName} ${customer.lastName},</h2>
              <p>Your appointment has been confirmed successfully!</p>

              <div class="confirmation">
                <h3>Appointment Details</h3>
                <div class="detail"><strong>Confirmation Number:</strong> ${confirmationNumber}</div>
                <div class="detail"><strong>Service:</strong> ${service.name}</div>
                <div class="detail"><strong>Date:</strong> ${formattedDate}</div>
                <div class="detail"><strong>Time:</strong> ${formattedTime}</div>
                <div class="detail"><strong>Estimated Duration:</strong> ${service.estimatedDuration || 60} minutes</div>
              </div>

              <p><strong>Please keep your confirmation number for reference.</strong></p>

              <p>If you need to cancel or reschedule your appointment, please contact us at:</p>
              <p>Phone: ${tenant.companyInfo.phone || 'Not available'}</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing ${tenant.companyInfo.name}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  /**
   * Generate admin notification email
   */
  private static generateAdminNotificationEmail(
    customer: ICustomer,
    tenant: ITenant,
    service: IService,
    date: Date,
    time: Date,
    confirmationNumber: string,
    requiresApproval: boolean
  ): { subject: string; html: string; text: string } {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const status = requiresApproval ? 'PENDING APPROVAL' : 'CONFIRMED';

    return {
      subject: `New Online Booking ${requiresApproval ? '(Approval Required)' : ''} - ${confirmationNumber}`,
      text: `New booking ${confirmationNumber} for ${service.name} on ${formattedDate} at ${formattedTime}. Customer: ${customer.firstName} ${customer.lastName}. Status: ${status}.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; margin: 20px 0; }
            .booking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
            .status { padding: 10px; background: ${requiresApproval ? '#fef3c7' : '#d1fae5'};
                     color: ${requiresApproval ? '#92400e' : '#065f46'};
                     border-radius: 4px; text-align: center; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Online Booking Received</h1>
            </div>
            <div class="content">
              <div class="status">${status}</div>

              <div class="booking-info">
                <h3>Booking Details</h3>
                <div class="detail"><strong>Confirmation Number:</strong> ${confirmationNumber}</div>
                <div class="detail"><strong>Service:</strong> ${service.name}</div>
                <div class="detail"><strong>Date:</strong> ${formattedDate}</div>
                <div class="detail"><strong>Time:</strong> ${formattedTime}</div>

                <h3 style="margin-top: 20px;">Customer Information</h3>
                <div class="detail"><strong>Name:</strong> ${customer.firstName} ${customer.lastName}</div>
                <div class="detail"><strong>Email:</strong> ${customer.email}</div>
                <div class="detail"><strong>Phone:</strong> ${customer.phone}</div>
              </div>

              ${
                requiresApproval
                  ? '<p><strong>⚠️ This booking requires your approval. Please log in to the admin panel to approve or reject it.</strong></p>'
                  : '<p>This booking has been automatically confirmed.</p>'
              }
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
}
