import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    // Since we only need one settings document, we can use a fixed ID or just findOne()
    geminiApiKey: { type: String, default: '' },
    aiPrompt: { type: String, default: '' },
    selectedModel: { type: String, default: 'gemini-2.0-flash' },
    generatedPostCount: { type: Number, default: 50 },
    updatedAt: { type: Date, default: Date.now }
});

// We'll treat this as a singleton configuration
export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
