import crypto from 'crypto';
import Customer from '@/lib/models/Customer';
import { sendEmail } from '@/lib/email';

export class CustomerPortalAuth {
  /**
   * Generate a 6-digit OTP code
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send OTP to customer email
   */
  static async sendOTP(
    customer: any,
    tenant: any,
    otp: string
  ): Promise<void> {
    const isArabic = customer.language === 'ar';

    const subject = isArabic
      ? `رمز التحقق الخاص بك - ${tenant.companyInfo.name}`
      : `Your Verification Code - ${tenant.companyInfo.name}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: ${isArabic ? 'Arial, sans-serif' : 'system-ui, -apple-system, sans-serif'};
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #F97402, #F13F33);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .otp-box {
            background: linear-gradient(135deg, rgba(249, 116, 2, 0.1), rgba(241, 63, 51, 0.1));
            border: 2px solid rgba(249, 116, 2, 0.3);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #F97402;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${tenant.companyInfo.name}</div>
            <h1>${isArabic ? 'رمز التحقق' : 'Verification Code'}</h1>
          </div>

          <p>
            ${isArabic
              ? `مرحباً ${customer.firstName} ${customer.lastName},`
              : `Hello ${customer.firstName} ${customer.lastName},`
            }
          </p>

          <p>
            ${isArabic
              ? 'استخدم رمز التحقق التالي للوصول إلى بوابة العملاء الخاصة بك:'
              : 'Use the following verification code to access your customer portal:'
            }
          </p>

          <div class="otp-box">
            <div>${isArabic ? 'رمز التحقق' : 'Your Code'}</div>
            <div class="otp-code">${otp}</div>
            <div style="color: #666; margin-top: 10px;">
              ${isArabic ? 'صالح لمدة 10 دقائق' : 'Valid for 10 minutes'}
            </div>
          </div>

          <div class="warning">
            <strong>${isArabic ? '⚠️ تحذير أمني:' : '⚠️ Security Warning:'}</strong>
            <p style="margin: 5px 0 0 0;">
              ${isArabic
                ? 'لا تشارك هذا الرمز مع أي شخص. لن نطلب منك أبداً مشاركة رمز التحقق عبر الهاتف أو البريد الإلكتروني.'
                : 'Never share this code with anyone. We will never ask you to share your verification code via phone or email.'
              }
            </p>
          </div>

          <p>
            ${isArabic
              ? 'إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.'
              : 'If you did not request this code, please ignore this email.'
            }
          </p>

          <div class="footer">
            <p>
              ${isArabic ? 'شكراً لك' : 'Thank you'}<br>
              <strong>${tenant.companyInfo.name}</strong>
            </p>
            ${tenant.companyInfo.phone
              ? `<p>${isArabic ? 'للمساعدة:' : 'For help:'} ${tenant.companyInfo.phone}</p>`
              : ''
            }
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: customer.email,
      subject,
      text: isArabic
        ? `رمز التحقق الخاص بك هو: ${otp}. صالح لمدة 10 دقائق.`
        : `Your verification code is: ${otp}. Valid for 10 minutes.`,
      html: htmlContent
    });
  }

  /**
   * Verify OTP and create session
   */
  static async verifyOTP(
    customerId: string,
    otp: string
  ): Promise<{ success: boolean; token?: string; expiresAt?: Date }> {
    const customer = await Customer.findById(customerId);

    if (!customer || !customer.portalAccess?.otpSecret) {
      return { success: false };
    }

    // Check if OTP matches
    if (customer.portalAccess.otpSecret !== otp) {
      return { success: false };
    }

    // Check if OTP is expired (10 minutes)
    const otpAge = Date.now() - customer.portalAccess.otpCreatedAt.getTime();
    if (otpAge > 10 * 60 * 1000) {
      return { success: false };
    }

    // Generate session token
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update customer with session
    customer.portalAccess.sessionToken = sessionToken;
    customer.portalAccess.sessionExpiry = expiresAt;
    customer.portalAccess.lastLogin = new Date();
    customer.portalAccess.otpSecret = undefined; // Clear OTP
    await customer.save();

    return {
      success: true,
      token: sessionToken,
      expiresAt
    };
  }

  /**
   * Validate session token
   */
  static async validateSession(
    customerId: string,
    sessionToken: string
  ): Promise<boolean> {
    const customer = await Customer.findById(customerId);

    if (!customer || !customer.portalAccess?.sessionToken) {
      return false;
    }

    // Check if token matches
    if (customer.portalAccess.sessionToken !== sessionToken) {
      return false;
    }

    // Check if session is expired
    if (customer.portalAccess.sessionExpiry < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Logout and clear session
   */
  static async logout(customerId: string): Promise<void> {
    await Customer.findByIdAndUpdate(customerId, {
      $set: {
        'portalAccess.sessionToken': null,
        'portalAccess.sessionExpiry': null
      }
    });
  }
}
