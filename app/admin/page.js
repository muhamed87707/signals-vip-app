'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PASSWORD = '123';

const getTimeAgo = (dateStr, lang) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (lang === 'ar') {
        if (seconds < 60) return 'منذ لحظات';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    } else {
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
};

export default function AdminPage() {
    const { t, lang, toggleLang, isRTL, mounted } = useLanguage();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    // VIP Management State
    const [telegramId, setTelegramId] = useState('');
    const [durationMonths, setDurationMonths] = useState('');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);

    // Telegram Auto-Post State
    const [postToTelegram, setPostToTelegram] = useState(true);

    // AI & VIP State
    const [isVip, setIsVip] = useState(false);
    const [apiKey, setApiKey] = useState('AIzaSyC2-Sbs6sxNzWk5mU7nN7AEkp4Kgd1NwwY'); // Default as requested
    const [aiModel, setAiModel] = useState('gemini-3-flash'); // Default as requested
    const [basePost, setBasePost] = useState('');
    const [aiPrompt, setAiPrompt] = useState('Rewrite the following trading signal post to be engaging, professional, and exciting for social media. Use emojis effectively. Keep the core numbers accurate.');
    const [generatedVariations, setGeneratedVariations] = useState([]);
    const [selectedVariationIndex, setSelectedVariationIndex] = useState(-1);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [aiError, setAiError] = useState('');
    const [availableModels, setAvailableModels] = useState([]); // New state for dynamic models

    useEffect(() => {
        const auth = sessionStorage.getItem('admin-auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSignals();
            fetchUsers();
        }

        // Load saved preferences
        const savedApiKey = localStorage.getItem('ai_apiKey');
        const savedModel = localStorage.getItem('ai_model');
        const savedPrompt = localStorage.getItem('ai_prompt');
        const savedBasePost = localStorage.getItem('ai_basePost');

        if (savedApiKey) setApiKey(savedApiKey);
        if (savedModel) setAiModel(savedModel);
        if (savedPrompt) setAiPrompt(savedPrompt);
        if (savedBasePost) setBasePost(savedBasePost);
    }, []);

    // Save preferences on change
    useEffect(() => { localStorage.setItem('ai_apiKey', apiKey); }, [apiKey]);
    useEffect(() => { localStorage.setItem('ai_model', aiModel); }, [aiModel]);
    useEffect(() => { localStorage.setItem('ai_prompt', aiPrompt); }, [aiPrompt]);
    useEffect(() => { localStorage.setItem('ai_basePost', basePost); }, [basePost]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin-auth', 'true');
            setError('');
            fetchSignals();
            fetchUsers();
        } else {
            setError(t.loginError);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin-auth');
    };

    const fetchSignals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/signals');
            const data = await res.json();
            setSignals(data.signals || []);
        } catch (err) {
            console.error('Error fetching signals:', err);
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    // --- CANVAS LOCK GENERATION (TUNED) ---
    const createBlurredImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Draw Reduced Blur Image (10px) - Overdraw to prevent black edges
                ctx.filter = 'blur(10px)';
                // Draw image slightly larger (-20px offset) to ensure blur doesn't pull transparency from edges
                ctx.drawImage(img, -20, -20, canvas.width + 40, canvas.height + 40);
                ctx.filter = 'none'; // Reset

                // 2. Prepare SVG Lock Badge (Corrected Radial Gradient)
                const size = Math.min(canvas.width, canvas.height) * 0.35; // Slightly larger lock
                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;

                // We simulate the signals page gradient: radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%)
                // And the SVG lock
                const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
                    <defs>
                        <!-- Glow Gradient -->
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" style="stop-color:rgba(184, 134, 11, 0.4);stop-opacity:1" />
                            <stop offset="70%" style="stop-color:rgba(0, 0, 0, 0);stop-opacity:0" />
                        </radialGradient>

                        <!-- Gold Lock Gradient -->
                        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFE566;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#B8860B;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#705C0B;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    
                    <!-- 1. Ambient Glow REMOVED as requested -->
                    
                    <!-- 2. Lock Icon Group (Larger & Centered) -->
                    <!-- Net Scale: 0.6 * 3.5 = 2.1. Center approx (12, 14). 12*2.1=25.2, 14*2.1=29.4. Offsets: 50-25=25, 50-29=21. -->
                    <g transform="translate(25, 21) scale(0.6)">
                         <!-- Backing Circle (Behind Lock Body Only - Slightly Smaller) -->
                         <circle cx="12" cy="16" r="5.5" fill="rgba(0,0,0,0.6)" transform="scale(3.5)" />
                         
                         <!-- Lock Parts -->
                         <rect x="6" y="11" width="12" height="10" rx="3" stroke="url(#gold)" stroke-width="2" fill="rgba(0,0,0,0.3)" transform="scale(3.5)" />
                         <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#gold)" stroke-width="2" stroke-linecap="round" fill="none" transform="scale(3.5)" />
                         <circle cx="12" cy="16" r="1.5" fill="url(#gold)" transform="scale(3.5)" />
                    </g>
                </svg>`;

                const badgeImg = new Image();
                badgeImg.onload = () => {
                    ctx.drawImage(badgeImg, x, y, size, size);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    URL.revokeObjectURL(url);
                    resolve(dataUrl);
                };
                badgeImg.src = 'data:image/svg+xml;base64,' + btoa(svgString);
            };
            img.src = url;
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) processFile(file);
                break;
            }
        }
    };

    const fetchModels = async (key) => {
        if (!key) return;
        try {
            const res = await fetch('/api/ai/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key })
            });
            const data = await res.json();
            if (data.models) {
                setAvailableModels(data.models);
                // If current selection is not in list, default to first found
                if (data.models.length > 0 && !data.models.find(m => m.name === aiModel)) {
                    setAiModel(data.models[0].name);
                }
            }
        } catch (err) {
            console.error('Failed to fetch models:', err);
        }
    };

    const handleGenerateContent = async () => {
        if (!basePost || !apiKey) {
            setAiError('Please enter API Key and Base Post');
            return;
        }

        setGeneratingAi(true);
        setAiError('');
        setGeneratedVariations([]);
        setSelectedVariationIndex(-1);

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey,
                    model: aiModel,
                    prompt: aiPrompt,
                    baseText: basePost
                })
            });
            const data = await res.json();

            if (data.error) {
                setAiError(data.error);
            } else if (data.variations && data.variations.length > 0) {
                setGeneratedVariations(data.variations);
                setSelectedVariationIndex(0); // Select first by default
            } else {
                setAiError('No variations generated.');
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            setAiError(error.message);
        }
        setGeneratingAi(false);
    };

    const handleDeleteSignal = async (id) => {
        if (!confirm('Are you sure you want to delete this signal? It will be removed from Telegram too.')) return;
        try {
            const res = await fetch('/api/signals', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                fetchSignals();
            } else {
                alert('Delete failed: ' + data.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Unified processFile function
    const processFile = async (file) => {
        setUploading(true);
        setSuccessMessage('');
        setError('');

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                const aiContentValue = selectedVariationIndex >= 0 ? generatedVariations[selectedVariationIndex] : '';

                let telegramImage = null;
                // Create blurred image if VIP or specifically requested
                if (isVip || postToTelegram) {
                    try {
                        telegramImage = await createBlurredImage(file);
                    } catch (blurErr) {
                        console.error('Blur failed', blurErr);
                    }
                }

                const res = await fetch('/api/signals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pair: 'GOLD',
                        type: 'SIGNAL',
                        image: base64Image,
                        isVip: isVip,
                        aiContent: aiContentValue,
                        sendToTelegram: postToTelegram
                    })
                });

                const data = await res.json();
                if (data.success) {
                    let msg = t.postSuccess;
                    setSuccessMessage(msg);
                    fetchSignals();
                } else {
                    setError(t.postError || 'Error posting signal');
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload error:', err);
            setError(t.uploadError);
            setUploading(false);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGrantVip = async (e) => {
        e.preventDefault();
        if (!telegramId) return;
        setVipLoading(true);
        setVipMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId,
                    isVip: true,
                    durationMonths,
                    isLifetime
                })
            });
            const data = await res.json();
            if (data.success) {
                setVipMessage({ type: 'success', text: t.vipSuccess });
                setTelegramId('');
                setDurationMonths('');
                setIsLifetime(false);
                fetchUsers();
            } else {
                setVipMessage({ type: 'error', text: t.vipError });
            }
        } catch (err) {
            setVipMessage({ type: 'error', text: t.vipError });
        }
        setVipLoading(false);
    };

    const handleRemoveUser = async (tid) => {
        if (!confirm('Are you sure you want to remove this user from the VIP list?')) return;
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId: tid, removeUser: true })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSignal = async (id) => {
        if (!confirm(t.deleteConfirm)) return;
        try {
            const res = await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSignals();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    if (!mounted) return null;

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>{t.adminTitle}</h1>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} style={{ width: '100%', padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff', textAlign: 'center', marginBottom: '1rem' }} />
                        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t.login}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080808', padding: '2rem' }} onPaste={handlePaste}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>💎 {t.signalsDashboard}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ef4444', borderRadius: '50px', color: '#ef4444', cursor: 'pointer' }}>{t.logout}</button>
                    </div>
                </div>

                {/* Old VIP Section Removed - Moved to Bottom */}

                <h2 style={{ color: '#DAA520', marginBottom: '1.5rem' }}>📊 {t.publishedSignals} ({signals.length})</h2>

                {/* Full Width Grid Layout - Matches User Request */}
                {/* Upload Section */}
                <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) processFile(file);
                        }}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{t.uploadTitle}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.1rem' }}>
                            <input
                                type="checkbox"
                                checked={postToTelegram}
                                onChange={(e) => setPostToTelegram(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            📤 {t.postToTelegram}
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.1rem', color: '#DAA520' }}>
                            <input
                                type="checkbox"
                                checked={isVip}
                                onChange={(e) => setIsVip(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            👑 VIP Signal
                        </label>
                    </div>

                    <div
                        onClick={() => fileInputRef.current.click()}
                        onPaste={handlePaste}
                        style={{
                            border: '3px dashed rgba(184, 134, 11, 0.3)',
                            borderRadius: '24px',
                            padding: '4rem 2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                        <p style={{ fontSize: '1.2rem', color: '#888' }}>
                            {uploading ? t.uploading : t.dropZone}
                        </p>
                        {selectedVariationIndex >= 0 && (
                            <p style={{ color: '#4caf50', marginTop: '1rem' }}>✅ {t.aiTextSelected}</p>
                        )}
                    </div>

                    {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
                    {successMessage && <p style={{ color: '#4caf50', marginTop: '1rem' }}>{successMessage}</p>}
                </div>

                {/* AI Content Generator Section - Moved Below Upload */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(184, 134, 11, 0.1)' }}>
                    <h2 style={{ color: '#DAA520', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t.aiGeneratorTitle}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.aiApiKey}</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    if (e.target.value.length > 20) fetchModels(e.target.value);
                                }}
                                onBlur={() => fetchModels(apiKey)}
                                style={{ width: '100%', padding: '0.8rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.aiModel}</label>
                            <select
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map(m => (
                                        <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                        <option value="gemini-3-flash">gemini-3-flash</option>
                                    </>
                                )}
                            </select>
                            <div style={{ fontSize: '0.8rem', color: '#DAA520', marginTop: '0.3rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => fetchModels(apiKey)}>
                                🔄 Update Models List
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.aiBasePost}</label>
                        <textarea
                            value={basePost}
                            onChange={(e) => setBasePost(e.target.value)}
                            placeholder={t.aiBasePostPlaceholder}
                            style={{ width: '100%', padding: '1rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff', minHeight: '100px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.aiPrompt}</label>
                        <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff', minHeight: '80px' }}
                        />
                    </div>

                    <button
                        onClick={handleGenerateContent}
                        disabled={generatingAi}
                        className="btn-primary"
                        style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', opacity: generatingAi ? 0.7 : 1 }}
                    >
                        {generatingAi ? t.aiGeneratingBtn : t.aiGenerateBtn}
                    </button>

                    {aiError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{aiError}</p>}

                    {/* Variations Carousel/List */}
                    {generatedVariations.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>{t.aiSelectVariation} ({generatedVariations.length}):</h3>
                            <div style={{
                                display: 'flex',
                                overflowX: 'auto',
                                gap: '1rem',
                                padding: '1rem 0',
                                borderTop: '1px solid #333',
                                borderBottom: '1px solid #333'
                            }}>
                                {generatedVariations.map((variation, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedVariationIndex(idx)}
                                        style={{
                                            minWidth: '350px',
                                            maxWidth: '350px',
                                            padding: '1.5rem',
                                            background: selectedVariationIndex === idx ? 'rgba(218, 165, 32, 0.2)' : '#1a1a24',
                                            border: selectedVariationIndex === idx ? '1px solid #DAA520' : '1px solid #333',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            color: '#ddd',
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            lineHeight: '1.6',
                                            direction: 'auto', // Handle mixed Arabic/English
                                            boxShadow: selectedVariationIndex === idx ? '0 0 15px rgba(218, 165, 32, 0.1)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.8rem', color: '#DAA520', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>#{idx + 1}</span>
                                            {selectedVariationIndex === idx && <span>✅ Selected</span>}
                                        </div>
                                        {variation}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Signals List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {loading ? <p style={{ color: '#888' }}>{t.loading}</p> : signals.map((signal) => (
                        <div key={signal._id} style={{ background: '#0c0c0c', borderRadius: '24px', overflow: 'hidden', border: signal.isVip ? '1px solid #DAA520' : '1px solid rgba(184, 134, 11, 0.15)' }}>
                            <div style={{ position: 'relative' }}>
                                {signal.isVip && <div style={{ position: 'absolute', top: 10, right: 10, background: '#DAA520', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', zIndex: 2 }}>VIP</div>}
                                <img src={signal.imageUrl} alt="Signal" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#9a9ab0', fontSize: '0.9rem' }}>🕒 {getTimeAgo(signal.createdAt, lang)}</span>
                                    <button onClick={() => handleDeleteSignal(signal._id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>{t.delete || 'Delete'}</button>
                                </div>
                                {signal.aiContent && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#777', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {signal.aiContent.substring(0, 100)}...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* VIP Management Section - Moved to Bottom */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(184, 134, 11, 0.2)' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>👑 {t.manageVip}</h2>

                    {/* Add VIP Form */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(184, 134, 11, 0.1)' }}>
                        <h3 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.2rem' }}>{t.addNewVip}</h3>
                        <form onSubmit={handleGrantVip} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.telegramIdPlaceholder}</label>
                                <input
                                    type="text"
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ minWidth: '150px' }}>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.durationMonths || 'Duration (Months)'}</label>
                                <input
                                    type="number"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(e.target.value)}
                                    placeholder="e.g. 1, 3, 12"
                                    disabled={isLifetime}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: isLifetime ? '#0f0f15' : '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: isLifetime ? '#555' : '#fff'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', height: '45px', padding: '0 1rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="lifetime"
                                    checked={isLifetime}
                                    onChange={(e) => setIsLifetime(e.target.checked)}
                                    style={{ marginRight: '0.5rem', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="lifetime" style={{ color: '#fff', cursor: 'pointer', userSelect: 'none' }}>{t.lifetime || 'Lifetime'}</label>
                            </div>

                            <button type="submit" className="btn-primary" style={{ height: '45px', padding: '0 2rem' }}>
                                {vipLoading ? '...' : t.grantVip}
                            </button>
                        </form>
                        {vipMessage.text && <p style={{ color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444', marginTop: '1rem' }}>{vipMessage.text}</p>}
                    </div>

                    {/* Active Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(184, 134, 11, 0.2)', textAlign: 'center' }}>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Telegram ID</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.status || 'Status'}</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.expiresIn || 'Expires In'}</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.actions || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.isVip).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t.noVipMembers || 'No active VIP members'}</td>
                                    </tr>
                                ) : (
                                    users.filter(u => u.isVip).map(user => {
                                        const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                                        const now = new Date();
                                        const isExpired = expiry && now > expiry;
                                        // This filter effectively hides expired users, per request "Active members only"
                                        // If backend update didn't run yet, front-end check helps
                                        if (isExpired && user.isVip) return null; // Should ideally be handled by state refresh

                                        let timeLeft = 'Lifetime ♾️';
                                        if (expiry) {
                                            const diff = expiry - now;
                                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                            timeLeft = `${days} Days`;
                                        }

                                        return (
                                            <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                <td style={{ padding: '1rem' }}>{user.telegramId}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: 'rgba(76, 175, 80, 0.1)',
                                                        color: '#4caf50',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem'
                                                    }}>Active</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{timeLeft}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => handleRemoveUser(user.telegramId)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #ef4444',
                                                            color: '#ef4444',
                                                            padding: '0.3rem 0.8rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {t.remove || 'Remove'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
