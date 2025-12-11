import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true }, // اسم الزوج مثلا GOLD
  type: { type: String, required: true }, // بيع او شراء
  imageUrl: { type: String, required: true }, // رابط الصورة
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);