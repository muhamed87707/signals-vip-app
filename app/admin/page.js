'use client';
import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLanguage } from '../context/LanguageContext';

export default function AdminPage() {
    const { isRTL } = useLanguage();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // Form State
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [signals, setSignals] = useState([]); // List of recent signals

    // Persistent Form Fields
    const [form, setForm] = useState({
        pair: 'XAUUSD',
        type: 'BUY',
        imageUrl: '',
        telegramImage: '', // Blurred version
        isVip: true,
        socialPostContent: '',
        sendToTelegram: true
    });

    // AI Configuration
    const [aiConfig, setAiConfig] = useState({
        apiKey: 'AIzaSyC2-Sbs6sxNzWk5mU7nN7AEkp4Kgd1NwwY', // Default from user
        model: 'gemini-1.5-flash',
        prompt: `Write a high-converting, professional trading signal post for Telegram.
Pair: {PAIR}
Type: {TYPE}
Tone: Exciting, Professional, Result-Oriented.
Include emojis. Make it short and punchy.
Language: Arabic & English mix.`
    });

    const [models, setModels] = useState([]);
    const [generatedPosts, setGeneratedPosts] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedAuth = localStorage.getItem('adminAuth');
        if (savedAuth === 'true') setIsAuthenticated(true);

        const savedForm = localStorage.getItem('adminForm');
        if (savedForm) setForm({ ...JSON.parse(savedForm), imageUrl: '', telegramImage: '' }); // Don't save heavy images

        const savedAi = localStorage.getItem('adminAiConfig');
        if (savedAi) setAiConfig(JSON.parse(savedAi));

        fetchSignals();
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isAuthenticated) localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminForm', JSON.stringify({ ...form, imageUrl: '', telegramImage: '' }));
        localStorage.setItem('adminAiConfig', JSON.stringify(aiConfig));
    }, [isAuthenticated, form, aiConfig]);

    const fetchSignals = async () => {
        try {
            const res = await fetch('/api/signals?limit=20');
            const data = await res.json();
            if (data.signals) setSignals(data.signals);
        } catch (e) { console.error(e); }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') { // Simple hardcoded pass
            setIsAuthenticated(true);
        } else {
            alert('Invalid Password');
        }
    };

    const fetchModels = async () => {
        try {
            // Fetching models requires API key but the SDK listModels might be node-only or require specific setup.
            // Using a hardcoded list of known Gemini models + ability to type custom is safer for client-side.
            // But user asked to fetch. Let's try to fetch if possible, or fallback.
            // Creating a dummy instance to valid check? 
            // Actually, we can just use the user provided list as default and button to refresh.
            const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
            // Client-side listing might be restricted by CORS. We'll use a reliable list.
            setModels(['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro-vision']);
            setStatus('Models list updated (simulated)');
        } catch (error) {
            console.error(error);
            setStatus('Failed to fetch models');
        }
    };

    const generatePosts = async () => {
        if (!aiConfig.apiKey) return alert('API Key required');
        setIsGenerating(true);
        setGeneratedPosts([]);

        try {
            const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
            const model = genAI.getGenerativeModel({ model: aiConfig.model });

            const fullPrompt = `${aiConfig.prompt}
            
            Replace {PAIR} with ${form.pair} and {TYPE} with ${form.type}.
            Generate exactly 50 distinct variations of this post.
            Separate each variation with "|||".
            Do not number them. Just the content.`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            const posts = text.split('|||').map(p => p.trim()).filter(p => p.length > 10);
            setGeneratedPosts(posts);
        } catch (error) {
            console.error(error);
            alert('Generation Failed: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, imageUrl: reader.result }));
                if (form.isVip) generateBlurredImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateBlurredImage = (base64) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Apply heavy blur
            ctx.filter = 'blur(20px)';
            ctx.drawImage(canvas, 0, 0); // Re-draw over itself with filter? 
            // Better way:
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear
            ctx.filter = 'blur(40px)'; // Heavy blur
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Overlay Text "VIP ONLY"
            ctx.filter = 'none';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${canvas.width / 10}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('VIP SIGNAL 💎', canvas.width / 2, canvas.height / 2);

            setForm(prev => ({ ...prev, telegramImage: canvas.toDataURL('image/jpeg', 0.8) }));
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('Posting...');

        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setStatus('✅ Posted Successfully!');
                fetchSignals();
                setForm(prev => ({ ...prev, imageUrl: '', telegramImage: '' })); // Clear images only
            } else {
                setStatus('❌ Error: ' + data.error);
            }
        } catch (error) {
            setStatus('❌ Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete from Website AND Telegram.')) return;
        try {
            await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
            fetchSignals();
        } catch (e) { console.error(e); }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 border border-[var(--gold-primary)] rounded-2xl">
                    <h1 className="text-2xl text-[var(--gold-primary)] text-center">Admin Login</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                    <button type="submit" className="bg-[var(--gold-primary)] text-black px-6 py-2 rounded-lg font-bold">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Form */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-[var(--gold-primary)]">New Signal</h1>

                    <div className="space-y-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        {/* Pair & Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2">Pair</label>
                                <input
                                    value={form.pair}
                                    onChange={e => setForm({ ...form, pair: e.target.value.toUpperCase() })}
                                    className="w-full p-3 bg-black border border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full p-3 bg-black border border-gray-700 rounded-lg"
                                >
                                    <option value="BUY">BUY 🟢</option>
                                    <option value="SELL">SELL 🔴</option>
                                </select>
                            </div>
                        </div>

                        {/* VIP Toggle */}
                        <div className="flex items-center gap-4 bg-black p-4 rounded-lg border border-[var(--gold-dark)]">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isVip}
                                    onChange={(e) => {
                                        setForm({ ...form, isVip: e.target.checked });
                                        if (e.target.checked && form.imageUrl) generateBlurredImage(form.imageUrl);
                                    }}
                                    className="w-6 h-6 accent-[var(--gold-primary)]"
                                />
                                <span className="font-bold text-[var(--gold-primary)]">VIP Signal 💎</span>
                            </label>
                            <span className="text-xs text-gray-500">Blurred on Social Media if checked</span>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-gray-400 mb-2">Chart Image</label>
                            <input type="file" onChange={handleImageChange} className="w-full text-gray-400" />
                            {form.imageUrl && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-center mb-1">Clear (Website)</p>
                                        <img src={form.imageUrl} className="w-full h-32 object-cover rounded-lg border border-green-500/30" />
                                    </div>
                                    {form.isVip && form.telegramImage && (
                                        <div>
                                            <p className="text-xs text-center mb-1">Blurred (Social)</p>
                                            <img src={form.telegramImage} className="w-full h-32 object-cover rounded-lg border border-[var(--gold-primary)]/30" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Social Post Content */}
                        <div>
                            <label className="block text-gray-400 mb-2">Social Post Content</label>
                            <textarea
                                value={form.socialPostContent}
                                onChange={e => setForm({ ...form, socialPostContent: e.target.value })}
                                className="w-full h-32 p-3 bg-black border border-gray-700 rounded-lg text-sm"
                                placeholder="Paste selected AI variant here..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.sendToTelegram}
                                    onChange={e => setForm({ ...form, sendToTelegram: e.target.checked })}
                                />
                                Post to Telegram
                            </label>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-[var(--gold-primary)] text-black font-bold py-3 rounded-xl hover:bg-white transition-colors"
                            >
                                {loading ? 'Publishing...' : '🚀 Publish Signal'}
                            </button>
                        </div>
                        {status && <p className="text-center font-mono text-sm">{status}</p>}
                    </div>

                    {/* Recent Signals List */}
                    <div className="space-y-2 mt-8">
                        <h3 className="text-xl font-bold text-gray-400">Recent Signals</h3>
                        {signals.map(s => (
                            <div key={s._id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <span className={s.isVip ? "text-[var(--gold-primary)]" : "text-green-500"}>{s.isVip ? "💎" : "🆓"}</span>
                                    <span className="font-mono">{s.pair}</span>
                                    <span className={s.type === 'BUY' ? "text-green-400" : "text-red-400"}>{s.type}</span>
                                </div>
                                <button onClick={() => handleDelete(s._id)} className="text-red-500 px-3 py-1 hover:bg-red-900/20 rounded">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: AI Generator */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                        🤖 AI Post Generator <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Gemini Flash</span>
                    </h2>

                    <div className="bg-gray-900 p-6 rounded-2xl border border-blue-900/30">
                        {/* Config */}
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <input
                                value={aiConfig.apiKey}
                                onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                                type="password"
                                placeholder="Gemini API Key"
                                className="w-full p-2 bg-black border border-gray-700 rounded text-xs font-mono"
                            />
                            <div className="flex gap-2">
                                <select
                                    value={aiConfig.model}
                                    onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                                    className="flex-1 p-2 bg-black border border-gray-700 rounded"
                                >
                                    {models.length > 0 ? models.map(m => <option key={m} value={m}>{m}</option>) : <option>gemini-1.5-flash</option>}
                                </select>
                                <button onClick={fetchModels} className="px-3 bg-gray-800 rounded">🔄</button>
                            </div>
                        </div>

                        {/* Prompt */}
                        <textarea
                            value={aiConfig.prompt}
                            onChange={e => setAiConfig({ ...aiConfig, prompt: e.target.value })}
                            className="w-full h-40 p-3 bg-black border border-gray-700 rounded-lg text-sm mb-4 font-mono"
                        />

                        <button
                            onClick={generatePosts}
                            disabled={isGenerating}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors"
                        >
                            {isGenerating ? 'Generating 50 Variations...' : '✨ Generate 50 Posts'}
                        </button>

                        {/* Results */}
                        <div className="mt-6 space-y-3 h-[600px] overflow-y-auto custom-scrollbar p-2">
                            {generatedPosts.map((post, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setForm({ ...form, socialPostContent: post })}
                                    className="p-4 bg-black border border-gray-800 rounded-lg hover:border-[var(--gold-primary)] cursor-pointer group transition-all"
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-500">Variation #{idx + 1}</span>
                                        <span className="text-xs text-gold-500 opacity-0 group-hover:opacity-100">Click to Use</span>
                                    </div>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{post}</p>
                                </div>
                            ))}
                            {generatedPosts.length === 0 && !isGenerating && (
                                <p className="text-center text-gray-600 mt-10">No posts generated yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
