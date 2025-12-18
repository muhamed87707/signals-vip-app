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

    // Simple State
    const [postToTelegram, setPostToTelegram] = useState(true);

    // VIP Management State
    const [telegramId, setTelegramId] = useState('');
    const [durationMonths, setDurationMonths] = useState('');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);

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
            setError(t.loginError || 'Incorrect password');
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
            const toBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            const base64Image = await toBase64(file);

            const payload = {
                pair,
                type,
                imageUrl: base64Image,
                sendToTelegram: postToTelegram,
                isVip: false // Force false for simple version
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
        if (!confirm('Are you sure you want to delete this signal?')) return;

        try {
            const res = await fetch(`/api/signals/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSignals();
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
                setVipMessage({ type: 'success', text: t.vipSuccess || 'User updated!' });
                setTelegramId('');
                setDurationMonths('');
                setIsLifetime(false);
                fetchUsers();
            } else {
                setVipMessage({ type: 'error', text: t.vipError || 'Error updating user' });
            }
        } catch (err) {
            setVipMessage({ type: 'error', text: t.vipError || 'Error' });
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

    if (!mounted) return null;

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>{t.adminTitle || 'Admin Login'}</h1>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder || 'Password'} style={{ width: '100%', padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff', textAlign: 'center', marginBottom: '1rem' }} />
                        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t.login || 'Login'}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080808', padding: '2rem' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>💎 {t.signalsDashboard || 'Signals Dashboard'}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ef4444', borderRadius: '50px', color: '#ef4444', cursor: 'pointer' }}>{t.logout || 'Logout'}</button>
                    </div>
                </div>

                <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem', border: '2px dashed rgba(184, 134, 11, 0.4)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1rem' }}>{t.postNewSignal || 'Post New Signal'}</h2>

                    <form onSubmit={handleUpload} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>

                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: postToTelegram ? '#229ED9' : '#888' }}>
                                <input type="checkbox" checked={postToTelegram} onChange={(e) => setPostToTelegram(e.target.checked)} />
                                Post to Telegram Channel
                            </label>
                        </div>

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
                            <p style={{ color: '#888' }}>{t.uploadPlaceholder || 'Click to select image'}</p>
                        </div>

                        <button type="submit" disabled={uploading} className="btn-primary" style={{ width: '100%', padding: '1rem', opacity: uploading ? 0.7 : 1 }}>
                            {uploading ? (t.uploading || 'Uploading...') : '🚀 Publish Signal'}
                        </button>
                    </form>
                    {successMessage && <p style={{ color: '#4caf50', marginTop: '1rem', fontWeight: 'bold' }}>{successMessage}</p>}
                </div>

                <h2 style={{ color: '#DAA520', marginBottom: '1.5rem' }}>📊 {t.publishedSignals || 'Published Signals'} ({signals.length})</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {loading ? <p style={{ color: '#888' }}>{t.loading || 'Loading...'}</p> : signals.map((signal) => (
                        <div key={signal._id} style={{ background: '#0c0c0c', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(184, 134, 11, 0.15)', position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={signal.imageUrl} alt="Signal" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                {signal.pair && <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.7)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{signal.pair} {signal.type}</div>}
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9a9ab0', fontSize: '0.9rem' }}>🕒 {getTimeAgo(signal.createdAt, lang)}</span>
                                <button onClick={() => handleDeleteSignal(signal._id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>{t.delete || 'Delete'}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(184, 134, 11, 0.2)' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>👑 {t.manageVip || 'Manage VIP'}</h2>
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(184, 134, 11, 0.1)' }}>
                        <h3 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.2rem' }}>{t.addNewVip || 'Add VIP'}</h3>
                        <form onSubmit={handleGrantVip} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder={t.telegramIdPlaceholder || 'Telegram ID'}
                                    style={{ width: '100%', padding: '0.8rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px', color: '#fff' }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ height: '45px', padding: '0 2rem' }}>
                                {vipLoading ? '...' : (t.grantVip || 'Grant VIP')}
                            </button>
                        </form>
                        {vipMessage.text && <p style={{ color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444', marginTop: '1rem' }}>{vipMessage.text}</p>}
                    </div>
                    {/* Active Users Table logic remains identical to viewed file, omitting for brevity in this manual replacement block because it was correct in previous view */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(184, 134, 11, 0.2)', textAlign: 'center' }}>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Telegram ID</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.isVip).length === 0 ? (
                                    <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No active VIP members</td></tr>
                                ) : (
                                    users.filter(u => u.isVip).map(user => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                            <td style={{ padding: '1rem' }}>{user.telegramId}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button onClick={() => handleRemoveUser(user.telegramId)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

