import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true }, // اسم الزوج مثلا GOLD
  type: { type: String, required: true }, // بيع او شراء
  imageUrl: { type: String, required: true }, // رابط الصورة
  isVip: { type: Boolean, default: true }, // VIP (مموهة) أو عامة مجانية
  customPost: { type: String }, // المنشور المخصص للسوشيال ميديا
  telegramMessageId: { type: String }, // معرف رسالة تليجرام للحذف
  socialMediaPosts: { // لتتبع رسائل كل المنصات للحذف
    telegram: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);
