/**
 * News Aggregation Service
 * Requirements: 5.1
 */

// In-memory cache
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Sample news data (in production, fetch from RSS feeds)
const SAMPLE_NEWS = [
  { headline: 'Fed signals potential rate cuts in 2025', source: 'Reuters', sentiment: 45 },
  { headline: 'Gold prices surge on geopolitical tensions', source: 'Bloomberg', sentiment: 65 },
  { headline: 'ECB maintains hawkish stance on inflation', source: 'CentralBank', sentiment: -20 },
  { headline: 'Dollar weakens as Treasury yields decline', source: 'Reuters', sentiment: 55 },
  { headline: 'Central banks continue gold accumulation', source: 'Bloomberg', sentiment: 70 },
  { headline: 'US inflation data comes in higher than expected', source: 'Reuters', sentiment: 40 },
  { headline: 'China PBoC increases gold reserves', source: 'CentralBank', sentiment: 60 },
  { headline: 'Market volatility rises amid uncertainty', source: 'Bloomberg', sentiment: -10 },
];

/**
 * Aggregate news from multiple sources
 */
export async function aggregateNews(sources = ['Reuters', 'Bloomberg', 'CentralBank']) {
  const cacheKey = `news_${sources.join('_')}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Filter news by requested sources
    const news = SAMPLE_NEWS
      .filter(item => sources.includes(item.source))
      .map(item => ({
        ...item,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        url: '#',
      }));

    // Sort by timestamp (newest first)
    news.sort((a, b) => b.timestamp - a.timestamp);

    cache.set(cacheKey, { data: news, timestamp: Date.now() });
    return news;
  } catch (error) {
    console.error('Error aggregating news:', error);
    return SAMPLE_NEWS;
  }
}

/**
 * Check if news contains items from all required sources
 */
export function hasAllSources(news, requiredSources = ['Reuters', 'Bloomberg', 'CentralBank']) {
  if (!Array.isArray(news) || news.length === 0) return false;
  
  const presentSources = new Set(news.map(item => item.source));
  return requiredSources.every(source => presentSources.has(source));
}

/**
 * Filter news by source
 */
export function filterBySource(news, source) {
  if (!Array.isArray(news)) return [];
  return news.filter(item => item.source === source);
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

export default {
  aggregateNews,
  hasAllSources,
  filterBySource,
  clearCache,
};
