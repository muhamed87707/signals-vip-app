/**
 * Kill Zone Manager - مدير أوقات التداول المثالية
 * Manages trading session times and kill zones
 */

import { KILL_ZONES } from '../index';

export class KillZoneManager {
  constructor(config = {}) {
    this.config = {
      timezone: 'America/New_York', // EST
      killZonePenalty: 15,
      ...config,
    };
    
    this.killZones = KILL_ZONES;
  }

  /**
   * Get current kill zone status
   * @returns {Object} Current kill zone information
   */
  getCurrentKillZone() {
    const now = this.getCurrentEST();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + (minute / 60);

    const activeZone = this.getActiveZone(currentTime);
    const nextZone = this.getNextZone(currentTime);

    return {
      isActive: activeZone !== null,
      currentZone: activeZone,
      nextZone: nextZone.name,
      timeToNextZone: nextZone.timeRemaining,
      currentHourEST: hour,
      sessions: this.getSessionStatus(currentTime),
    };
  }

  /**
   * Get current time in EST
   */
  getCurrentEST() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: this.config.timezone }));
  }

  /**
   * Check if currently in a kill zone
   */
  getActiveZone(currentTime) {
    // London Kill Zone (02:00-05:00 EST)
    if (currentTime >= this.killZones.london.start && currentTime < this.killZones.london.end) {
      return 'london';
    }

    // New York Kill Zone (07:00-10:00 EST)
    if (currentTime >= this.killZones.newYork.start && currentTime < this.killZones.newYork.end) {
      return 'newYork';
    }

    // London Close (10:00-12:00 EST)
    if (currentTime >= this.killZones.londonClose.start && currentTime < this.killZones.londonClose.end) {
      return 'londonClose';
    }

    // Asian Session (19:00-02:00 EST) - spans midnight
    if (currentTime >= this.killZones.asian.start || currentTime < this.killZones.asian.end) {
      return 'asian';
    }

    return null;
  }

  /**
   * Get next kill zone and time remaining
   */
  getNextZone(currentTime) {
    const zones = [
      { name: 'london', start: this.killZones.london.start },
      { name: 'newYork', start: this.killZones.newYork.start },
      { name: 'londonClose', start: this.killZones.londonClose.start },
      { name: 'asian', start: this.killZones.asian.start },
    ];

    // Find next zone
    for (const zone of zones) {
      if (zone.start > currentTime) {
        const hoursRemaining = zone.start - currentTime;
        return {
          name: zone.name,
          timeRemaining: this.formatTimeRemaining(hoursRemaining),
          hoursRemaining,
        };
      }
    }

    // If past all zones today, next is London tomorrow
    const hoursRemaining = (24 - currentTime) + this.killZones.london.start;
    return {
      name: 'london',
      timeRemaining: this.formatTimeRemaining(hoursRemaining),
      hoursRemaining,
    };
  }

  /**
   * Format time remaining as string
   */
  formatTimeRemaining(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h === 0) {
      return `${m}m`;
    }
    return `${h}h ${m}m`;
  }

  /**
   * Get status of all trading sessions
   */
  getSessionStatus(currentTime) {
    return {
      asian: {
        active: currentTime >= this.killZones.asian.start || currentTime < this.killZones.asian.end,
        name: 'Asian Session',
        hours: '19:00-02:00 EST',
        description: 'Tokyo, Sydney, Hong Kong',
      },
      london: {
        active: currentTime >= this.killZones.london.start && currentTime < this.killZones.londonClose.end,
        name: 'London Session',
        hours: '02:00-12:00 EST',
        description: 'London, Frankfurt, Zurich',
        killZone: currentTime >= this.killZones.london.start && currentTime < this.killZones.london.end,
      },
      newYork: {
        active: currentTime >= this.killZones.newYork.start && currentTime < 17,
        name: 'New York Session',
        hours: '07:00-17:00 EST',
        description: 'New York, Chicago, Toronto',
        killZone: currentTime >= this.killZones.newYork.start && currentTime < this.killZones.newYork.end,
      },
      overlap: {
        active: currentTime >= this.killZones.newYork.start && currentTime < this.killZones.londonClose.end,
        name: 'London/NY Overlap',
        hours: '07:00-12:00 EST',
        description: 'Highest liquidity period',
      },
    };
  }

  /**
   * Check if it's a good time to trade
   */
  isGoodTimeToTrade() {
    const { isActive, currentZone } = this.getCurrentKillZone();
    return isActive && (currentZone === 'london' || currentZone === 'newYork' || currentZone === 'londonClose');
  }

  /**
   * Get kill zone penalty
   */
  getKillZonePenalty() {
    const { isActive } = this.getCurrentKillZone();
    return isActive ? 0 : this.config.killZonePenalty;
  }

  /**
   * Get best instruments for current session
   */
  getBestInstrumentsForSession() {
    const { currentZone } = this.getCurrentKillZone();

    const recommendations = {
      asian: ['USDJPY', 'AUDUSD', 'NZDUSD', 'AUDJPY', 'XAUUSD'],
      london: ['EURUSD', 'GBPUSD', 'EURGBP', 'EURJPY', 'XAUUSD', 'GER40'],
      newYork: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'US30', 'US500', 'XAUUSD'],
      londonClose: ['EURUSD', 'GBPUSD', 'XAUUSD'],
    };

    return recommendations[currentZone] || recommendations.newYork;
  }

  /**
   * Get session volatility expectation
   */
  getVolatilityExpectation() {
    const { currentZone, sessions } = this.getCurrentKillZone();

    if (sessions.overlap.active) {
      return { level: 'high', description: 'London/NY overlap - expect high volatility' };
    }

    if (currentZone === 'london' || currentZone === 'newYork') {
      return { level: 'medium-high', description: 'Major session - good volatility expected' };
    }

    if (currentZone === 'asian') {
      return { level: 'low-medium', description: 'Asian session - typically lower volatility' };
    }

    return { level: 'low', description: 'Off-hours - low liquidity and volatility' };
  }
}

export default KillZoneManager;
