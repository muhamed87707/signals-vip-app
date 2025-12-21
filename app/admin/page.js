'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './admin.css';

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
  const { t, lang, toggleLang, mounted } = useLanguage();
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

  // Signal State
  const [postToTelegram, setPostToTelegram] = useState(true);
  const [signalType, setSignalType] = useState('vip');
  const [customPost, setCustomPost] = useState('');
  const [telegramButtonType, setTelegramButtonType] = useState('view_signal');
  const [previewData, setPreviewData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // AI Settings
  const [aiPrompt, setAiPrompt] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [postCount, setPostCount] = useState(50);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [generatingPosts, setGeneratingPosts] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(-1);
  const [savingSettings, setSavingSettings] = useState(false);

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
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

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
      if (data.success) setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const saveSettingsToDB = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey, aiPrompt, selectedModel, generatedPostCount: postCount })
      });
      alert(lang === 'ar' ? 'تم حفظ الإعدادات!' : 'Settings saved!');
    } catch (err) {
      alert(lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
    }
    setSavingSettings(false);
  };

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
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
          <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFE566"/><stop offset="50%" style="stop-color:#B8860B"/><stop offset="100%" style="stop-color:#705C0B"/></linearGradient></defs>
          <g transform="translate(25, 21) scale(0.6)"><circle cx="12" cy="16" r="5.5" fill="rgba(0,0,0,0.6)" transform="scale(3.5)"/><rect x="6" y="11" width="12" height="10" rx="3" stroke="url(#gold)" stroke-width="2" fill="rgba(0,0,0,0.3)" transform="scale(3.5)"/><path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#gold)" stroke-width="2" stroke-linecap="round" fill="none" transform="scale(3.5)"/><circle cx="12" cy="16" r="1.5" fill="url(#gold)" transform="scale(3.5)"/></g>
        </svg>`;
        const badgeImg = new Image();
        badgeImg.onload = () => {
          ctx.drawImage(badgeImg, x, y, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
          URL.revokeObjectURL(url);
        };
        badgeImg.src = 'data:image/svg+xml;base64,' + btoa(svgString);
      };
      img.src = url;
    });
  };

  const handleImageUpload = (e) => {
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

  const handlePaste = (e) => {
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

  const handlePublish = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setSuccessMessage('');
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let postToUse = selectedPostIndex >= 0 ? generatedPosts[selectedPostIndex] : customPost;
        if (postToUse?.trim() && !postToUse.startsWith('*')) postToUse = `*${postToUse.trim()}*`;

        let telegramImage = null;
        if (postToTelegram && signalType === 'vip') {
          telegramImage = await createBlurredImage(selectedFile);
        }

        const res = await fetch('/api/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pair: 'GOLD',
            type: signalType === 'regular' ? 'REGULAR' : 'SIGNAL',
            imageUrl: reader.result,
            telegramImage,
            sendToTelegram: postToTelegram,
            isVip: signalType === 'vip',
            customPost: postToUse || null,
            telegramButtonType
          })
        });

        const data = await res.json();
        if (data.success) {
          setSuccessMessage(lang === 'ar' ? 'تم النشر بنجاح!' : 'Published successfully!');
          fetchSignals();
          setPreviewData(null);
          setSelectedFile(null);
          setCustomPost('');
          setGeneratedPosts([]);
          setSelectedPostIndex(-1);
        } else {
          setError(t.postError);
        }
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(t.uploadError);
      setUploading(false);
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
    setActiveTab('publish');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setCustomPost('');
    setPreviewData(null);
    setSelectedFile(null);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setUploading(true);
    try {
      let postToUse = customPost;
      if (postToUse?.trim() && !postToUse.startsWith('*')) postToUse = `*${postToUse.trim()}*`;

      let payload = {
        id: editingId,
        customPost: postToUse,
        telegramButtonType,
        type: signalType === 'regular' ? 'REGULAR' : 'SIGNAL',
        isVip: signalType === 'vip',
        imageUrl: previewData
      };

      if (selectedFile) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(selectedFile);
        });
        payload.imageUrl = base64;
        if (signalType === 'vip') payload.telegramImage = await createBlurredImage(selectedFile);
      }

      const res = await fetch('/api/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if ((await res.json()).success) {
        setSuccessMessage(lang === 'ar' ? 'تم التحديث!' : 'Updated!');
        handleCancelEdit();
        fetchSignals();
      }
    } catch (err) {
      setError(t.postError);
    }
    setUploading(false);
  };

  const deleteSignal = async (id) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
      fetchSignals();
    } catch (err) {
      console.error(err);
    }
  };

  const generateAIPosts = async () => {
    if (!customPost.trim()) return;
    setGeneratingPosts(true);
    setGeneratedPosts([]);
    try {
      const res = await fetch('/api/ai/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiApiKey, model: selectedModel, userPost: customPost, customPrompt: aiPrompt, count: postCount })
      });
      const data = await res.json();
      if (data.success) setGeneratedPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }
    setGeneratingPosts(false);
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
        body: JSON.stringify({ telegramId, isVip: true, durationMonths, isLifetime })
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
    if (!confirm('Remove this user?')) return;
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId: tid, removeUser: true })
    });
    fetchUsers();
  };

  if (!mounted) return null;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h1>{t.adminTitle}</h1>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-gold">{t.login}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" onPaste={handlePaste}>
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>💎 {t.signalsDashboard}</h1>
        </div>
        <div className="header-right">
          <button onClick={toggleLang} className="btn-outline">🌐 {t.langSwitch}</button>
          <button onClick={handleLogout} className="btn-danger">{t.logout}</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        <button className={activeTab === 'publish' ? 'active' : ''} onClick={() => setActiveTab('publish')}>
          📤 {lang === 'ar' ? 'نشر جديد' : 'Publish'}
        </button>
        <button className={activeTab === 'signals' ? 'active' : ''} onClick={() => setActiveTab('signals')}>
          📊 {lang === 'ar' ? 'المنشورات' : 'Signals'} ({signals.length})
        </button>
        <button className={activeTab === 'vip' ? 'active' : ''} onClick={() => setActiveTab('vip')}>
          👑 VIP ({users.filter(u => u.isVip).length})
        </button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
          ⚙️ {lang === 'ar' ? 'الإعدادات' : 'Settings'}
        </button>
      </nav>

      {/* Success/Error Messages */}
      {successMessage && <div className="alert success">{successMessage}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Tab Content */}
      <main className="admin-content">
        {/* PUBLISH TAB */}
        {activeTab === 'publish' && (
          <div className="publish-section">
            {isEditing && <div className="edit-badge">✏️ {lang === 'ar' ? 'وضع التعديل' : 'Edit Mode'}</div>}
            
            {/* Image Upload */}
            <div className="upload-area">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} id="image-upload" hidden />
              {!previewData ? (
                <label htmlFor="image-upload" className="upload-label">
                  <span className="upload-icon">📸</span>
                  <span>{lang === 'ar' ? 'اضغط لرفع صورة أو الصق من الحافظة' : 'Click to upload or paste image'}</span>
                </label>
              ) : (
                <div className="preview-container">
                  <img src={previewData} alt="Preview" />
                  <button onClick={() => { setPreviewData(null); setSelectedFile(null); }} className="change-btn">
                    {lang === 'ar' ? 'تغيير' : 'Change'}
                  </button>
                </div>
              )}
            </div>

            {/* Signal Type */}
            <div className="signal-types">
              {['vip', 'free', 'regular'].map(type => (
                <button key={type} className={signalType === type ? 'active' : ''} onClick={() => setSignalType(type)}>
                  {type === 'vip' && '💎 VIP'}
                  {type === 'free' && '🎁 Free'}
                  {type === 'regular' && '📝 Regular'}
                </button>
              ))}
            </div>

            {/* Post Text */}
            <div className="form-group">
              <label>✍️ {lang === 'ar' ? 'نص المنشور' : 'Post Text'}</label>
              <textarea value={customPost} onChange={(e) => setCustomPost(e.target.value)} placeholder={lang === 'ar' ? 'اكتب المنشور...' : 'Write post...'} rows={4} />
            </div>

            {/* AI Generate */}
            <button onClick={generateAIPosts} disabled={generatingPosts || !customPost.trim()} className="btn-ai">
              {generatingPosts ? '...' : `🤖 ${lang === 'ar' ? 'توليد نسخ' : 'Generate'} (${postCount})`}
            </button>

            {/* Generated Posts */}
            {generatedPosts.length > 0 && (
              <div className="generated-posts">
                {generatedPosts.map((post, idx) => (
                  <div key={idx} className={selectedPostIndex === idx ? 'selected' : ''} onClick={() => setSelectedPostIndex(idx)}>
                    {post}
                  </div>
                ))}
              </div>
            )}

            {/* Telegram Options */}
            <div className="telegram-options">
              <label className="checkbox-label">
                <input type="checkbox" checked={postToTelegram} onChange={(e) => setPostToTelegram(e.target.checked)} />
                <span>📱 {t.postToTelegram}</span>
              </label>
              
              {postToTelegram && (
                <div className="button-types">
                  {[
                    { id: 'view_signal', label: '💎 Show Signal' },
                    { id: 'share', label: '📤 Share' },
                    { id: 'subscribe', label: '🔥 Subscribe' },
                    { id: 'none', label: '🚫 None' }
                  ].map(btn => (
                    <button key={btn.id} className={telegramButtonType === btn.id ? 'active' : ''} onClick={() => setTelegramButtonType(btn.id)}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Publish Button */}
            <div className="publish-actions">
              {isEditing && <button onClick={handleCancelEdit} className="btn-outline">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>}
              <button onClick={isEditing ? handleUpdate : handlePublish} disabled={uploading || !previewData} className="btn-gold btn-large">
                {uploading ? '...' : (isEditing ? '🔄 Update' : '🚀 Publish')}
              </button>
            </div>
          </div>
        )}

        {/* SIGNALS TAB */}
        {activeTab === 'signals' && (
          <div className="signals-grid">
            {loading ? <p className="loading">Loading...</p> : signals.map(signal => (
              <div key={signal._id} className="signal-card">
                <img src={signal.imageUrl} alt="Signal" />
                {signal.customPost && <p className="signal-text">{signal.customPost.replace(/\*/g, '')}</p>}
                <div className="signal-meta">
                  <span className="time">{getTimeAgo(signal.createdAt, lang)}</span>
                  <span className={`badge ${signal.isVip ? 'vip' : 'free'}`}>{signal.isVip ? 'VIP' : 'Free'}</span>
                </div>
                <div className="signal-actions">
                  <button onClick={() => handleEdit(signal)} className="btn-edit">✏️</button>
                  <button onClick={() => deleteSignal(signal._id)} className="btn-delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIP TAB */}
        {activeTab === 'vip' && (
          <div className="vip-section">
            <form onSubmit={handleGrantVip} className="vip-form">
              <h3>👑 {t.addNewVip}</h3>
              <div className="form-row">
                <input type="text" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} placeholder="Telegram ID" required />
                <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="Months" disabled={isLifetime} />
                <label className="checkbox-label">
                  <input type="checkbox" checked={isLifetime} onChange={(e) => setIsLifetime(e.target.checked)} />
                  <span>♾️ Lifetime</span>
                </label>
                <button type="submit" className="btn-gold" disabled={vipLoading}>{vipLoading ? '...' : t.grantVip}</button>
              </div>
              {vipMessage.text && <p className={vipMessage.type}>{vipMessage.text}</p>}
            </form>

            <div className="vip-table">
              <table>
                <thead>
                  <tr>
                    <th>Telegram ID</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.isVip).map(user => {
                    const expiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
                    const days = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <tr key={user._id}>
                        <td>{user.telegramId}</td>
                        <td><span className="badge vip">Active</span></td>
                        <td>{days ? `${days} days` : '♾️ Lifetime'}</td>
                        <td><button onClick={() => handleRemoveUser(user.telegramId)} className="btn-delete">Remove</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h3>🤖 AI Settings (Gemini)</h3>
            <div className="form-group">
              <label>🔑 API Key</label>
              <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} />
            </div>
            <div className="form-group">
              <label>🧠 Model</label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              </select>
            </div>
            <div className="form-group">
              <label>🔢 Post Count</label>
              <input type="number" min="1" max="100" value={postCount} onChange={(e) => setPostCount(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>📝 Custom Prompt</label>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={6} />
            </div>
            <button onClick={saveSettingsToDB} disabled={savingSettings} className="btn-gold">
              {savingSettings ? '...' : '💾 Save Settings'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
