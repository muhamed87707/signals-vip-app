'use client';

import { useLanguage } from '../context/LanguageContext';

export default function FloatingChat() {
    const { t, isRTL, mounted } = useLanguage();

    if (!mounted) return null;

    // Contact link (can be updated to a bot link later)
    const supportLink = "https://t.me/Sniper_VIP_Academy"; // Placeholder valid support channel

    return (
        <div className="floating-chat-container">
            <span className="chat-tooltip">{t.chatSupport}</span>
            <a
                href={supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="floating-chat-btn"
                aria-label={t.chatSupport}
            >
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </a>
        </div>
    );
}
