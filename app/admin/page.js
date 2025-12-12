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
    const [duration, setDuration] = useState('1'); // Default 1 month
    const [users, setUsers] = useState([]);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });

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

    const revokeVip = async (tgId) => {
        if (!confirm('Are you sure you want to revoke VIP access for this user?')) return;
        try {
            const res = await fetch(`/api/users?telegramId=${tgId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchUsers(); // Refresh list
            }
        } catch (err) {
            console.error('Revoke error:', err);
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
                body: JSON.stringify({ telegramId, isVip: true, duration })
            });
            const data = await res.json();
            if (data.success) {
                setVipMessage({ type: 'success', text: t.vipSuccess || 'User updated successfully' });
                setTelegramId('');
                fetchUsers(); // Refresh list
            } else {
                setVipMessage({ type: 'error', text: t.vipError || 'Error updating user' });
            }
        } catch (err) {
            setVipMessage({ type: 'error', text: t.vipError || 'Error updating user' });
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

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '4rem 0' }}></div>

                {/* VIP Management - Refined System (Bottom) */}
                <div className="card" style={{ padding: '2rem', marginBottom: '4rem', background: '#13131d', border: '1px solid #2a2a35' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>👑 {t.manageVip || 'VIP Members Management'}</h2>
                        <button onClick={fetchUsers} style={{ padding: '0.5rem', background: '#2a2a35', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🔄 Refresh</button>
                    </div>

                    {/* Add Member Form */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <h3 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.1rem' }}>➕ Add New VIP Member</h3>
                        <form onSubmit={handleGrantVip} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={telegramId}
                                onChange={(e) => setTelegramId(e.target.value)}
                                placeholder={t.telegramIdPlaceholder}
                                style={{
                                    flex: 2,
                                    padding: '1rem',
                                    background: '#080810',
                                    border: '1px solid #2a2a35',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    minWidth: '200px'
                                }}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#080810', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                                {duration === 'lifetime' ? (
                                    <span style={{ color: '#aaa' }}>Lifetime ∞</span>
                                ) : (
                                    <>
                                        <input
                                            type="number"
                                            min="1"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            style={{
                                                width: '60px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                textAlign: 'center',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <span style={{ color: '#777' }}>Months</span>
                                    </>
                                )}
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#fff' }}>
                                <input
                                    type="checkbox"
                                    checked={duration === 'lifetime'}
                                    onChange={(e) => setDuration(e.target.checked ? 'lifetime' : '1')}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Lifetime
                            </label>

                            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', minWidth: '120px' }} disabled={vipLoading}>
                                {vipLoading ? '...' : (t.grantVip || 'Grant VIP')}
                            </button>
                        </form>
                        {vipMessage.text && <p style={{ color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444', marginTop: '1rem' }}>{vipMessage.text}</p>}
                    </div>

                    {/* Members List Table (Active Only) */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #2a2a35', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Telegram ID</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Start Date</th>
                                    <th style={{ padding: '1rem' }}>Expiry Date</th>
                                    <th style={{ padding: '1rem' }}>Remaining</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(users) ? users : []).filter(u => u.isVip && (!u.vipExpiryDate || new Date(u.vipExpiryDate) > new Date())).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No active members found.</td>
                                    </tr>
                                ) : (Array.isArray(users) ? users : []).filter(u => u.isVip && (!u.vipExpiryDate || new Date(u.vipExpiryDate) > new Date())).map((user) => {
                                    const expiry = user.vipExpiryDate ? new Date(user.vipExpiryDate) : null;
                                    const isLifetime = expiry && expiry.getFullYear() > 2090;
                                    const daysLeft = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                                    return (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #1f1f2e' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{user.telegramId}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '50px',
                                                    background: 'rgba(76, 175, 80, 0.15)',
                                                    color: '#4caf50',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    Active
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#aaa' }}>
                                                {user.vipStartDate ? new Date(user.vipStartDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#aaa' }}>
                                                {isLifetime ? 'Lifetime ∞' : expiry.toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#DAA520' }}>
                                                {isLifetime ? '∞' : `${daysLeft} Days`}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => revokeVip(user.telegramId)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        background: 'transparent',
                                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                                        borderRadius: '6px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
