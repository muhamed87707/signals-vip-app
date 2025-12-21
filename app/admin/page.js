'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PASSWORD = '123';

// ===== Icons Components =====
const DashboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const SignalIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h.01" />
        <path d="M7 20v-4" />
        <path d="M12 20v-8" />
        <path d="M17 20V8" />
        <path d="M22 4v16" />
    </svg>
);

const CrownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M3 20h18" />
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

const ImageIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#DAA520" />
            </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
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

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const SparkleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
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

// ===== Styles =====
const styles = {
    // Layout
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #080808 0%, #0a0a0f 50%, #080808 100%)',
    },
    sidebar: {
        position: 'fixed',
        top: 0,
        width: '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)',
        borderRight: '1px solid rgba(184, 134, 11, 0.15)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'transform 0.3s ease',
    },
    mainContent: {
        marginLeft: '280px',
        padding: '2rem 3rem',
        minHeight: '100vh',
    },
    // Logo
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '3rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFE566 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: '0 4px 20px rgba(184, 134, 11, 0.3)',
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: '700',
        background: 'linear-gradient(90deg, #FFD700, #FFE566, #FFD700)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    // Navigation
    navItem: (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '0.5rem',
        background: isActive ? 'linear-gradient(90deg, rgba(184, 134, 11, 0.15), rgba(218, 165, 32, 0.1))' : 'transparent',
        border: isActive ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid transparent',
        color: isActive ? '#FFD700' : '#888',
    }),
    navIcon: (isActive) => ({
        color: isActive ? '#FFD700' : '#666',
        transition: 'color 0.3s ease',
    }),
    navText: {
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    // Cards
    card: {
        background: 'linear-gradient(145deg, #0c0c0c 0%, #0a0a0f 100%)',
        border: '1px solid rgba(184, 134, 11, 0.12)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
    },
    cardGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.5), transparent)',
    },
    // Buttons
    primaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFE566 100%)',
        backgroundSize: '200% 200%',
        border: 'none',
        borderRadius: '12px',
        color: '#000',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(184, 134, 11, 0.3)',
    },
    secondaryButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        border: '1px solid rgba(184, 134, 11, 0.3)',
        borderRadius: '10px',
        color: '#DAA520',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    dangerButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        color: '#ef4444',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    // Inputs
    input: {
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(184, 134, 11, 0.15)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
    },
    textarea: {
        width: '100%',
        minHeight: '140px',
        padding: '1rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(184, 134, 11, 0.15)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        resize: 'vertical',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
    },
    select: {
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(184, 134, 11, 0.15)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        cursor: 'pointer',
    },
    label: {
        display: 'block',
        color: '#DAA520',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
    },
    // Signal Type Buttons
    typeButton: (isActive) => ({
        flex: 1,
        padding: '1rem',
        background: isActive ? 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' : 'rgba(0, 0, 0, 0.3)',
        border: isActive ? 'none' : '1px solid rgba(184, 134, 11, 0.2)',
        borderRadius: '12px',
        color: isActive ? '#000' : '#888',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    }),
    // Upload Zone
    uploadZone: {
        border: '2px dashed rgba(184, 134, 11, 0.3)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'rgba(184, 134, 11, 0.02)',
    },
    // Signal Card
    signalCard: {
        background: 'linear-gradient(145deg, #0c0c0c 0%, #080808 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(184, 134, 11, 0.1)',
        transition: 'all 0.3s ease',
    },
    // Table
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 0.5rem',
    },
    tableHeader: {
        background: 'rgba(184, 134, 11, 0.05)',
        color: '#DAA520',
        fontWeight: '600',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableRow: {
        background: 'rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
    },
    tableCell: {
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    },
    // Badge
    badge: (type) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        background: type === 'success' ? 'rgba(76, 175, 80, 0.1)' : type === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(184, 134, 11, 0.1)',
        color: type === 'success' ? '#4caf50' : type === 'warning' ? '#ffc107' : '#DAA520',
        border: `1px solid ${type === 'success' ? 'rgba(76, 175, 80, 0.2)' : type === 'warning' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`,
    }),
    // Section Title
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(90deg, #FFD700, #FFE566, #FFD700)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    // Stats
    statCard: {
        background: 'linear-gradient(145deg, rgba(184, 134, 11, 0.08) 0%, rgba(184, 134, 11, 0.02) 100%)',
        border: '1px solid rgba(184, 134, 11, 0.15)',
        borderRadius: '16px',
        padding: '1.5rem',
        textAlign: 'center',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: '800',
        background: 'linear-gradient(90deg, #FFD700, #FFE566)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    statLabel: {
        color: '#888',
        fontSize: '0.85rem',
        marginTop: '0.5rem',
    },
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Save Drafts to LocalStorage
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

    // SAVE SETTINGS TO DB
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

    // Fetch Gemini Models
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

    // Generate AI Posts
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

    // Canvas Lock Generation
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

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #080808 0%, #0a0a0f 50%, #080808 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}>
                <div style={{
                    ...styles.card,
                    maxWidth: '420px',
                    width: '100%',
                    padding: '3rem',
                    textAlign: 'center',
                }}>
                    <div style={styles.cardGlow} />
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFE566 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        fontSize: '2.5rem',
                        boxShadow: '0 8px 32px rgba(184, 134, 11, 0.4)',
                    }}>
                        💎
                    </div>
                    <h1 style={{
                        ...styles.sectionTitle,
                        justifyContent: 'center',
                        marginBottom: '0.5rem',
                    }}>{t.adminTitle}</h1>
                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        {lang === 'ar' ? 'أدخل كلمة المرور للوصول' : 'Enter password to access'}
                    </p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordPlaceholder}
                            style={{
                                ...styles.input,
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                                fontSize: '1.1rem',
                            }}
                        />
                        {error && (
                            <p style={{
                                color: '#ef4444',
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                            }}>{error}</p>
                        )}
                        <button type="submit" style={{ ...styles.primaryButton, width: '100%' }}>
                            {t.login}
                        </button>
                    </form>
                </div>
            </div>
        );
    }


    // Navigation Items
    const navItems = [
        { id: 'publish', icon: <UploadIcon />, label: lang === 'ar' ? 'نشر توصية' : 'Publish Signal', smallIcon: <SignalIcon /> },
        { id: 'signals', icon: <SignalIcon />, label: lang === 'ar' ? 'التوصيات' : 'Signals', count: signals.length, smallIcon: <SignalIcon /> },
        { id: 'vip', icon: <CrownIcon />, label: lang === 'ar' ? 'إدارة VIP' : 'VIP Management', count: users.filter(u => u.isVip).length, smallIcon: <CrownIcon /> },
        { id: 'settings', icon: <SettingsIcon />, label: lang === 'ar' ? 'الإعدادات' : 'Settings', smallIcon: <SettingsIcon /> },
    ];

    const vipUsers = users.filter(u => u.isVip);

    return (
        <div style={styles.pageWrapper} onPaste={handlePaste}>
            {/* Sidebar */}
            <aside style={{
                ...styles.sidebar,
                [isRTL ? 'right' : 'left']: 0,
                transform: mobileMenuOpen ? 'translateX(0)' : undefined,
            }} className="admin-sidebar">
                {/* Logo */}
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>💎</div>
                    <div>
                        <div style={styles.logoText}>{lang === 'ar' ? 'أبو الذهب' : 'Abu Al-Dahab'}</div>
                        <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                            style={styles.navItem(activeTab === item.id)}
                            onMouseEnter={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'rgba(184, 134, 11, 0.05)';
                                    e.currentTarget.style.color = '#DAA520';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#888';
                                }
                            }}
                        >
                            <span style={styles.navIcon(activeTab === item.id)}>{item.smallIcon}</span>
                            <span style={styles.navText}>{item.label}</span>
                            {item.count !== undefined && (
                                <span style={{
                                    marginLeft: 'auto',
                                    background: activeTab === item.id ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                    color: activeTab === item.id ? '#FFD700' : '#888',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                }}>{item.count}</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div style={{ borderTop: '1px solid rgba(184, 134, 11, 0.1)', paddingTop: '1.5rem' }}>
                    <button
                        onClick={toggleLang}
                        style={{
                            ...styles.secondaryButton,
                            width: '100%',
                            marginBottom: '0.75rem',
                            justifyContent: 'center',
                        }}
                    >
                        🌐 {t.langSwitch}
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            ...styles.dangerButton,
                            width: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        <LogoutIcon /> {t.logout}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="mobile-header" style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'rgba(8, 8, 8, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(184, 134, 11, 0.15)',
                zIndex: 99,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
            }}>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#DAA520',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                    }}
                >
                    ☰
                </button>
                <div style={styles.logoText}>💎 {lang === 'ar' ? 'لوحة التحكم' : 'Admin'}</div>
                <button onClick={toggleLang} style={{ background: 'transparent', border: 'none', color: '#DAA520', cursor: 'pointer' }}>
                    🌐
                </button>
            </div>

            {/* Main Content */}
            <main style={{
                ...styles.mainContent,
                marginLeft: isRTL ? 0 : '280px',
                marginRight: isRTL ? '280px' : 0,
            }} className="admin-main">
                {/* Success/Error Messages */}
                {successMessage && (
                    <div style={{
                        position: 'fixed',
                        top: '2rem',
                        right: '2rem',
                        left: isRTL ? '2rem' : 'auto',
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9))',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                        animation: 'slideIn 0.3s ease',
                    }}>
                        ✓ {successMessage}
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'fixed',
                        top: '2rem',
                        right: '2rem',
                        left: isRTL ? '2rem' : 'auto',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
                    }}>
                        ✕ {error}
                        <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '1rem' }}>×</button>
                    </div>
                )}

                {/* PUBLISH TAB */}
                {activeTab === 'publish' && (
                    <div>
                        <h1 style={styles.sectionTitle}>
                            📤 {isEditing ? (lang === 'ar' ? 'تعديل المنشور' : 'Edit Signal') : t.postNewSignal}
                        </h1>

                        {isEditing && (
                            <div style={{
                                background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.1), transparent)',
                                border: '1px solid rgba(218, 165, 32, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem 1.5rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <span style={{ color: '#DAA520', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ✏️ {lang === 'ar' ? 'أنت في وضع التعديل' : 'You are in edit mode'}
                                </span>
                                <button onClick={handleCancelEdit} style={styles.dangerButton}>
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                            </div>
                        )}

                        <div style={styles.card}>
                            <div style={styles.cardGlow} />
                            
                            {/* Image Upload */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={styles.label}>
                                    📸 {lang === 'ar' ? 'صورة التوصية' : 'Signal Image'}
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                />
                                {!previewData ? (
                                    <label htmlFor="image-upload" style={styles.uploadZone}>
                                        <ImageIcon />
                                        <p style={{ color: '#888', marginTop: '1rem', fontSize: '1rem' }}>
                                            {lang === 'ar' ? 'اضغط لرفع صورة أو الصق من الحافظة' : 'Click to upload or paste from clipboard'}
                                        </p>
                                        <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                            PNG, JPG, WEBP
                                        </p>
                                    </label>
                                ) : (
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '2px solid rgba(184, 134, 11, 0.3)',
                                        display: 'inline-block',
                                    }}>
                                        <img src={previewData} alt="Preview" style={{ maxHeight: '300px', display: 'block' }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0,0,0,0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                        >
                                            <button onClick={cancelPreview} style={styles.dangerButton}>
                                                {lang === 'ar' ? 'تغيير الصورة' : 'Change Image'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Signal Type */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={styles.label}>
                                    📊 {lang === 'ar' ? 'نوع المنشور' : 'Post Type'}
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setSignalType('vip')} style={styles.typeButton(signalType === 'vip')}>
                                        💎 VIP
                                    </button>
                                    <button onClick={() => setSignalType('free')} style={styles.typeButton(signalType === 'free')}>
                                        🎁 {lang === 'ar' ? 'مجاني' : 'Free'}
                                    </button>
                                    <button onClick={() => setSignalType('regular')} style={styles.typeButton(signalType === 'regular')}>
                                        📝 {lang === 'ar' ? 'عادي' : 'Regular'}
                                    </button>
                                </div>
                            </div>

                            {/* Post Text */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={styles.label}>
                                    ✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}
                                </label>
                                <textarea
                                    value={customPost}
                                    onChange={(e) => setCustomPost(e.target.value)}
                                    placeholder={lang === 'ar' ? 'اكتب المنشور هنا...' : 'Write your post here...'}
                                    style={styles.textarea}
                                />
                            </div>

                            {/* AI Generation */}
                            <div style={{
                                background: 'rgba(102, 126, 234, 0.05)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <SparkleIcon />
                                    <span style={{ color: '#a78bfa', fontWeight: '600' }}>
                                        {lang === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'AI Generation'}
                                    </span>
                                </div>
                                <button
                                    onClick={generateAIPosts}
                                    disabled={generatingPosts || !customPost.trim()}
                                    style={{
                                        ...styles.primaryButton,
                                        background: generatingPosts ? '#333' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                        opacity: !customPost.trim() ? 0.5 : 1,
                                        width: '100%',
                                    }}
                                >
                                    {generatingPosts 
                                        ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...') 
                                        : (lang === 'ar' ? `🚀 توليد ${postCount} نسخة` : `🚀 Generate ${postCount} Variations`)}
                                </button>

                                {generatedPosts.length > 0 && (
                                    <div style={{
                                        marginTop: '1.5rem',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        display: 'grid',
                                        gap: '0.75rem',
                                    }}>
                                        {generatedPosts.map((post, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedPostIndex(idx)}
                                                style={{
                                                    padding: '1rem',
                                                    background: selectedPostIndex === idx ? 'rgba(184, 134, 11, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                                                    border: `2px solid ${selectedPostIndex === idx ? '#DAA520' : 'transparent'}`,
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                <p style={{ color: '#e0e0e0', fontSize: '0.9rem', margin: 0 }}>{post}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Telegram Options */}
                            <div style={{
                                background: 'rgba(34, 158, 217, 0.05)',
                                border: '1px solid rgba(34, 158, 217, 0.2)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                            }}>
                                <div
                                    onClick={() => setPostToTelegram(!postToTelegram)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        marginBottom: postToTelegram ? '1.5rem' : 0,
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        border: `2px solid ${postToTelegram ? '#229ED9' : '#555'}`,
                                        background: postToTelegram ? '#229ED9' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        {postToTelegram && <span style={{ color: '#fff', fontSize: '14px' }}>✓</span>}
                                    </div>
                                    <TelegramIcon />
                                    <span style={{ color: '#229ED9', fontWeight: '600' }}>{t.postToTelegram}</span>
                                </div>

                                {postToTelegram && (
                                    <div>
                                        <label style={{ ...styles.label, color: '#229ED9' }}>
                                            🔘 {lang === 'ar' ? 'زر التفاعل' : 'Action Button'}
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                            {[
                                                { id: 'view_signal', label: lang === 'ar' ? '💎 إظهار التوصية' : '💎 Show Signal' },
                                                { id: 'subscribe', label: lang === 'ar' ? '🔥 اشترك الآن' : '🔥 Subscribe' },
                                                { id: 'share', label: lang === 'ar' ? '📤 مشاركة' : '📤 Share' },
                                                { id: 'none', label: lang === 'ar' ? '🚫 بدون' : '🚫 None' },
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => setTelegramButtonType(btn.id)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: telegramButtonType === btn.id ? '#229ED9' : 'rgba(0, 0, 0, 0.3)',
                                                        border: `1px solid ${telegramButtonType === btn.id ? '#229ED9' : 'rgba(34, 158, 217, 0.2)'}`,
                                                        borderRadius: '10px',
                                                        color: '#fff',
                                                        fontWeight: telegramButtonType === btn.id ? '600' : '400',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                    }}
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
                                    style={{
                                        ...styles.primaryButton,
                                        width: '100%',
                                        padding: '1.25rem',
                                        fontSize: '1.1rem',
                                        opacity: uploading ? 0.7 : 1,
                                    }}
                                >
                                    {uploading
                                        ? (lang === 'ar' ? (isEditing ? 'جاري التحديث...' : 'جاري النشر...') : (isEditing ? 'Updating...' : 'Publishing...'))
                                        : (lang === 'ar' ? (isEditing ? '🔄 تحديث المنشور' : '🚀 نشر التوصية') : (isEditing ? '🔄 Update Signal' : '🚀 Publish Signal'))}
                                </button>
                            )}
                        </div>
                    </div>
                )}


                {/* SIGNALS TAB */}
                {activeTab === 'signals' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h1 style={styles.sectionTitle}>
                                📊 {t.publishedSignals}
                            </h1>
                            <span style={styles.badge('default')}>{signals.length} {lang === 'ar' ? 'توصية' : 'signals'}</span>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                <p style={{ color: '#888' }}>{t.loading}</p>
                            </div>
                        ) : signals.length === 0 ? (
                            <div style={{ ...styles.card, textAlign: 'center', padding: '4rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                                <p style={{ color: '#888', fontSize: '1.1rem' }}>
                                    {lang === 'ar' ? 'لا توجد توصيات بعد' : 'No signals yet'}
                                </p>
                                <button
                                    onClick={() => setActiveTab('publish')}
                                    style={{ ...styles.primaryButton, marginTop: '1.5rem' }}
                                >
                                    {lang === 'ar' ? 'نشر أول توصية' : 'Publish First Signal'}
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '1.5rem',
                            }}>
                                {signals.map((signal) => (
                                    <div key={signal._id} style={styles.signalCard}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={signal.imageUrl}
                                                alt="Signal"
                                                style={{ width: '100%', height: 'auto', display: 'block' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
                                                display: 'flex',
                                                gap: '0.5rem',
                                            }}>
                                                {signal.isVip && (
                                                    <span style={styles.badge('default')}>💎 VIP</span>
                                                )}
                                                {signal.type === 'REGULAR' && (
                                                    <span style={styles.badge('warning')}>📝 Regular</span>
                                                )}
                                            </div>
                                        </div>
                                        {signal.customPost && (
                                            <div style={{
                                                padding: '1.25rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderTop: '1px solid rgba(184, 134, 11, 0.1)',
                                            }}>
                                                <p style={{
                                                    color: '#e0e0e0',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.6',
                                                    margin: 0,
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                    {signal.customPost.replace(/\*/g, '')}
                                                </p>
                                                <div style={{
                                                    marginTop: '1rem',
                                                    color: '#666',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}>
                                                    🕐 {getTimeAgo(signal.createdAt, lang)}
                                                </div>
                                            </div>
                                        )}
                                        <div style={{
                                            padding: '1rem 1.25rem',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '0.75rem',
                                        }}>
                                            <button
                                                onClick={() => handleEdit(signal)}
                                                style={styles.secondaryButton}
                                            >
                                                <EditIcon /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                                            </button>
                                            <button
                                                onClick={() => deleteSignal(signal._id)}
                                                style={styles.dangerButton}
                                            >
                                                <TrashIcon /> {t.delete}
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
                    <div>
                        <h1 style={styles.sectionTitle}>
                            👑 {t.manageVip}
                        </h1>

                        {/* Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem',
                        }}>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{vipUsers.length}</div>
                                <div style={styles.statLabel}>{lang === 'ar' ? 'أعضاء VIP' : 'VIP Members'}</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{vipUsers.filter(u => !u.subscriptionEndDate).length}</div>
                                <div style={styles.statLabel}>{lang === 'ar' ? 'مدى الحياة' : 'Lifetime'}</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{users.length}</div>
                                <div style={styles.statLabel}>{lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</div>
                            </div>
                        </div>

                        {/* Add VIP Form */}
                        <div style={styles.card}>
                            <div style={styles.cardGlow} />
                            <h3 style={{ color: '#DAA520', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                ➕ {t.addNewVip}
                            </h3>
                            <form onSubmit={handleGrantVip}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                }}>
                                    <div>
                                        <label style={styles.label}>{t.telegramIdPlaceholder}</label>
                                        <input
                                            type="text"
                                            value={telegramId}
                                            onChange={(e) => setTelegramId(e.target.value)}
                                            placeholder="e.g. 123456789"
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={styles.label}>{t.durationMonths || 'Duration (Months)'}</label>
                                        <input
                                            type="number"
                                            value={durationMonths}
                                            onChange={(e) => setDurationMonths(e.target.value)}
                                            placeholder="1, 3, 12..."
                                            disabled={isLifetime}
                                            style={{
                                                ...styles.input,
                                                opacity: isLifetime ? 0.5 : 1,
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1rem 1.25rem',
                                            background: isLifetime ? 'rgba(184, 134, 11, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                                            border: `1px solid ${isLifetime ? 'rgba(184, 134, 11, 0.3)' : 'rgba(184, 134, 11, 0.15)'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            width: '100%',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={isLifetime}
                                                onChange={(e) => setIsLifetime(e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#DAA520' }}
                                            />
                                            <span style={{ color: isLifetime ? '#DAA520' : '#888' }}>
                                                ♾️ {t.lifetime || 'Lifetime'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" style={styles.primaryButton} disabled={vipLoading}>
                                    {vipLoading ? '...' : t.grantVip}
                                </button>
                            </form>
                            {vipMessage.text && (
                                <p style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    background: vipMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: vipMessage.type === 'success' ? '#4caf50' : '#ef4444',
                                }}>
                                    {vipMessage.text}
                                </p>
                            )}
                        </div>

                        {/* VIP Users Table */}
                        <div style={{ ...styles.card, marginTop: '1.5rem', padding: '0', overflow: 'hidden' }}>
                            <div style={styles.cardGlow} />
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(184, 134, 11, 0.1)' }}>
                                <h3 style={{ color: '#DAA520', margin: 0 }}>
                                    👥 {lang === 'ar' ? 'الأعضاء النشطين' : 'Active Members'}
                                </h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={{ ...styles.tableCell, textAlign: isRTL ? 'right' : 'left' }}>Telegram ID</th>
                                            <th style={{ ...styles.tableCell, textAlign: 'center' }}>{t.status || 'Status'}</th>
                                            <th style={{ ...styles.tableCell, textAlign: 'center' }}>{t.expiresIn || 'Expires'}</th>
                                            <th style={{ ...styles.tableCell, textAlign: 'center' }}>{t.actions || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vipUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ ...styles.tableCell, textAlign: 'center', padding: '3rem', color: '#666' }}>
                                                    {t.noVipMembers || 'No active VIP members'}
                                                </td>
                                            </tr>
                                        ) : (
                                            vipUsers.map(user => {
                                                const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                                                const now = new Date();
                                                const isExpired = expiry && now > expiry;
                                                if (isExpired) return null;

                                                let timeLeft = '♾️ Lifetime';
                                                if (expiry) {
                                                    const diff = expiry - now;
                                                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                    timeLeft = `${days} ${lang === 'ar' ? 'يوم' : 'days'}`;
                                                }

                                                return (
                                                    <tr key={user._id} style={styles.tableRow}>
                                                        <td style={{ ...styles.tableCell, fontFamily: 'monospace', color: '#fff' }}>
                                                            {user.telegramId}
                                                        </td>
                                                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                                                            <span style={styles.badge('success')}>
                                                                ✓ Active
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.tableCell, textAlign: 'center', color: '#DAA520' }}>
                                                            {timeLeft}
                                                        </td>
                                                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleRemoveUser(user.telegramId)}
                                                                style={styles.dangerButton}
                                                            >
                                                                <TrashIcon /> {t.remove || 'Remove'}
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

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div>
                        <h1 style={styles.sectionTitle}>
                            ⚙️ {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                        </h1>

                        <div style={styles.card}>
                            <div style={styles.cardGlow} />
                            <h3 style={{ color: '#a78bfa', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <SparkleIcon /> {lang === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings (Gemini)'}
                            </h3>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {/* API Key */}
                                <div>
                                    <label style={styles.label}>🔑 Gemini API Key</label>
                                    <input
                                        type="password"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Enter your API key..."
                                        style={styles.input}
                                    />
                                </div>

                                {/* Model Selection */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={styles.label}>🧠 {lang === 'ar' ? 'النموذج' : 'Model'}</label>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                            {availableModels.map(m => (
                                                <option key={m.id} value={m.id}>{m.displayName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={fetchModels}
                                        disabled={modelsLoading || !geminiApiKey}
                                        style={{
                                            ...styles.secondaryButton,
                                            opacity: !geminiApiKey ? 0.5 : 1,
                                        }}
                                    >
                                        {modelsLoading ? '...' : '🔄'}
                                    </button>
                                </div>

                                {/* Post Count */}
                                <div>
                                    <label style={styles.label}>🔢 {lang === 'ar' ? 'عدد المنشورات المولدة' : 'Generated Posts Count'}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={postCount}
                                        onChange={(e) => setPostCount(Number(e.target.value))}
                                        style={{ ...styles.input, maxWidth: '150px' }}
                                    />
                                </div>

                                {/* Prompt */}
                                <div>
                                    <label style={styles.label}>📝 {lang === 'ar' ? 'الأمر (Prompt)' : 'Custom Prompt'}</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={lang === 'ar' ? 'أدخل الأمر المخصص...' : 'Enter custom prompt...'}
                                        style={styles.textarea}
                                    />
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={() => saveSettingsToDB(null, true)}
                                    disabled={savingSettings}
                                    style={{
                                        ...styles.primaryButton,
                                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                        maxWidth: '200px',
                                    }}
                                >
                                    {savingSettings 
                                        ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                                        : (lang === 'ar' ? '💾 حفظ الإعدادات' : '💾 Save Settings')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 99,
                    }}
                />
            )}

            {/* Responsive Styles */}
            <style jsx global>{`
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        transform: translateX(${isRTL ? '100%' : '-100%'});
                        width: 280px !important;
                    }
                    .admin-sidebar.open {
                        transform: translateX(0) !important;
                    }
                    .admin-main {
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                        padding: 80px 1.5rem 2rem !important;
                    }
                    .mobile-header {
                        display: flex !important;
                    }
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
