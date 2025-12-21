'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PASSWORD = '123';

// ===== Icons Components =====
const DashboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const SignalIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const UploadIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

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
    
    // Twitter/X Auto-Post State
    const [postToTwitter, setPostToTwitter] = useState(false);
    const [twitterApiKey, setTwitterApiKey] = useState('');
    const [twitterApiSecret, setTwitterApiSecret] = useState('');
    const [twitterAccessToken, setTwitterAccessToken] = useState('');
    const [twitterAccessSecret, setTwitterAccessSecret] = useState('');

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
                    // Twitter settings
                    if (s.twitterApiKey !== undefined) setTwitterApiKey(s.twitterApiKey);
                    if (s.twitterApiSecret !== undefined) setTwitterApiSecret(s.twitterApiSecret);
                    if (s.twitterAccessToken !== undefined) setTwitterAccessToken(s.twitterAccessToken);
                    if (s.twitterAccessSecret !== undefined) setTwitterAccessSecret(s.twitterAccessSecret);
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
                generatedPostCount: postCount,
                twitterApiKey,
                twitterApiSecret,
                twitterAccessToken,
                twitterAccessSecret
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
                        sendToTwitter: postToTwitter,
                        isVip: signalType === 'vip',
                        customPost: postToUse || null,
                        telegramButtonType: telegramButtonType
                    })
                });

                const data = await res.json();
                if (data.success) {
                    let msg = t.postSuccess;
                    if (postToTelegram) msg += ` ${t.telegramSuccess || ''}`;
                    if (postToTwitter) msg += ' | X ✓';
                    setSuccessMessage(msg);
                    fetchSignals();
                    setGeneratedPosts([]);
                    setSelectedPostIndex(-1);
                    setPreviewData(null);
                    setSelectedFile(null);
                    setCustomPost('');
                } else {
                    setError(data.error || t.postError);
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


    // ===== LOGIN SCREEN =====
    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="login-logo">
                        <div className="login-icon">🔐</div>
                        <h1 className="login-title">Admin Panel</h1>
                        <p className="login-subtitle">{lang === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the dashboard'}</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder}
                                className="admin-input"
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="admin-btn-primary">{t.login}</button>
                    </form>
                </div>
                <style jsx>{`
                    .admin-login-container {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #080808 0%, #0c0c0c 50%, #080808 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        position: relative;
                        overflow: hidden;
                    }
                    .admin-login-container::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 600px;
                        height: 600px;
                        background: radial-gradient(circle, rgba(184, 134, 11, 0.1) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .admin-login-card {
                        background: rgba(12, 12, 12, 0.95);
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 24px;
                        padding: 3rem;
                        max-width: 420px;
                        width: 100%;
                        backdrop-filter: blur(20px);
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(184, 134, 11, 0.1);
                        position: relative;
                        z-index: 1;
                    }
                    .login-logo {
                        text-align: center;
                        margin-bottom: 2.5rem;
                    }
                    .login-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                        filter: drop-shadow(0 0 20px rgba(184, 134, 11, 0.5));
                    }
                    .login-title {
                        font-size: 2rem;
                        font-weight: 800;
                        background: linear-gradient(90deg, #FFD700, #FFE566, #FFFFFF, #FFE566, #FFD700);
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: goldShine 3s linear infinite;
                        margin-bottom: 0.5rem;
                    }
                    .login-subtitle {
                        color: #888;
                        font-size: 0.95rem;
                    }
                    .login-form {
                        display: flex;
                        flex-direction: column;
                        gap: 1.25rem;
                    }
                    .input-group {
                        position: relative;
                    }
                    .admin-input {
                        width: 100%;
                        padding: 1rem 1.25rem;
                        background: rgba(20, 20, 20, 0.8);
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 12px;
                        color: #fff;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                        text-align: center;
                    }
                    .admin-input:focus {
                        outline: none;
                        border-color: rgba(184, 134, 11, 0.5);
                        box-shadow: 0 0 20px rgba(184, 134, 11, 0.15);
                    }
                    .admin-btn-primary {
                        padding: 1rem 2rem;
                        background: linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%);
                        background-size: 200% auto;
                        border: none;
                        border-radius: 12px;
                        color: #000;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);
                    }
                    .admin-btn-primary:hover {
                        background-position: right center;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 25px rgba(184, 134, 11, 0.4);
                    }
                    .error-message {
                        color: #ef4444;
                        text-align: center;
                        font-size: 0.9rem;
                        padding: 0.75rem;
                        background: rgba(239, 68, 68, 0.1);
                        border-radius: 8px;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }
                    @keyframes goldShine {
                        0% { background-position: 0% center; }
                        100% { background-position: 200% center; }
                    }
                `}</style>
            </div>
        );
    }

    // ===== MAIN DASHBOARD =====
    return (
        <div className="admin-dashboard" onPaste={handlePaste}>
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">💎</span>
                        <span className="logo-text">Admin</span>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'publish' ? 'active' : ''}`}
                        onClick={() => setActiveTab('publish')}
                    >
                        <UploadIcon />
                        <span>{lang === 'ar' ? 'نشر جديد' : 'Publish'}</span>
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'signals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signals')}
                    >
                        <SignalIcon />
                        <span>{lang === 'ar' ? 'التوصيات' : 'Signals'}</span>
                        <span className="nav-badge">{signals.length}</span>
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'vip' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vip')}
                    >
                        <UsersIcon />
                        <span>{lang === 'ar' ? 'VIP' : 'VIP Users'}</span>
                        <span className="nav-badge">{users.filter(u => u.isVip).length}</span>
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <SettingsIcon />
                        <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={toggleLang} className="sidebar-btn">
                        🌐 {t.langSwitch}
                    </button>
                    <button onClick={handleLogout} className="sidebar-btn logout">
                        <LogoutIcon />
                        <span>{t.logout}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="header-title">
                        <h1>
                            {activeTab === 'publish' && (lang === 'ar' ? '📤 نشر توصية جديدة' : '📤 Publish New Signal')}
                            {activeTab === 'signals' && (lang === 'ar' ? '📊 التوصيات المنشورة' : '📊 Published Signals')}
                            {activeTab === 'vip' && (lang === 'ar' ? '👑 إدارة VIP' : '👑 VIP Management')}
                            {activeTab === 'settings' && (lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings')}
                        </h1>
                        {isEditing && (
                            <span className="edit-badge">
                                ✏️ {lang === 'ar' ? 'وضع التعديل' : 'Edit Mode'}
                            </span>
                        )}
                    </div>
                    <div className="header-actions">
                        {successMessage && <span className="success-toast">{successMessage}</span>}
                        {error && <span className="error-toast">{error}</span>}
                    </div>
                </header>

                {/* Content Area */}
                <div className="admin-content">

                    {/* ===== PUBLISH TAB ===== */}
                    {activeTab === 'publish' && (
                        <div className="publish-section">
                            {/* Image Upload Area */}
                            <div className="upload-card">
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    style={{ display: 'none' }} 
                                    id="image-upload" 
                                />
                                
                                {!previewData ? (
                                    <label htmlFor="image-upload" className="upload-zone">
                                        <UploadIcon />
                                        <h3>{lang === 'ar' ? 'اسحب الصورة هنا أو اضغط للاختيار' : 'Drag image here or click to upload'}</h3>
                                        <p>{lang === 'ar' ? 'أو الصق من الحافظة (Ctrl+V)' : 'Or paste from clipboard (Ctrl+V)'}</p>
                                    </label>
                                ) : (
                                    <div className="preview-container">
                                        <img src={previewData} alt="Preview" className="preview-image" />
                                        <button onClick={cancelPreview} className="change-image-btn">
                                            {lang === 'ar' ? '🔄 تغيير الصورة' : '🔄 Change Image'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Signal Type Selection */}
                            <div className="type-selection">
                                <h3 className="section-label">{lang === 'ar' ? 'نوع المنشور' : 'Post Type'}</h3>
                                <div className="type-buttons">
                                    <button 
                                        className={`type-btn ${signalType === 'vip' ? 'active' : ''}`}
                                        onClick={() => setSignalType('vip')}
                                    >
                                        <span className="type-icon">💎</span>
                                        <span className="type-label">VIP</span>
                                        <span className="type-desc">{lang === 'ar' ? 'مطموسة' : 'Blurred'}</span>
                                    </button>
                                    <button 
                                        className={`type-btn ${signalType === 'free' ? 'active' : ''}`}
                                        onClick={() => setSignalType('free')}
                                    >
                                        <span className="type-icon">🎁</span>
                                        <span className="type-label">{lang === 'ar' ? 'مجانية' : 'Free'}</span>
                                        <span className="type-desc">{lang === 'ar' ? 'واضحة' : 'Clear'}</span>
                                    </button>
                                    <button 
                                        className={`type-btn ${signalType === 'regular' ? 'active' : ''}`}
                                        onClick={() => setSignalType('regular')}
                                    >
                                        <span className="type-icon">📝</span>
                                        <span className="type-label">{lang === 'ar' ? 'عادي' : 'Regular'}</span>
                                        <span className="type-desc">{lang === 'ar' ? 'منشور' : 'Post'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Post Text */}
                            <div className="post-text-section">
                                <div className="section-header">
                                    <h3 className="section-label">✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}</h3>
                                    {isEditing && (
                                        <button onClick={handleCancelEdit} className="cancel-edit-btn">
                                            ✖ {lang === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit'}
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={customPost}
                                    onChange={(e) => setCustomPost(e.target.value)}
                                    placeholder={lang === 'ar' ? 'اكتب المنشور هنا...' : 'Write post here...'}
                                    className="post-textarea"
                                />
                            </div>

                            {/* AI Generation */}
                            <div className="ai-section">
                                <button 
                                    onClick={generateAIPosts} 
                                    disabled={generatingPosts || !customPost.trim()}
                                    className="generate-btn"
                                >
                                    {generatingPosts 
                                        ? (lang === 'ar' ? '⏳ جاري التوليد...' : '⏳ Generating...') 
                                        : (lang === 'ar' ? `🚀 توليد ${postCount} نسخة بالذكاء الاصطناعي` : `🚀 Generate ${postCount} AI Variations`)}
                                </button>

                                {generatedPosts.length > 0 && (
                                    <div className="generated-posts">
                                        <h4>{lang === 'ar' ? 'اختر نسخة:' : 'Select a variation:'}</h4>
                                        <div className="posts-grid">
                                            {generatedPosts.map((post, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`post-card ${selectedPostIndex === idx ? 'selected' : ''}`}
                                                    onClick={() => setSelectedPostIndex(idx)}
                                                >
                                                    <p>{post}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Telegram Options */}
                            <div className="telegram-section">
                                <div className="telegram-toggle" onClick={() => setPostToTelegram(!postToTelegram)}>
                                    <div className={`toggle-checkbox ${postToTelegram ? 'checked' : ''}`}>
                                        {postToTelegram && <TelegramIcon />}
                                    </div>
                                    <span>{t.postToTelegram}</span>
                                </div>

                                {postToTelegram && (
                                    <div className="telegram-buttons">
                                        <h4>{lang === 'ar' ? 'زر التفاعل:' : 'Action Button:'}</h4>
                                        <div className="button-options">
                                            {[
                                                { id: 'view_signal', label: lang === 'ar' ? '💎 إظهار التوصية' : '💎 Show Signal' },
                                                { id: 'subscribe', label: lang === 'ar' ? '🔥 اشترك الآن' : '🔥 Subscribe Now' },
                                                { id: 'share', label: lang === 'ar' ? '📤 مشاركة' : '📤 Share' },
                                                { id: 'none', label: lang === 'ar' ? '🚫 بدون' : '🚫 None' }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    className={`option-btn ${telegramButtonType === btn.id ? 'active' : ''}`}
                                                    onClick={() => setTelegramButtonType(btn.id)}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Twitter/X Options */}
                            <div className="twitter-section">
                                <div className="twitter-toggle" onClick={() => setPostToTwitter(!postToTwitter)}>
                                    <div className={`toggle-checkbox twitter ${postToTwitter ? 'checked' : ''}`}>
                                        {postToTwitter && <span>𝕏</span>}
                                    </div>
                                    <span>{lang === 'ar' ? 'نشر على X (تويتر)' : 'Post to X (Twitter)'}</span>
                                </div>
                            </div>

                            {/* Publish Button */}
                            {previewData && (
                                <div className="publish-action">
                                    <button
                                        onClick={isEditing ? handleUpdate : handlePublish}
                                        disabled={uploading}
                                        className="publish-btn"
                                    >
                                        {uploading
                                            ? (lang === 'ar' ? '⏳ جاري النشر...' : '⏳ Publishing...')
                                            : isEditing 
                                                ? (lang === 'ar' ? '🔄 تحديث المنشور' : '🔄 Update Post')
                                                : (lang === 'ar' ? '🚀 نشر الآن' : '🚀 Publish Now')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== SIGNALS TAB ===== */}
                    {activeTab === 'signals' && (
                        <div className="signals-section">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>{t.loading}</p>
                                </div>
                            ) : signals.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📭</span>
                                    <h3>{lang === 'ar' ? 'لا توجد توصيات' : 'No signals yet'}</h3>
                                    <p>{lang === 'ar' ? 'ابدأ بنشر أول توصية' : 'Start by publishing your first signal'}</p>
                                </div>
                            ) : (
                                <div className="signals-grid">
                                    {signals.map((signal) => (
                                        <div key={signal._id} className="signal-card">
                                            <div className="signal-image">
                                                <img src={signal.imageUrl} alt="Signal" />
                                                <div className="signal-badges">
                                                    {signal.isVip && <span className="badge vip">VIP</span>}
                                                    {signal.type === 'REGULAR' && <span className="badge regular">Regular</span>}
                                                </div>
                                            </div>
                                            {signal.customPost && (
                                                <div className="signal-content">
                                                    <p>{signal.customPost.replace(/\*/g, '')}</p>
                                                    <span className="signal-time">{getTimeAgo(signal.createdAt, lang)}</span>
                                                </div>
                                            )}
                                            <div className="signal-actions">
                                                <button onClick={() => handleEdit(signal)} className="action-btn edit">
                                                    ✏️ {lang === 'ar' ? 'تعديل' : 'Edit'}
                                                </button>
                                                <button onClick={() => deleteSignal(signal._id)} className="action-btn delete">
                                                    🗑️ {t.delete}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== VIP TAB ===== */}
                    {activeTab === 'vip' && (
                        <div className="vip-section">
                            {/* Add VIP Form */}
                            <div className="vip-form-card">
                                <h3>➕ {t.addNewVip}</h3>
                                <form onSubmit={handleGrantVip} className="vip-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{t.telegramIdPlaceholder}</label>
                                            <input
                                                type="text"
                                                value={telegramId}
                                                onChange={(e) => setTelegramId(e.target.value)}
                                                placeholder="e.g. 123456789"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t.durationMonths || 'Duration (Months)'}</label>
                                            <input
                                                type="number"
                                                value={durationMonths}
                                                onChange={(e) => setDurationMonths(e.target.value)}
                                                placeholder="1, 3, 12..."
                                                className="form-input"
                                                disabled={isLifetime}
                                            />
                                        </div>
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={isLifetime}
                                                    onChange={(e) => setIsLifetime(e.target.checked)}
                                                />
                                                <span className="checkmark"></span>
                                                {t.lifetime || 'Lifetime'} ♾️
                                            </label>
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={vipLoading}>
                                            {vipLoading ? '...' : t.grantVip}
                                        </button>
                                    </div>
                                </form>
                                {vipMessage.text && (
                                    <p className={`form-message ${vipMessage.type}`}>{vipMessage.text}</p>
                                )}
                            </div>

                            {/* VIP Users Table */}
                            <div className="vip-table-card">
                                <h3>👑 {lang === 'ar' ? 'الأعضاء النشطين' : 'Active Members'}</h3>
                                <div className="table-container">
                                    <table className="vip-table">
                                        <thead>
                                            <tr>
                                                <th>Telegram ID</th>
                                                <th>{t.status || 'Status'}</th>
                                                <th>{t.expiresIn || 'Expires In'}</th>
                                                <th>{t.actions || 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.isVip).length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="empty-table">
                                                        {t.noVipMembers || 'No active VIP members'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.filter(u => u.isVip).map(user => {
                                                    const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                                                    const now = new Date();
                                                    const isExpired = expiry && now > expiry;
                                                    if (isExpired && user.isVip) return null;

                                                    let timeLeft = 'Lifetime ♾️';
                                                    if (expiry) {
                                                        const diff = expiry - now;
                                                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                        timeLeft = `${days} ${lang === 'ar' ? 'يوم' : 'Days'}`;
                                                    }

                                                    return (
                                                        <tr key={user._id}>
                                                            <td className="user-id">{user.telegramId}</td>
                                                            <td><span className="status-badge active">Active</span></td>
                                                            <td className="time-left">{timeLeft}</td>
                                                            <td>
                                                                <button 
                                                                    onClick={() => handleRemoveUser(user.telegramId)}
                                                                    className="remove-btn"
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
                    )}

                    {/* ===== SETTINGS TAB ===== */}
                    {activeTab === 'settings' && (
                        <div className="settings-section">
                            <div className="settings-card">
                                <div className="settings-header">
                                    <h3>🤖 {lang === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings (Gemini)'}</h3>
                                    <button 
                                        onClick={() => saveSettingsToDB(null, true)}
                                        disabled={savingSettings}
                                        className="save-settings-btn"
                                    >
                                        {savingSettings 
                                            ? (lang === 'ar' ? '⏳ جاري الحفظ...' : '⏳ Saving...') 
                                            : (lang === 'ar' ? '💾 حفظ الإعدادات' : '💾 Save Settings')}
                                    </button>
                                </div>

                                <div className="settings-form">
                                    <div className="setting-group">
                                        <label>🔑 Gemini API Key</label>
                                        <input
                                            type="password"
                                            value={geminiApiKey}
                                            onChange={(e) => setGeminiApiKey(e.target.value)}
                                            placeholder="Enter your API key..."
                                            className="setting-input"
                                        />
                                    </div>

                                    <div className="setting-row">
                                        <div className="setting-group flex-2">
                                            <label>🧠 {lang === 'ar' ? 'النموذج' : 'Model'}</label>
                                            <div className="model-select">
                                                <select 
                                                    value={selectedModel} 
                                                    onChange={(e) => setSelectedModel(e.target.value)}
                                                    className="setting-select"
                                                >
                                                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                                    {availableModels.map(m => (
                                                        <option key={m.id} value={m.id}>{m.displayName}</option>
                                                    ))}
                                                </select>
                                                <button 
                                                    onClick={fetchModels} 
                                                    disabled={modelsLoading}
                                                    className="refresh-btn"
                                                >
                                                    {modelsLoading ? '...' : '🔄'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="setting-group flex-1">
                                            <label>🔢 {lang === 'ar' ? 'عدد النسخ' : 'Count'}</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={postCount}
                                                onChange={(e) => setPostCount(Number(e.target.value))}
                                                className="setting-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="setting-group">
                                        <label>📝 {lang === 'ar' ? 'الأمر (Prompt)' : 'Custom Prompt'}</label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder={lang === 'ar' ? 'أدخل الأمر المخصص للذكاء الاصطناعي...' : 'Enter custom AI prompt...'}
                                            className="setting-textarea"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Twitter/X Settings */}
                            <div className="settings-card" style={{ marginTop: '1.5rem' }}>
                                <div className="settings-header">
                                    <h3>𝕏 {lang === 'ar' ? 'إعدادات تويتر' : 'Twitter/X Settings'}</h3>
                                </div>

                                <div className="settings-form">
                                    <div className="setting-row">
                                        <div className="setting-group flex-1">
                                            <label>🔑 API Key</label>
                                            <input
                                                type="password"
                                                value={twitterApiKey}
                                                onChange={(e) => setTwitterApiKey(e.target.value)}
                                                placeholder="API Key..."
                                                className="setting-input"
                                            />
                                        </div>
                                        <div className="setting-group flex-1">
                                            <label>🔐 API Secret</label>
                                            <input
                                                type="password"
                                                value={twitterApiSecret}
                                                onChange={(e) => setTwitterApiSecret(e.target.value)}
                                                placeholder="API Secret..."
                                                className="setting-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="setting-row">
                                        <div className="setting-group flex-1">
                                            <label>🎫 Access Token</label>
                                            <input
                                                type="password"
                                                value={twitterAccessToken}
                                                onChange={(e) => setTwitterAccessToken(e.target.value)}
                                                placeholder="Access Token..."
                                                className="setting-input"
                                            />
                                        </div>
                                        <div className="setting-group flex-1">
                                            <label>🔒 Access Secret</label>
                                            <input
                                                type="password"
                                                value={twitterAccessSecret}
                                                onChange={(e) => setTwitterAccessSecret(e.target.value)}
                                                placeholder="Access Token Secret..."
                                                className="setting-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ===== STYLES ===== */}
            <style jsx>{`
                .admin-dashboard {
                    display: flex;
                    min-height: 100vh;
                    background: #080808;
                    direction: ${isRTL ? 'rtl' : 'ltr'};
                }

                /* ===== SIDEBAR ===== */
                .admin-sidebar {
                    width: 260px;
                    background: linear-gradient(180deg, #0c0c0c 0%, #080808 100%);
                    border-right: 1px solid rgba(184, 134, 11, 0.15);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .logo-icon {
                    font-size: 2rem;
                    filter: drop-shadow(0 0 10px rgba(184, 134, 11, 0.5));
                }

                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 800;
                    background: linear-gradient(90deg, #FFD700, #FFE566, #FFFFFF, #FFE566, #FFD700);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: goldShine 3s linear infinite;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 1rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: 12px;
                    color: #888;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: ${isRTL ? 'right' : 'left'};
                    width: 100%;
                }

                .nav-item:hover {
                    background: rgba(184, 134, 11, 0.1);
                    color: #DAA520;
                }

                .nav-item.active {
                    background: linear-gradient(135deg, rgba(184, 134, 11, 0.2) 0%, rgba(184, 134, 11, 0.1) 100%);
                    color: #FFD700;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                }

                .nav-item svg {
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                }

                .nav-badge {
                    margin-${isRTL ? 'right' : 'left'}: auto;
                    background: rgba(184, 134, 11, 0.2);
                    color: #DAA520;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .sidebar-footer {
                    padding: 1rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .sidebar-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #888;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .sidebar-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }

                .sidebar-btn.logout {
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .sidebar-btn.logout:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                /* ===== MAIN CONTENT ===== */
                .admin-main {
                    flex: 1;
                    margin-${isRTL ? 'right' : 'left'}: 260px;
                    display: flex;
                    flex-direction: column;
                }

                .admin-header {
                    padding: 1.5rem 2rem;
                    background: rgba(12, 12, 12, 0.95);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(10px);
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-title h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                }

                .edit-badge {
                    background: linear-gradient(135deg, #DAA520, #B8860B);
                    color: #000;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .success-toast {
                    background: rgba(76, 175, 80, 0.15);
                    color: #4caf50;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                }

                .error-toast {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .admin-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                }

                @keyframes goldShine {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>

            {/* ===== PUBLISH STYLES ===== */}
            <style jsx>{`
                .publish-section {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .upload-card {
                    background: rgba(12, 12, 12, 0.8);
                    border: 2px dashed rgba(184, 134, 11, 0.3);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .upload-card:hover {
                    border-color: rgba(184, 134, 11, 0.5);
                }

                .upload-zone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .upload-zone:hover {
                    background: rgba(184, 134, 11, 0.05);
                }

                .upload-zone svg {
                    color: #DAA520;
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }

                .upload-zone h3 {
                    color: #fff;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }

                .upload-zone p {
                    color: #666;
                    font-size: 0.9rem;
                }

                .preview-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1.5rem;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 12px;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                }

                .change-image-btn {
                    margin-top: 1rem;
                    padding: 0.6rem 1.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .change-image-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                }

                .type-selection {
                    background: rgba(12, 12, 12, 0.8);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .section-label {
                    color: #DAA520;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .type-buttons {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }

                .type-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1.25rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .type-btn:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    background: rgba(184, 134, 11, 0.05);
                }

                .type-btn.active {
                    border-color: #DAA520;
                    background: rgba(184, 134, 11, 0.15);
                }

                .type-icon {
                    font-size: 1.75rem;
                }

                .type-label {
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .type-desc {
                    color: #666;
                    font-size: 0.8rem;
                }

                .post-text-section {
                    background: rgba(12, 12, 12, 0.8);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .cancel-edit-btn {
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    font-size: 0.85rem;
                    cursor: pointer;
                    font-weight: 600;
                }

                .post-textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    resize: vertical;
                    transition: all 0.3s ease;
                }

                .post-textarea:focus {
                    outline: none;
                    border-color: rgba(184, 134, 11, 0.4);
                }

                .ai-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .generate-btn {
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .generate-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                }

                .generate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .generated-posts {
                    background: rgba(12, 12, 12, 0.8);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .generated-posts h4 {
                    color: #DAA520;
                    margin-bottom: 1rem;
                }

                .posts-grid {
                    display: grid;
                    gap: 0.75rem;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .post-card {
                    padding: 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .post-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                }

                .post-card.selected {
                    border-color: #DAA520;
                    background: rgba(184, 134, 11, 0.1);
                }

                .post-card p {
                    color: #e0e0e0;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 0;
                }
            `}</style>

            {/* ===== TELEGRAM & PUBLISH STYLES ===== */}
            <style jsx>{`
                .telegram-section {
                    background: rgba(12, 12, 12, 0.8);
                    border: 1px solid rgba(34, 158, 217, 0.2);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .twitter-section {
                    background: rgba(12, 12, 12, 0.8);
                    border: 1px solid rgba(0, 0, 0, 0.3);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-top: 1rem;
                }

                .twitter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .toggle-checkbox.twitter {
                    border-color: rgba(255, 255, 255, 0.3);
                    font-weight: bold;
                    font-size: 14px;
                }

                .toggle-checkbox.twitter.checked {
                    background: #000;
                    border-color: #fff;
                    color: #fff;
                }

                .telegram-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .toggle-checkbox {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: 2px solid rgba(34, 158, 217, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .toggle-checkbox.checked {
                    background: #229ED9;
                    border-color: #229ED9;
                }

                .toggle-checkbox svg {
                    color: #fff;
                }

                .telegram-toggle span, .twitter-toggle span {
                    color: #fff;
                    font-size: 0.95rem;
                }

                .telegram-buttons {
                    margin-top: 1.25rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .telegram-buttons h4 {
                    color: #888;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .button-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }

                .option-btn {
                    padding: 0.875rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #888;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .option-btn:hover {
                    border-color: rgba(34, 158, 217, 0.3);
                    color: #fff;
                }

                .option-btn.active {
                    background: rgba(34, 158, 217, 0.15);
                    border-color: #229ED9;
                    color: #229ED9;
                }

                .publish-action {
                    margin-top: 1rem;
                }

                .publish-btn {
                    width: 100%;
                    padding: 1.25rem 2rem;
                    background: linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%);
                    background-size: 200% auto;
                    border: none;
                    border-radius: 14px;
                    color: #000;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(184, 134, 11, 0.4);
                }

                .publish-btn:hover:not(:disabled) {
                    background-position: right center;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(184, 134, 11, 0.5);
                }

                .publish-btn:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }
            `}</style>

            {/* ===== SIGNALS STYLES ===== */}
            <style jsx>{`
                .signals-section {
                    width: 100%;
                }

                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    text-align: center;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(184, 134, 11, 0.2);
                    border-top-color: #DAA520;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-state h3 {
                    color: #fff;
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: #666;
                }

                .signals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .signal-card {
                    background: rgba(12, 12, 12, 0.9);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .signal-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .signal-image {
                    position: relative;
                    overflow: hidden;
                }

                .signal-image img {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .signal-badges {
                    position: absolute;
                    top: 0.75rem;
                    ${isRTL ? 'left' : 'right'}: 0.75rem;
                    display: flex;
                    gap: 0.5rem;
                }

                .badge {
                    padding: 0.3rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .badge.vip {
                    background: linear-gradient(135deg, #B8860B, #DAA520);
                    color: #000;
                }

                .badge.regular {
                    background: rgba(100, 100, 100, 0.8);
                    color: #fff;
                }

                .signal-content {
                    padding: 1rem 1.25rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                    position: relative;
                }

                .signal-content p {
                    color: #e0e0e0;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    margin: 0 0 0.5rem 0;
                }

                .signal-time {
                    color: #666;
                    font-size: 0.75rem;
                }

                .signal-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .action-btn {
                    flex: 1;
                    padding: 0.6rem 1rem;
                    background: transparent;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .action-btn.edit {
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    color: #DAA520;
                }

                .action-btn.edit:hover {
                    background: rgba(184, 134, 11, 0.1);
                }

                .action-btn.delete {
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
            `}</style>

            {/* ===== VIP STYLES ===== */}
            <style jsx>{`
                .vip-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .vip-form-card, .vip-table-card {
                    background: rgba(12, 12, 12, 0.9);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .vip-form-card h3, .vip-table-card h3 {
                    color: #DAA520;
                    font-size: 1.1rem;
                    margin-bottom: 1.25rem;
                }

                .vip-form {
                    width: 100%;
                }

                .form-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: flex-end;
                }

                .form-group {
                    flex: 1;
                    min-width: 180px;
                }

                .form-group label {
                    display: block;
                    color: #888;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: rgba(184, 134, 11, 0.4);
                }

                .form-input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    min-width: auto;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #fff;
                    cursor: pointer;
                    padding: 0.875rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }

                .checkbox-label:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                }

                .checkbox-label input {
                    width: 18px;
                    height: 18px;
                    accent-color: #DAA520;
                }

                .submit-btn {
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%);
                    border: none;
                    border-radius: 10px;
                    color: #000;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }

                .form-message {
                    margin-top: 1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                .form-message.success {
                    background: rgba(76, 175, 80, 0.1);
                    color: #4caf50;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                }

                .form-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .table-container {
                    overflow-x: auto;
                }

                .vip-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .vip-table th {
                    padding: 1rem;
                    text-align: ${isRTL ? 'right' : 'left'};
                    color: #888;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.2);
                    white-space: nowrap;
                }

                .vip-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .empty-table {
                    text-align: center;
                    color: #666;
                    padding: 3rem 1rem !important;
                }

                .user-id {
                    color: #fff;
                    font-family: monospace;
                    font-size: 0.95rem;
                }

                .status-badge {
                    display: inline-block;
                    padding: 0.3rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .status-badge.active {
                    background: rgba(76, 175, 80, 0.15);
                    color: #4caf50;
                }

                .time-left {
                    color: #DAA520;
                    font-weight: 500;
                }

                .remove-btn {
                    padding: 0.4rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .remove-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
            `}</style>

            {/* ===== SETTINGS STYLES ===== */}
            <style jsx>{`
                .settings-section {
                    max-width: 700px;
                    margin: 0 auto;
                }

                .settings-card {
                    background: rgba(12, 12, 12, 0.9);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .settings-header h3 {
                    color: #DAA520;
                    font-size: 1.1rem;
                }

                .save-settings-btn {
                    padding: 0.6rem 1.25rem;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .save-settings-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }

                .save-settings-btn:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }

                .settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .setting-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .setting-group label {
                    color: #888;
                    font-size: 0.9rem;
                }

                .setting-row {
                    display: flex;
                    gap: 1rem;
                }

                .flex-1 { flex: 1; }
                .flex-2 { flex: 2; }

                .setting-input, .setting-select {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }

                .setting-input:focus, .setting-select:focus {
                    outline: none;
                    border-color: rgba(184, 134, 11, 0.4);
                }

                .model-select {
                    display: flex;
                    gap: 0.5rem;
                }

                .model-select select {
                    flex: 1;
                }

                .refresh-btn {
                    padding: 0.875rem 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .refresh-btn:hover:not(:disabled) {
                    border-color: rgba(184, 134, 11, 0.4);
                    background: rgba(184, 134, 11, 0.1);
                }

                .setting-textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 1rem;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.95rem;
                    resize: vertical;
                    transition: all 0.3s ease;
                }

                .setting-textarea:focus {
                    outline: none;
                    border-color: rgba(184, 134, 11, 0.4);
                }
            `}</style>

            {/* ===== RESPONSIVE STYLES ===== */}
            <style jsx>{`
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        width: 80px;
                    }

                    .sidebar-logo .logo-text,
                    .nav-item span:not(.nav-badge),
                    .sidebar-btn span {
                        display: none;
                    }

                    .sidebar-logo {
                        justify-content: center;
                    }

                    .nav-item {
                        justify-content: center;
                        padding: 1rem;
                    }

                    .nav-badge {
                        position: absolute;
                        top: 0.25rem;
                        ${isRTL ? 'left' : 'right'}: 0.25rem;
                        margin: 0;
                        font-size: 0.65rem;
                        padding: 0.15rem 0.4rem;
                    }

                    .sidebar-btn {
                        padding: 0.75rem;
                    }

                    .admin-main {
                        margin-${isRTL ? 'right' : 'left'}: 80px;
                    }
                }

                @media (max-width: 768px) {
                    .admin-sidebar {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        top: auto;
                        width: 100%;
                        height: auto;
                        flex-direction: row;
                        border-right: none;
                        border-top: 1px solid rgba(184, 134, 11, 0.15);
                        z-index: 100;
                    }

                    .sidebar-header, .sidebar-footer {
                        display: none;
                    }

                    .sidebar-nav {
                        flex-direction: row;
                        justify-content: space-around;
                        padding: 0.5rem;
                        width: 100%;
                    }

                    .nav-item {
                        flex-direction: column;
                        gap: 0.25rem;
                        padding: 0.5rem;
                        font-size: 0.7rem;
                    }

                    .nav-item svg {
                        width: 22px;
                        height: 22px;
                    }

                    .nav-badge {
                        position: static;
                        font-size: 0.6rem;
                    }

                    .admin-main {
                        margin: 0;
                        padding-bottom: 80px;
                    }

                    .admin-header {
                        padding: 1rem;
                    }

                    .header-title h1 {
                        font-size: 1.1rem;
                    }

                    .admin-content {
                        padding: 1rem;
                    }

                    .type-buttons {
                        grid-template-columns: 1fr;
                    }

                    .button-options {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        flex-direction: column;
                    }

                    .setting-row {
                        flex-direction: column;
                    }

                    .signals-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
