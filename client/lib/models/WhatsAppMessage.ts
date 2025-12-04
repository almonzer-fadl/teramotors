import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsAppMessage extends Document {
  tenantId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  phoneNumber: string;
  body: string;
  status: 'sent' | 'failed' | 'delivered'; // Simplified status
  errorMessage?: string;
  sentAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  phoneNumber: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed', 'delivered'], required: true },
  errorMessage: { type: String },
  sentAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

WhatsAppMessageSchema.index({ tenantId: 1, sentAt: -1 });
WhatsAppMessageSchema.index({ tenantId: 1, customerId: 1 });

const WhatsAppMessage = mongoose.models.WhatsAppMessage || mongoose.model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);

export default WhatsAppMessage;