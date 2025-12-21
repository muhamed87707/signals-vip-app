'use client';

/**
 * NewsFeed - Scrolling headlines display
 * Requirements: 5.1
 */
export default function NewsFeed({ news }) {
  const getSentimentColor = (sentiment) => {
    if (sentiment > 30) return 'var(--dash-neon-green)';
    if (sentiment < -30) return 'var(--dash-neon-red)';
    return 'var(--dash-text-secondary)';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="news-feed">
      <div className="feed-header">
        <span className="feed-title">📰 Latest Headlines</span>
      </div>
      <div className="feed-list">
        {(news || []).slice(0, 5).map((item, index) => (
          <div key={index} className="news-item">
            <div className="news-meta">
              <span className="news-source">{item.source}</span>
              <span className="news-time">{formatTime(item.timestamp)}</span>
            </div>
            <div className="news-headline" style={{ borderLeftColor: getSentimentColor(item.sentiment) }}>
              {item.headline}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .news-feed {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }
        .feed-header {
          margin-bottom: 0.75rem;
        }
        .feed-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .news-item {
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--dash-border-primary);
        }
        .news-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .news-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .news-source {
          font-size: 0.7rem;
          color: var(--dash-gold-primary);
          font-weight: 600;
        }
        .news-time {
          font-size: 0.7rem;
          color: var(--dash-text-muted);
        }
        .news-headline {
          font-size: 0.85rem;
          color: var(--dash-text-primary);
          line-height: 1.4;
          padding-left: 0.75rem;
          border-left: 3px solid;
        }
      `}</style>
    </div>
  );
}
