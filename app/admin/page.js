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
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });

    // Telegram Auto-Post State
    const [postToTelegram, setPostToTelegram] = useState(true);

    useEffect(() => {
        const auth = sessionStorage.getItem('admin-auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSignals();
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin-auth', 'true');
            setError('');
            fetchSignals();
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

    // --- CANVAS LOCK GENERATION (MATCHING SIGNALS PAGE) ---
    const createBlurredImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Draw Blurred Image (Reduced scale for teasing effect)
                // Was 20px, reducing to 10px to be less "boring" and more "teasing"
                ctx.filter = 'blur(10px)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.filter = 'none'; // Reset

                // 2. Full Overlay (Glassmorphism Tint)
                // Matches rgba(8, 8, 16, 0.4) from Signals Page
                ctx.fillStyle = 'rgba(8, 8, 16, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 3. Prepare SVG Lock Badge
                const size = Math.min(canvas.width, canvas.height) * 0.35; // Slightly larger lock
                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;

                // Replicate the Signals Page Lock:
                // - No hard background circle
                // - Subtle Radial Glow behind
                // - Gold Lock Icon
                const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFE566;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#B8860B;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#705C0B;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" style="stop-color:rgba(184, 134, 11, 0.6)" />
                            <stop offset="100%" style="stop-color:rgba(184, 134, 11, 0)" />
                        </radialGradient>
                    </defs>
                    
                    <!-- Subtle Glow (No hard circle) -->
                    <circle cx="50" cy="50" r="50" fill="url(#glow)" />
                    
                    <!-- Lock Body (Gold) -->
                    <rect x="30" y="45" width="40" height="30" rx="5" fill="none" stroke="url(#gold)" stroke-width="4" />
                    
                    <!-- Lock Shackle -->
                    <path d="M 35 45 L 35 30 A 15 15 0 0 1 65 30 L 65 45" fill="none" stroke="url(#gold)" stroke-width="4" stroke-linecap="round" />
                    
                    <!-- Keyhole -->
                    <circle cx="50" cy="60" r="4" fill="url(#gold)" />
                    
                    <!-- Shimmer/Highlight hint (Static) -->
                    <path d="M 32 47 L 45 47" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
                </svg>
                `;

                const badgeImg = new Image();
                badgeImg.onload = () => {
                    ctx.drawImage(badgeImg, x, y, size, size);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // High quality
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

    const processFile = async (file) => {
        setUploading(true);
        setSuccessMessage('');
        setError('');

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;

                let telegramImage = null;
                if (postToTelegram) {
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
                        imageUrl: base64Image,
                        telegramImage: telegramImage,
                        sendToTelegram: postToTelegram
                    })
                });

                const data = await res.json();
                if (data.success) {
                    let msg = t.postSuccess;
                    if (postToTelegram) msg += ` ${t.telegramSuccess || ''}`;
                    setSuccessMessage(msg);
                    fetchSignals();
                } else {
                    setError(t.postError);
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
                body: JSON.stringify({ telegramId, isVip: true })
            });
            const data = await res.json();
            if (data.success) {
                setVipMessage({ type: 'success', text: t.vipSuccess });
                setTelegramId('');
            } else {
                setVipMessage({ type: 'error', text: t.vipError });
            }
        } catch (err) {
            setVipMessage({ type: 'error', text: t.vipError });
        }
        setVipLoading(false);
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
            <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>{t.adminTitle}</h1>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} style={{ width: '100%', padding: '1rem', background: '#161622', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff', textAlign: 'center', marginBottom: '1rem' }} />
                        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t.login}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080810', padding: '2rem' }} onPaste={handlePaste}>
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

                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                    <h2 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>{t.manageVip}</h2>
                    <form onSubmit={handleGrantVip} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
                        <input type="text" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} placeholder={t.telegramIdPlaceholder} style={{ flex: 1, padding: '0.8rem', background: '#161622', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '8px', color: '#fff' }} />
                        <button type="submit" className="btn-primary" style={{ background: '#4caf50' }}>{vipLoading ? '...' : t.grantVip}</button>
                    </form>
                    {vipMessage.text && <p style={{ color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444', marginTop: '0.5rem' }}>{vipMessage.text}</p>}
                </div>

                <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem', border: '2px dashed rgba(184, 134, 11, 0.4)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1rem' }}>{t.postNewSignal}</h2>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setPostToTelegram(!postToTelegram)}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${postToTelegram ? '#229ED9' : '#555'}`, background: postToTelegram ? '#229ED9' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {postToTelegram && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>
                        <span style={{ color: '#f0f0f0' }}>{t.postToTelegram}</span>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
                    <label htmlFor="image-upload" className="btn-primary" style={{ cursor: 'pointer' }}>{uploading ? t.uploading : t.chooseImage}</label>

                    {successMessage && <p style={{ color: '#4caf50', marginTop: '1rem', fontWeight: 'bold' }}>{successMessage}</p>}
                    {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
                </div>

                <h2 style={{ color: '#DAA520', marginBottom: '1.5rem' }}>📊 {t.publishedSignals} ({signals.length})</h2>

                {/* Full Width Grid Layout - Matches User Request */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {loading ? <p style={{ color: '#888' }}>{t.loading}</p> : signals.map((signal) => (
                        <div key={signal._id} style={{ background: '#0f0f18', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(184, 134, 11, 0.15)' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={signal.imageUrl} alt="Signal" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9a9ab0', fontSize: '0.9rem' }}>🕒 {getTimeAgo(signal.createdAt, lang)}</span>
                                <button onClick={() => deleteSignal(signal._id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>{t.delete}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
