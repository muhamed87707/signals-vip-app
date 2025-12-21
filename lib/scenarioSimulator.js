/**
 * Scenario Simulator Service
 * Historical elasticity calculations for gold price projections
 * Requirements: 8.1, 8.2, 8.3
 */

// Historical elasticity coefficients (based on historical data analysis)
const ELASTICITY_COEFFICIENTS = {
  fedRate: -45,      // Gold moves ~$45 per 25bps rate change
  dxy: -15,          // Gold moves ~$15 per 1 DXY point
  inflation: 30,     // Gold moves ~$30 per 0.5% inflation change
  realYield: -80,    // Gold moves ~$80 per 0.5% real yield change
  geopolitical: 25,  // Gold moves ~$25 per risk level change
};

/**
 * Calculate projected gold price based on scenario inputs
 * @param {Object} scenario - Scenario parameters
 * @param {number} currentPrice - Current gold price
 * @returns {Object} Projection result
 */
export function calculateScenario(scenario, currentPrice = 2650) {
  const {
    fedRateChange = 0,    // in basis points (-100 to +100)
    dxyChange = 0,        // in points (-5 to +5)
    inflationChange = 0,  // in percentage points (-1 to +1)
    realYieldChange = 0,  // in percentage points (-1 to +1)
    geopoliticalRisk = 0, // scale 0-100
  } = scenario;

  // Calculate individual impacts
  const fedImpact = (fedRateChange / 25) * ELASTICITY_COEFFICIENTS.fedRate;
  const dxyImpact = dxyChange * ELASTICITY_COEFFICIENTS.dxy;
  const inflationImpact = (inflationChange / 0.5) * ELASTICITY_COEFFICIENTS.inflation;
  const realYieldImpact = (realYieldChange / 0.5) * ELASTICITY_COEFFICIENTS.realYield;
  const geoImpact = (geopoliticalRisk / 20) * ELASTICITY_COEFFICIENTS.geopolitical;

  const totalImpact = fedImpact + dxyImpact + inflationImpact + realYieldImpact + geoImpact;
  const projectedPrice = currentPrice + totalImpact;
  const percentChange = (totalImpact / currentPrice) * 100;

  return {
    currentPrice,
    projectedPrice: Math.round(projectedPrice * 100) / 100,
    totalImpact: Math.round(totalImpact * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    breakdown: {
      fedRate: { change: fedRateChange, impact: Math.round(fedImpact * 100) / 100 },
      dxy: { change: dxyChange, impact: Math.round(dxyImpact * 100) / 100 },
      inflation: { change: inflationChange, impact: Math.round(inflationImpact * 100) / 100 },
      realYield: { change: realYieldChange, impact: Math.round(realYieldImpact * 100) / 100 },
      geopolitical: { risk: geopoliticalRisk, impact: Math.round(geoImpact * 100) / 100 },
    },
    confidence: calculateConfidence(scenario),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate confidence level based on scenario extremity
 */
function calculateConfidence(scenario) {
  const extremity = Math.abs(scenario.fedRateChange || 0) / 100 +
                   Math.abs(scenario.dxyChange || 0) / 5 +
                   Math.abs(scenario.inflationChange || 0) +
                   Math.abs(scenario.realYieldChange || 0) +
                   (scenario.geopoliticalRisk || 0) / 100;
  
  const confidence = Math.max(30, 95 - extremity * 15);
  return Math.round(confidence);
}

/**
 * Generate explanation for scenario
 * @param {Object} result - Scenario calculation result
 * @returns {string} Human-readable explanation
 */
export function generateExplanation(result) {
  const { breakdown, projectedPrice, percentChange } = result;
  const parts = [];

  if (breakdown.fedRate.change !== 0) {
    const direction = breakdown.fedRate.change < 0 ? 'cut' : 'hike';
    parts.push(`Fed rate ${direction} of ${Math.abs(breakdown.fedRate.change)}bps → $${breakdown.fedRate.impact > 0 ? '+' : ''}${breakdown.fedRate.impact}`);
  }

  if (breakdown.dxy.change !== 0) {
    const direction = breakdown.dxy.change < 0 ? 'weakening' : 'strengthening';
    parts.push(`Dollar ${direction} → $${breakdown.dxy.impact > 0 ? '+' : ''}${breakdown.dxy.impact}`);
  }

  if (breakdown.inflation.change !== 0) {
    const direction = breakdown.inflation.change > 0 ? 'rising' : 'falling';
    parts.push(`Inflation ${direction} → $${breakdown.inflation.impact > 0 ? '+' : ''}${breakdown.inflation.impact}`);
  }

  if (breakdown.geopolitical.risk > 0) {
    parts.push(`Geopolitical risk premium → $+${breakdown.geopolitical.impact}`);
  }

  const summary = `Projected price: $${projectedPrice.toLocaleString()} (${percentChange > 0 ? '+' : ''}${percentChange}%)`;
  
  return parts.length > 0 ? `${parts.join('. ')}. ${summary}` : summary;
}

/**
 * Get preset scenarios
 */
export function getPresetScenarios() {
  return [
    {
      id: 'dovish_fed',
      name: 'Dovish Fed Pivot',
      description: 'Fed cuts rates by 50bps, dollar weakens',
      params: { fedRateChange: -50, dxyChange: -2, inflationChange: 0.2 },
    },
    {
      id: 'hawkish_fed',
      name: 'Hawkish Surprise',
      description: 'Fed hikes rates, dollar strengthens',
      params: { fedRateChange: 25, dxyChange: 1.5, inflationChange: -0.1 },
    },
    {
      id: 'risk_off',
      name: 'Risk-Off Event',
      description: 'Geopolitical crisis, flight to safety',
      params: { geopoliticalRisk: 80, dxyChange: -1 },
    },
    {
      id: 'stagflation',
      name: 'Stagflation Scenario',
      description: 'High inflation with slowing growth',
      params: { inflationChange: 0.8, realYieldChange: -0.5, fedRateChange: -25 },
    },
  ];
}

export default {
  calculateScenario,
  generateExplanation,
  getPresetScenarios,
  ELASTICITY_COEFFICIENTS,
};
