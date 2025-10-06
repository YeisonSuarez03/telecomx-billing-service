import mongoose from 'mongoose';

const { Schema } = mongoose;

const AddressSchema = new Schema({
  city: { type: String },
  country: { type: String },
  zipCode: { type: String },
  address: { type: String }
}, { _id: false });

const PhoneSchema = new Schema({
  codeNumber: { type: String, default: '+57' },
  phoneNumber: { type: Number }
}, { _id: false });

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  address: { type: AddressSchema },
  phoneNumber: { type: PhoneSchema },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
