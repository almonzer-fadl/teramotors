import { WhatsAppService } from './WhatsAppService';
import Customer from '@/lib/models/Customer';

export class WhatsAppEventListeners {
  private static instance: WhatsAppEventListeners;
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = WhatsAppService.getInstance();
  }

  public static getInstance(): WhatsAppEventListeners {
    if (!WhatsAppEventListeners.instance) {
      WhatsAppEventListeners.instance = new WhatsAppEventListeners();
    }
    return WhatsAppEventListeners.instance;
  }

  // Customer created - Send welcome message
  public async onCustomerCreated(customerId: string): Promise<void> {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer || !customer.whatsappEnabled) {
        return;
      }

      const language = customer.language || 'ar';
      await this.whatsappService.sendMessage(
        customerId, 
        'welcome', 
        language
      );

      console.log(`Welcome message sent to customer ${customerId}`);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  // Job card opened - Send job started message
  public async onJobCardOpened(customerId: string): Promise<void> {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer || !customer.whatsappEnabled) {
        return;
      }

      const language = customer.language || 'ar';
      await this.whatsappService.sendMessage(
        customerId, 
        'job_started', 
        language
      );

      console.log(`Job started message sent to customer ${customerId}`);
    } catch (error) {
      console.error('Error sending job started message:', error);
    }
  }

  // Job card closed - Send job completed message
  public async onJobCardClosed(customerId: string): Promise<void> {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer || !customer.whatsappEnabled) {
        return;
      }

      const language = customer.language || 'ar';
      await this.whatsappService.sendMessage(
        customerId, 
        'job_completed', 
        language
      );

      console.log(`Job completed message sent to customer ${customerId}`);
    } catch (error) {
      console.error('Error sending job completed message:', error);
    }
  }

  // Invoice created - Send invoice ready message
  public async onInvoiceCreated(customerId: string, invoiceId?: string): Promise<void> {
    try {
      console.log(`[WhatsApp Event] onInvoiceCreated called for customer ${customerId}, invoice ${invoiceId}`);

      const customer = await Customer.findById(customerId);

      if (!customer) {
        console.log(`[WhatsApp Event] Customer ${customerId} not found`);
        return;
      }

      console.log(`[WhatsApp Event] Customer found: ${customer.firstName} ${customer.lastName}, whatsappEnabled: ${customer.whatsappEnabled}, phone: ${customer.phoneNumber}`);

      if (!customer.whatsappEnabled) {
        console.log(`[WhatsApp Event] WhatsApp is disabled for customer ${customerId}`);
        return;
      }

      const language = customer.language || 'ar';
      console.log(`[WhatsApp Event] Sending invoice ready message in ${language} with invoice link: ${invoiceId || 'none'}`);

      // Send invoice ready message with invoice link
      await this.whatsappService.sendMessage(
        customerId,
        'invoice_ready',
        language,
        undefined,
        invoiceId
      );

      // Schedule advertisement message for 24 hours later
      await this.whatsappService.scheduleAdvertisement(customerId, language);

      console.log(`[WhatsApp Event] Invoice ready message sent to customer ${customerId}`);
      console.log(`[WhatsApp Event] Advertisement message scheduled for customer ${customerId}`);
    } catch (error) {
      console.error('[WhatsApp Event] Error sending invoice ready message:', error);
      throw error; // Re-throw to see the error in the invoice creation route
    }
  }

  // Test message - Send test message to customer
  public async sendTestMessage(customerId: string, messageType: string): Promise<boolean> {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer || !customer.whatsappEnabled) {
        return false;
      }

      const language = customer.language || 'ar';
      const success = await this.whatsappService.sendMessage(
        customerId, 
        messageType as any, 
        language
      );

      return success;
    } catch (error) {
      console.error('Error sending test message:', error);
      return false;
    }
  }
}
