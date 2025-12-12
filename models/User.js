import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  isVip: { type: Boolean, default: false }, // هل هو مشترك أم لا
  subscriptionEndDate: { type: Date, default: null }, // تاريخ انتهاء الاشتراك (null = مدى الحياة إذا كان isVip=true)
  name: String,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);