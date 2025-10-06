import mongoose from 'mongoose';
import { PhoneSchema } from './User';

const { Schema } = mongoose;

const BillingSchema = new Schema({
  userId: { type: String, required: true, index: true },
  billingId: { type: String, required: true, unique: true },
  generationDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  serviceId: { type: String },
  totalInvoice: { type: Number },
  isPaid: { type: Boolean, default: false },
  paymentDate: { type: Date, default: null },
  phoneNumber: { type: PhoneSchema },
}, { timestamps: true });

export default mongoose.model('Billing', BillingSchema);
