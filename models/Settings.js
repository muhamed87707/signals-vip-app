import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    // AI Settings
    geminiApiKey: { type: String, default: '' },
    aiPrompt: { type: String, default: '' },
    selectedModel: { type: String, default: 'gemini-2.0-flash' },
    generatedPostCount: { type: Number, default: 50 },
    
    // Twitter/X Settings
    twitterApiKey: { type: String, default: '' },
    twitterApiSecret: { type: String, default: '' },
    twitterAccessToken: { type: String, default: '' },
    twitterAccessSecret: { type: String, default: '' },
    
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
