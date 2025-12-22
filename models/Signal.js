import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  type: { type: String, required: true },
  imageUrl: { type: String, required: false },
  isVip: { type: Boolean, default: true },
  customPost: { type: String },
  telegramMessageId: { type: String },
  telegramButtonType: { type: String, default: 'view_signal' },
  twitterTweetId: { type: String }, // New: Twitter tweet ID
  socialMediaPosts: {
    telegram: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);
