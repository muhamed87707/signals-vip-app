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
    const [activeTab, setActiveTab] = useState('publish');

    // VIP Management State
    const [telegramId, setTelegramId] = useState('');
    const [durationMonths, setDurationMonths] = useState('');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);

    // Telegram Auto-Post State
    const [postToTelegram, setPostToTelegram] = useState(true);

    // Signal Type & AI Post Generation
    const [signalType, setSignalType] = useState('vip');
    const [customPost, setCustomPost] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState([]);
    const [generatingPosts, setGeneratingPosts] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(-1);
    const [postCount, setPostCount] = useState(50);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [telegramButtonType, setTelegramButtonType] = useState('view_signal');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Preview State
    const [previewData, setPreviewData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // FETCH SETTINGS FROM DB ON MOUNT
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                const data = await res.json();
                if (data.success && data.settings) {
                    const s = data.settings;
                    if (s.geminiApiKey !== undefined) setGeminiApiKey(s.geminiApiKey);
                    if (s.aiPrompt !== undefined) setAiPrompt(s.aiPrompt);
                    if (s.selectedModel !== undefined) setSelectedModel(s.selectedModel);
                    if (s.generatedPostCount !== undefined) setPostCount(Number(s.generatedPostCount));
                    setSettingsLoaded(true);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();

        if (typeof window !== 'undefined') {
            const savedPost = localStorage.getItem('admin-custom-post');
            const savedType = localStorage.getItem('admin-signal-type');
            if (savedPost) setCustomPost(savedPost);
            if (savedType) setSignalType(savedType);
        }
    }, []);

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

    const saveSettingsToDB = async (payload, manual = false) => {
        if (manual) setSavingSettings(true);
        try {
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
                    setSuccessMessage(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                }
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            if (manual) setError(lang === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
        }
        if (manual) setSavingSettings(false);
    };

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
            const res = await fetch('/api/signals?admin=true');
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

    const handleEdit = (signal) => {
        setCustomPost(signal.customPost || '');
        setTelegramButtonType(signal.telegramButtonType || 'view_signal');
        setSignalType(signal.type === 'REGULAR' ? 'regular' : (signal.isVip ? 'vip' : 'free'));
        setPreviewData(signal.imageUrl);
        setSelectedFile(null);
        setIsEditing(true);
        setEditingId(signal._id);
        setSuccessMessage('');
        setError('');
        setActiveTab('publish');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setCustomPost('');
        setPreviewData(null);
        setSelectedFile(null);
        setTelegramButtonType('view_signal');
        setError('');
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setUploading(true);
        setSuccessMessage('');
        setError('');

        try {
            let postToUse = customPost;
            if (postToUse && postToUse.trim()) {
                const cleanPost = postToUse.trim();
                if (!cleanPost.startsWith('*') && !cleanPost.endsWith('*')) {
                    postToUse = `*${cleanPost}*`;
                }
            }

            let payload = {
                id: editingId,
                customPost: postToUse,
                telegramButtonType: telegramButtonType,
                type: signalType === 'regular' ? 'REGULAR' : 'SIGNAL',
                isVip: signalType === 'vip'
            };

            if (selectedFile) {
                const reader = new FileReader();
                const filePromise = new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });

                const base64Image = await filePromise;
                payload.imageUrl = base64Image;

                if (signalType === 'vip') {
                    try {
                        payload.telegramImage = await createBlurredImage(selectedFile);
                    } catch (blurErr) {
                        console.error('Blur failed during update', blurErr);
                    }
                }
            } else {
                payload.imageUrl = previewData;
            }

            const res = await fetch('/api/signals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage(lang === 'ar' ? 'تم تحديث المنشور بنجاح!' : 'Signal updated successfully!');
                handleCancelEdit();
                fetchSignals();
            } else {
                setError(t.postError);
            }
        } catch (err) {
            console.error('Update error:', err);
            setError(t.postError);
        }
        setUploading(false);
    };

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
            }
        } catch (err) {
            console.error('Error fetching models:', err);
        }
        setModelsLoading(false);
    };

    useEffect(() => {
        if (settingsLoaded && geminiApiKey && availableModels.length === 0) {
            fetchModels();
        }
    }, [settingsLoaded, geminiApiKey]);

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
                    count: postCount
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

    const createBlurredImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.filter = 'blur(10px)';
                ctx.drawImage(img, -20, -20, canvas.width + 40, canvas.height + 40);
                ctx.filter = 'none';

                const size = Math.min(canvas.width, canvas.height) * 0.35;
                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;

                const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" style="stop-color:rgba(184, 134, 11, 0.4);stop-opacity:1" />
                            <stop offset="70%" style="stop-color:rgba(0, 0, 0, 0);stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFE566;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#B8860B;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#705C0B;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <g transform="translate(25, 21) scale(0.6)">
                         <circle cx="12" cy="16" r="5.5" fill="rgba(0,0,0,0.6)" transform="scale(3.5)" />
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

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewData(reader.result);
            setSelectedFile(file);
        };
        reader.readAsDataURL(file);

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

                let postToUse = selectedPostIndex >= 0 && generatedPosts[selectedPostIndex]
                    ? generatedPosts[selectedPostIndex]
                    : customPost;

                if (postToUse && postToUse.trim()) {
                    const cleanPost = postToUse.trim();
                    if (!cleanPost.startsWith('*') && !cleanPost.endsWith('*')) {
                        postToUse = `*${cleanPost}*`;
                    }
                }

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
                        type: signalType === 'regular' ? 'REGULAR' : 'SIGNAL',
                        imageUrl: base64Image,
                        telegramImage: telegramImage,
                        sendToTelegram: postToTelegram,
                        isVip: signalType === 'vip',
                        customPost: postToUse || null,
                        telegramButtonType: telegramButtonType
                    })
                });

                const data = await res.json();
                if (data.success) {
                    let msg = t.postSuccess;
                    if (postToTelegram) msg += ` ${t.telegramSuccess || ''}`;
                    setSuccessMessage(msg);
                    fetchSignals();
                    setGeneratedPosts([]);
                    setSelectedPostIndex(-1);
                    setPreviewData(null);
                    setSelectedFile(null);
                    setCustomPost('');
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

    const vipUsers = users.filter(u => u.isVip);
    const tabs = [
        { id: 'publish', label: lang === 'ar' ? '📤 نشر توصية' : '📤 Publish' },
        { id: 'signals', label: lang === 'ar' ? `📊 التوصيات (${signals.length})` : `📊 Signals (${signals.length})` },
        { id: 'vip', label: lang === 'ar' ? `👑 VIP (${vipUsers.length})` : `👑 VIP (${vipUsers.length})` },
        { id: 'settings', label: lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings' },
    ];


    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-card">
                    <div className="login-icon">💎</div>
                    <h1 className="text-gradient">{t.adminTitle}</h1>
                    <p className="login-subtitle">{lang === 'ar' ? 'أدخل كلمة المرور للوصول' : 'Enter password to access'}</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            className="gold-input"
                        />
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-primary">{t.login}</button>
                    </form>
                </div>

                <style jsx>{`
                    .admin-login {
                        min-height: 100vh;
                        background: #080808;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        background-image: linear-gradient(rgba(184, 134, 11, 0.03) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(184, 134, 11, 0.03) 1px, transparent 1px);
                        background-size: 50px 50px;
                    }
                    .login-card {
                        background: #0c0c0c;
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 24px;
                        padding: 3rem;
                        max-width: 420px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 0 60px rgba(184, 134, 11, 0.1);
                    }
                    .login-icon {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #B8860B, #DAA520, #FFE566);
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                        font-size: 2.5rem;
                        box-shadow: 0 8px 32px rgba(184, 134, 11, 0.4);
                    }
                    .login-card h1 {
                        font-size: 1.75rem;
                        margin-bottom: 0.5rem;
                    }
                    .login-subtitle {
                        color: #888;
                        margin-bottom: 2rem;
                    }
                    .gold-input {
                        width: 100%;
                        padding: 1rem;
                        background: rgba(184, 134, 11, 0.05);
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 12px;
                        color: #fff;
                        font-size: 1rem;
                        text-align: center;
                        margin-bottom: 1rem;
                        outline: none;
                        transition: all 0.3s;
                    }
                    .gold-input:focus {
                        border-color: #DAA520;
                        box-shadow: 0 0 20px rgba(184, 134, 11, 0.2);
                    }
                    .error-msg {
                        color: #ef4444;
                        background: rgba(239, 68, 68, 0.1);
                        padding: 0.75rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="admin-page" onPaste={handlePaste}>
            {/* Header */}
            <header className="admin-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">💎</span>
                        <span className="text-gradient">{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</span>
                    </div>
                    <div className="header-actions">
                        <button onClick={toggleLang} className="lang-toggle">
                            🌐 {t.langSwitch}
                        </button>
                        <button onClick={handleLogout} className="logout-btn">
                            {t.logout}
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <nav className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Messages */}
            {successMessage && (
                <div className="success-toast">✓ {successMessage}</div>
            )}
            {error && (
                <div className="error-toast">
                    ✕ {error}
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}

            {/* Main Content */}
            <main className="admin-main">
                {/* PUBLISH TAB */}
                {activeTab === 'publish' && (
                    <div className="tab-content">
                        <h2 className="section-title text-gradient">
                            {isEditing ? (lang === 'ar' ? '✏️ تعديل المنشور' : '✏️ Edit Signal') : (lang === 'ar' ? '📤 نشر توصية جديدة' : '📤 Publish New Signal')}
                        </h2>

                        {isEditing && (
                            <div className="edit-banner">
                                <span>✏️ {lang === 'ar' ? 'وضع التعديل' : 'Edit Mode'}</span>
                                <button onClick={handleCancelEdit} className="cancel-btn">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                            </div>
                        )}

                        <div className="card">
                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="gold-label">📸 {lang === 'ar' ? 'صورة التوصية' : 'Signal Image'}</label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload" />
                                {!previewData ? (
                                    <label htmlFor="img-upload" className="upload-zone">
                                        <div className="upload-icon">📷</div>
                                        <p>{lang === 'ar' ? 'اضغط لرفع صورة أو الصق من الحافظة' : 'Click to upload or paste from clipboard'}</p>
                                        <span>PNG, JPG, WEBP</span>
                                    </label>
                                ) : (
                                    <div className="preview-container">
                                        <img src={previewData} alt="Preview" />
                                        <button onClick={cancelPreview} className="change-img-btn">
                                            {lang === 'ar' ? '🔄 تغيير' : '🔄 Change'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Signal Type */}
                            <div className="form-group">
                                <label className="gold-label">📊 {lang === 'ar' ? 'نوع المنشور' : 'Post Type'}</label>
                                <div className="type-buttons">
                                    <button onClick={() => setSignalType('vip')} className={`type-btn ${signalType === 'vip' ? 'active' : ''}`}>
                                        💎 VIP
                                    </button>
                                    <button onClick={() => setSignalType('free')} className={`type-btn ${signalType === 'free' ? 'active' : ''}`}>
                                        🎁 {lang === 'ar' ? 'مجاني' : 'Free'}
                                    </button>
                                    <button onClick={() => setSignalType('regular')} className={`type-btn ${signalType === 'regular' ? 'active' : ''}`}>
                                        📝 {lang === 'ar' ? 'عادي' : 'Regular'}
                                    </button>
                                </div>
                            </div>

                            {/* Post Text */}
                            <div className="form-group">
                                <label className="gold-label">✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}</label>
                                <textarea
                                    value={customPost}
                                    onChange={(e) => setCustomPost(e.target.value)}
                                    placeholder={lang === 'ar' ? 'اكتب المنشور هنا...' : 'Write your post here...'}
                                    className="gold-textarea"
                                />
                            </div>

                            {/* AI Section */}
                            <div className="ai-section">
                                <div className="ai-header">
                                    <span>🤖 {lang === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'AI Generation'}</span>
                                </div>
                                <button
                                    onClick={generateAIPosts}
                                    disabled={generatingPosts || !customPost.trim()}
                                    className="ai-btn"
                                >
                                    {generatingPosts ? '⏳...' : `🚀 ${lang === 'ar' ? `توليد ${postCount} نسخة` : `Generate ${postCount} Variations`}`}
                                </button>

                                {generatedPosts.length > 0 && (
                                    <div className="generated-posts">
                                        {generatedPosts.map((post, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedPostIndex(idx)}
                                                className={`post-option ${selectedPostIndex === idx ? 'selected' : ''}`}
                                            >
                                                {post}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Telegram Options */}
                            <div className="telegram-section">
                                <div className="telegram-toggle" onClick={() => setPostToTelegram(!postToTelegram)}>
                                    <div className={`checkbox ${postToTelegram ? 'checked' : ''}`}>
                                        {postToTelegram && '✓'}
                                    </div>
                                    <span>📱 {t.postToTelegram}</span>
                                </div>

                                {postToTelegram && (
                                    <div className="button-options">
                                        <label className="gold-label">{lang === 'ar' ? 'زر التفاعل' : 'Action Button'}</label>
                                        <div className="btn-grid">
                                            {[
                                                { id: 'view_signal', label: '💎 ' + (lang === 'ar' ? 'إظهار التوصية' : 'Show Signal') },
                                                { id: 'subscribe', label: '🔥 ' + (lang === 'ar' ? 'اشترك' : 'Subscribe') },
                                                { id: 'share', label: '📤 ' + (lang === 'ar' ? 'مشاركة' : 'Share') },
                                                { id: 'none', label: '🚫 ' + (lang === 'ar' ? 'بدون' : 'None') },
                                            ].map(btn => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => setTelegramButtonType(btn.id)}
                                                    className={`tg-btn ${telegramButtonType === btn.id ? 'active' : ''}`}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Publish Button */}
                            {previewData && (
                                <button
                                    onClick={isEditing ? handleUpdate : handlePublish}
                                    disabled={uploading}
                                    className="btn-primary publish-btn"
                                >
                                    {uploading
                                        ? (lang === 'ar' ? '⏳ جاري...' : '⏳ Processing...')
                                        : (isEditing 
                                            ? (lang === 'ar' ? '🔄 تحديث المنشور' : '🔄 Update Signal')
                                            : (lang === 'ar' ? '🚀 نشر التوصية' : '🚀 Publish Signal'))}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* SIGNALS TAB */}
                {activeTab === 'signals' && (
                    <div className="tab-content">
                        <h2 className="section-title text-gradient">📊 {t.publishedSignals}</h2>
                        
                        {loading ? (
                            <div className="loading">⏳ {t.loading}</div>
                        ) : signals.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p>{lang === 'ar' ? 'لا توجد توصيات بعد' : 'No signals yet'}</p>
                                <button onClick={() => setActiveTab('publish')} className="btn-primary">
                                    {lang === 'ar' ? 'نشر أول توصية' : 'Publish First Signal'}
                                </button>
                            </div>
                        ) : (
                            <div className="signals-grid">
                                {signals.map(signal => (
                                    <div key={signal._id} className="signal-card">
                                        <div className="signal-image">
                                            <img src={signal.imageUrl} alt="Signal" />
                                            <div className="signal-badges">
                                                {signal.isVip && <span className="badge vip">💎 VIP</span>}
                                                {signal.type === 'REGULAR' && <span className="badge regular">📝</span>}
                                            </div>
                                        </div>
                                        {signal.customPost && (
                                            <div className="signal-text">
                                                <p>{signal.customPost.replace(/\*/g, '')}</p>
                                                <span className="time">{getTimeAgo(signal.createdAt, lang)}</span>
                                            </div>
                                        )}
                                        <div className="signal-actions">
                                            <button onClick={() => handleEdit(signal)} className="edit-btn">
                                                ✏️ {lang === 'ar' ? 'تعديل' : 'Edit'}
                                            </button>
                                            <button onClick={() => deleteSignal(signal._id)} className="delete-btn">
                                                🗑️ {t.delete}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* VIP TAB */}
                {activeTab === 'vip' && (
                    <div className="tab-content">
                        <h2 className="section-title text-gradient">👑 {t.manageVip}</h2>

                        {/* Stats */}
                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-value text-gradient">{vipUsers.length}</div>
                                <div className="stat-label">{lang === 'ar' ? 'أعضاء VIP' : 'VIP Members'}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value text-gradient">{vipUsers.filter(u => !u.subscriptionEndDate).length}</div>
                                <div className="stat-label">{lang === 'ar' ? 'مدى الحياة' : 'Lifetime'}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value text-gradient">{users.length}</div>
                                <div className="stat-label">{lang === 'ar' ? 'إجمالي' : 'Total'}</div>
                            </div>
                        </div>

                        {/* Add VIP Form */}
                        <div className="card">
                            <h3 className="card-title">➕ {t.addNewVip}</h3>
                            <form onSubmit={handleGrantVip} className="vip-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="gold-label">Telegram ID</label>
                                        <input
                                            type="text"
                                            value={telegramId}
                                            onChange={(e) => setTelegramId(e.target.value)}
                                            placeholder="123456789"
                                            className="gold-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="gold-label">{t.durationMonths || 'Duration'}</label>
                                        <input
                                            type="number"
                                            value={durationMonths}
                                            onChange={(e) => setDurationMonths(e.target.value)}
                                            placeholder="1, 3, 12..."
                                            disabled={isLifetime}
                                            className="gold-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="lifetime-check">
                                            <input
                                                type="checkbox"
                                                checked={isLifetime}
                                                onChange={(e) => setIsLifetime(e.target.checked)}
                                            />
                                            <span>♾️ {t.lifetime || 'Lifetime'}</span>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={vipLoading}>
                                    {vipLoading ? '...' : t.grantVip}
                                </button>
                            </form>
                            {vipMessage.text && (
                                <p className={`msg ${vipMessage.type}`}>{vipMessage.text}</p>
                            )}
                        </div>

                        {/* VIP Table */}
                        <div className="card">
                            <h3 className="card-title">👥 {lang === 'ar' ? 'الأعضاء النشطين' : 'Active Members'}</h3>
                            <div className="table-wrapper">
                                <table className="vip-table">
                                    <thead>
                                        <tr>
                                            <th>Telegram ID</th>
                                            <th>{t.status || 'Status'}</th>
                                            <th>{t.expiresIn || 'Expires'}</th>
                                            <th>{t.actions || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vipUsers.length === 0 ? (
                                            <tr><td colSpan="4" className="empty">{t.noVipMembers || 'No VIP members'}</td></tr>
                                        ) : vipUsers.map(user => {
                                            const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                                            const now = new Date();
                                            if (expiry && now > expiry) return null;
                                            const timeLeft = expiry ? `${Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))} ${lang === 'ar' ? 'يوم' : 'days'}` : '♾️';
                                            
                                            return (
                                                <tr key={user._id}>
                                                    <td className="mono">{user.telegramId}</td>
                                                    <td><span className="status-badge">✓ Active</span></td>
                                                    <td className="gold">{timeLeft}</td>
                                                    <td>
                                                        <button onClick={() => handleRemoveUser(user.telegramId)} className="delete-btn small">
                                                            🗑️
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
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="tab-content">
                        <h2 className="section-title text-gradient">⚙️ {lang === 'ar' ? 'الإعدادات' : 'Settings'}</h2>

                        <div className="card">
                            <h3 className="card-title">🤖 {lang === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings (Gemini)'}</h3>
                            
                            <div className="settings-form">
                                <div className="form-group">
                                    <label className="gold-label">🔑 API Key</label>
                                    <input
                                        type="password"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Enter API key..."
                                        className="gold-input"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group flex-2">
                                        <label className="gold-label">🧠 {lang === 'ar' ? 'النموذج' : 'Model'}</label>
                                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="gold-select">
                                            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                            {availableModels.map(m => <option key={m.id} value={m.id}>{m.displayName}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={fetchModels} disabled={modelsLoading || !geminiApiKey} className="refresh-btn">
                                        {modelsLoading ? '...' : '🔄'}
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label className="gold-label">🔢 {lang === 'ar' ? 'عدد المنشورات' : 'Post Count'}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={postCount}
                                        onChange={(e) => setPostCount(Number(e.target.value))}
                                        className="gold-input small"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="gold-label">📝 Prompt</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={lang === 'ar' ? 'أدخل الأمر...' : 'Enter prompt...'}
                                        className="gold-textarea"
                                    />
                                </div>

                                <button onClick={() => saveSettingsToDB(null, true)} disabled={savingSettings} className="btn-primary save-btn">
                                    {savingSettings ? '⏳...' : (lang === 'ar' ? '💾 حفظ الإعدادات' : '💾 Save Settings')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>


            {/* Styles */}
            <style jsx>{`
                .admin-page {
                    min-height: 100vh;
                    background: #080808;
                    background-image: linear-gradient(rgba(184, 134, 11, 0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(184, 134, 11, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                }

                /* Header */
                .admin-header {
                    background: rgba(8, 8, 8, 0.95);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                    padding: 1rem 2rem;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .logo-icon {
                    font-size: 1.5rem;
                }
                .header-actions {
                    display: flex;
                    gap: 1rem;
                }
                .lang-toggle {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 50px;
                    color: #DAA520;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .lang-toggle:hover {
                    background: rgba(184, 134, 11, 0.1);
                    border-color: #DAA520;
                }
                .logout-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 50px;
                    color: #ef4444;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Tabs */
                .admin-tabs {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.5rem 2rem 0;
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: rgba(184, 134, 11, 0.05);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 12px 12px 0 0;
                    color: #888;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .tab-btn:hover {
                    color: #DAA520;
                    background: rgba(184, 134, 11, 0.1);
                }
                .tab-btn.active {
                    background: linear-gradient(180deg, rgba(184, 134, 11, 0.15), rgba(184, 134, 11, 0.05));
                    border-color: rgba(184, 134, 11, 0.3);
                    border-bottom-color: transparent;
                    color: #FFD700;
                }

                /* Toast Messages */
                .success-toast, .error-toast {
                    position: fixed;
                    top: 1.5rem;
                    right: 1.5rem;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    animation: slideIn 0.3s ease;
                }
                .success-toast {
                    background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
                    color: #fff;
                    box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
                }
                .error-toast {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
                    color: #fff;
                    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
                }
                .error-toast button {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.25rem;
                    cursor: pointer;
                    margin-left: 1rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                /* Main Content */
                .admin-main {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .tab-content {
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Section Title */
                .section-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                /* Cards */
                .card {
                    background: linear-gradient(145deg, #0c0c0c, #080808);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                }
                .card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.4), transparent);
                }
                .card-title {
                    color: #DAA520;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                /* Form Elements */
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-row {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    align-items: flex-end;
                }
                .flex-2 { flex: 2; }
                .gold-label {
                    display: block;
                    color: #DAA520;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                }
                .gold-input, .gold-select, .gold-textarea {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                }
                .gold-input:focus, .gold-select:focus, .gold-textarea:focus {
                    border-color: #DAA520;
                    box-shadow: 0 0 20px rgba(184, 134, 11, 0.15);
                }
                .gold-input.small { max-width: 150px; }
                .gold-textarea {
                    min-height: 120px;
                    resize: vertical;
                    font-family: inherit;
                }
                .gold-select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23DAA520' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    padding-right: 2.5rem;
                }

                /* Upload Zone */
                .upload-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    border: 2px dashed rgba(184, 134, 11, 0.3);
                    border-radius: 16px;
                    background: rgba(184, 134, 11, 0.02);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .upload-zone:hover {
                    border-color: #DAA520;
                    background: rgba(184, 134, 11, 0.05);
                }
                .upload-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .upload-zone p {
                    color: #888;
                    margin-bottom: 0.5rem;
                }
                .upload-zone span {
                    color: #555;
                    font-size: 0.85rem;
                }

                /* Preview */
                .preview-container {
                    position: relative;
                    display: inline-block;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid rgba(184, 134, 11, 0.3);
                }
                .preview-container img {
                    max-height: 300px;
                    display: block;
                }
                .change-img-btn {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    padding: 0.5rem 1rem;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #DAA520;
                    border-radius: 8px;
                    color: #DAA520;
                    cursor: pointer;
                    font-size: 0.85rem;
                }

                /* Type Buttons */
                .type-buttons {
                    display: flex;
                    gap: 1rem;
                }
                .type-btn {
                    flex: 1;
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    color: #888;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .type-btn:hover {
                    border-color: #DAA520;
                    color: #DAA520;
                }
                .type-btn.active {
                    background: linear-gradient(135deg, #B8860B, #DAA520);
                    border-color: #DAA520;
                    color: #000;
                    box-shadow: 0 4px 20px rgba(184, 134, 11, 0.3);
                }

                /* AI Section */
                .ai-section {
                    background: rgba(102, 126, 234, 0.05);
                    border: 1px solid rgba(102, 126, 234, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .ai-header {
                    color: #a78bfa;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                .ai-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .ai-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }
                .ai-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                .generated-posts {
                    margin-top: 1.5rem;
                    max-height: 300px;
                    overflow-y: auto;
                    display: grid;
                    gap: 0.75rem;
                }
                .post-option {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    color: #ccc;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .post-option:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                }
                .post-option.selected {
                    border-color: #DAA520;
                    background: rgba(184, 134, 11, 0.1);
                    color: #fff;
                }

                /* Telegram Section */
                .telegram-section {
                    background: rgba(34, 158, 217, 0.05);
                    border: 1px solid rgba(34, 158, 217, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .telegram-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    color: #229ED9;
                    font-weight: 600;
                }
                .checkbox {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #555;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    color: #fff;
                    font-size: 14px;
                }
                .checkbox.checked {
                    background: #229ED9;
                    border-color: #229ED9;
                }
                .button-options {
                    margin-top: 1.5rem;
                }
                .btn-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }
                .tg-btn {
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(34, 158, 217, 0.2);
                    border-radius: 10px;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .tg-btn:hover {
                    border-color: #229ED9;
                }
                .tg-btn.active {
                    background: #229ED9;
                    border-color: #229ED9;
                    font-weight: 600;
                }

                /* Primary Button */
                .btn-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    background: linear-gradient(110deg, #B8860B, #DAA520, #FFE566, #DAA520, #B8860B);
                    background-size: 200% 100%;
                    animation: goldShine 3s linear infinite;
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 20px rgba(184, 134, 11, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(184, 134, 11, 0.4);
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .publish-btn {
                    width: 100%;
                    padding: 1.25rem;
                    font-size: 1.1rem;
                }
                @keyframes goldShine {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }

                /* Edit Banner */
                .edit-banner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    background: linear-gradient(90deg, rgba(218, 165, 32, 0.1), transparent);
                    border: 1px solid rgba(218, 165, 32, 0.3);
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    color: #DAA520;
                }
                .cancel-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid #ef4444;
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                }

                /* Signals Grid */
                .signals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                .signal-card {
                    background: linear-gradient(145deg, #0c0c0c, #080808);
                    border: 1px solid rgba(184, 134, 11, 0.1);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.3s;
                }
                .signal-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                }
                .signal-image {
                    position: relative;
                }
                .signal-image img {
                    width: 100%;
                    display: block;
                }
                .signal-badges {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    display: flex;
                    gap: 0.5rem;
                }
                .badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .badge.vip {
                    background: rgba(184, 134, 11, 0.9);
                    color: #000;
                }
                .badge.regular {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                .signal-text {
                    padding: 1.25rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                }
                .signal-text p {
                    color: #e0e0e0;
                    line-height: 1.6;
                    margin-bottom: 0.75rem;
                }
                .signal-text .time {
                    color: #666;
                    font-size: 0.8rem;
                }
                .signal-actions {
                    padding: 1rem 1.25rem;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
                .edit-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    color: #DAA520;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .edit-btn:hover {
                    background: rgba(184, 134, 11, 0.1);
                }
                .delete-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                .delete-btn.small {
                    padding: 0.4rem 0.75rem;
                }

                /* Stats */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: linear-gradient(145deg, rgba(184, 134, 11, 0.08), rgba(184, 134, 11, 0.02));
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    text-align: center;
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                }
                .stat-label {
                    color: #888;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                }

                /* VIP Form */
                .vip-form {
                    margin-bottom: 1rem;
                }
                .lifetime-check {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    color: #888;
                    height: 100%;
                }
                .lifetime-check input {
                    width: 18px;
                    height: 18px;
                    accent-color: #DAA520;
                }
                .lifetime-check:has(input:checked) {
                    border-color: #DAA520;
                    color: #DAA520;
                }
                .msg {
                    margin-top: 1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                }
                .msg.success {
                    background: rgba(76, 175, 80, 0.1);
                    color: #4caf50;
                }
                .msg.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                /* Table */
                .table-wrapper {
                    overflow-x: auto;
                }
                .vip-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .vip-table th {
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    color: #DAA520;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    text-align: center;
                }
                .vip-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    text-align: center;
                    color: #ccc;
                }
                .vip-table td.mono {
                    font-family: monospace;
                    color: #fff;
                }
                .vip-table td.gold {
                    color: #DAA520;
                }
                .vip-table td.empty {
                    padding: 3rem;
                    color: #666;
                }
                .status-badge {
                    display: inline-block;
                    padding: 0.35rem 0.75rem;
                    background: rgba(76, 175, 80, 0.1);
                    border: 1px solid rgba(76, 175, 80, 0.2);
                    border-radius: 20px;
                    color: #4caf50;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                /* Settings */
                .settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .refresh-btn {
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    color: #DAA520;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .refresh-btn:hover {
                    background: rgba(184, 134, 11, 0.2);
                }
                .refresh-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .save-btn {
                    align-self: flex-start;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                }
                .save-btn:hover {
                    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.3);
                }

                /* Empty & Loading States */
                .loading, .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #888;
                }
                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .admin-header { padding: 1rem; }
                    .header-content { flex-wrap: wrap; gap: 1rem; }
                    .admin-tabs { padding: 1rem 1rem 0; }
                    .tab-btn { padding: 0.6rem 1rem; font-size: 0.9rem; }
                    .admin-main { padding: 1.5rem 1rem; }
                    .card { padding: 1.5rem; }
                    .type-buttons { flex-direction: column; }
                    .form-row { flex-direction: column; }
                    .signals-grid { grid-template-columns: 1fr; }
                    .btn-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
