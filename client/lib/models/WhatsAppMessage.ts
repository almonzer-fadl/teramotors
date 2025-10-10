import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsAppMessage extends Document {
  customerId: mongoose.Types.ObjectId;
  messageType: 'welcome' | 'job_started' | 'job_completed' | 'invoice_ready' | 'advertisement';
  content: string;
  mediaUrl?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  twilioMessageId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  language: 'ar' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  messageType: {
    type: String,
    enum: ['welcome', 'job_started', 'job_completed', 'invoice_ready', 'advertisement'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  twilioMessageId: {
    type: String
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  errorMessage: {
    type: String
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  }
}, {
  timestamps: true
});

export default mongoose.models.WhatsAppMessage || mongoose.model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);
