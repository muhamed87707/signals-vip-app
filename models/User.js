import mongoose from 'mongoose';

// Generate a unique 8-character referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  isVip: { type: Boolean, default: false },
  subscriptionEndDate: { type: Date, default: null },
  name: String,
  // Referral Program Fields
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null }, // referralCode of the person who referred this user
  referralCount: { type: Number, default: 0 }, // Number of successful referrals
  referralRewardsEarned: { type: Number, default: 0 }, // Total free months earned
  pushSubscription: { type: Object, default: null }, // Store endpoint and keys
});

// Auto-generate referral code before saving if not exists
UserSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateReferralCode();
      const existing = await mongoose.models.User.findOne({ referralCode: code });
      if (!existing) isUnique = true;
    }
    this.referralCode = code;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);