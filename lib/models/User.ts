import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // Will be securely hashed
  subscription: {
    tier: { type: String, enum: ['Free Trial', 'Pro Plan Monthly', 'Yearly Max Plan'], default: 'Free Trial' },
    activationDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);