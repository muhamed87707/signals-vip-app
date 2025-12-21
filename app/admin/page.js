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

    // Active tab state for better organization
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
        e.preventDe