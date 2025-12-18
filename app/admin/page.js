'use client';
import { useState, useEffect, useRef } from 'react';

const DEFAULT_API_KEY = 'AIzaSyC2-Sbs6sxNzWk5mU7nN7AEkp4Kgd1NwwY';
const DEFAULT_MODEL = 'gemini-1.5-flash';
const DEFAULT_PROMPT = `You are an expert Social Media Manager for a Premium Gold & Forex Trading Signal service.
Write a highly engaging, professional, and exciting post text for the following trading signal.
Use emojis, hashtags (#Gold #Forex #Trading), and persuasive language to encourage people to join our VIP channel.
Keep it concise but powerful.
Signal Details:
{DRAFT}
`;

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Signal State
    const [formData, setFormData] = useState({
        pair: 'GOLD',
        type: 'BUY',
        image: null,
        imgPreview: null,
        isVip: false
    });

    // AI State
    const [aiConfig, setAiConfig] = useState({
        apiKey: DEFAULT_API_KEY,
        model: DEFAULT_MODEL,
        availableModels: [],
        draft: 'GOLD BUY NOW @ 2030\nSL: 2025\nTP: 2040',
        prompt: DEFAULT_PROMPT,
        variations: [],
        selectedVariationIndex: -1
    });

    const [signals, setSignals] = useState([]);

    // Persistence
    useEffect(() => {
        const savedApi = localStorage.getItem('admin_apiKey');
        const savedModel = localStorage.getItem('admin_model');
        const savedDraft = localStorage.getItem('admin_draft');
        const savedPrompt = localStorage.getItem('admin_prompt');

        setAiConfig(prev => ({
            ...prev,
            apiKey: savedApi || DEFAULT_API_KEY,
            model: savedModel || DEFAULT_MODEL,
            draft: savedDraft || prev.draft,
            prompt: savedPrompt || DEFAULT_PROMPT
        }));

        fetchSignals();
    }, []);

    // Save on Change
    useEffect(() => {
        localStorage.setItem('admin_apiKey', aiConfig.apiKey);
        localStorage.setItem('admin_model', aiConfig.model);
        localStorage.setItem('admin_draft', aiConfig.draft);
        localStorage.setItem('admin_prompt', aiConfig.prompt);
    }, [aiConfig]);


    const fetchSignals = async () => {
        try {
            const res = await fetch('/api/signals?telegramId=admin');
            const data = await res.json();
            if (data.signals) setSignals(data.signals);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchModels = async () => {
        if (!aiConfig.apiKey) return alert('Enter API Key');
        setLoading(true);
        try {
            const res = await fetch(`/api/gemini/models?key=${aiConfig.apiKey}`);
            const data = await res.json();
            if (data.models) {
                setAiConfig(prev => ({ ...prev, availableModels: data.models }));
                setStatus('Models fetched!');
            } else {
                alert('Failed to fetch models: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const generateVariations = async () => {
        if (!aiConfig.apiKey || !aiConfig.draft) return alert('API Key and Draft are required');
        setLoading(true);
        setStatus('Generating 50 variations... this may take a moment...');

        const finalPrompt = aiConfig.prompt.replace('{DRAFT}', aiConfig.draft);

        try {
            const res = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: aiConfig.apiKey,
                    model: aiConfig.model,
                    prompt: finalPrompt,
                    count: 50
                })
            });
            const data = await res.json();
            if (data.variations) {
                setAiConfig(prev => ({ ...prev, variations: data.variations }));
                setStatus(`Generated ${data.variations.length} variations!`);
            } else {
                alert('Error: ' + (data.error || 'No variations returned'));
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Canvas Logic for Blurring
    const blurImage = async (imageFile) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw blurred
                ctx.filter = 'blur(40px)'; // Strong blur
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Overlay text
                ctx.filter = 'none';
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = `bold ${canvas.width / 10}px Arial`;
                ctx.fillStyle = '#FFD700';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('VIP ONLY 🔒', canvas.width / 2, canvas.height / 2);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result, imgPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.image) return alert('Please select an image');
        setLoading(true);
        setStatus('Publishing...');

        try {
            let telegramImage = null;

            // If VIP, generate blurred image for Telegram
            if (formData.isVip) {
                // We need the file object to create blob? No, we have base64 in formData.image
                // But blurImage logic used createObjectURL on file.
                // Let's refactor blurImage to take base64 string
                const img = new Image();
                img.src = formData.image;
                await img.decode(); // Wait for load

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                ctx.filter = 'blur(50px)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                ctx.filter = 'none';
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = `bold ${canvas.width / 8}px sans-serif`;
                ctx.fillStyle = '#FFD700'; // Gold
                ctx.textAlign = 'center';
                ctx.fillText('VIP SIGNAL 🔒', canvas.width / 2, canvas.height / 2);

                telegramImage = canvas.toDataURL('image/jpeg', 0.85); // Base64 Blurred
            }

            const selectedCaption = aiConfig.selectedVariationIndex >= 0
                ? aiConfig.variations[aiConfig.selectedVariationIndex]
                : null;

            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair: formData.pair,
                    type: formData.type,
                    imageUrl: formData.image, // Clear image for DB/Website
                    telegramImage: telegramImage, // Blurred (or null if not VIP? No, existing logic needs it to post to TG. If Public, we send clear image to TG too?)
                    // Logic check: If Public, telegramImage should be same as imageUrl?
                    // User request: "Tumwih if VIP". If public, post normally.
                    // Existing route logic: if (telegramImage) sendToTelegram(telegramImage). 
                    // So for Public, we must pass imageUrl as telegramImage too.
                    telegramImage: formData.isVip ? telegramImage : formData.image,
                    sendToTelegram: true,
                    isVip: formData.isVip,
                    caption: selectedCaption
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus('Success! Signal Posted.');
                setFormData(prev => ({ ...prev, image: null, imgPreview: null }));
                fetchSignals();
            } else {
                alert('Error: ' + data.error);
            }

        } catch (e) {
            console.error(e);
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete from Website AND Social Media.')) return;
        setLoading(true);
        try {
            await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
            fetchSignals();
            setStatus('Signal Deleted.');
        } catch (e) {
            alert('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="p-8 border border-white/10 rounded-xl">
                    <h1 className="text-2xl mb-4 text-gold">Admin Login</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-900 border border-gray-700 p-2 rounded w-full mb-4"
                        placeholder="Password"
                    />
                    <button
                        onClick={() => password === 'admin123' ? setIsAuthenticated(true) : alert('Wrong')}
                        className="bg-yellow-600 text-black font-bold py-2 px-4 rounded w-full"
                    >
                        Login
                    </button>
                    <p className="mt-2 text-xs text-gray-500">Hint: admin123</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: Signal & Config */}
                <div className="space-y-8">
                    {/* 1. Signal Creator */}
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                        <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
                            🚀 Post New Signal
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Pair</label>
                                <input
                                    value={formData.pair}
                                    onChange={e => setFormData({ ...formData, pair: e.target.value })}
                                    className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-yellow-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-black border border-gray-700 p-3 rounded-lg focus:border-yellow-500 outline-none"
                                >
                                    <option>BUY</option>
                                    <option>SELL</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-3 cursor-pointer bg-black p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.isVip ? 'border-yellow-500' : 'border-gray-500'}`}>
                                    {formData.isVip && <div className="w-3 h-3 bg-yellow-500 rounded-full" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.isVip}
                                    onChange={e => setFormData({ ...formData, isVip: e.target.checked })}
                                />
                                <div>
                                    <span className={`block font-bold ${formData.isVip ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        VIP Signal 🔒
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Will be blurred on Social Media automatically
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mb-6">
                            <label className="block w-full p-8 border-2 border-dashed border-gray-700 rounded-xl text-center cursor-pointer hover:border-yellow-500 transition-colors bg-black/50">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                {formData.imgPreview ? (
                                    <img src={formData.imgPreview} className="max-h-64 mx-auto rounded-lg shadow-2xl" />
                                ) : (
                                    <span className="text-gray-400">Click to Upload Chart Image</span>
                                )}
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700'
                                }`}
                        >
                            {loading ? status : '📢 Publish Signal Now'}
                        </button>
                    </div>

                    {/* 2. Previous Signals */}
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-gray-200 mb-4">Recent Signals</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {signals.length === 0 && <p className="text-gray-500 text-center py-4">No signals yet.</p>}
                            {signals.map(s => (
                                <div key={s._id} className="flex items-center justify-between bg-black p-3 rounded-lg border border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <img src={s.imageUrl} className="w-12 h-12 object-cover rounded" />
                                        <div>
                                            <div className="font-bold">{s.pair} <span className={`text-xs px-2 py-0.5 rounded ${s.type === 'BUY' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{s.type}</span></div>
                                            <div className="text-xs text-gray-500">
                                                {s.isVip && <span className="text-yellow-500 mr-2">🔒 VIP</span>}
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        disabled={loading}
                                        className="text-red-500 hover:bg-red-900/30 p-2 rounded transition-colors"
                                        title="Delete from Website & Social"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: AI Content Studio */}
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                            🤖 AI Content Studio
                        </h2>
                        <div className="text-xs text-gray-500 bg-black px-3 py-1 rounded-full border border-gray-800">
                            Powered by Google Gemini
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">API Key</label>
                            <input
                                type="password"
                                value={aiConfig.apiKey}
                                onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                                className="w-full bg-black border border-gray-800 p-2 rounded text-xs text-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Model</label>
                            <div className="flex gap-2">
                                <select
                                    value={aiConfig.model}
                                    onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                                    className="flex-1 bg-black border border-gray-800 p-2 rounded text-xs text-gray-300 focus:border-blue-500 outline-none"
                                >
                                    <option value="gemini-1.5-flash">Default (Flash 1.5)</option>
                                    {aiConfig.availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <button onClick={fetchModels} className="bg-gray-800 text-gray-300 px-3 rounded hover:bg-gray-700 text-xs">↻</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Raw Signal Data (Draft)</label>
                            <textarea
                                value={aiConfig.draft}
                                onChange={e => setAiConfig({ ...aiConfig, draft: e.target.value })}
                                rows={3}
                                className="w-full bg-black border border-gray-800 p-3 rounded-lg text-sm font-mono text-green-400 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">AI Prompt Instruction</label>
                            <textarea
                                value={aiConfig.prompt}
                                onChange={e => setAiConfig({ ...aiConfig, prompt: e.target.value })}
                                rows={3}
                                className="w-full bg-black border border-gray-800 p-3 rounded-lg text-sm text-gray-300 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={generateVariations}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
                        >
                            ✨ Generate 50 Variations
                        </button>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1 bg-black rounded-xl border border-gray-800 p-4 overflow-y-auto max-h-[600px]">
                        {aiConfig.variations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                                <div className="text-4xl mb-2">📄</div>
                                <p>Generated content will appear here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                <p className="text-gray-400 text-xs mb-2">Click a variation to select it for the post:</p>
                                {aiConfig.variations.map((text, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setAiConfig(prev => ({ ...prev, selectedVariationIndex: idx }))}
                                        className={`p-4 rounded-lg cursor-pointer border transition-all text-sm whitespace-pre-wrap ${aiConfig.selectedVariationIndex === idx
                                                ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                                                : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-600 hover:bg-[#222]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                                            {aiConfig.selectedVariationIndex === idx && <span className="text-blue-400 text-xs">● Selected</span>}
                                        </div>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            {status && (
                <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up z-50">
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {status}
                </div>
            )}
        </div>
    );
}
