import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  isVip: { type: Boolean, default: false }, // هل هو مشترك أم لا
  vipStartDate: { type: Date },
  vipExpiryDate: { type: Date },
  notes: { type: String },
  name: String,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);