'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdminDashboard() {
    const { t, dir, toggleLanguage, lang } = useLanguage();
    const router = useRouter();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        pair: '',
        type: 'BUY',
        imageUrl: '',
    });

    useEffect(() => {
        // Check authentication
        const isAuth = sessionStorage.getItem('admin_authenticated');
        if (!isAuth) {
            router.push('/admin/login');
            return;
        }
        fetchSignals();
    }, [router]);

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
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                handleImageFile(blob);
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    };

    const handleImageFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            setImagePreview(base64);
            setFormData({ ...formData, imageUrl: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ pair: '', type: 'BUY', imageUrl: '' });
                setImagePreview(null);
                fetchSignals();
                alert(lang === 'ar' ? 'تم نشر التوصية بنجاح!' : 'Signal posted successfully!');
            } else {
                alert(lang === 'ar' ? 'فشل في نشر التوصية' : 'Failed to post signal');
            }
        } catch (error) {
            alert(lang === 'ar' ? 'حدث خطأ' : 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;

        try {
            const res = await fetch(`/api/signals/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSignals();
            }
        } catch (error) {
            console.error('Error deleting signal:', error);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('admin_authenticated');
        router.push('/admin/login');
    };

    return (
        <div dir={dir} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151520] to-[#0a0a0f] text-white p-6">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center glass-strong p-6 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-gold">{t('admin_title')}</h1>
                    <p className="text-gray-400 text-sm mt-1">{t('site_title')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="px-4 py-2 glass rounded-full text-sm font-semibold hover:glass-strong transition"
                    >
                        {lang === 'en' ? '🇸🇦 AR' : '🇬🇧 EN'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500/20 border border-red-500/50 rounded-full font-semibold hover:bg-red-500/30 transition"
                    >
                        {t('admin_logout')}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
                {/* Post Signal Form */}
                <div className="glass-strong p-8 rounded-3xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-6">{t('admin_post_signal')}</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pair Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                {t('admin_pair')}
                            </label>
                            <input
                                type="text"
                                value={formData.pair}
                                onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                                placeholder="XAUUSD - GOLD"
                                required
                            />
                        </div>

                        {/* Type Select */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                {t('admin_type')}
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                            >
                                <option value="BUY">{t('admin_buy')}</option>
                                <option value="SELL">{t('admin_sell')}</option>
                            </select>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                {t('admin_image')}
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onPaste={handleImagePaste}
                                className="w-full min-h-[200px] border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 transition bg-white/5"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="max-h-[400px] rounded-lg" />
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="text-6xl mb-4">📸</div>
                                        <p className="text-gray-400">{t('admin_paste_or_upload')}</p>
                                        <p className="text-gray-500 text-xs mt-2">Ctrl+V {lang === 'ar' ? 'أو اضغط للرفع' : 'or click to upload'}</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.pair || !formData.imageUrl}
                            className="w-full btn-premium py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (lang === 'ar' ? 'جاري النشر...' : 'Posting...') : t('admin_post')}
                        </button>
                    </form>
                </div>

                {/* Recent Signals */}
                <div className="glass-strong p-8 rounded-3xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-6">{t('admin_recent_signals')}</h2>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto">
                        {signals.map((signal) => (
                            <div key={signal._id} className="glass p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{signal.pair}</h3>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {signal.type}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(signal._id)}
                                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition"
                                    >
                                        {t('admin_delete')}
                                    </button>
                                </div>
                                <img src={signal.imageUrl} alt="Signal" className="w-full h-32 object-cover rounded-lg" />
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(signal.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                </p>
                            </div>
                        ))}

                        {signals.length === 0 && (
                            <p className="text-center text-gray-500 py-10">{lang === 'ar' ? 'لا توجد توصيات' : 'No signals yet'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
