'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Analysis Page Crash:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
            <div className="bg-[#1a1a1a] border border-red-900/50 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-sm">
                <span className="text-4xl mb-4 block">⚠️</span>
                <h2 className="text-xl font-bold text-red-500 mb-3">
                    عذراً، حدث خطأ فني بسيط
                </h2>
                <div className="bg-red-900/20 p-3 rounded mb-4 text-left overflow-auto max-h-32">
                    <code className="text-red-400 text-xs font-mono break-all">{error.message || "Unknown Error"}</code>
                </div>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    نواجه مشكلة مؤقتة في تحميل لوحة التحليل. تم تسجيل الخطأ وتنبيه الفريق التقني.
                </p>
                <button
                    onClick={() => reset()}
                    className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02]"
                >
                    🔄 إعادة المحاولة / Try Again
                </button>
            </div>
            <style jsx>{`
                .text-red-500 { color: #ef4444; }
                .text-gray-400 { color: #9ca3af; }
                .bg-gold-500 { background-color: #eab308; }
            `}</style>
        </div>
    );
}
