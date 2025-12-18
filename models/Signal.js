import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true }, // اسم الزوج مثلا GOLD
  type: { type: String, required: true }, // بيع او شراء
  imageUrl: { type: String, required: true }, // رابط الصورة
  telegramMessageId: { type: String }, // معرف رسالة تليجرام للحذف
  isVip: { type: Boolean, default: false }, // هل التوصية حصرية للـ VIP
  aiContent: { type: String }, // النص الذي تم توليده بواسطة AI
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);