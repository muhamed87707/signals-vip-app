'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PASSWORD = '123';
const DEFAULT_GEMINI_KEY = 'AIzaSyC2-Sbs6sxNzWk5mU7nN7AEkp4Kgd1NwwY';

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

    // New Features State
    const [isVipSignal, setIsVipSignal] = useState(false);
    const [geminiApiKey, setGeminiApiKey] = useState(DEFAULT_GEMINI_KEY);
    const [postPrompt, setPostPrompt] = useState('Create a hype trading signal post for social media. Use emojis. Keep it short and exciting.');
    const [aiPosts, setAiPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);

    // VIP Management State
    const [telegramId, setTelegramId] = useState('');
    const [durationMonths, setDurationMonths] = useState('');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);

    // Telegram Auto-Post State
    const [postToTelegram, setPostToTelegram] = useState(true);

    useEffect(() => {
        const auth = sessionStorage.getItem('admin-auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSignals();
            fetchUsers();
        }
    }, []);

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

    // AI Generation Logic (Updated to use Server API)
    const generateAiPosts = async () => {
        if (!geminiApiKey) {
            alert('Please enter a Valid Gemini API Key');
            return;
        }
        setIsGeneratingAi(true);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: geminiApiKey, prompt: postPrompt })
            });
            const data = await res.json();

            if (data.success && Array.isArray(data.posts)) {
                setAiPosts(data.posts);
            } else {
                alert('AI Error: ' + (data.error || 'Failed to generate'));
            }
        } catch (error) {
            console.error("AI Request Error:", error);
            alert("Error generating posts");
        }
        setIsGeneratingAi(false);
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
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" style="stop-color:rgba(184, 134, 11, 0.4);stop-opacity:1" />
                            <stop offset="70%" style="stop-color:rgba(0, 0, 0, 0);stop-opacity:0" />
                        </radialGradient>

                        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFE566;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#B8860B;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#705C0B;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    
                    <g transform="translate(25, 21) scale(0.6)">
                         <circle cx="12" cy="16" r="5.5" fill="rgba(0,0,0,0.6)" transform="scale(3.5)" />
                         
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

    const handleUpload = async (e) => {
        e.preventDefault();
        const form = e.target;
        const file = form.image.files[0];
        const pair = form.pair.value;
        const type = form.type.value;

        if (!file) return;

        setUploading(true);
        setSuccessMessage('');

        try {
            const formData = new FormData();
            // Convert file to base64 for uploadToImgBB logic (which expects base64 or file? API says input 'image')
            // Actually, my previous logic in POST used uploadToImgBB which expects base64 string

            const toBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]); // Get only base64 data
                reader.onerror = error => reject(error);
            });

            const base64Image = await toBase64(file);

            let blurredImageBase64 = null;
            if (isVipSignal && postToTelegram) {
                const blurredBlob = await createBlurredImage(file);
                blurredImageBase64 = await toBase64(blurredBlob);
            }

            const payload = {
                pair,
                type,
                imageUrl: base64Image,
                telegramImage: blurredImageBase64, // Pass blurred image if VIP
                sendToTelegram: postToTelegram,
                isVip: isVipSignal,
                socialPostContent: selectedPost
            };

            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage(t.uploadSuccess || 'Signal Posted Successfully!');
                form.reset();
                setAiPosts([]);
                setSelectedPost('');
                fetchSignals();
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload error');
        }
        setUploading(false);
    };

    const handleDeleteSignal = async (id) => {
        if (!confirm('Are you sure you want to delete this signal? It will be removed from the site and Telegram.')) return;

        try {
            const res = await fetch(`/api/signals/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSignals(); // Refresh list
            } else {
                alert('Failed to delete: ' + data.error);
            }
        } catch (err) {
            alert('Delete failed');
        }
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

                <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem', border: '2px dashed rgba(184, 134, 11, 0.4)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1rem' }}>{t.postNewSignal}</h2>

                    <form onSubmit={handleUpload} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>

                        {/* VIP Toggle & Telegram Option */}
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: postToTelegram ? '#229ED9' : '#888' }}>
                                <input type="checkbox" checked={postToTelegram} onChange={(e) => setPostToTelegram(e.target.checked)} />
                                Post to Telegram Channel
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: isVipSignal ? '#DAA520' : '#888' }}>
                                <input type="checkbox" checked={isVipSignal} onChange={(e) => setIsVipSignal(e.target.checked)} />
                                🔒 VIP Signal? (Blurs Telegram Image)
                            </label>
                        </div>

                        {/* AI Generator Section */}
                        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #333', borderRadius: '8px', background: '#111' }}>
                            <h3 style={{ color: '#DAA520', fontSize: '1rem', marginBottom: '0.5rem' }}>⚡ AI Social Post Generator (Gemini Flash)</h3>

                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Gemini API Key:</label>
                            <input
                                type="password"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '1rem' }}
                            />

                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Prompt:</label>
                            <textarea
                                value={postPrompt}
                                onChange={(e) => setPostPrompt(e.target.value)}
                                rows={2}
                                style={{ width: '100%', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', marginBottom: '0.5rem' }}
                            />

                            <button type="button" onClick={generateAiPosts} disabled={isGeneratingAi} style={{ width: '100%', padding: '0.5rem', background: isGeneratingAi ? '#444' : '#222', color: '#fff', border: '1px solid #444', cursor: isGeneratingAi ? 'not-allowed' : 'pointer' }}>
                                {isGeneratingAi ? 'Generating...' : '✨ Generate 50 Variations'}
                            </button>

                            {aiPosts.length > 0 && (
                                <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #333', padding: '0.5rem' }}>
                                    {aiPosts.map((post, i) => (
                                        <div key={i} onClick={() => setSelectedPost(post)} style={{ padding: '0.5rem', borderBottom: '1px solid #222', cursor: 'pointer', background: selectedPost === post ? '#333' : 'transparent', fontSize: '0.85rem', color: '#ccc' }}>
                                            {post}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Selected Post Content (for Telegram/Social):</label>
                        <textarea
                            value={selectedPost}
                            onChange={(e) => setSelectedPost(e.target.value)}
                            placeholder="Write your post here or generate one..."
                            rows={4}
                            style={{ width: '100%', padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff', marginBottom: '1.5rem', fontFamily: 'inherit' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input name="pair" placeholder="Pair (e.g. XAUUSD)" required style={{ padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff' }} />
                            <select name="type" required style={{ padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff' }}>
                                <option value="BUY">🟢 BUY</option>
                                <option value="SELL">🔴 SELL</option>
                            </select>
                        </div>

                        <div style={{ border: '2px dashed #333', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem', position: 'relative' }}
                            onClick={() => fileInputRef.current.click()}>
                            <input ref={fileInputRef} type="file" name="image" accept="image/*" style={{ display: 'none' }} />
                            <p style={{ color: '#888' }}>{t.uploadPlaceholder}</p>
                        </div>

                        <button type="submit" disabled={uploading} className="btn-primary" style={{ width: '100%', padding: '1rem', opacity: uploading ? 0.7 : 1 }}>
                            {uploading ? t.uploading : (isVipSignal ? '🚀 Publish VIP Signal' : '🚀 Publish Free Signal')}
                        </button>
                    </form>
                    {successMessage && <p style={{ color: '#4caf50', marginTop: '1rem', fontWeight: 'bold' }}>{successMessage}</p>}
                    {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
                </div>

                <h2 style={{ color: '#DAA520', marginBottom: '1.5rem' }}>📊 {t.publishedSignals} ({signals.length})</h2>

                {/* Full Width Grid Layout - Matches User Request */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {loading ? <p style={{ color: '#888' }}>{t.loading}</p> : signals.map((signal) => (
                        <div key={signal._id} style={{ background: '#0c0c0c', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(184, 134, 11, 0.15)', position: 'relative' }}>
                            {signal.isVip && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#DAA520', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 5 }}>VIP 🔒</div>}
                            <div style={{ position: 'relative' }}>
                                <img src={signal.imageUrl} alt="Signal" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                {signal.pair && <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.7)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{signal.pair} {signal.type}</div>}
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9a9ab0', fontSize: '0.9rem' }}>🕒 {getTimeAgo(signal.createdAt, lang)}</span>
                                <button onClick={() => handleDeleteSignal(signal._id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>{t.delete}</button>
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
