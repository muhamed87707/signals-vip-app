'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PASSWORD = '123';

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

    // Check authentication on mount
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

    // Helper to Create Blurred Image
    const createBlurredImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Apply Blur
                ctx.filter = 'blur(20px)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get Base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                URL.revokeObjectURL(url);
                resolve(dataUrl);
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
            // 1. Get Clean Base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;

                // 2. Get Blurred Base64 (if posting to TG)
                let telegramImage = null;
                if (postToTelegram) {
                    try {
                        telegramImage = await createBlurredImage(file);
                    } catch (blurErr) {
                        console.error('Blur failed', blurErr);
                    }
                }

                // 3. Upload to API
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

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #080810 0%, #0f0f18 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div className="absolute top-4 right-4" style={{ right: isRTL ? 'auto' : '1rem', left: isRTL ? '1rem' : 'auto' }}>
                    <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                </div>

                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 className="text-gradient" style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            marginBottom: '0.5rem'
                        }}>{t.adminTitle}</h1>
                        <p style={{ color: '#9a9ab0' }}>{t.adminSubtitle}</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#161622',
                                border: '1px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                direction: 'ltr'
                            }}
                        />
                        {error && (
                            <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
                        )}
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                fontSize: '1rem'
                            }}
                        >
                            {t.login}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #080810 0%, #0f0f18 100%)',
                padding: '2rem'
            }}
            onPaste={handlePaste}
        >
            <div className="container">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h1 className="text-gradient" style={{
                        fontSize: '1.75rem',
                        fontWeight: '700'
                    }}>
                        💎 {t.signalsDashboard}
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '50px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {t.logout}
                        </button>
                    </div>
                </div>

                {/* VIP Management Section */}
                <div className="card" style={{
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    background: 'rgba(76, 175, 80, 0.05)'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👑</div>
                    <h2 style={{ color: '#4caf50', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                        {t.manageVip}
                    </h2>
                    <p style={{ color: '#9a9ab0', marginBottom: '1.5rem' }}>
                        {t.manageVipSubtitle}
                    </p>

                    <form onSubmit={handleGrantVip} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <input
                            type="text"
                            value={telegramId}
                            onChange={(e) => setTelegramId(e.target.value)}
                            placeholder={t.telegramIdPlaceholder}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#161622',
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                direction: 'ltr'
                            }}
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                            }}
                            disabled={vipLoading}
                        >
                            {vipLoading ? t.loading : t.grantVip}
                        </button>
                    </form>

                    {vipMessage.text && (
                        <p style={{
                            color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444',
                            marginTop: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}>
                            {vipMessage.text}
                        </p>
                    )}
                </div>

                {/* Upload Section */}
                <div className="card" style={{
                    border: '2px dashed rgba(184, 134, 11, 0.4)',
                    padding: '3rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    background: '#0f0f18'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.5rem' }}>
                        {t.postNewSignal}
                    </h2>
                    <p style={{ color: '#9a9ab0', marginBottom: '1.5rem' }}>
                        {t.dragDropText}
                    </p>

                    {/* Telegram Checkbox */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => setPostToTelegram(!postToTelegram)}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: `2px solid ${postToTelegram ? '#229ED9' : '#555'}`,
                            background: postToTelegram ? '#229ED9' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}>
                            {postToTelegram && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>
                        <span style={{ color: '#f0f0f0', userSelect: 'none' }}>{t.postToTelegram}</span>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="btn-primary"
                        style={{
                            display: 'inline-block',
                            cursor: 'pointer'
                        }}
                    >
                        {uploading ? t.uploading : t.chooseImage}
                    </label>

                    {successMessage && (
                        <p style={{ color: '#4caf50', marginTop: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            {successMessage}
                        </p>
                    )}
                    {error && (
                        <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            {error}
                        </p>
                    )}
                </div>

                {/* Signals List */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ color: '#DAA520', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        📊 {t.publishedSignals} ({signals.length})
                    </h2>

                    {loading ? (
                        <p style={{ color: '#9a9ab0', textAlign: 'center' }}>{t.loading}</p>
                    ) : signals.length === 0 ? (
                        <p style={{ color: '#9a9ab0', textAlign: 'center' }}>{t.noSignals || 'No signals'}</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {signals.map((signal) => (
                                <div
                                    key={signal._id}
                                    style={{
                                        background: '#161622',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(184, 134, 11, 0.1)'
                                    }}
                                >
                                    <img
                                        src={signal.imageUrl}
                                        alt="Signal"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{ padding: '1rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ color: '#9a9ab0', fontSize: '0.85rem' }}>
                                                {new Date(signal.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                            </span>
                                            <button
                                                onClick={() => deleteSignal(signal._id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '8px',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {t.delete}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
