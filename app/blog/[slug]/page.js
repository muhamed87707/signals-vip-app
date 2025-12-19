'use client';

import { useLanguage } from '../../context/LanguageContext';
import { blogPosts } from '../../utils/blogData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';

// Simple Markdown Parser Component
const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    return (
        <div className="article-content">
            {content.split('\n').map((line, index) => {
                const trimmed = line.trim();

                // Headers
                if (trimmed.startsWith('### ')) {
                    return <h3 key={index}>{trimmed.replace('### ', '')}</h3>;
                }
                if (trimmed.startsWith('## ')) {
                    return <h2 key={index}>{trimmed.replace('## ', '')}</h2>;
                }

                // List items
                if (trimmed.startsWith('- ')) {
                    return <li key={index} className="article-list-item">{trimmed.replace('- ', '')}</li>;
                }

                // Blockquotes
                if (trimmed.startsWith('> ')) {
                    return <blockquote key={index} className="article-quote">{trimmed.replace('> ', '')}</blockquote>;
                }

                // Empty lines
                if (trimmed === '') {
                    return <br key={index} />;
                }

                // Paragraphs with bold handling
                // Very basic bold parser: **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={index}>
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

export default function BlogPost({ params }) {
    const { t, lang, isRTL, mounted, toggleLang } = useLanguage();
    const { slug } = use(params);

    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center', color: '#fff' }}>Post not found</div>;
    }

    const postContent = post[lang] || post['en'];

    if (!mounted) return null;

    return (
        <div className="blog-post-page" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="header">
                <div className="container header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <a href="/" className="logo">
                            <span className="btn-text-shine">{t.brand}</span>
                        </a>
                        <Link href="/analysis" style={{
                            color: 'var(--gold-primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }} className="hover:opacity-80">
                            📊 {t.analysisTitle}
                        </Link>
                        <button
                            onClick={toggleLang}
                            className="lang-toggle-blog"
                            style={{
                                background: 'rgba(184, 134, 11, 0.1)',
                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                borderRadius: '50px',
                                padding: '0.4rem 1rem',
                                color: 'var(--gold-primary)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🌐 {t.langSwitch}
                        </button>
                    </div>
                    <Link href="/blog" className="back-link">
                        {t.backToBlog}
                    </Link>
                </div>
            </header>

            <article className="container article-container animate-fade-in-up">
                <div className="article-header">
                    <div className="article-meta-top">
                        <span className="article-date">{post.date}</span>
                        <span className="article-read-time">{post.readingTime} {t.minRead}</span>
                    </div>
                    <h1 className="article-title">{postContent.title}</h1>
                    <div className="article-author">
                        <span>{t.publishedOn}</span> <span className="author-name">{postContent.author}</span>
                    </div>
                </div>

                <div className="article-image-wrapper">
                    <img src={post.image} alt={postContent.title} className="article-featured-image" />
                </div>

                <MarkdownRenderer content={postContent.content} />

                <div className="article-footer">
                    <Link href="/blog" className="btn-secondary">
                        {t.backToBlog}
                    </Link>
                </div>
            </article>

            <section className="cta-section">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <h2 className="section-title">{t.heroTitle} <span className="text-gradient">{t.brand}</span></h2>
                    <p style={{ marginBottom: '2rem', color: '#888' }}>{t.heroSubtitle}</p>
                    <a href="/" className="btn-primary">{t.ctaButton}</a>
                </div>
            </section>

            <footer className="footer">
                <div className="container footer-content" style={{ textAlign: 'center' }}>
                    <p>© {new Date().getFullYear()} {t.brand}. {t.footerText}</p>
                </div>
            </footer>
        </div>
    );
}
