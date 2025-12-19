'use client';

import { useLanguage } from '../context/LanguageContext';
import { blogPosts } from '../utils/blogData';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function BlogIndex() {
    const { t, lang, isRTL, mounted, toggleLang } = useLanguage();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        setPosts(blogPosts);
    }, []);

    if (!mounted) return null;

    return (
        <div className="blog-page" dir={isRTL ? 'rtl' : 'ltr'}>
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
                    <a href="/" className="back-link">
                        {t.backToHome}
                    </a>
                </div>
            </header>

            <section className="hero blog-hero">
                <div className="container">
                    <div className="hero-badge animate-fade-in-up">{t.blogTitle}</div>
                    <h1 className="hero-title animate-fade-in-up delay-100">
                        {t.blogHeroTitle}
                    </h1>
                    <p className="hero-subtitle animate-fade-in-up delay-200">
                        {t.blogHeroSubtitle}
                    </p>
                </div>
            </section>

            <section className="container" style={{ paddingBottom: '4rem' }}>
                <div className="blog-grid animate-fade-in-up delay-300">
                    {posts.map((post) => {
                        const postContent = post[lang] || post['en'];
                        return (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="blog-card">
                                <div className="blog-card-image">
                                    <img src={post.image} alt={postContent.title} />
                                </div>
                                <div className="blog-card-content">
                                    <div className="blog-meta">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readingTime} {t.minRead}</span>
                                    </div>
                                    <h2 className="blog-card-title">{postContent.title}</h2>
                                    <p className="blog-card-excerpt">{postContent.excerpt}</p>
                                    <span className="blog-read-more">{t.readMore} &rarr;</span>
                                </div>
                            </Link>
                        );
                    })}
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
