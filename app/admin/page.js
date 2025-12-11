'use client';
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = '@Mainpassword87707';

export default function AdminPanel() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [signals, setSignals] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Form
    const [pair, setPair] = useState('XAUUSD');
    const [type, setType] = useState('BUY');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState('');

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setAuthenticated(true);
            loadSignals();
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            loadSignals();
        } else {
            setError('كلمة مرور خاطئة');
        }
    };

    const loadSignals = async () => {
        const res = await fetch('/api/signals');
        const data = await res.json();
        setSignals(data.signals || []);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImageUrl(event.target.result);
                    setPreview(event.target.result);
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) {
            setMessage('❌ الرجاء لصق صورة أولاً');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pair, type, imageUrl }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('✅ تم نشر التوصية بنجاح');
                setImageUrl('');
                setPreview('');
                setPair('XAUUSD');
                setType('BUY');
                loadSignals();
            } else {
                setMessage('❌ حدث خطأ');
            }
        } catch (err) {
            setMessage('❌ خطأ في الاتصال');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل تريد حذف هذه التوصية؟')) return;

        await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
        loadSignals();
    };

    // LOGIN SCREEN
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #151520 100%)' }}>
                <div className="glass-strong rounded-3xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🔐</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                        <p className="text-gray-400 text-sm">Enter password to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold"
                            autoFocus
                        />

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button type="submit" className="btn-premium w-full">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ADMIN DASHBOARD
    return (
        <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #151520 100)' }} dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass-strong rounded-2xl p-4 mb-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gold flex items-center gap-2">
                        <span>👑</span> لوحة تحكم الأدمن
                    </h1>
                    <button onClick={() => {
                        setAuthenticated(false);
                        sessionStorage.removeItem('adminAuth');
                    }} className="text-red-400 hover:text-red-300 text-sm">
                        خروج
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="glass p-6 rounded-3xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📤</span> نشر توصية جديدة
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">الزوج</label>
                                <select value={pair} onChange={(e) => setPair(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                                    <option value="XAUUSD">XAUUSD (الذهب)</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">النوع</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setType('BUY')} className={`py-3 rounded-xl font-bold ${type === 'BUY' ? 'bg-green-500/20 text-green-400 border-2 border-green-500' : 'bg-white/5 text-gray-400'}`}>
                                        🟢 BUY
                                    </button>
                                    <button type="button" onClick={() => setType('SELL')} className={`py-3 rounded-xl font-bold ${type === 'SELL' ? 'bg-red-500/20 text-red-400 border-2 border-red-500' : 'bg-white/5 text-gray-400'}`}>
                                        🔴 SELL
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">الصورة (الصق هنا Ctrl+V)</label>
                                <div onPaste={handlePaste} tabIndex={0} className="w-full h-64 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer bg-white/5 overflow-hidden">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="max-w-full max-h-full" />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <div className="text-5xl mb-2">📋</div>
                                            <p>اضغط هنا ثم الصق (Ctrl+V)</p>
                                        </div>
                                    )}
                                </div>
                                {preview && (
                                    <button type="button" onClick={() => { setPreview(''); setImageUrl(''); }} className="text-red-400 text-sm mt-2">
                                        إزالة
                                    </button>
                                )}
                            </div>

                            {message && <p className={`text-center text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}

                            <button type="submit" disabled={uploading} className="btn-premium w-full">
                                {uploading ? 'جاري النشر...' : '🚀 نشر التوصية'}
                            </button>
                        </form>
                    </div>

                    {/* Signals List */}
                    <div className="glass p-6 rounded-3xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📊</span> التوصيات ({signals.length})
                        </h2>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {signals.map((s) => (
                                <div key={s._id} className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{s.pair}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${s.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {s.type}
                                            </span>
                                        </div>
                                        <button onClick={() => handleDelete(s._id)} className="text-red-400 text-sm">
                                            🗑️
                                        </button>
                                    </div>
                                    {s.imageUrl && <img src={s.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />}
                                    <p className="text-xs text-gray-500 mt-2">{new Date(s.createdAt).toLocaleString('ar')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
