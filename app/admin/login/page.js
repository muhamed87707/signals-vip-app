'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdminLogin() {
    const { t, dir, toggleLanguage, lang } = useLanguage();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('admin_authenticated', 'true');
                router.push('/admin/dashboard');
            } else {
                setError(lang === 'ar' ? 'كلمة مرور خاطئة' : 'Incorrect password');
            }
        } catch (err) {
            setError(lang === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div dir={dir} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151520] to-[#0a0a0f] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="absolute top-6 right-6 px-4 py-2 glass rounded-full text-sm font-semibold text-white hover:glass-strong transition z-20"
            >
                {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
            </button>

            {/* Login Card */}
            <div className="relative z-10 glass-strong p-10 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-yellow-500/30">
                        🔐
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('admin_login')}</h1>
                    <p className="text-gray-400 text-sm">{t('site_title')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            {t('admin_password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition"
                            placeholder="••••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-premium py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (lang === 'ar' ? 'جاري الدخول...' : 'Logging in...') : t('admin_login_button')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-gray-400 hover:text-white text-sm transition"
                    >
                        ← {lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to home'}
                    </a>
                </div>
            </div>
        </div>
    );
}
