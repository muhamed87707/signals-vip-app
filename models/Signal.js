import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  type: { type: String, required: true }, // VIP or REGULAR
  imageUrl: { type: String, required: false }, // Clear image
  blurredImageUrl: { type: String, required: false }, // Blurred image for VIP
  isVip: { type: Boolean, default: false },
  customPost: { type: String },
  publishedToWebsite: { type: Boolean, default: false },
  telegramMessageId: { type: String },
  telegramButtonType: { type: String, default: 'view_signal' },
  twitterTweetId: { type: String },
  socialMediaPosts: {
    telegram: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);
