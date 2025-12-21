/**
 * Geopolitical Risk Index Calculation
 * Requirements: 5.3, 5.4
 */

const RISK_KEYWORDS = {
  war: ['war', 'conflict', 'military', 'attack', 'invasion', 'troops'],
  sanctions: ['sanctions', 'embargo', 'ban', 'restrictions', 'tariff'],
  tariffs: ['tariff', 'trade war', 'import duty', 'export ban'],
  recession: ['recession', 'downturn', 'slowdown', 'contraction', 'crisis'],
};

/**
 * Calculate geopolitical risk index from news headlines
 * @param {Array} headlines - Array of headline strings
 * @returns {Object} Risk index with keyword breakdown
 */
export function calculateRiskIndex(headlines) {
  if (!Array.isArray(headlines) || headlines.length === 0) {
    return {
      score: 0,
      keywords: { war: 0, sanctions: 0, tariffs: 0, recession: 0 },
      trend: 'stable',
    };
  }

  const keywordCounts = {
    war: 0,
    sanctions: 0,
    tariffs: 0,
    recession: 0,
  };

  // Count keyword occurrences
  const combinedText = headlines.join(' ').toLowerCase();
  
  for (const [category, words] of Object.entries(RISK_KEYWORDS)) {
    for (const word of words) {
      const regex = new RegExp(word, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        keywordCounts[category] += matches.length;
      }
    }
  }

  // Calculate aggregate score (0-100)
  const totalKeywords = Object.values(keywordCounts).reduce((a, b) => a + b, 0);
  const maxPossible = headlines.length * 2; // Assume max 2 keywords per headline
  const score = Math.min(100, Math.round((totalKeywords / maxPossible) * 100));

  return {
    score: Math.max(0, Math.min(100, score)),
    keywords: keywordCounts,
    trend: score > 50 ? 'rising' : score < 30 ? 'falling' : 'stable',
  };
}

/**
 * Validate risk index structure
 */
export function validateRiskIndex(riskIndex) {
  if (!riskIndex || typeof riskIndex !== 'object') return false;
  
  if (typeof riskIndex.score !== 'number') return false;
  if (riskIndex.score < 0 || riskIndex.score > 100) return false;
  
  if (!riskIndex.keywords) return false;
  const requiredKeywords = ['war', 'sanctions', 'tariffs', 'recession'];
  for (const keyword of requiredKeywords) {
    if (typeof riskIndex.keywords[keyword] !== 'number') return false;
  }
  
  return true;
}

/**
 * Get fear gauge level based on risk index
 */
export function getFearLevel(score) {
  if (score >= 70) return { level: 'Extreme Fear', color: 'var(--dash-neon-red)' };
  if (score >= 50) return { level: 'Fear', color: 'var(--dash-neutral)' };
  if (score >= 30) return { level: 'Moderate', color: 'var(--dash-neon-blue)' };
  return { level: 'Low Fear', color: 'var(--dash-neon-green)' };
}

export default {
  calculateRiskIndex,
  validateRiskIndex,
  getFearLevel,
  RISK_KEYWORDS,
};
