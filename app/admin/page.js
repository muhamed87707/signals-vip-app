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
    const [durationMonths, setDurationMonths] = useState('');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);

    // Telegram Auto-Post State
    const [postToTelegram, setPostToTelegram] = useState(true);

    // ===== NEW: Signal Type & AI Post Generation =====
    // Initialize with defaults, will fetch from DB on mount
    const [signalType, setSignalType] = useState('vip');
    const [customPost, setCustomPost] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState([]);
    const [generatingPosts, setGeneratingPosts] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(-1);
    const [postCount, setPostCount] = useState(50); // New State for Count
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false); // Manual Save state

    // FETCH SETTINGS FROM DB ON MOUNT
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    const s = data.settings;
                    // Use property check ('in') or check against undefined to allow saving empty strings
                    if (s.geminiApiKey !== undefined) setGeminiApiKey(s.geminiApiKey);
                    if (s.aiPrompt !== undefined) setAiPrompt(s.aiPrompt);
                    if (s.selectedModel !== undefined) setSelectedModel(s.selectedModel);
                    if (s.generatedPostCount !== undefined) setPostCount(Number(s.generatedPostCount));
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
            setSettingsLoaded(true);
        };
        fetchSettings();

        // Also load signal type and custom post from local storage (UI preference vs Config)
        // User asked for "API, Prompt, Model" -> DB. Custom Post & Type -> Maybe keep localStorage or add to DB?
        // User said "The prompt, api key, model... stored in database". 
        // I will stick to localStorage for momentary drafts like customPost/SignalType to avoid DB spam, 
        // unless explicitly asked for ALL fields. User said "Settings". 
        // Let's keep customPost/Type in localStorage for session persistence, 
        // and Key/Prompt/Model in DB for global config.
        if (typeof window !== 'undefined') {
            const savedPost = localStorage.getItem('admin-custom-post');
            const savedType = localStorage.getItem('admin-signal-type');
            if (savedPost) setCustomPost(savedPost);
            if (savedType) setSignalType(savedType);
        }
    }, []);

    // Save Drafts to LocalStorage (User Experience / Session)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin-custom-post', customPost);
        }
    }, [customPost]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('admin-signal-type', signalType);
        }
    }, [signalType]);

    // SAVE SETTINGS TO DB (Debounced)
    // We create a generic save function
    const saveSettingsToDB = async (payload, manual = false) => {
        if (manual) setSavingSettings(true);
        try {
            // If manual, save all current settings
            const body = manual ? {
                geminiApiKey,
                aiPrompt,
                selectedModel,
                generatedPostCount: postCount
            } : payload;

            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (manual) {
                const data = await res.json();
                if (data.success) {
                    alert(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!');
                }
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            if (manual) alert(lang === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
        }
        if (manual) setSavingSettings(false);
    };

    // Effects to trigger save when specific fields change (after load)
    useEffect(() => {
        if (!settingsLoaded) return;
        const timer = setTimeout(() => {
            saveSettingsToDB({ generatedPostCount: postCount });
        }, 1000);
        return () => clearTimeout(timer);
    }, [postCount, settingsLoaded]);

    useEffect(() => {
        if (!settingsLoaded) return;
        const timer = setTimeout(() => {
            saveSettingsToDB({ geminiApiKey });
        }, 1000); // Debounce 1s
        return () => clearTimeout(timer);
    }, [geminiApiKey, settingsLoaded]);

    useEffect(() => {
        if (!settingsLoaded) return;
        const timer = setTimeout(() => {
            saveSettingsToDB({ aiPrompt });
        }, 2000); // Extended debounce for text area
        return () => clearTimeout(timer);
    }, [aiPrompt, settingsLoaded]);

    useEffect(() => {
        if (!settingsLoaded) return;
        saveSettingsToDB({ selectedModel });
    }, [selectedModel, settingsLoaded]);

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

    // ===== NEW: Fetch Gemini Models =====
    const fetchModels = async () => {
        if (!geminiApiKey) return;
        setModelsLoading(true);
        try {
            const res = await fetch('/api/ai/list-models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: geminiApiKey })
            });
            const data = await res.json();
            if (data.success) {
                setAvailableModels(data.models || []);
            } else {
                console.error('Failed to fetch models:', data.error);
            }
        } catch (err) {
            console.error('Error fetching models:', err);
        }
        setModelsLoading(false);
    };

    // ===== NEW: Generate AI Posts =====
    const generateAIPosts = async () => {
        if (!customPost.trim()) {
            setError(lang === 'ar' ? 'يرجى كتابة المنشور أولاً' : 'Please write a post first');
            return;
        }
        setGeneratingPosts(true);
        setGeneratedPosts([]);
        setSelectedPostIndex(-1);
        try {
            const res = await fetch('/api/ai/generate-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: geminiApiKey,
                    model: selectedModel,
                    userPost: customPost,
                    customPrompt: aiPrompt || undefined,
                    count: postCount // Use the configured count
                })
            });
            const data = await res.json();
            if (data.success && data.posts) {
                setGeneratedPosts(data.posts);
            } else {
                setError(data.error || 'Failed to generate posts');
            }
        } catch (err) {
            console.error('Error generating posts:', err);
            setError(err.message);
        }
        setGeneratingPosts(false);
    };

    // Fetch default prompt on load
    useEffect(() => {
        if (!aiPrompt) {
            fetch('/api/ai/generate-posts')
                .then(res => res.json())
                .then(data => {
                    if (data.defaultPrompt && !aiPrompt) {
                        setAiPrompt(data.defaultPrompt);
                    }
                })
                .catch(console.error);
        }
    }, []);

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

    // Preview State
    const [previewData, setPreviewData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Render preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewData(reader.result);
            setSelectedFile(file);
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreviewData(reader.result);
                        setSelectedFile(file);
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };

    const handlePublish = () => {
        if (selectedFile) processFile(selectedFile);
    };

    const cancelPreview = () => {
        setPreviewData(null);
        setSelectedFile(null);
        setSuccessMessage('');
        setError('');
    };

    const processFile = async (file) => {
        setUploading(true);
        setSuccessMessage('');
        setError('');

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;

                // Get the post to use
                let postToUse = selectedPostIndex >= 0 && generatedPosts[selectedPostIndex]
                    ? generatedPosts[selectedPostIndex]
                    : customPost;

                // AUTO-BOLD LOGIC: Wrap in * for Telegram Markdown
                // We trim it first, then wrap.
                if (postToUse && postToUse.trim()) {
                    const cleanPost = postToUse.trim();
                    // Avoid double wrapping if already wrapped
                    if (!cleanPost.startsWith('*') && !cleanPost.endsWith('*')) {
                        postToUse = `*${cleanPost}*`;
                    }
                }

                // Only create blurred image for VIP signals
                let telegramImage = null;
                if (postToTelegram && signalType === 'vip') {
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
                        sendToTelegram: postToTelegram,
                        isVip: signalType === 'vip',
                        customPost: postToUse || null
                    })
                });

                const data = await res.json();
                if (data.success) {
                    let msg = t.postSuccess;
                    if (postToTelegram) msg += ` ${t.telegramSuccess || ''}`;
                    setSuccessMessage(msg);
                    fetchSignals();
                    // Clear state
                    setGeneratedPosts([]);
                    setSelectedPostIndex(-1);
                    setPreviewData(null);
                    setSelectedFile(null);
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
                setVipMessage({ type: 'success', text: t.vipSuccess });
                setTelegramId('');
                setDurationMonths('');
                setIsLifetime(false);
                fetchUsers();
            } else {
                setVipMessage({ type: 'error', text: t.vipError });
            }
        } catch (err) {
            setVipMessage({ type: 'error', text: t.vipError });
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
            <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '700' }}>{t.adminTitle}</h1>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} style={{ width: '100%', padding: '1rem', background: '#141414', border: '1px solid rgba(184, 134, 11, 0.2)', borderRadius: '12px', color: '#fff', textAlign: 'center', marginBottom: '1rem' }} />
                        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t.login}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080808', padding: '2rem' }} onPaste={handlePaste}>
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

                {/* Old VIP Section Removed - Moved to Bottom */}

                <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: '2px dashed rgba(184, 134, 11, 0.4)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>📤</div>
                    <h2 style={{ color: '#DAA520', marginBottom: '1.5rem', textAlign: 'center' }}>{t.postNewSignal}</h2>

                    {/* ===== Signal Type Toggle ===== */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setSignalType('vip')}
                            style={{
                                padding: '0.75rem 2rem',
                                background: signalType === 'vip' ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'transparent',
                                border: `2px solid ${signalType === 'vip' ? '#DAA520' : '#555'}`,
                                borderRadius: '50px',
                                color: signalType === 'vip' ? '#000' : '#888',
                                fontWeight: signalType === 'vip' ? '700' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            👑 VIP {lang === 'ar' ? '(مموهة)' : '(Blurred)'}
                        </button>
                        <button
                            onClick={() => setSignalType('free')}
                            style={{
                                padding: '0.75rem 2rem',
                                background: signalType === 'free' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'transparent',
                                border: `2px solid ${signalType === 'free' ? '#4caf50' : '#555'}`,
                                borderRadius: '50px',
                                color: signalType === 'free' ? '#fff' : '#888',
                                fontWeight: signalType === 'free' ? '700' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            🎁 {lang === 'ar' ? 'مجانية (واضحة)' : 'Free (Clear)'}
                        </button>
                    </div>

                    {/* ===== Telegram Toggle ===== */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setPostToTelegram(!postToTelegram)}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${postToTelegram ? '#229ED9' : '#555'}`, background: postToTelegram ? '#229ED9' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {postToTelegram && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>
                        <span style={{ color: '#f0f0f0' }}>{t.postToTelegram}</span>
                    </div>

                    {/* ===== Custom Post Editor ===== */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ color: '#DAA520', fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>
                            ✍️ {lang === 'ar' ? 'اكتب المنشور' : 'Write Your Post'}
                        </label>
                        <textarea
                            value={customPost}
                            onChange={(e) => setCustomPost(e.target.value)}
                            placeholder={lang === 'ar' ? 'اكتب المنشور الذي سيتم نشره مع التوصية...' : 'Write the post that will be published with the signal...'}
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '1rem',
                                background: '#13131d',
                                border: '1px solid #2a2a35',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* ===== AI Generation Settings ===== */}
                    <details style={{ background: '#0f0f12', borderRadius: '12px', padding: '1rem', margin: '0 0 2rem 0', border: '1px solid #2a2a35' }}>
                        <summary style={{ cursor: 'pointer', color: '#DAA520', fontWeight: 'bold' }}>
                            🤖 {lang === 'ar' ? 'إعدادات الذكاء الاصطناعي (Gemini)' : 'AI Settings (Gemini)'}
                        </summary>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Manual Save Button - ADDED */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => saveSettingsToDB(null, true)}
                                    disabled={savingSettings}
                                    style={{
                                        padding: '0.5rem 1.5rem',
                                        background: '#4CAF50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: savingSettings ? 'wait' : 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    💾 {savingSettings ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                                </button>
                            </div>

                            {/* API Key Input */}
                            <div>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                                    🔑 Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    value={geminiApiKey}
                                    onChange={(e) => setGeminiApiKey(e.target.value)}
                                    placeholder="Enter your Google Gemini API Key"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </div>

                            {/* Model Selection & Post Count */}
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 2, minWidth: '200px' }}>
                                    <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                                        🧠 {lang === 'ar' ? 'موديل الذكاء الاصطناعي' : 'AI Model'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.8rem',
                                                background: '#13131d',
                                                border: '1px solid #2a2a35',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        >
                                            <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended)</option>
                                            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                            {availableModels.map(m => (
                                                <option key={m.id} value={m.id}>{m.displayName}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={fetchModels}
                                            disabled={modelsLoading}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: '#2a2a35',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {modelsLoading ? '...' : '🔄'}
                                        </button>
                                    </div>
                                </div>

                                {/* Post Count Input - ADDED */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                                        🔢 {lang === 'ar' ? 'عدد المنشورات' : 'Number of Posts'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={postCount}
                                        onChange={(e) => setPostCount(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            background: '#13131d',
                                            border: '1px solid #2a2a35',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </div>
                            </div>
                            {/* AI Prompt */}
                            <div>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                                    📝 {lang === 'ar' ? 'البرومبت (يمكنك التعديل)' : 'Prompt (Editable)'}
                                </label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    style={{
                                        width: '100%',
                                        minHeight: '150px',
                                        padding: '1rem',
                                        background: '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>
                    </details>

                    {/* ===== Generate Posts Button ===== */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <button
                            onClick={generateAIPosts}
                            disabled={generatingPosts || !customPost.trim()}
                            style={{
                                padding: '1rem 2rem',
                                background: generatingPosts ? '#333' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#fff',
                                fontWeight: '700',
                                cursor: generatingPosts ? 'wait' : 'pointer',
                                opacity: !customPost.trim() ? 0.5 : 1
                            }}
                        >
                            {generatingPosts ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...') : (lang === 'ar' ? '🚀 توليد 50 نسخة بالذكاء الاصطناعي' : '🚀 Generate 50 AI Variations')}
                        </button>
                    </div>

                    {/* ===== Generated Posts Gallery ===== */}
                    {generatedPosts.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: '#DAA520', marginBottom: '1rem' }}>
                                ✨ {lang === 'ar' ? `اختر منشوراً (${generatedPosts.length} نسخة)` : `Select a Post (${generatedPosts.length} variations)`}
                            </h3>
                            <div style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1rem',
                                padding: '0.5rem',
                                background: '#0a0a0f',
                                borderRadius: '12px',
                                border: '1px solid #2a2a35'
                            }}>
                                {generatedPosts.map((post, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedPostIndex(idx)}
                                        style={{
                                            padding: '1rem',
                                            background: selectedPostIndex === idx ? 'rgba(184, 134, 11, 0.15)' : '#13131d',
                                            border: `2px solid ${selectedPostIndex === idx ? '#DAA520' : '#2a2a35'}`,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>#{idx + 1}</div>
                                        <p style={{ color: '#e0e0e0', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{post}</p>
                                    </div>
                                ))}
                            </div>
                            {selectedPostIndex >= 0 && (
                                <p style={{ color: '#4caf50', marginTop: '1rem', textAlign: 'center' }}>
                                    ✓ {lang === 'ar' ? `تم اختيار المنشور رقم ${selectedPostIndex + 1}` : `Post #${selectedPostIndex + 1} selected`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ===== Preview Card OR Upload Button ===== */}
                    {previewData ? (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: '#13131d',
                            borderRadius: '16px',
                            border: '1px solid #2a2a35',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ color: '#DAA520', marginBottom: '1rem' }}>👁️ {lang === 'ar' ? 'معاينة قبل النشر' : 'Preview Before Publishing'}</h3>

                            {/* Image Preview */}
                            <div style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                border: '1px solid #333',
                                display: 'inline-block'
                            }}>
                                <img src={previewData} alt="Preview" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                            </div>

                            {/* Text Preview */}
                            <div style={{
                                textAlign: 'left',
                                background: '#0a0a0f',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #2a2a35',
                                marginBottom: '1.5rem',
                                whiteSpace: 'pre-wrap',
                                direction: lang === 'ar' ? 'rtl' : 'ltr'
                            }}>
                                <label style={{ display: 'block', color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                    {lang === 'ar' ? 'نص المنشور (سيتم تعريضه تلقائياً)' : 'Post Text (Auto-Bold Applied)'}
                                </label>
                                <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>
                                    {/* Show the text as it will appear (visually bold) */}
                                    {selectedPostIndex >= 0 && generatedPosts[selectedPostIndex]
                                        ? generatedPosts[selectedPostIndex]
                                        : customPost || (lang === 'ar' ? 'لا يوجد نص' : 'No text provided')}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={cancelPreview}
                                    style={{
                                        padding: '0.8rem 2rem',
                                        background: 'transparent',
                                        border: '1px solid #555',
                                        borderRadius: '50px',
                                        color: '#bbb',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ❌ {lang === 'ar' ? 'إلغاء / تغيير الصورة' : 'Cancel / Change Image'}
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={uploading}
                                    style={{
                                        padding: '0.8rem 2rem',
                                        background: 'linear-gradient(135deg, #B8860B, #DAA520)',
                                        border: 'none',
                                        borderRadius: '50px',
                                        color: '#000', // Black text on gold for contrast
                                        fontWeight: '800',
                                        cursor: uploading ? 'wait' : 'pointer',
                                        boxShadow: '0 4px 15px rgba(184, 134, 11, 0.3)',
                                        transition: 'all 0.2s',
                                        transform: uploading ? 'none' : 'scale(1.05)'
                                    }}
                                >
                                    {uploading ? (lang === 'ar' ? 'جاري النشر...' : 'Publishing...') : (lang === 'ar' ? '🚀 تأكيد ونشر الآن' : '🚀 Confirm & Publish')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Upload Button */
                        <div style={{ textAlign: 'center' }}>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
                            <label htmlFor="image-upload" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block', padding: '1rem 3rem' }}>
                                {lang === 'ar' ? '📸 اختيار صورة للمعاينة' : '📸 Select Image to Preview'}
                            </label>
                        </div>
                    )}

                    {successMessage && <p style={{ color: '#4caf50', marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>{successMessage}</p>}
                    {error && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
                </div>

                <h2 style={{ color: '#DAA520', marginBottom: '1.5rem' }}>📊 {t.publishedSignals} ({signals.length})</h2>

                {/* Full Width Grid Layout - Matches User Request */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                    {loading ? <p style={{ color: '#888' }}>{t.loading}</p> : signals.map((signal) => (
                        <div key={signal._id} style={{ background: '#0c0c0c', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(184, 134, 11, 0.15)' }}>
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

                {/* VIP Management Section - Moved to Bottom */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(184, 134, 11, 0.2)' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>👑 {t.manageVip}</h2>

                    {/* Add VIP Form */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(184, 134, 11, 0.1)' }}>
                        <h3 style={{ color: '#DAA520', marginBottom: '1rem', fontSize: '1.2rem' }}>{t.addNewVip}</h3>
                        <form onSubmit={handleGrantVip} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.telegramIdPlaceholder}</label>
                                <input
                                    type="text"
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ minWidth: '150px' }}>
                                <label style={{ color: '#9a9ab0', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{t.durationMonths || 'Duration (Months)'}</label>
                                <input
                                    type="number"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(e.target.value)}
                                    placeholder="e.g. 1, 3, 12"
                                    disabled={isLifetime}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: isLifetime ? '#0f0f15' : '#13131d',
                                        border: '1px solid #2a2a35',
                                        borderRadius: '8px',
                                        color: isLifetime ? '#555' : '#fff'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', height: '45px', padding: '0 1rem', background: '#13131d', border: '1px solid #2a2a35', borderRadius: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="lifetime"
                                    checked={isLifetime}
                                    onChange={(e) => setIsLifetime(e.target.checked)}
                                    style={{ marginRight: '0.5rem', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="lifetime" style={{ color: '#fff', cursor: 'pointer', userSelect: 'none' }}>{t.lifetime || 'Lifetime'}</label>
                            </div>

                            <button type="submit" className="btn-primary" style={{ height: '45px', padding: '0 2rem' }}>
                                {vipLoading ? '...' : t.grantVip}
                            </button>
                        </form>
                        {vipMessage.text && <p style={{ color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444', marginTop: '1rem' }}>{vipMessage.text}</p>}
                    </div>

                    {/* Active Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(184, 134, 11, 0.2)', textAlign: 'center' }}>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Telegram ID</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.status || 'Status'}</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.expiresIn || 'Expires In'}</th>
                                    <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{t.actions || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.isVip).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t.noVipMembers || 'No active VIP members'}</td>
                                    </tr>
                                ) : (
                                    users.filter(u => u.isVip).map(user => {
                                        const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                                        const now = new Date();
                                        const isExpired = expiry && now > expiry;
                                        // This filter effectively hides expired users, per request "Active members only"
                                        // If backend update didn't run yet, front-end check helps
                                        if (isExpired && user.isVip) return null; // Should ideally be handled by state refresh

                                        let timeLeft = 'Lifetime ♾️';
                                        if (expiry) {
                                            const diff = expiry - now;
                                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                            timeLeft = `${days} Days`;
                                        }

                                        return (
                                            <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                <td style={{ padding: '1rem' }}>{user.telegramId}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: 'rgba(76, 175, 80, 0.1)',
                                                        color: '#4caf50',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem'
                                                    }}>Active</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{timeLeft}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => handleRemoveUser(user.telegramId)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #ef4444',
                                                            color: '#ef4444',
                                                            padding: '0.3rem 0.8rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {t.remove || 'Remove'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
