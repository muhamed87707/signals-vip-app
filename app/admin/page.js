'use client';

import { useState, useEffect, useRef } from 'react';
import { translations } from '../utils/translations';

export default function AdminPage() {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Language state
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    // Active tab state
    const [activeTab, setActiveTab] = useState('signals');

    // Signal management state
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [customPost, setCustomPost] = useState('');
    const [signalType, setSignalType] = useState('vip');
    const [postToTelegram, setPostToTelegram] = useState(true);
    const [telegramButtonType, setTelegramButtonType] = useState('view_signal');

    // AI settings state
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [postCount, setPostCount] = useState(3);
    const [aiPrompt, setAiPrompt] = useState('Generate 3 variations of this trading signal post.');
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState([]);
    const [selectedPostIndex, setSelectedPostIndex] = useState(-1);
    const [generatingPosts, setGeneratingPosts] = useState(false);

    // VIP management state
    const [users, setUsers] = useState([]);
    const [telegramId, setTelegramId] = useState('');
    const [durationMonths, setDurationMonths] = useState('1');
    const [isLifetime, setIsLifetime] = useState(false);
    const [vipLoading, setVipLoading] = useState(false);
    const [vipMessage, setVipMessage] = useState({ text: '', type: '' });

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingSignal, setEditingSignal] = useState(null);

    // Refs
    const fileInputRef = useRef(null);

    // Messages state
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    // Load settings and data on mount
    useEffect(() => {
        const savedAuth = localStorage.getItem('adminAuth');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
            loadSignals();
            loadUsers();
            loadSettings();
        }

        const savedLang = localStorage.getItem('language') || 'en';
        setLang(savedLang);
    }, []);

    // Authentication functions
    const handleLogin = async (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            setLoginError('');
            loadSignals();
            loadUsers();
            loadSettings();
        } else {
            setLoginError(t.invalidPassword || 'Invalid password');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setPassword('');
    };

    // Data loading functions
    const loadSignals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/signals?admin=true');
            const data = await res.json();
            setSignals(data.signals || []);
        } catch (err) {
            console.error('Error loading signals:', err);
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setGeminiApiKey(data.settings.geminiApiKey || '');
                setSelectedModel(data.settings.selectedModel || 'gemini-2.0-flash');
                setPostCount(data.settings.generatedPostCount || 3);
                setAiPrompt(data.settings.aiPrompt || 'Generate 3 variations of this trading signal post.');
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };
    // Image handling functions
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setPreviewData({ type: 'image', content: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImage(e.target.result);
                    setPreviewData({ type: 'image', content: e.target.result });
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    // Signal posting function
    const handlePostSignal = async () => {
        if (!selectedImage) {
            setError(t.selectImageFirst || 'Please select an image first');
            return;
        }

        setUploading(true);
        setError('');
        setSuccessMessage('');

        try {
            const payload = {
                pair: 'GOLD',
                type: signalType === 'vip' ? 'SIGNAL' : 'REGULAR',
                imageUrl: selectedImage,
                telegramImage: selectedImage,
                sendToTelegram: postToTelegram,
                isVip: signalType === 'vip',
                customPost: customPost || null,
                telegramButtonType: telegramButtonType
            };

            const res = await fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage(t.postSuccess || 'Signal posted successfully!');
                loadSignals();
                // Clear form
                setSelectedImage(null);
                setPreviewData(null);
                setCustomPost('');
                setGeneratedPosts([]);
                setSelectedPostIndex(-1);
            } else {
                setError(data.error || t.postError || 'Failed to post signal');
            }
        } catch (err) {
            setError(t.postError || 'Failed to post signal');
        }
        setUploading(false);
    };
    // VIP management functions
    const handleVipAction = async (action) => {
        if (!telegramId.trim()) {
            setVipMessage({ text: 'Please enter Telegram ID', type: 'error' });
            return;
        }

        setVipLoading(true);
        try {
            const payload = {
                telegramId: telegramId.trim(),
                isVip: action === 'add',
                durationMonths: isLifetime ? null : parseInt(durationMonths),
                isLifetime: isLifetime,
                removeUser: action === 'remove'
            };

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setVipMessage({ 
                    text: action === 'add' ? 'VIP access granted!' : 'User removed successfully!', 
                    type: 'success' 
                });
                loadUsers();
                setTelegramId('');
            } else {
                setVipMessage({ text: data.error || 'Operation failed', type: 'error' });
            }
        } catch (err) {
            setVipMessage({ text: 'Operation failed', type: 'error' });
        }
        setVipLoading(false);
    };

    // Delete signal function
    const handleDeleteSignal = async (id) => {
        if (!confirm(t.deleteConfirm || 'Are you sure you want to delete this signal?')) return;
        
        try {
            const res = await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                loadSignals();
                setSuccessMessage(t.deleteSuccess || 'Signal deleted successfully!');
            }
        } catch (err) {
            setError(t.deleteError || 'Failed to delete signal');
        }
    };

    // Language toggle
    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        localStorage.setItem('language', newLang);
    };
    // Login screen
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background effects */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'pulse 8s ease-in-out infinite'
                }}></div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(184, 134, 11, 0.2)',
                    borderRadius: '30px',
                    padding: '3rem',
                    maxWidth: '450px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💎</div>
                        <h1 className="text-gradient" style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            marginBottom: '0.5rem'
                        }}>
                            {t.adminTitle || 'Admin Panel'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {t.adminSubtitle || 'Enter password to login'}
                        </p>
                    </div>

                    {/* Login form */}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder || 'Password'}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '2px solid rgba(184, 134, 11, 0.2)',
                                    borderRadius: '15px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--gold-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(184, 134, 11, 0.2)'}
                            />
                        </div>

                        {loginError && (
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                borderRadius: '10px',
                                color: '#ff4444',
                                fontSize: '0.9rem',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: '700'
                            }}
                        >
                            {t.login || 'Login'} 🔐
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    // Main admin interface
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background effects */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(218, 165, 32, 0.08) 0%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'pulse 10s ease-in-out infinite reverse'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <header style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(184, 134, 11, 0.2)',
                    padding: '1.5rem 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem' }}>💎</div>
                            <h1 className="text-gradient" style={{
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                margin: 0
                            }}>
                                {t.signalsPanel || 'Signals Panel'}
                            </h1>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(184, 134, 11, 0.1)',
                                    border: '1px solid rgba(184, 134, 11, 0.3)',
                                    borderRadius: '10px',
                                    color: 'var(--gold-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                🌐 {lang === 'en' ? 'العربية' : 'English'}
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    border: '1px solid rgba(255, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#ff4444',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                {t.logout || 'Logout'} 🚪
                            </button>
                        </div>
                    </div>
                </header>
                {/* Navigation Tabs */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
                    padding: '0 2rem',
                    overflowX: 'auto'
                }}>
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto',
                        display: 'flex',
                        gap: '0.5rem',
                        minWidth: 'max-content'
                    }}>
                        {[
                            { id: 'signals', label: t.signalsTab || 'Signals', icon: '📊' },
                            { id: 'vip', label: t.vipTab || 'VIP Management', icon: '👑' },
                            { id: 'settings', label: t.settingsTab || 'AI Settings', icon: '⚙️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    background: activeTab === tab.id 
                                        ? 'linear-gradient(135deg, rgba(184, 134, 11, 0.2) 0%, rgba(218, 165, 32, 0.1) 100%)'
                                        : 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id 
                                        ? '3px solid var(--gold-primary)' 
                                        : '3px solid transparent',
                                    color: activeTab === tab.id ? 'var(--gold-primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    whiteSpace: 'nowrap',
                                    minWidth: 'max-content'
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '2rem'
                }}>
                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(74, 222, 128, 0.1)',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                            borderRadius: '15px',
                            color: '#4ade80',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            ✅ {successMessage}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '15px',
                            color: '#ff4444',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            ❌ {error}
                        </div>
                    )}
                    {/* Signals Tab */}
                    {activeTab === 'signals' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Post New Signal Card */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    📤 {t.postNewSignal || 'Post New Signal'}
                                </h2>

                                {/* Image Upload Area */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onPaste={handlePaste}
                                    style={{
                                        border: '2px dashed rgba(184, 134, 11, 0.3)',
                                        borderRadius: '20px',
                                        padding: '3rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        marginBottom: '2rem',
                                        background: selectedImage 
                                            ? 'rgba(184, 134, 11, 0.05)' 
                                            : 'rgba(255, 255, 255, 0.02)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {selectedImage ? (
                                        <div>
                                            <img
                                                src={selectedImage}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '300px',
                                                    borderRadius: '15px',
                                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                                                }}
                                            />
                                            <p style={{
                                                color: 'var(--gold-primary)',
                                                marginTop: '1rem',
                                                fontWeight: '600'
                                            }}>
                                                ✅ Image selected - Click to change
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '1.1rem',
                                                fontWeight: '600'
                                            }}>
                                                {t.dragDropText || 'Click to upload or paste image (Ctrl+V)'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                {/* Signal Options */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.5rem',
                                    marginBottom: '2rem'
                                }}>
                                    {/* Signal Type */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📊 Signal Type
                                        </label>
                                        <select
                                            value={signalType}
                                            onChange={(e) => setSignalType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <option value="vip">👑 VIP Signal</option>
                                            <option value="free">🎁 Free Signal</option>
                                        </select>
                                    </div>

                                    {/* Telegram Button */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🔘 Telegram Button
                                        </label>
                                        <select
                                            value={telegramButtonType}
                                            onChange={(e) => setTelegramButtonType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <option value="view_signal">💎 View Signal</option>
                                            <option value="subscribe">🔥 Subscribe</option>
                                            <option value="share">📤 Share</option>
                                            <option value="none">❌ No Button</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Custom Post Text */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: 'var(--gold-primary)',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem'
                                    }}>
                                        ✍️ Custom Post Text (Optional)
                                    </label>
                                    <textarea
                                        value={customPost}
                                        onChange={(e) => setCustomPost(e.target.value)}
                                        placeholder="Enter custom text for the post..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(184, 134, 11, 0.3)',
                                            borderRadius: '15px',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                                {/* Post Options */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    marginBottom: '2rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        color: 'var(--text-primary)',
                                        fontWeight: '600'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={postToTelegram}
                                            onChange={(e) => setPostToTelegram(e.target.checked)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                accentColor: 'var(--gold-primary)'
                                            }}
                                        />
                                        📱 Post to Telegram
                                    </label>
                                </div>

                                {/* Post Button */}
                                <button
                                    onClick={handlePostSignal}
                                    disabled={uploading || !selectedImage}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        opacity: uploading || !selectedImage ? 0.6 : 1,
                                        cursor: uploading || !selectedImage ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {uploading ? (
                                        <>🔄 Posting...</>
                                    ) : (
                                        <>🚀 {t.postSignal || 'Post Signal'}</>
                                    )}
                                </button>
                            </div>

                            {/* Recent Signals */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    📋 Recent Signals ({signals.length})
                                </h2>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                        <p style={{ color: 'var(--text-secondary)' }}>Loading signals...</p>
                                    </div>
                                ) : signals.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                                        <p style={{ color: 'var(--text-secondary)' }}>No signals posted yet</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {signals.map((signal, index) => (
                                            <div
                                                key={signal._id || index}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(184, 134, 11, 0.2)',
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Signal Badge */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    background: signal.isVip 
                                                        ? 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)'
                                                        : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                    color: signal.isVip ? '#1a1a1a' : 'white',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '15px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    zIndex: 2
                                                }}>
                                                    {signal.isVip ? '👑 VIP' : '🎁 FREE'}
                                                </div>

                                                {/* Signal Image */}
                                                <img
                                                    src={signal.imageUrl}
                                                    alt="Signal"
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                />

                                                {/* Signal Info */}
                                                <div style={{ padding: '1rem' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        <span style={{
                                                            color: 'var(--text-secondary)',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {new Date(signal.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <button
                                                            onClick={() => handleDeleteSignal(signal._id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem',
                                                                background: 'rgba(255, 68, 68, 0.1)',
                                                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                                                borderRadius: '10px',
                                                                color: '#ff4444',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIP Management Tab */}
                    {activeTab === 'vip' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Add/Remove VIP Card */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    👑 {t.manageVip || 'Manage VIP Access'}
                                </h2>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '2rem',
                                    fontSize: '0.95rem'
                                }}>
                                    {t.manageVipSubtitle || 'Grant or revoke VIP status by Telegram ID'}
                                </p>

                                {/* VIP Action Form */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.5rem',
                                    marginBottom: '2rem'
                                }}>
                                    {/* Telegram ID Input */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📱 Telegram ID
                                        </label>
                                        <input
                                            type="text"
                                            value={telegramId}
                                            onChange={(e) => setTelegramId(e.target.value)}
                                            placeholder={t.telegramIdPlaceholder || 'Enter Telegram ID'}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Duration Selection */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            ⏰ Duration
                                        </label>
                                        <select
                                            value={isLifetime ? 'lifetime' : durationMonths}
                                            onChange={(e) => {
                                                if (e.target.value === 'lifetime') {
                                                    setIsLifetime(true);
                                                } else {
                                                    setIsLifetime(false);
                                                    setDurationMonths(e.target.value);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <option value="1">1 Month</option>
                                            <option value="3">3 Months</option>
                                            <option value="6">6 Months</option>
                                            <option value="12">12 Months</option>
                                            <option value="lifetime">♾️ Lifetime</option>
                                        </select>
                                    </div>
                                </div>

                                {/* VIP Message */}
                                {vipMessage.text && (
                                    <div style={{
                                        padding: '1rem',
                                        background: vipMessage.type === 'success' 
                                            ? 'rgba(74, 222, 128, 0.1)' 
                                            : 'rgba(255, 68, 68, 0.1)',
                                        border: `1px solid ${vipMessage.type === 'success' 
                                            ? 'rgba(74, 222, 128, 0.3)' 
                                            : 'rgba(255, 68, 68, 0.3)'}`,
                                        borderRadius: '15px',
                                        color: vipMessage.type === 'success' ? '#4ade80' : '#ff4444',
                                        marginBottom: '2rem',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        {vipMessage.type === 'success' ? '✅' : '❌'} {vipMessage.text}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => handleVipAction('add')}
                                        disabled={vipLoading}
                                        className="btn-primary"
                                        style={{
                                            flex: 1,
                                            minWidth: '200px',
                                            padding: '1rem',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            opacity: vipLoading ? 0.6 : 1
                                        }}
                                    >
                                        {vipLoading ? '⏳ Processing...' : '👑 Grant VIP Access'}
                                    </button>
                                    <button
                                        onClick={() => handleVipAction('remove')}
                                        disabled={vipLoading}
                                        style={{
                                            flex: 1,
                                            minWidth: '200px',
                                            padding: '1rem',
                                            background: 'rgba(255, 68, 68, 0.1)',
                                            border: '2px solid rgba(255, 68, 68, 0.3)',
                                            borderRadius: '15px',
                                            color: '#ff4444',
                                            cursor: vipLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            opacity: vipLoading ? 0.6 : 1,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {vipLoading ? '⏳ Processing...' : '🗑️ Remove User'}
                                    </button>
                                </div>
                            </div>

                            {/* VIP Users List */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    👥 VIP Users ({users.filter(u => u.isVip).length})
                                </h2>

                                {users.filter(u => u.isVip).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
                                        <p style={{ color: 'var(--text-secondary)' }}>No VIP users yet</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {users.filter(u => u.isVip).map((user, index) => (
                                            <div
                                                key={user.telegramId || index}
                                                style={{
                                                    background: 'rgba(184, 134, 11, 0.05)',
                                                    border: '1px solid rgba(184, 134, 11, 0.2)',
                                                    borderRadius: '20px',
                                                    padding: '1.5rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: 'var(--gradient-gold-metallic)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5rem',
                                                        color: '#1a1a1a',
                                                        fontWeight: '800'
                                                    }}>
                                                        👑
                                                    </div>
                                                    <div>
                                                        <h3 style={{
                                                            color: 'var(--gold-primary)',
                                                            fontSize: '1.1rem',
                                                            fontWeight: '700',
                                                            marginBottom: '0.25rem'
                                                        }}>
                                                            {user.firstName} {user.lastName}
                                                        </h3>
                                                        <p style={{
                                                            color: 'var(--text-secondary)',
                                                            fontSize: '0.85rem',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            ID: {user.telegramId}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '1rem',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <div>
                                                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                                                        <div style={{ color: 'var(--gold-primary)', fontWeight: '600' }}>
                                                            {user.isLifetime ? '♾️ Lifetime' : '👑 VIP'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-secondary)' }}>Expires:</span>
                                                        <div style={{ color: user.isLifetime ? 'var(--gold-primary)' : 'white', fontWeight: '600' }}>
                                                            {user.isLifetime 
                                                                ? 'Never' 
                                                                : user.subscriptionEndDate 
                                                                    ? new Date(user.subscriptionEndDate).toLocaleDateString()
                                                                    : 'Unknown'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Settings Tab */}
                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* AI Configuration Card */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    🤖 AI Configuration
                                </h2>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '2rem',
                                    fontSize: '0.95rem'
                                }}>
                                    Configure AI settings for automated post generation
                                </p>

                                {/* AI Settings Form */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '2rem'
                                }}>
                                    {/* Gemini API Key */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🔑 Gemini API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={geminiApiKey}
                                            onChange={(e) => setGeminiApiKey(e.target.value)}
                                            placeholder="Enter your Gemini API key..."
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>

                                    {/* Model Selection */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            🧠 AI Model
                                        </label>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        </select>
                                    </div>

                                    {/* Post Count */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--gold-primary)',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📊 Generated Posts Count
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={postCount}
                                            onChange={(e) => setPostCount(parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* AI Prompt */}
                                <div style={{ marginTop: '2rem' }}>
                                    <label style={{
                                        display: 'block',
                                        color: 'var(--gold-primary)',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem'
                                    }}>
                                        ✍️ AI Prompt Template
                                    </label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Enter the prompt template for AI post generation..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(184, 134, 11, 0.3)',
                                            borderRadius: '15px',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* Save Settings Button */}
                                <button
                                    onClick={async () => {
                                        setSavingSettings(true);
                                        try {
                                            const res = await fetch('/api/settings', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    geminiApiKey,
                                                    selectedModel,
                                                    generatedPostCount: postCount,
                                                    aiPrompt
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setSuccessMessage('AI settings saved successfully! ✓');
                                            } else {
                                                setError('Failed to save settings');
                                            }
                                        } catch (err) {
                                            setError('Failed to save settings');
                                        }
                                        setSavingSettings(false);
                                    }}
                                    disabled={savingSettings}
                                    className="btn-primary"
                                    style={{
                                        marginTop: '2rem',
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        opacity: savingSettings ? 0.6 : 1
                                    }}
                                >
                                    {savingSettings ? '⏳ Saving...' : '💾 Save AI Settings'}
                                </button>
                            </div>

                            {/* AI Post Generator */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(184, 134, 11, 0.2)',
                                borderRadius: '25px',
                                padding: '2rem',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--gold-primary)',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    ✨ AI Post Generator
                                </h2>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: '2rem',
                                    fontSize: '0.95rem'
                                }}>
                                    Generate multiple post variations using AI
                                </p>

                                {/* Generate Button */}
                                <button
                                    onClick={async () => {
                                        if (!selectedImage) {
                                            setError('Please select an image first');
                                            return;
                                        }
                                        setGeneratingPosts(true);
                                        try {
                                            const res = await fetch('/api/ai/generate-posts', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    imageUrl: selectedImage,
                                                    prompt: aiPrompt,
                                                    count: postCount
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setGeneratedPosts(data.posts);
                                                setSuccessMessage(`Generated ${data.posts.length} post variations! ✓`);
                                            } else {
                                                setError('Failed to generate posts');
                                            }
                                        } catch (err) {
                                            setError('Failed to generate posts');
                                        }
                                        setGeneratingPosts(false);
                                    }}
                                    disabled={generatingPosts || !selectedImage}
                                    className="btn-primary"
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        opacity: generatingPosts || !selectedImage ? 0.6 : 1,
                                        marginBottom: '2rem'
                                    }}
                                >
                                    {generatingPosts ? '🤖 Generating...' : '✨ Generate AI Posts'}
                                </button>

                                {/* Generated Posts */}
                                {generatedPosts.length > 0 && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {generatedPosts.map((post, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: selectedPostIndex === index 
                                                        ? 'rgba(184, 134, 11, 0.1)' 
                                                        : 'rgba(255, 255, 255, 0.05)',
                                                    border: selectedPostIndex === index 
                                                        ? '2px solid var(--gold-primary)' 
                                                        : '1px solid rgba(184, 134, 11, 0.2)',
                                                    borderRadius: '15px',
                                                    padding: '1.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => {
                                                    setSelectedPostIndex(index);
                                                    setCustomPost(post);
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <h3 style={{
                                                        color: 'var(--gold-primary)',
                                                        fontSize: '1rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        Variation {index + 1}
                                                    </h3>
                                                    {selectedPostIndex === index && (
                                                        <span style={{
                                                            background: 'var(--gold-primary)',
                                                            color: '#1a1a1a',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '15px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700'
                                                        }}>
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.6',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {post}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}