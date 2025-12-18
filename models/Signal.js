import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true }, // اسم الزوج مثلا GOLD
  type: { type: String, required: true }, // بيع او شراء
  imageUrl: { type: String, required: true }, // رابط الصورة
  isVip: { type: Boolean, default: true }, // هل التوصية VIP؟
  socialPostContent: { type: String }, // نص المنشور الاجتماعي
  socialPostIds: { type: mongoose.Schema.Types.Mixed }, // معرفات المنشورات (تليجرام وغيره)
  telegramMessageId: { type: String }, // معرف رسالة تليجرام للحذف (Legacy support)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);