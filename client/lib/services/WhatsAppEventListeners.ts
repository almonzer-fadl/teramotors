import { WhatsAppService } from './WhatsAppService';
import Customer from '@/lib/models/Customer';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';

export class WhatsAppEventListeners {
  private static instance: WhatsAppEventListeners;

  public static getInstance(): WhatsAppEventListeners {
    if (!WhatsAppEventListeners.instance) {
      WhatsAppEventListeners.instance = new WhatsAppEventListeners();
    }
    return WhatsAppEventListeners.instance;
  }

  // Generic helper to send a message
  private async sendMessage(customerId: string, messageBody: string): Promise<void> {
    try {
      const customer = await Customer.findById(customerId).lean();
      if (!customer || !customer.whatsappEnabled || !customer.phoneNumber || !customer.tenantId) {
        console.log(`[WhatsApp Event] Cannot send message: Customer ${customerId} has WhatsApp disabled, or phone/tenant is missing.`);
        return;
      }

      await WhatsAppService.sendMessage(
        customer.tenantId.toString(),
        customerId,
        customer.phoneNumber,
        messageBody
      );

      console.log(`[WhatsApp Event] Message sent to customer ${customerId}`);
    } catch (error) {
      console.error(`[WhatsApp Event] Error sending message to customer ${customerId}:`, error);
      // We don't re-throw here to prevent a failed WhatsApp message from crashing a core business logic flow.
    }
  }

  // Customer created - Send welcome message
  public async onCustomerCreated(customerId: string): Promise<void> {
    const customer = await Customer.findById(customerId).select('firstName').lean();
    if(!customer) return;
    const message = `Welcome, ${customer.firstName}! We are happy to have you as a customer at our workshop.`;
    await this.sendMessage(customerId, message);
  }

  // Job card opened - Send job started message
  public async onJobCardOpened(customerId: string, jobCardId: string): Promise<void> {
      const jobCard = await JobCard.findById(jobCardId).select('jobCardNumber').lean();
      if(!jobCard) return;
      const message = `An update on your vehicle: Job Card #${jobCard.jobCardNumber} has been opened and work is starting now.`;
      await this.sendMessage(customerId, message);
  }

  // Job card closed - Send job completed message
  public async onJobCardClosed(customerId: string, jobCardId: string): Promise<void> {
    const jobCard = await JobCard.findById(jobCardId).select('jobCardNumber').lean();
    if(!jobCard) return;
    const message = `Great news! Work on your vehicle (Job Card #${jobCard.jobCardNumber}) is complete. We will notify you again when the invoice is ready.`;
    await this.sendMessage(customerId, message);
  }

  // Invoice created - Send invoice ready message
  public async onInvoiceCreated(customerId: string, invoiceId: string): Promise<void> {
    const invoice = await Invoice.findById(invoiceId).select('invoiceNumber totalAmount').lean();
    if(!invoice) return;
    const message = `Your invoice #${invoice.invoiceNumber} for a total of ${invoice.totalAmount} SAR is ready. You can view it here: ${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${invoiceId}`;
    await this.sendMessage(customerId, message);
  }
}

