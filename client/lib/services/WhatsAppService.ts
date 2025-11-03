import WhatsAppMessage from '@/lib/models/WhatsAppMessage';
import Customer from '@/lib/models/Customer';
import { WahaService } from './WahaService';

// Waha configuration
const wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
const wahaApiKey = process.env.WAHA_API_KEY;
const wahaSessionName = process.env.WAHA_SESSION_NAME || 'teramotors';

// Initialize Waha client
const wahaClient = new WahaService({
  apiUrl: wahaApiUrl,
  apiKey: wahaApiKey,
  sessionName: wahaSessionName
});

export class WhatsAppService {
  private static instance: WhatsAppService;

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Message templates in Arabic
  private getMessageTemplates() {
    return {
      welcome: {
        ar: 'مرحباً بك في تيرا موتورز! 🚗\n\nشكراً لثقتك في خدماتنا. سنبدأ العمل على سيارتك قريباً وسنخبرك بكل التحديثات.\n\nلأي استفسار، لا تتردد في التواصل معنا.',
        en: 'Welcome to Tera Motors! 🚗\n\nThank you for trusting our services. We will start working on your car soon and keep you updated.\n\nFor any inquiries, feel free to contact us.'
      },
      job_started: {
        ar: 'تم بدء العمل على سيارتك! 🔧\n\nفريقنا المختص بدأ العمل على سيارتك الآن. سنخبرك فور الانتهاء.\n\nشكراً لصبرك!',
        en: 'We started working on your car! 🔧\n\nOur expert team has started working on your car now. We will notify you as soon as we are done.\n\nThank you for your patience!'
      },
      job_completed: {
        ar: 'تم الانتهاء من سيارتك! ✅\n\nسيارتك جاهزة للاستلام. يمكنك الحضور لاستلامها في أي وقت مناسب لك.\n\nنتطلع لرؤيتك قريباً!',
        en: 'Your car is ready! ✅\n\nYour car is ready for pickup. You can come to collect it at any convenient time.\n\nWe look forward to seeing you soon!'
      },
      invoice_ready: {
        ar: 'فاتورتك جاهزة! 📄\n\nتم إنشاء فاتورتك ويمكنك مراجعتها. شكراً لاختيارك خدماتنا.\n\nنتطلع لخدمتك مرة أخرى!',
        en: 'Your invoice is ready! 📄\n\nYour invoice has been created and you can review it. Thank you for choosing our services.\n\nWe look forward to serving you again!'
      },
      advertisement: {
        ar: 'شكراً لثقتك في تيرا موتورز! 🙏\n\nنحن متخصصون في:\n• صيانة السيارات\n• إصلاح المحركات\n• تغيير الزيوت\n• فحص شامل\n\n📞 للاستفسارات: [رقم الهاتف]\n📍 العنوان: [العنوان]\n\nنتطلع لخدمتك مرة أخرى!',
        en: 'Thank you for trusting Tera Motors! 🙏\n\nWe specialize in:\n• Car maintenance\n• Engine repair\n• Oil changes\n• Comprehensive inspection\n\n📞 For inquiries: [Phone Number]\n📍 Address: [Address]\n\nWe look forward to serving you again!'
      }
    };
  }

  // Get customer's WhatsApp number
  private async getCustomerWhatsApp(customerId: string): Promise<string | null> {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer || !customer.phoneNumber) {
        return null;
      }
      
      // Format phone number for WhatsApp (ensure it starts with +966)
      let phoneNumber = customer.phoneNumber;
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+966' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+966' + phoneNumber;
      }
      
      return phoneNumber;
    } catch (error) {
      console.error('Error getting customer WhatsApp:', error);
      return null;
    }
  }

  // Send WhatsApp message via Waha
  public async sendMessage(
    customerId: string,
    messageType: 'welcome' | 'job_started' | 'job_completed' | 'invoice_ready' | 'advertisement',
    language: 'ar' | 'en' = 'ar',
    mediaUrl?: string
  ): Promise<boolean> {
    try {
      const customerWhatsApp = await this.getCustomerWhatsApp(customerId);
      if (!customerWhatsApp) {
        console.error('Customer WhatsApp number not found');
        return false;
      }

      const templates = this.getMessageTemplates();
      const content = templates[messageType][language];

      // Create message record in database
      const messageRecord = new WhatsAppMessage({
        customerId,
        messageType,
        content,
        mediaUrl,
        language,
        status: 'pending'
      });
      await messageRecord.save();

      // Format phone number for Waha (remove + and add @c.us)
      const chatId = wahaClient.formatPhoneNumber(customerWhatsApp);

      // Send message via Waha
      const response = await wahaClient.sendTextMessage(chatId, content);
      const messageId = wahaClient.extractMessageId(response);

      // Update message record with Waha response
      await WhatsAppMessage.findByIdAndUpdate(messageRecord._id, {
        wahaMessageId: messageId,
        status: 'sent',
        sentAt: new Date()
      });

      console.log(`WhatsApp message sent via Waha: ${messageId}`);
      return true;

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);

      // Update message record with error
      if (customerId) {
        await WhatsAppMessage.findOneAndUpdate(
          { customerId, messageType, status: 'pending' },
          {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }

      return false;
    }
  }

  // Schedule advertisement message (24 hours after invoice)
  public async scheduleAdvertisement(customerId: string, language: 'ar' | 'en' = 'ar'): Promise<void> {
    try {
      // Schedule the message for 24 hours later
      setTimeout(async () => {
        await this.sendMessage(customerId, 'advertisement', language);
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
      console.log(`Advertisement message scheduled for customer ${customerId}`);
    } catch (error) {
      console.error('Error scheduling advertisement:', error);
    }
  }

  // Get message status (Waha handles this via webhooks, but keeping for compatibility)
  public async updateMessageStatus(messageId: string): Promise<void> {
    try {
      // With Waha, status updates come via webhooks
      // This method is kept for backward compatibility
      console.log(`Status check for message ${messageId} - handled by Waha webhooks`);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  // Get message history for a customer
  public async getCustomerMessages(customerId: string): Promise<any[]> {
    try {
      return await WhatsAppMessage.find({ customerId })
        .sort({ createdAt: -1 })
        .populate('customerId', 'firstName lastName phoneNumber');
    } catch (error) {
      console.error('Error getting customer messages:', error);
      return [];
    }
  }
}
