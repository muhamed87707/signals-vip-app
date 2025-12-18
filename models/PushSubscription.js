import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: String,
        auth: String
    },
    telegramId: { type: String, default: null }, // Optional: link to user if logged in
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);
