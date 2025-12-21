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
    const [aiPrompt, setAiPrompt] = useState('Generate 3 variations of this trading signal post. Keep the same meaning but vary the wording, tone, and structure. Make them engaging and professional for a trading audience. Each variation should be unique but maintain the core message.');
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
            setIsAuthenticated(true);
            localStorage.setItem('adminAuth', 'true');
            setLoginError('');
            loadSignals();
            loadUsers();
            loadSettings();
        } else {
            setLoginError(t.loginError);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuth');
        setPassword('');
    };

    // Data loading functions
    const loadSignals = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/signals');
            if (response.ok) {
                const data = await response.json();
                setSignals(data.signals || []);
            }
        } catch (error) {
            console.error('Error loading signals:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.settings) {
                    setGeminiApiKey(data.settings.geminiApiKey || '');
                    setSelectedModel(data.settings.selectedModel || 'gemini-2.0-flash');
                    setPostCount(data.settings.postCount || 3);
                    setAiPrompt(data.settings.aiPrompt || aiPrompt);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };
    // Settings functions
    const saveSettingsToDB = async (e = null, manual = false) => {
        if (e) e.preventDefault();
        setSavingSettings(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    geminiApiKey,
                    selectedModel,
                    postCount,
                    aiPrompt
                })
            });
            if (response.ok && manual) {
                // Show success feedback for manual saves
                const originalText = savingSettings;
                setSavingSettings(false);
                setTimeout(() => setSavingSettings(false), 2000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchModels = async () => {
        setModelsLoading(true);
        try {
            const response = await fetch('/api/admin/gemini-models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: geminiApiKey })
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableModels(data.models || []);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
        } finally {
            setModelsLoading(false);
        }
    };

    // Image handling functions
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewData(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    setSelectedImage(file);
                    const reader = new FileReader();
                    reader.onload = (e) => setPreviewData(e.target.result);
                    reader.readAsDataURL(file);
                    break;
                }
            }
        }
    };

    const cancelPreview = () => {
        setSelectedImage(null);
        setPreviewData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // AI functions
    const generateAIPosts = async () => {
        if (!customPost.trim()) return;
        setGeneratingPosts(true);
        try {
            const response = await fetch('/api/admin/generate-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalPost: customPost,
                    count: postCount,
                    model: selectedModel,
                    prompt: aiPrompt,
                    apiKey: geminiApiKey
                })
            });
            if (response.ok) {
                const data = await response.json();
                setGeneratedPosts(data.posts || []);
                setSelectedPostIndex(0);
            }
        } catch (error) {
            console.error('Error generating posts:', error);
        } finally {
            setGeneratingPosts(false);
        }
    };
    // Signal management functions
    const handlePublish = async () => {
        if (!selectedImage || !customPost.trim()) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            formData.append('customPost', selectedPostIndex >= 0 && generatedPosts[selectedPostIndex] ? generatedPosts[selectedPostIndex] : customPost);
            formData.append('signalType', signalType);
            formData.append('postToTelegram', postToTelegram);
            formData.append('telegramButtonType', telegramButtonType);

            const response = await fetch('/api/admin/signals', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                loadSignals();
                resetForm();
            }
        } catch (error) {
            console.error('Error publishing signal:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingSignal || !customPost.trim()) return;
        setUploading(true);
        try {
            const formData = new FormData();
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            formData.append('customPost', selectedPostIndex >= 0 && generatedPosts[selectedPostIndex] ? generatedPosts[selectedPostIndex] : customPost);
            formData.append('signalType', signalType);
            formData.append('postToTelegram', postToTelegram);
            formData.append('telegramButtonType', telegramButtonType);

            const response = await fetch(`/api/admin/signals/${editingSignal._id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                loadSignals();
                handleCancelEdit();
            }
        } catch (error) {
            console.error('Error updating signal:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (signal) => {
        setIsEditing(true);
        setEditingSignal(signal);
        setCustomPost(signal.customPost || '');
        setSignalType(signal.signalType || 'vip');
        setPreviewData(signal.imageUrl);
        setSelectedImage(null);
        setGeneratedPosts([]);
        setSelectedPostIndex(-1);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingSignal(null);
        resetForm();
    };

    const deleteSignal = async (id) => {
        if (!confirm(t.deleteConfirm)) return;
        try {
            const response = await fetch(`/api/admin/signals/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadSignals();
            }
        } catch (error) {
            console.error('Error deleting signal:', error);
        }
    };

    const resetForm = () => {
        setSelectedImage(null);
        setPreviewData(null);
        setCustomPost('');
        setSignalType('vip');
        setPostToTelegram(true);
        setTelegramButtonType('view_signal');
        setGeneratedPosts([]);
        setSelectedPostIndex(-1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    // VIP management functions
    const handleGrantVip = async (e) => {
        e.preventDefault();
        if (!telegramId.trim()) return;
        setVipLoading(true);
        try {
            const response = await fetch('/api/admin/grant-vip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: telegramId.trim(),
                    durationMonths: isLifetime ? null : parseInt(durationMonths),
                    isLifetime
                })
            });
            if (response.ok) {
                setVipMessage({ text: t.vipSuccess, type: 'success' });
                setTelegramId('');
                setDurationMonths('1');
                setIsLifetime(false);
                loadUsers();
            } else {
                setVipMessage({ text: t.vipError, type: 'error' });
            }
        } catch (error) {
            setVipMessage({ text: t.vipError, type: 'error' });
        } finally {
            setVipLoading(false);
            setTimeout(() => setVipMessage({ text: '', type: '' }), 3000);
        }
    };

    const handleRemoveUser = async (telegramId) => {
        if (!confirm(t.remove + '?')) return;
        try {
            const response = await fetch('/api/admin/remove-vip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId })
            });
            if (response.ok) {
                loadUsers();
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    // Utility functions
    const getTimeAgo = (dateString, lang) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return lang === 'ar' ? 'الآن' : 'now';
        if (diffInSeconds < 3600) return lang === 'ar' ? `${Math.floor(diffInSeconds / 60)} د` : `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return lang === 'ar' ? `${Math.floor(diffInSeconds / 3600)} س` : `${Math.floor(diffInSeconds / 3600)}h`;
        return lang === 'ar' ? `${Math.floor(diffInSeconds / 86400)} ي` : `${Math.floor(diffInSeconds / 86400)}d`;
    };
    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-3xl">👑</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">{t.adminTitle}</h1>
                            <p className="text-gray-400">{t.adminSubtitle}</p>
                        </div>
                        
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t.passwordPlaceholder}
                                    className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                    required
                                />
                            </div>
                            
                            {loginError && (
                                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    {loginError}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                className="w-full btn-primary py-3 text-lg font-bold"
                            >
                                {t.login}
                            </button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                            >
                                {t.langSwitch}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Main admin interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-black/50 backdrop-blur-xl border-b border-yellow-500/20 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl">👑</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gradient">{t.adminTitle}</h1>
                                <p className="text-gray-400 text-sm">{t.signalsPanel}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-all"
                            >
                                {t.langSwitch}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                            >
                                {t.logout}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Signal Creation Section */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        {t.postNewSignal}
                    </h2>

                    {/* Image Upload Section */}
                    <div className="mb-8">
                        <label className="block text-yellow-400 font-semibold mb-4 text-lg">
                            📸 {lang === 'ar' ? 'صورة التوصية' : 'Signal Image'}
                        </label>
                        
                        <div 
                            className="relative border-2 border-dashed border-gray-600 hover:border-yellow-500 rounded-2xl p-8 text-center transition-all cursor-pointer bg-gray-800/30"
                            onPaste={handlePaste}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            
                            {previewData ? (
                                <div className="relative">
                                    <img 
                                        src={previewData} 
                                        alt="Preview" 
                                        className="max-w-full max-h-96 mx-auto rounded-xl shadow-lg"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelPreview();
                                        }}
                                        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12">
                                    <div className="text-6xl mb-4">📷</div>
                                    <p className="text-gray-400 text-lg mb-2">{t.dragDropText}</p>
                                    <p className="text-yellow-400 font-semibold">{t.chooseImage}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Signal Type Selection */}
                    <div className="mb-8">
                        <label className="block text-yellow-400 font-semibold mb-4 text-lg">
                            🎯 {lang === 'ar' ? 'نوع التوصية' : 'Signal Type'}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'vip', label: '💎 VIP (Blurred)', desc: lang === 'ar' ? 'للأعضاء المميزين فقط' : 'For VIP members only' },
                                { id: 'free', label: '🎁 Free (Clear)', desc: lang === 'ar' ? 'مجاني للجميع' : 'Free for everyone' },
                                { id: 'regular', label: '📝 Regular Post', desc: lang === 'ar' ? 'منشور عادي' : 'Regular post' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSignalType(type.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                                        signalType === type.id
                                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                            : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="font-bold text-lg mb-1">{type.label}</div>
                                    <div className="text-sm opacity-75">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Post Text */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-yellow-400 font-semibold text-lg">
                                ✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}
                            </label>
                            {isEditing && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm"
                                >
                                    ✖ {lang === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit'}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={customPost}
                            onChange={(e) => setCustomPost(e.target.value)}
                            placeholder={lang === 'ar' ? 'اكتب المنشور هنا...' : 'Write post here...'}
                            className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all resize-vertical"
                        />
                    </div>
                    {/* AI Settings */}
                    <details className="mb-8 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <summary className="p-6 cursor-pointer text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors">
                            🤖 {lang === 'ar' ? 'إعدادات الذكاء الاصطناعي (Gemini)' : 'AI Settings (Gemini)'}
                        </summary>
                        <div className="px-6 pb-6 space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => saveSettingsToDB(null, true)}
                                    disabled={savingSettings}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all font-semibold"
                                >
                                    💾 {savingSettings ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">🔑 Gemini API Key</label>
                                <input
                                    type="password"
                                    value={geminiApiKey}
                                    onChange={(e) => setGeminiApiKey(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-2">🧠 Model</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all"
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
                                            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-xl transition-all"
                                        >
                                            {modelsLoading ? '...' : '🔄'}
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-300 font-semibold mb-2">🔢 {lang === 'ar' ? 'العدد' : 'Count'}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={postCount}
                                        onChange={(e) => setPostCount(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">📝 Prompt</label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all resize-vertical"
                                />
                            </div>
                        </div>
                    </details>
                    {/* Generate AI Posts Button */}
                    <div className="text-center mb-8">
                        <button
                            onClick={generateAIPosts}
                            disabled={generatingPosts || !customPost.trim()}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg disabled:opacity-50"
                        >
                            {generatingPosts ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating...') : (lang === 'ar' ? `🚀 توليد ${postCount} نسخة` : `🚀 Generate ${postCount} Variations`)}
                        </button>
                    </div>

                    {/* Generated Posts Gallery */}
                    {generatedPosts.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">🎨 Generated Variations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                                {generatedPosts.map((post, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedPostIndex(idx)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                                            selectedPostIndex === idx
                                                ? 'bg-yellow-500/20 border-2 border-yellow-500'
                                                : 'bg-gray-800/50 border border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        <p className="text-gray-200 text-sm leading-relaxed">{post}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Telegram Settings */}
                    <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-center mb-6">
                            <label className="flex items-center gap-3 cursor-pointer" onClick={() => setPostToTelegram(!postToTelegram)}>
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                    postToTelegram ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                                }`}>
                                    {postToTelegram && <span className="text-white text-sm">✓</span>}
                                </div>
                                <span className="text-white font-semibold text-lg">{t.postToTelegram}</span>
                            </label>
                        </div>

                        {postToTelegram && (
                            <div>
                                <label className="block text-blue-300 font-semibold mb-4 text-center">
                                    🔘 {lang === 'ar' ? 'أزرار التفاعل' : 'Action Buttons'}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: 'share', label: lang === 'ar' ? '📤 مشاركة المنشور' : '📤 Share Post' },
                                        { id: 'subscribe', label: lang === 'ar' ? '🔥 اشترك الآن' : '🔥 Subscribe Now' },
                                        { id: 'view_signal', label: lang === 'ar' ? '💎 إظهار التوصية' : '💎 Show Signal' },
                                        { id: 'none', label: lang === 'ar' ? '🚫 بدون زر' : '🚫 No Button' }
                                    ].map((btn) => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setTelegramButtonType(btn.id)}
                                            className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                                                telegramButtonType === btn.id
                                                    ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                                                    : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                                            }`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Final Preview & Publish */}
                    {previewData && (
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-6">👁️ {lang === 'ar' ? 'المعاينة النهائية' : 'Final Preview'}</h3>
                            
                            <div className="mb-6">
                                <img 
                                    src={previewData} 
                                    alt="Preview" 
                                    className="max-w-full max-h-96 mx-auto rounded-xl shadow-lg border border-gray-600"
                                />
                            </div>
                            
                            <div className="bg-black/50 rounded-xl p-4 mb-6 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                <p className="text-white font-semibold leading-relaxed">
                                    {selectedPostIndex >= 0 && generatedPosts[selectedPostIndex] ? generatedPosts[selectedPostIndex] : customPost}
                                </p>
                            </div>
                            
                            <button
                                onClick={isEditing ? handleUpdate : handlePublish}
                                disabled={uploading}
                                className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold text-xl rounded-2xl transition-all shadow-lg disabled:opacity-50"
                            >
                                {uploading
                                    ? (lang === 'ar' ? (isEditing ? 'جاري التعديل...' : 'جاري النشر...') : (isEditing ? 'Updating...' : 'Publishing...'))
                                    : (lang === 'ar' ? (isEditing ? '🔄 تأكيد وتحديث الآن' : '🚀 تأكيد ونشر الآن') : (isEditing ? '🔄 Confirm & Update' : '🚀 Confirm & Publish'))}
                            </button>
                        </div>
                    )}
                </div>
                {/* Published Signals Section */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        {t.publishedSignals} ({signals.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">{t.loading}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {signals.map((signal) => (
                                <div key={signal._id} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all">
                                    <div className="relative">
                                        <img 
                                            src={signal.imageUrl} 
                                            alt="Signal" 
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-300">
                                            {getTimeAgo(signal.createdAt, lang)}
                                        </div>
                                    </div>
                                    
                                    {signal.customPost && (
                                        <div className="p-4 border-t border-gray-700">
                                            <p className="text-gray-200 text-sm leading-relaxed line-clamp-3">
                                                {signal.customPost.replace(/\*/g, '')}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="p-4 bg-gray-900/50 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(signal)}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-all text-sm font-semibold"
                                        >
                                            {lang === 'ar' ? 'تعديل' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => deleteSignal(signal._id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-semibold"
                                        >
                                            {t.delete}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* VIP Management Section */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
                        <span className="text-3xl">👑</span>
                        {t.manageVip}
                    </h2>

                    {/* Add VIP Form */}
                    <div className="bg-gray-800/30 rounded-2xl p-6 mb-8 border border-gray-700">
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">{t.addNewVip}</h3>
                        <form onSubmit={handleGrantVip} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">{t.telegramIdPlaceholder}</label>
                                <input
                                    type="text"
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 font-semibold mb-2">{t.durationMonths || 'Duration (Months)'}</label>
                                <input
                                    type="number"
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(e.target.value)}
                                    placeholder="e.g. 1, 3, 12"
                                    disabled={isLifetime}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-all disabled:opacity-50 disabled:bg-gray-900"
                                />
                            </div>

                            <div className="flex items-center justify-center h-12">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isLifetime}
                                        onChange={(e) => setIsLifetime(e.target.checked)}
                                        className="w-5 h-5 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                                    />
                                    <span className="text-white font-semibold">{t.lifetime || 'Lifetime'}</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={vipLoading}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl transition-all font-semibold"
                            >
                                {vipLoading ? '...' : t.grantVip}
                            </button>
                        </form>
                        
                        {vipMessage.text && (
                            <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                                vipMessage.type === 'success' 
                                    ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                            }`}>
                                {vipMessage.text}
                            </div>
                        )}
                    </div>
                    {/* Active Users Table */}
                    <div className="bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-yellow-400 font-bold">Telegram ID</th>
                                        <th className="px-6 py-4 text-center text-yellow-400 font-bold">{t.status || 'Status'}</th>
                                        <th className="px-6 py-4 text-center text-yellow-400 font-bold">{t.expiresIn || 'Expires In'}</th>
                                        <th className="px-6 py-4 text-center text-yellow-400 font-bold">{t.actions || 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.isVip).length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
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
                                                timeLeft = `${days} Days`;
                                            }

                                            return (
                                                <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 text-white font-mono">{user.telegramId}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm font-semibold">
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-white font-semibold">{timeLeft}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleRemoveUser(user.telegramId)}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-semibold"
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
        </div>
    );
}