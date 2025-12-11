'use client';

import { useState, useEffect, useRef } from 'react';

const ADMIN_PASSWORD = '123';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

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
            setError('كلمة المرور غير صحيحة');
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

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setSuccessMessage('');

        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;

                // Upload to API
                const res = await fetch('/api/signals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pair: 'GOLD',
                        type: 'SIGNAL',
                        imageUrl: base64Image
                    })
                });

                const data = await res.json();
                if (data.success) {
                    setSuccessMessage('تم نشر التوصية بنجاح! ✓');
                    fetchSignals();
                } else {
                    setError('حدث خطأ في نشر التوصية');
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload error:', err);
            setError('حدث خطأ في رفع الصورة');
            setUploading(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    setUploading(true);
                    setSuccessMessage('');

                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Image = reader.result;

                        try {
                            const res = await fetch('/api/signals', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    pair: 'GOLD',
                                    type: 'SIGNAL',
                                    imageUrl: base64Image
                                })
                            });

                            const data = await res.json();
                            if (data.success) {
                                setSuccessMessage('تم نشر التوصية بنجاح! ✓');
                                fetchSignals();
                            } else {
                                setError('حدث خطأ في نشر التوصية');
                            }
                        } catch (err) {
                            setError('حدث خطأ في نشر التوصية');
                        }
                        setUploading(false);
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };

    const deleteSignal = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه التوصية؟')) return;

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
                <div style={{
                    background: '#0f0f18',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                    borderRadius: '24px',
                    padding: '3rem',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 0 60px rgba(184, 134, 11, 0.1)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            background: 'linear-gradient(90deg, #B8860B, #DAA520, #FFE566, #DAA520, #B8860B)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>لوحة تحكم الإدمن</h1>
                        <p style={{ color: '#9a9ab0' }}>أدخل كلمة المرور للدخول</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة المرور"
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
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(180deg, #E6BE44 0%, #DAA520 15%, #B8860B 50%, #8B6914 85%, #705C0B 100%)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#1a1a1a',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: 'inset 0 2px 0 rgba(255, 244, 184, 0.5), 0 4px 20px rgba(184, 134, 11, 0.4)'
                            }}
                        >
                            دخول
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
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        background: 'linear-gradient(90deg, #B8860B, #DAA520, #FFE566, #DAA520, #B8860B)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        💎 لوحة تحكم التوصيات
                    </h1>
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
                        تسجيل خروج
                    </button>
                </div>

                {/* Upload Section */}
                <div style={{
                    background: '#0f0f18',
                    border: '2px dashed rgba(184, 134, 11, 0.4)',
                    borderRadius: '20px',
                    padding: '3rem',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.5rem' }}>
                        نشر توصية جديدة
                    </h2>
                    <p style={{ color: '#9a9ab0', marginBottom: '1.5rem' }}>
                        الصق صورة التوصية مباشرة (Ctrl+V) أو اختر ملف
                    </p>

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
                        style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(180deg, #E6BE44 0%, #DAA520 15%, #B8860B 50%, #8B6914 85%, #705C0B 100%)',
                            borderRadius: '50px',
                            color: '#1a1a1a',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: 'inset 0 2px 0 rgba(255, 244, 184, 0.5), 0 4px 20px rgba(184, 134, 11, 0.4)'
                        }}
                    >
                        {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                    </label>

                    {successMessage && (
                        <p style={{ color: '#4caf50', marginTop: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            {successMessage}
                        </p>
                    )}
                </div>

                {/* Signals List */}
                <div style={{
                    background: '#0f0f18',
                    border: '1px solid rgba(184, 134, 11, 0.2)',
                    borderRadius: '20px',
                    padding: '2rem'
                }}>
                    <h2 style={{ color: '#DAA520', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        📊 التوصيات المنشورة ({signals.length})
                    </h2>

                    {loading ? (
                        <p style={{ color: '#9a9ab0', textAlign: 'center' }}>جاري التحميل...</p>
                    ) : signals.length === 0 ? (
                        <p style={{ color: '#9a9ab0', textAlign: 'center' }}>لا توجد توصيات منشورة</p>
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
                                                {new Date(signal.createdAt).toLocaleDateString('ar-EG')}
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
                                                حذف
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
