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

// Icons Components
const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const SignalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const UploadIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

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
    const [previewData, setPreviewData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Fetch settings from DB on mount
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

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewData(reader.result);
                setSelectedFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
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


    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
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
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: radial-gradient(circle at 50% 50%, rgba(184, 134, 11, 0.08) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .login-card {
                        background: rgba(12, 12, 12, 0.95);
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 24px;
                        padding: 3rem;
                        max-width: 420px;
                        width: 100%;
                        position: relative;
                        backdrop-filter: blur(20px);
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .login-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background: linear-gradient(90deg, #705C0B, #DAA520, #FFE566, #DAA520, #705C0B);
                        border-radius: 24px 24px 0 0;
                    }
                    .login-icon {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 1.5rem;
                        background: linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(218, 165, 32, 0.1));
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2.5rem;
                        border: 1px solid rgba(184, 134, 11, 0.3);
                    }
                    .login-title {
                        text-align: center;
                        font-size: 1.75rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                        background: linear-gradient(90deg, #FFD700, #FFE566, #FFFFFF, #FFE566, #FFD700);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: goldShine 2.5s linear infinite alternate;
                    }
                    @keyframes goldShine {
                        0% { background-position: 200% center; }
                        100% { background-position: 0% center; }
                    }
                    .login-subtitle {
                        text-align: center;
                        color: #888;
                        margin-bottom: 2rem;
                        font-size: 0.95rem;
                    }
                    .login-input {
                        width: 100%;
                        padding: 1rem 1.25rem;
                        background: rgba(20, 20, 20, 0.8);
                        border: 1px solid rgba(184, 134, 11, 0.2);
                        border-radius: 12px;
                        color: #fff;
                        font-size: 1rem;
                        text-align: center;
                        margin-bottom: 1rem;
                        transition: all 0.3s ease;
                        outline: none;
                    }
                    .login-input:focus {
                        border-color: rgba(184, 134, 11, 0.5);
                        box-shadow: 0 0 20px rgba(184, 134, 11, 0.15);
                    }
                    .login-input::placeholder {
                        color: #666;
                    }
                    .login-btn {
                        width: 100%;
                        padding: 1rem;
                        background: linear-gradient(135deg, #B8860B, #DAA520, #FFE566, #DAA520, #B8860B);
                        background-size: 200% 100%;
                        border: none;
                        border-radius: 12px;
                        color: #000;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        animation: goldShine 3s linear infinite;
                    }
                    .login-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 30px rgba(184, 134, 11, 0.3);
                    }
                    .login-error {
                        color: #ef4444;
                        text-align: center;
                        margin-bottom: 1rem;
                        font-size: 0.9rem;
                        padding: 0.75rem;
                        background: rgba(239, 68, 68, 0.1);
                        border-radius: 8px;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }
                `}</style>
                <div className="login-card">
                    <div className="login-icon">🔐</div>
                    <h1 className="login-title">{t.adminTitle}</h1>
                    <p className="login-subtitle">{lang === 'ar' ? 'أدخل كلمة المرور للوصول' : 'Enter password to access'}</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            className="login-input"
                        />
                        {error && <p className="login-error">{error}</p>}
                        <button type="submit" className="login-btn">{t.login}</button>
                    </form>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'publish', label: lang === 'ar' ? 'نشر توصية' : 'Publish Signal', icon: <UploadIcon /> },
        { id: 'signals', label: lang === 'ar' ? 'التوصيات' : 'Signals', icon: <SignalIcon />, count: signals.length },
        { id: 'vip', label: lang === 'ar' ? 'أعضاء VIP' : 'VIP Members', icon: <UsersIcon />, count: users.filter(u => u.isVip).length },
        { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="admin-container" onPaste={handlePaste}>
            <style jsx>{`
                .admin-container {
                    min-height: 100vh;
                    background: #080808;
                    display: flex;
                }
                .admin-sidebar {
                    width: 280px;
                    background: linear-gradient(180deg, #0c0c0c 0%, #080808 100%);
                    border-right: 1px solid rgba(184, 134, 11, 0.15);
                    padding: 1.5rem;
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    z-index: 100;
                }
                [dir="rtl"] .admin-sidebar {
                    left: auto;
                    right: 0;
                    border-right: none;
                    border-left: 1px solid rgba(184, 134, 11, 0.15);
                }
                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    margin-bottom: 2rem;
                }
                .logo-icon-wrapper {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(218, 165, 32, 0.1));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                }
                .logo-text {
                    font-size: 1.25rem;
                    font-weight: 700;
                    background: linear-gradient(90deg, #FFD700, #FFE566, #FFFFFF, #FFE566, #FFD700);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: goldShine 2.5s linear infinite alternate;
                }
                @keyframes goldShine {
                    0% { background-position: 200% center; }
                    100% { background-position: 0% center; }
                }
                .sidebar-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #888;
                    border: 1px solid transparent;
                    position: relative;
                }
                .nav-item:hover {
                    background: rgba(184, 134, 11, 0.08);
                    color: #DAA520;
                }
                .nav-item.active {
                    background: linear-gradient(135deg, rgba(184, 134, 11, 0.15), rgba(218, 165, 32, 0.08));
                    color: #FFE566;
                    border-color: rgba(184, 134, 11, 0.3);
                }
                .nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 60%;
                    background: linear-gradient(180deg, #DAA520, #FFE566);
                    border-radius: 0 3px 3px 0;
                }
                [dir="rtl"] .nav-item.active::before {
                    left: auto;
                    right: 0;
                    border-radius: 3px 0 0 3px;
                }
                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                }
                .nav-label {
                    flex: 1;
                    font-weight: 500;
                }
                .nav-count {
                    background: rgba(184, 134, 11, 0.2);
                    color: #DAA520;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .sidebar-footer {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .footer-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    background: transparent;
                    color: #888;
                }
                .footer-btn:hover {
                    background: rgba(184, 134, 11, 0.1);
                    color: #DAA520;
                }
                .footer-btn.logout {
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                .footer-btn.logout:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                .admin-main {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem;
                    min-height: 100vh;
                }
                [dir="rtl"] .admin-main {
                    margin-left: 0;
                    margin-right: 280px;
                }
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        width: 100%;
                        height: auto;
                        position: relative;
                        border-right: none;
                        border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                    }
                    [dir="rtl"] .admin-sidebar {
                        border-left: none;
                    }
                    .admin-container {
                        flex-direction: column;
                    }
                    .admin-main {
                        margin-left: 0;
                        margin-right: 0;
                    }
                    [dir="rtl"] .admin-main {
                        margin-right: 0;
                    }
                    .sidebar-nav {
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    .nav-item {
                        padding: 0.75rem 1rem;
                    }
                    .nav-item.active::before {
                        display: none;
                    }
                    .sidebar-footer {
                        flex-direction: row;
                        justify-content: center;
                        border-top: none;
                        padding-top: 0.5rem;
                    }
                }
            `}</style>

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon-wrapper">💎</div>
                    <span className="logo-text">{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</span>
                </div>
                
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                            {tab.count !== undefined && <span className="nav-count">{tab.count}</span>}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={toggleLang} className="footer-btn">
                        🌐 {t.langSwitch}
                    </button>
                    <button onClick={handleLogout} className="footer-btn logout">
                        {lang === 'ar' ? '🚪 خروج' : '🚪 Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Success/Error Messages */}
                {successMessage && (
                    <div style={{
                        position: 'fixed',
                        top: '1rem',
                        right: isRTL ? 'auto' : '1rem',
                        left: isRTL ? '1rem' : 'auto',
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95))',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 10px 40px rgba(76, 175, 80, 0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        ✅ {successMessage}
                    </div>
                )}
                {error && (
                    <div style={{
                        position: 'fixed',
                        top: '1rem',
                        right: isRTL ? 'auto' : '1rem',
                        left: isRTL ? '1rem' : 'auto',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        ❌ {error}
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem' }}>✕</button>
                    </div>
                )}

                {/* Publish Tab */}
                {activeTab === 'publish' && (
                    <div className="publish-section">
                        <style jsx>{`
                            .publish-section {
                                max-width: 900px;
                                margin: 0 auto;
                            }
                            .section-header {
                                margin-bottom: 2rem;
                            }
                            .section-title {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: #fff;
                                margin-bottom: 0.5rem;
                                display: flex;
                                align-items: center;
                                gap: 0.75rem;
                            }
                            .section-subtitle {
                                color: #888;
                                font-size: 0.95rem;
                            }
                            .edit-badge {
                                background: linear-gradient(135deg, #DAA520, #FFE566);
                                color: #000;
                                padding: 0.4rem 1rem;
                                border-radius: 20px;
                                font-size: 0.8rem;
                                font-weight: 700;
                                display: inline-flex;
                                align-items: center;
                                gap: 0.3rem;
                            }
                            .upload-zone {
                                background: linear-gradient(135deg, rgba(12, 12, 12, 0.8), rgba(20, 20, 20, 0.6));
                                border: 2px dashed rgba(184, 134, 11, 0.3);
                                border-radius: 20px;
                                padding: 3rem 2rem;
                                text-align: center;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                margin-bottom: 2rem;
                            }
                            .upload-zone:hover, .upload-zone.dragging {
                                border-color: rgba(184, 134, 11, 0.6);
                                background: linear-gradient(135deg, rgba(184, 134, 11, 0.08), rgba(218, 165, 32, 0.04));
                            }
                            .upload-zone.dragging {
                                transform: scale(1.02);
                            }
                            .upload-icon {
                                color: #DAA520;
                                margin-bottom: 1rem;
                                opacity: 0.8;
                            }
                            .upload-text {
                                color: #888;
                                font-size: 1rem;
                                margin-bottom: 0.5rem;
                            }
                            .upload-hint {
                                color: #666;
                                font-size: 0.85rem;
                            }
                            .preview-container {
                                position: relative;
                                background: rgba(12, 12, 12, 0.8);
                                border: 1px solid rgba(184, 134, 11, 0.3);
                                border-radius: 20px;
                                overflow: hidden;
                                margin-bottom: 2rem;
                            }
                            .preview-image {
                                width: 100%;
                                max-height: 400px;
                                object-fit: contain;
                                display: block;
                            }
                            .preview-overlay {
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: rgba(0, 0, 0, 0.5);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                opacity: 0;
                                transition: opacity 0.3s ease;
                            }
                            .preview-container:hover .preview-overlay {
                                opacity: 1;
                            }
                            .change-btn {
                                background: rgba(239, 68, 68, 0.9);
                                color: #fff;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: 10px;
                                cursor: pointer;
                                font-weight: 600;
                                transition: all 0.3s ease;
                            }
                            .change-btn:hover {
                                background: #ef4444;
                                transform: scale(1.05);
                            }
                            .form-card {
                                background: rgba(12, 12, 12, 0.6);
                                border: 1px solid rgba(184, 134, 11, 0.15);
                                border-radius: 20px;
                                padding: 1.5rem;
                                margin-bottom: 1.5rem;
                            }
                            .form-card-title {
                                color: #DAA520;
                                font-size: 1rem;
                                font-weight: 600;
                                margin-bottom: 1rem;
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                            }
                            .signal-type-grid {
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                gap: 1rem;
                            }
                            .type-btn {
                                padding: 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 2px solid rgba(255, 255, 255, 0.1);
                                border-radius: 12px;
                                color: #888;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                text-align: center;
                            }
                            .type-btn:hover {
                                border-color: rgba(184, 134, 11, 0.3);
                                color: #DAA520;
                            }
                            .type-btn.active {
                                background: linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(218, 165, 32, 0.1));
                                border-color: #DAA520;
                                color: #FFE566;
                            }
                            .type-icon {
                                font-size: 1.5rem;
                                margin-bottom: 0.5rem;
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
                                outline: none;
                                transition: all 0.3s ease;
                            }
                            .post-textarea:focus {
                                border-color: rgba(184, 134, 11, 0.5);
                                box-shadow: 0 0 20px rgba(184, 134, 11, 0.1);
                            }
                            .post-textarea::placeholder {
                                color: #666;
                            }
                            .telegram-options {
                                display: flex;
                                flex-direction: column;
                                gap: 1rem;
                            }
                            .telegram-toggle {
                                display: flex;
                                align-items: center;
                                gap: 0.75rem;
                                cursor: pointer;
                                padding: 0.75rem;
                                background: rgba(20, 20, 20, 0.5);
                                border-radius: 10px;
                                transition: all 0.3s ease;
                            }
                            .telegram-toggle:hover {
                                background: rgba(34, 158, 217, 0.1);
                            }
                            .toggle-checkbox {
                                width: 20px;
                                height: 20px;
                                border-radius: 6px;
                                border: 2px solid #555;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.3s ease;
                            }
                            .toggle-checkbox.active {
                                background: #229ED9;
                                border-color: #229ED9;
                            }
                            .button-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 0.75rem;
                            }
                            .tg-btn {
                                padding: 0.875rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                color: #888;
                                font-size: 0.9rem;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                text-align: center;
                            }
                            .tg-btn:hover {
                                border-color: rgba(34, 158, 217, 0.3);
                                color: #229ED9;
                            }
                            .tg-btn.active {
                                background: rgba(34, 158, 217, 0.15);
                                border-color: #229ED9;
                                color: #229ED9;
                            }
                            .publish-btn {
                                width: 100%;
                                padding: 1.25rem;
                                background: linear-gradient(135deg, #B8860B, #DAA520, #FFE566, #DAA520, #B8860B);
                                background-size: 200% 100%;
                                border: none;
                                border-radius: 14px;
                                color: #000;
                                font-weight: 700;
                                font-size: 1.1rem;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                animation: goldShine 3s linear infinite;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 0.5rem;
                            }
                            .publish-btn:hover:not(:disabled) {
                                transform: translateY(-2px);
                                box-shadow: 0 10px 30px rgba(184, 134, 11, 0.4);
                            }
                            .publish-btn:disabled {
                                opacity: 0.6;
                                cursor: not-allowed;
                            }
                            @media (max-width: 640px) {
                                .signal-type-grid {
                                    grid-template-columns: 1fr;
                                }
                                .button-grid {
                                    grid-template-columns: 1fr;
                                }
                            }
                        `}</style>

                        <div className="section-header">
                            <h1 className="section-title">
                                📤 {isEditing ? (lang === 'ar' ? 'تعديل التوصية' : 'Edit Signal') : (lang === 'ar' ? 'نشر توصية جديدة' : 'Publish New Signal')}
                                {isEditing && <span className="edit-badge">✏️ {lang === 'ar' ? 'وضع التعديل' : 'Edit Mode'}</span>}
                            </h1>
                            <p className="section-subtitle">
                                {lang === 'ar' ? 'قم برفع صورة التوصية وتخصيص المنشور' : 'Upload signal image and customize your post'}
                            </p>
                        </div>

                        {/* Image Upload */}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
                        
                        {!previewData ? (
                            <label 
                                htmlFor="image-upload" 
                                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className="upload-icon"><UploadIcon /></div>
                                <p className="upload-text">{lang === 'ar' ? 'اسحب الصورة هنا أو اضغط للاختيار' : 'Drag image here or click to select'}</p>
                                <p className="upload-hint">{lang === 'ar' ? 'يمكنك أيضاً لصق الصورة من الحافظة (Ctrl+V)' : 'You can also paste from clipboard (Ctrl+V)'}</p>
                            </label>
                        ) : (
                            <div className="preview-container">
                                <img src={previewData} alt="Preview" className="preview-image" />
                                <div className="preview-overlay">
                                    <button onClick={cancelPreview} className="change-btn">
                                        {lang === 'ar' ? '🔄 تغيير الصورة' : '🔄 Change Image'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Signal Type */}
                        <div className="form-card">
                            <h3 className="form-card-title">📊 {lang === 'ar' ? 'نوع التوصية' : 'Signal Type'}</h3>
                            <div className="signal-type-grid">
                                <button className={`type-btn ${signalType === 'vip' ? 'active' : ''}`} onClick={() => setSignalType('vip')}>
                                    <div className="type-icon">💎</div>
                                    <div>VIP</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang === 'ar' ? 'مطموسة' : 'Blurred'}</div>
                                </button>
                                <button className={`type-btn ${signalType === 'free' ? 'active' : ''}`} onClick={() => setSignalType('free')}>
                                    <div className="type-icon">🎁</div>
                                    <div>{lang === 'ar' ? 'مجانية' : 'Free'}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang === 'ar' ? 'واضحة' : 'Clear'}</div>
                                </button>
                                <button className={`type-btn ${signalType === 'regular' ? 'active' : ''}`} onClick={() => setSignalType('regular')}>
                                    <div className="type-icon">📝</div>
                                    <div>{lang === 'ar' ? 'منشور عادي' : 'Regular'}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang === 'ar' ? 'بدون توصية' : 'No signal'}</div>
                                </button>
                            </div>
                        </div>

                        {/* Post Text */}
                        <div className="form-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="form-card-title" style={{ margin: 0 }}>✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}</h3>
                                {isEditing && (
                                    <button onClick={handleCancelEdit} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        ✖ {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={customPost}
                                onChange={(e) => setCustomPost(e.target.value)}
                                placeholder={lang === 'ar' ? 'اكتب نص المنشور هنا...' : 'Write your post text here...'}
                                className="post-textarea"
                            />
                        </div>

                        {/* AI Generation */}
                        <div className="form-card">
                            <details style={{ cursor: 'pointer' }}>
                                <summary className="form-card-title" style={{ marginBottom: 0 }}>
                                    🤖 {lang === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'AI Generation'}
                                </summary>
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        onClick={generateAIPosts}
                                        disabled={generatingPosts || !customPost.trim()}
                                        style={{
                                            padding: '1rem',
                                            background: generatingPosts ? '#333' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontWeight: '600',
                                            cursor: generatingPosts ? 'wait' : 'pointer',
                                            opacity: !customPost.trim() ? 0.5 : 1
                                        }}
                                    >
                                        {generatingPosts ? (lang === 'ar' ? '⏳ جاري التوليد...' : '⏳ Generating...') : (lang === 'ar' ? `🚀 توليد ${postCount} نسخة` : `🚀 Generate ${postCount} Variations`)}
                                    </button>

                                    {generatedPosts.length > 0 && (
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                                            {generatedPosts.map((post, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedPostIndex(idx)}
                                                    style={{
                                                        padding: '1rem',
                                                        background: selectedPostIndex === idx ? 'rgba(184, 134, 11, 0.15)' : 'rgba(20, 20, 20, 0.8)',
                                                        border: `2px solid ${selectedPostIndex === idx ? '#DAA520' : 'transparent'}`,
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <p style={{ color: '#e0e0e0', fontSize: '0.9rem', margin: 0 }}>{post}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </details>
                        </div>

                        {/* Telegram Options */}
                        <div className="form-card">
                            <h3 className="form-card-title"><TelegramIcon /> {lang === 'ar' ? 'خيارات تليجرام' : 'Telegram Options'}</h3>
                            <div className="telegram-options">
                                <div className="telegram-toggle" onClick={() => setPostToTelegram(!postToTelegram)}>
                                    <div className={`toggle-checkbox ${postToTelegram ? 'active' : ''}`}>
                                        {postToTelegram && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <span style={{ color: '#fff' }}>{t.postToTelegram}</span>
                                </div>

                                {postToTelegram && (
                                    <div className="button-grid">
                                        {[
                                            { id: 'view_signal', label: lang === 'ar' ? '💎 إظهار التوصية' : '💎 Show Signal' },
                                            { id: 'subscribe', label: lang === 'ar' ? '🔥 اشترك الآن' : '🔥 Subscribe Now' },
                                            { id: 'share', label: lang === 'ar' ? '📤 مشاركة' : '📤 Share Post' },
                                            { id: 'none', label: lang === 'ar' ? '🚫 بدون زر' : '🚫 No Button' }
                                        ].map(btn => (
                                            <button
                                                key={btn.id}
                                                className={`tg-btn ${telegramButtonType === btn.id ? 'active' : ''}`}
                                                onClick={() => setTelegramButtonType(btn.id)}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Publish Button */}
                        {previewData && (
                            <button
                                onClick={isEditing ? handleUpdate : handlePublish}
                                disabled={uploading}
                                className="publish-btn"
                            >
                                {uploading
                                    ? (lang === 'ar' ? '⏳ جاري المعالجة...' : '⏳ Processing...')
                                    : isEditing
                                        ? (lang === 'ar' ? '🔄 تحديث التوصية' : '🔄 Update Signal')
                                        : (lang === 'ar' ? '🚀 نشر التوصية' : '🚀 Publish Signal')
                                }
                            </button>
                        )}
                    </div>
                )}

                {/* Signals Tab */}
                {activeTab === 'signals' && (
                    <div className="signals-section">
                        <style jsx>{`
                            .signals-section {
                                max-width: 1400px;
                                margin: 0 auto;
                            }
                            .signals-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 2rem;
                            }
                            .signals-title {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: #fff;
                                display: flex;
                                align-items: center;
                                gap: 0.75rem;
                            }
                            .signals-count {
                                background: linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(218, 165, 32, 0.1));
                                color: #DAA520;
                                padding: 0.3rem 0.8rem;
                                border-radius: 20px;
                                font-size: 0.9rem;
                            }
                            .signals-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                                gap: 1.5rem;
                            }
                            .signal-card {
                                background: rgba(12, 12, 12, 0.8);
                                border: 1px solid rgba(184, 134, 11, 0.15);
                                border-radius: 20px;
                                overflow: hidden;
                                transition: all 0.3s ease;
                            }
                            .signal-card:hover {
                                border-color: rgba(184, 134, 11, 0.3);
                                transform: translateY(-4px);
                                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                            }
                            .signal-image {
                                width: 100%;
                                height: auto;
                                display: block;
                            }
                            .signal-content {
                                padding: 1.25rem;
                                background: rgba(255, 255, 255, 0.02);
                                border-top: 1px solid rgba(184, 134, 11, 0.1);
                            }
                            .signal-text {
                                color: #e0e0e0;
                                font-size: 0.95rem;
                                line-height: 1.6;
                                white-space: pre-wrap;
                                margin-bottom: 0.75rem;
                            }
                            .signal-meta {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                color: #666;
                                font-size: 0.8rem;
                            }
                            .signal-actions {
                                padding: 0.75rem 1rem;
                                display: flex;
                                justify-content: flex-end;
                                gap: 0.5rem;
                                background: rgba(0, 0, 0, 0.3);
                            }
                            .action-btn {
                                padding: 0.5rem 1rem;
                                background: transparent;
                                border: 1px solid rgba(184, 134, 11, 0.3);
                                border-radius: 8px;
                                color: #DAA520;
                                cursor: pointer;
                                font-size: 0.85rem;
                                transition: all 0.3s ease;
                            }
                            .action-btn:hover {
                                background: rgba(184, 134, 11, 0.1);
                            }
                            .action-btn.delete {
                                border-color: rgba(239, 68, 68, 0.3);
                                color: #ef4444;
                            }
                            .action-btn.delete:hover {
                                background: rgba(239, 68, 68, 0.1);
                            }
                            .empty-state {
                                text-align: center;
                                padding: 4rem 2rem;
                                color: #666;
                            }
                            .empty-icon {
                                font-size: 4rem;
                                margin-bottom: 1rem;
                                opacity: 0.5;
                            }
                        `}</style>

                        <div className="signals-header">
                            <h1 className="signals-title">
                                📊 {lang === 'ar' ? 'التوصيات المنشورة' : 'Published Signals'}
                                <span className="signals-count">{signals.length}</span>
                            </h1>
                            <button onClick={() => setActiveTab('publish')} style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #B8860B, #DAA520)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#000',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                + {lang === 'ar' ? 'توصية جديدة' : 'New Signal'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="empty-state">
                                <div className="empty-icon">⏳</div>
                                <p>{t.loading}</p>
                            </div>
                        ) : signals.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p>{lang === 'ar' ? 'لا توجد توصيات منشورة' : 'No signals published yet'}</p>
                            </div>
                        ) : (
                            <div className="signals-grid">
                                {signals.map((signal) => (
                                    <div key={signal._id} className="signal-card">
                                        <img src={signal.imageUrl} alt="Signal" className="signal-image" />
                                        {signal.customPost && (
                                            <div className="signal-content">
                                                <p className="signal-text">{signal.customPost.replace(/\*/g, '')}</p>
                                                <div className="signal-meta">
                                                    <span>{getTimeAgo(signal.createdAt, lang)}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {signal.isVip ? '💎 VIP' : '🎁 Free'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="signal-actions">
                                            <button className="action-btn" onClick={() => handleEdit(signal)}>
                                                ✏️ {lang === 'ar' ? 'تعديل' : 'Edit'}
                                            </button>
                                            <button className="action-btn delete" onClick={() => deleteSignal(signal._id)}>
                                                🗑️ {t.delete}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* VIP Tab */}
                {activeTab === 'vip' && (
                    <div className="vip-section">
                        <style jsx>{`
                            .vip-section {
                                max-width: 1000px;
                                margin: 0 auto;
                            }
                            .vip-header {
                                margin-bottom: 2rem;
                            }
                            .vip-title {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: #fff;
                                margin-bottom: 0.5rem;
                            }
                            .vip-subtitle {
                                color: #888;
                            }
                            .add-vip-card {
                                background: linear-gradient(135deg, rgba(184, 134, 11, 0.1), rgba(218, 165, 32, 0.05));
                                border: 1px solid rgba(184, 134, 11, 0.2);
                                border-radius: 20px;
                                padding: 2rem;
                                margin-bottom: 2rem;
                            }
                            .add-vip-title {
                                color: #DAA520;
                                font-size: 1.1rem;
                                font-weight: 600;
                                margin-bottom: 1.5rem;
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                            }
                            .vip-form {
                                display: grid;
                                grid-template-columns: 2fr 1fr 1fr auto;
                                gap: 1rem;
                                align-items: end;
                            }
                            .form-group {
                                display: flex;
                                flex-direction: column;
                                gap: 0.5rem;
                            }
                            .form-label {
                                color: #888;
                                font-size: 0.85rem;
                            }
                            .form-input {
                                padding: 0.875rem 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                color: #fff;
                                font-size: 0.95rem;
                                outline: none;
                                transition: all 0.3s ease;
                            }
                            .form-input:focus {
                                border-color: rgba(184, 134, 11, 0.5);
                            }
                            .form-input:disabled {
                                opacity: 0.5;
                            }
                            .lifetime-toggle {
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                                padding: 0.875rem 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            }
                            .lifetime-toggle:hover {
                                border-color: rgba(184, 134, 11, 0.3);
                            }
                            .lifetime-toggle.active {
                                background: rgba(184, 134, 11, 0.15);
                                border-color: #DAA520;
                            }
                            .add-btn {
                                padding: 0.875rem 2rem;
                                background: linear-gradient(135deg, #B8860B, #DAA520);
                                border: none;
                                border-radius: 10px;
                                color: #000;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                white-space: nowrap;
                            }
                            .add-btn:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 8px 20px rgba(184, 134, 11, 0.3);
                            }
                            .vip-message {
                                margin-top: 1rem;
                                padding: 0.75rem 1rem;
                                border-radius: 10px;
                                font-size: 0.9rem;
                            }
                            .vip-message.success {
                                background: rgba(76, 175, 80, 0.1);
                                color: #4caf50;
                                border: 1px solid rgba(76, 175, 80, 0.2);
                            }
                            .vip-message.error {
                                background: rgba(239, 68, 68, 0.1);
                                color: #ef4444;
                                border: 1px solid rgba(239, 68, 68, 0.2);
                            }
                            .users-table-container {
                                background: rgba(12, 12, 12, 0.6);
                                border: 1px solid rgba(184, 134, 11, 0.15);
                                border-radius: 20px;
                                overflow: hidden;
                            }
                            .users-table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            .users-table th {
                                padding: 1rem 1.25rem;
                                text-align: center;
                                color: #DAA520;
                                font-weight: 600;
                                font-size: 0.9rem;
                                background: rgba(184, 134, 11, 0.08);
                                border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                            }
                            .users-table td {
                                padding: 1rem 1.25rem;
                                text-align: center;
                                color: #e0e0e0;
                                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                            }
                            .users-table tr:last-child td {
                                border-bottom: none;
                            }
                            .users-table tr:hover td {
                                background: rgba(184, 134, 11, 0.05);
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
                            .remove-btn {
                                padding: 0.4rem 0.8rem;
                                background: transparent;
                                border: 1px solid rgba(239, 68, 68, 0.3);
                                border-radius: 8px;
                                color: #ef4444;
                                cursor: pointer;
                                font-size: 0.85rem;
                                transition: all 0.3s ease;
                            }
                            .remove-btn:hover {
                                background: rgba(239, 68, 68, 0.1);
                            }
                            .empty-table {
                                padding: 3rem;
                                text-align: center;
                                color: #666;
                            }
                            @media (max-width: 768px) {
                                .vip-form {
                                    grid-template-columns: 1fr;
                                }
                            }
                        `}</style>

                        <div className="vip-header">
                            <h1 className="vip-title">👑 {t.manageVip}</h1>
                            <p className="vip-subtitle">{lang === 'ar' ? 'إدارة اشتراكات الأعضاء المميزين' : 'Manage VIP member subscriptions'}</p>
                        </div>

                        <div className="add-vip-card">
                            <h3 className="add-vip-title">➕ {t.addNewVip}</h3>
                            <form onSubmit={handleGrantVip} className="vip-form">
                                <div className="form-group">
                                    <label className="form-label">Telegram ID</label>
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
                                    <label className="form-label">{t.durationMonths || 'Duration'}</label>
                                    <input
                                        type="number"
                                        value={durationMonths}
                                        onChange={(e) => setDurationMonths(e.target.value)}
                                        placeholder="Months"
                                        className="form-input"
                                        disabled={isLifetime}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">&nbsp;</label>
                                    <div 
                                        className={`lifetime-toggle ${isLifetime ? 'active' : ''}`}
                                        onClick={() => setIsLifetime(!isLifetime)}
                                    >
                                        <input type="checkbox" checked={isLifetime} onChange={() => {}} style={{ display: 'none' }} />
                                        <span style={{ color: isLifetime ? '#DAA520' : '#888' }}>♾️ {t.lifetime || 'Lifetime'}</span>
                                    </div>
                                </div>
                                <button type="submit" className="add-btn" disabled={vipLoading}>
                                    {vipLoading ? '...' : t.grantVip}
                                </button>
                            </form>
                            {vipMessage.text && (
                                <div className={`vip-message ${vipMessage.type}`}>{vipMessage.text}</div>
                            )}
                        </div>

                        <div className="users-table-container">
                            <table className="users-table">
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
                                                    <td style={{ fontFamily: 'monospace' }}>{user.telegramId}</td>
                                                    <td><span className="status-badge active">✓ Active</span></td>
                                                    <td>{timeLeft}</td>
                                                    <td>
                                                        <button className="remove-btn" onClick={() => handleRemoveUser(user.telegramId)}>
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
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <style jsx>{`
                            .settings-section {
                                max-width: 800px;
                                margin: 0 auto;
                            }
                            .settings-header {
                                margin-bottom: 2rem;
                            }
                            .settings-title {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: #fff;
                                margin-bottom: 0.5rem;
                            }
                            .settings-subtitle {
                                color: #888;
                            }
                            .settings-card {
                                background: rgba(12, 12, 12, 0.6);
                                border: 1px solid rgba(184, 134, 11, 0.15);
                                border-radius: 20px;
                                padding: 2rem;
                                margin-bottom: 1.5rem;
                            }
                            .settings-card-title {
                                color: #DAA520;
                                font-size: 1.1rem;
                                font-weight: 600;
                                margin-bottom: 1.5rem;
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                                padding-bottom: 1rem;
                                border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                            }
                            .settings-form {
                                display: flex;
                                flex-direction: column;
                                gap: 1.25rem;
                            }
                            .settings-row {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 1rem;
                            }
                            .settings-group {
                                display: flex;
                                flex-direction: column;
                                gap: 0.5rem;
                            }
                            .settings-label {
                                color: #888;
                                font-size: 0.9rem;
                                display: flex;
                                align-items: center;
                                gap: 0.5rem;
                            }
                            .settings-input {
                                padding: 0.875rem 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                color: #fff;
                                font-size: 0.95rem;
                                outline: none;
                                transition: all 0.3s ease;
                            }
                            .settings-input:focus {
                                border-color: rgba(184, 134, 11, 0.5);
                                box-shadow: 0 0 20px rgba(184, 134, 11, 0.1);
                            }
                            .settings-select {
                                padding: 0.875rem 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                color: #fff;
                                font-size: 0.95rem;
                                outline: none;
                                cursor: pointer;
                            }
                            .settings-textarea {
                                padding: 1rem;
                                background: rgba(20, 20, 20, 0.8);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                color: #fff;
                                font-size: 0.95rem;
                                min-height: 120px;
                                resize: vertical;
                                outline: none;
                                transition: all 0.3s ease;
                            }
                            .settings-textarea:focus {
                                border-color: rgba(184, 134, 11, 0.5);
                            }
                            .model-row {
                                display: flex;
                                gap: 0.75rem;
                            }
                            .refresh-btn {
                                padding: 0.875rem 1rem;
                                background: rgba(184, 134, 11, 0.15);
                                border: 1px solid rgba(184, 134, 11, 0.3);
                                border-radius: 10px;
                                color: #DAA520;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            }
                            .refresh-btn:hover {
                                background: rgba(184, 134, 11, 0.25);
                            }
                            .save-btn {
                                padding: 1rem 2rem;
                                background: linear-gradient(135deg, #4CAF50, #45a049);
                                border: none;
                                border-radius: 12px;
                                color: #fff;
                                font-weight: 600;
                                font-size: 1rem;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 0.5rem;
                            }
                            .save-btn:hover:not(:disabled) {
                                transform: translateY(-2px);
                                box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
                            }
                            .save-btn:disabled {
                                opacity: 0.7;
                                cursor: wait;
                            }
                            @media (max-width: 640px) {
                                .settings-row {
                                    grid-template-columns: 1fr;
                                }
                            }
                        `}</style>

                        <div className="settings-header">
                            <h1 className="settings-title">⚙️ {lang === 'ar' ? 'الإعدادات' : 'Settings'}</h1>
                            <p className="settings-subtitle">{lang === 'ar' ? 'إعدادات الذكاء الاصطناعي والنظام' : 'AI and system configuration'}</p>
                        </div>

                        <div className="settings-card">
                            <h3 className="settings-card-title">🤖 {lang === 'ar' ? 'إعدادات Gemini AI' : 'Gemini AI Settings'}</h3>
                            <div className="settings-form">
                                <div className="settings-group">
                                    <label className="settings-label">🔑 API Key</label>
                                    <input
                                        type="password"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Enter your Gemini API key"
                                        className="settings-input"
                                    />
                                </div>

                                <div className="settings-row">
                                    <div className="settings-group">
                                        <label className="settings-label">🧠 {lang === 'ar' ? 'النموذج' : 'Model'}</label>
                                        <div className="model-row">
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                className="settings-select"
                                                style={{ flex: 1 }}
                                            >
                                                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                                {availableModels.map(m => (
                                                    <option key={m.id} value={m.id}>{m.displayName}</option>
                                                ))}
                                            </select>
                                            <button onClick={fetchModels} disabled={modelsLoading} className="refresh-btn">
                                                {modelsLoading ? '...' : '🔄'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="settings-group">
                                        <label className="settings-label">🔢 {lang === 'ar' ? 'عدد النسخ' : 'Post Count'}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={postCount}
                                            onChange={(e) => setPostCount(Number(e.target.value))}
                                            className="settings-input"
                                        />
                                    </div>
                                </div>

                                <div className="settings-group">
                                    <label className="settings-label">📝 {lang === 'ar' ? 'الأمر (Prompt)' : 'Custom Prompt'}</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={lang === 'ar' ? 'أدخل الأمر المخصص للذكاء الاصطناعي...' : 'Enter custom AI prompt...'}
                                        className="settings-textarea"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => saveSettingsToDB(null, true)}
                            disabled={savingSettings}
                            className="save-btn"
                        >
                            {savingSettings ? (
                                <>{lang === 'ar' ? '⏳ جاري الحفظ...' : '⏳ Saving...'}</>
                            ) : (
                                <>💾 {lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
