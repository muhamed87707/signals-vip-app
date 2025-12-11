'use client';
import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = '@Mainpassword87707';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [signals, setSignals] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');

    // Form state
    const [pair, setPair] = useState('XAUUSD');
    const [signalType, setSignalType] = useState('BUY');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        // Check if already authenticated in session
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSignals();
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            setError('');
            fetchSignals();
        } else {
            setError('كلمة المرور غير صحيحة');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
        setPassword('');
    };

    const fetchSignals = async () => {
        try {
            const res = await fetch('/api/signals');
            const data = await res.json();
            if (data.signals) setSignals(data.signals);
        } catch (error) {
            console.error('Error fetching signals:', error);
        }
    };

    const handleImagePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    setImagePreview(base64);
                    setImageUrl(base64);
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) {
            setError('الرجاء لصق صورة التوصية');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pair,
                    type: signalType,
                    imageUrl,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess('تم نشر التوصية بنجاح! ✅');
                setImageUrl('');
                setImagePreview('');
                setPair('XAUUSD');
                setSignalType('BUY');
                fetchSignals();
            } else {
                setError('حدث خطأ أثناء نشر التوصية');
            }
        } catch (error) {
            setError('حدث خطأ في الاتصال');
        } finally {
            setUploading(false);
        }
    };

    const deleteSignal = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه التوصية؟')) return;

        try {
            const res = await fetch(`/api/signals?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchSignals();
                setSuccess('تم حذف التوصية ✅');
            }
        } catch (error) {
            setError('حدث خطأ أثناء الحذف');
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4" dir="rtl">
                <div className="glass-strong rounded-3xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <span className="text-5xl mb-4 block">🔐</span>
                        <h1 className="text-2xl font-bold gold-text">لوحة تحكم الأدمن</h1>
                        <p className="text-gray-400 text-sm mt-2">أدخل كلمة المرور للدخول</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="كلمة المرور"
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 transition"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="mb-4 text-red-400 text-center text-sm bg-red-500/10 py-2 px-4 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full gold-button py-4 rounded-xl text-lg font-bold"
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
        <div className="min-h-screen bg-[#050510] p-4 md:p-8" dir="rtl">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center glass rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <h1 className="text-xl font-bold gold-text">لوحة تحكم الأدمن</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
                    >
                        خروج
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
                {/* New Signal Form */}
                <div className="glass rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>📤</span> نشر توصية جديدة
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Pair Selection */}
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-2">الزوج</label>
                            <select
                                value={pair}
                                onChange={(e) => setPair(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50"
                            >
                                <option value="XAUUSD">XAUUSD (الذهب)</option>
                                <option value="EURUSD">EURUSD</option>
                                <option value="GBPUSD">GBPUSD</option>
                                <option value="USDJPY">USDJPY</option>
                                <option value="BTCUSD">BTCUSD</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {/* Signal Type */}
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-2">نوع التوصية</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSignalType('BUY')}
                                    className={`py-3 rounded-xl font-bold transition ${signalType === 'BUY'
                                            ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                                            : 'bg-white/5 text-gray-400 border border-white/10'
                                        }`}
                                >
                                    🟢 BUY
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignalType('SELL')}
                                    className={`py-3 rounded-xl font-bold transition ${signalType === 'SELL'
                                            ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                                            : 'bg-white/5 text-gray-400 border border-white/10'
                                        }`}
                                >
                                    🔴 SELL
                                </button>
                            </div>
                        </div>

                        {/* Image Paste Area */}
                        <div className="mb-6">
                            <label className="block text-gray-400 text-sm mb-2">صورة التوصية (الصق هنا)</label>
                            <div
                                onPaste={handleImagePaste}
                                className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#D4AF37]/50 transition bg-white/5 overflow-hidden"
                                tabIndex={0}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <span className="text-4xl block mb-2">📋</span>
                                        <p>اضغط هنا ثم الصق الصورة (Ctrl+V)</p>
                                    </div>
                                )}
                            </div>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(''); setImageUrl(''); }}
                                    className="mt-2 text-red-400 text-sm hover:underline"
                                >
                                    إزالة الصورة
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="mb-4 text-red-400 text-center text-sm bg-red-500/10 py-2 px-4 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 text-green-400 text-center text-sm bg-green-500/10 py-2 px-4 rounded-lg">
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full gold-button py-4 rounded-xl text-lg font-bold ${uploading ? 'opacity-50' : ''}`}
                        >
                            {uploading ? 'جاري النشر...' : '🚀 نشر التوصية'}
                        </button>
                    </form>
                </div>

                {/* Signals List */}
                <div className="glass rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>📊</span> التوصيات المنشورة ({signals.length})
                    </h2>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {signals.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                لا توجد توصيات منشورة بعد
                            </div>
                        ) : (
                            signals.map((signal) => (
                                <div key={signal._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{signal.pair}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {signal.type}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteSignal(signal._id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            🗑️ حذف
                                        </button>
                                    </div>
                                    {signal.imageUrl && (
                                        <img
                                            src={signal.imageUrl}
                                            alt="Signal"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="mt-2 text-gray-500 text-xs">
                                        {new Date(signal.createdAt).toLocaleString('ar-EG')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
