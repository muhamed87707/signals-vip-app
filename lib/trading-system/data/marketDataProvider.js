/**
 * Market Data Provider - مزود بيانات السوق
 * Fetches and aggregates market data from multiple sources
 */

import { SUPPORTED_INSTRUMENTS, TIMEFRAMES } from '../index';

export class MarketDataProvider {
  constructor(config = {}) {
    this.config = {
      primarySource: 'alphavantage',
      backupSources: ['twelvedata', 'yahoo'],
      cacheTimeout: 60000, // 1 minute
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.cache = new Map();
    this.apiKeys = {
      alphavantage: config.alphaVantageKey || process.env.ALPHA_VANTAGE_API_KEY,
      twelvedata: config.twelveDataKey || process.env.TWELVE_DATA_API_KEY,
    };

    this.sources = {
      alphavantage: this.fetchFromAlphaVantage.bind(this),
      twelvedata: this.fetchFromTwelveData.bind(this),
      yahoo: this.fetchFromYahoo.bind(this),
    };
  }

  /**
   * Get OHLCV data for a symbol and timeframe
   */
  async getOHLCV(symbol, timeframe = 'H1', bars = 500) {
    const cacheKey = `${symbol}_${timeframe}_${bars}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }

    // Try primary source first
    let data = null;
    let lastError = null;

    try {
      data = await this.fetchWithRetry(this.config.primarySource, symbol, timeframe, bars);
    } catch (error) {
      lastError = error;
      console.warn(`Primary source (${this.config.primarySource}) failed:`, error.message);
    }

    // Try backup sources if primary fails
    if (!data) {
      for (const source of this.config.backupSources) {
        try {
          data = await this.fetchWithRetry(source, symbol, timeframe, bars);
          if (data) break;
        } catch (error) {
          lastError = error;
          console.warn(`Backup source (${source}) failed:`, error.message);
        }
      }
    }

    if (!data) {
      throw new Error(`All data sources failed for ${symbol}. Last error: ${lastError?.message}`);
    }

    // Validate and cache data
    const validatedData = this.validateData(data);
    this.cache.set(cacheKey, {
      data: validatedData,
      timestamp: Date.now(),
    });

    return validatedData;
  }

  /**
   * Get data for multiple timeframes
   */
  async getMultiTimeframe(symbol) {
    const timeframes = ['M15', 'H1', 'H4', 'D1'];
    const results = {};

    await Promise.all(
      timeframes.map(async (tf) => {
        try {
          results[tf] = {
            candles: await this.getOHLCV(symbol, tf, 500),
            timeframe: tf,
          };
        } catch (error) {
          console.error(`Failed to fetch ${tf} data for ${symbol}:`, error);
          results[tf] = { candles: [], timeframe: tf, error: error.message };
        }
      })
    );

    return results;
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol) {
    try {
      const data = await this.getOHLCV(symbol, 'M1', 1);
      if (data && data.length > 0) {
        const lastCandle = data[data.length - 1];
        return {
          symbol,
          price: lastCandle.close,
          bid: lastCandle.close - 0.0001, // Approximate
          ask: lastCandle.close + 0.0001,
          timestamp: lastCandle.timestamp,
        };
      }
    } catch (error) {
      console.error(`Failed to get current price for ${symbol}:`, error);
    }
    return null;
  }

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(source, symbol, timeframe, bars) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const fetchFn = this.sources[source];
        if (!fetchFn) {
          throw new Error(`Unknown data source: ${source}`);
        }
        return await fetchFn(symbol, timeframe, bars);
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Fetch from Alpha Vantage
   */
  async fetchFromAlphaVantage(symbol, timeframe, bars) {
    const apiKey = this.apiKeys.alphavantage;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const interval = this.mapTimeframeToAlphaVantage(timeframe);
    const func = timeframe === 'D1' || timeframe === 'W1' 
      ? 'FX_DAILY' 
      : 'FX_INTRADAY';

    // Convert symbol format (EURUSD -> EUR/USD)
    const fromCurrency = symbol.substring(0, 3);
    const toCurrency = symbol.substring(3, 6);

    const url = `https://www.alphavantage.co/query?function=${func}&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=${interval}&outputsize=full&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || data['Note']);
    }

    // Parse Alpha Vantage response
    const timeSeries = data[`Time Series FX (${interval})`] || data['Time Series FX (Daily)'];
    if (!timeSeries) {
      throw new Error('No data returned from Alpha Vantage');
    }

    const candles = Object.entries(timeSeries)
      .slice(0, bars)
      .map(([timestamp, values]) => ({
        timestamp: new Date(timestamp).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: 0, // Alpha Vantage doesn't provide volume for forex
      }))
      .reverse();

    return candles;
  }

  /**
   * Fetch from Twelve Data
   */
  async fetchFromTwelveData(symbol, timeframe, bars) {
    const apiKey = this.apiKeys.twelvedata;
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured');
    }

    const interval = this.mapTimeframeToTwelveData(timeframe);
    const formattedSymbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;

    const url = `https://api.twelvedata.com/time_series?symbol=${formattedSymbol}&interval=${interval}&outputsize=${bars}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    const candles = data.values.map(v => ({
      timestamp: new Date(v.datetime).getTime(),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseFloat(v.volume) || 0,
    })).reverse();

    return candles;
  }

  /**
   * Fetch from Yahoo Finance (free, no API key needed)
   */
  async fetchFromYahoo(symbol, timeframe, bars) {
    // Yahoo Finance uses different symbol format
    const yahooSymbol = this.mapSymbolToYahoo(symbol);
    const interval = this.mapTimeframeToYahoo(timeframe);
    const range = this.getYahooRange(timeframe, bars);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const data = await response.json();

    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    const candles = timestamps.map((ts, i) => ({
      timestamp: ts * 1000,
      open: quotes.open[i],
      high: quotes.high[i],
      low: quotes.low[i],
      close: quotes.close[i],
      volume: quotes.volume[i] || 0,
    })).filter(c => c.open !== null);

    return candles.slice(-bars);
  }

  /**
   * Validate and clean data
   */
  validateData(candles) {
    if (!Array.isArray(candles) || candles.length === 0) {
      throw new Error('Invalid data: empty or not an array');
    }

    // Filter out invalid candles and fill gaps
    const validCandles = candles.filter(c => 
      c.timestamp && 
      !isNaN(c.open) && 
      !isNaN(c.high) && 
      !isNaN(c.low) && 
      !isNaN(c.close)
    );

    // Sort by timestamp
    validCandles.sort((a, b) => a.timestamp - b.timestamp);

    return validCandles;
  }

  /**
   * Map timeframe to Alpha Vantage format
   */
  mapTimeframeToAlphaVantage(timeframe) {
    const map = {
      'M1': '1min',
      'M5': '5min',
      'M15': '15min',
      'M30': '30min',
      'H1': '60min',
      'H4': '60min', // Alpha Vantage doesn't have H4, use H1
      'D1': 'Daily',
      'W1': 'Weekly',
    };
    return map[timeframe] || '60min';
  }

  /**
   * Map timeframe to Twelve Data format
   */
  mapTimeframeToTwelveData(timeframe) {
    const map = {
      'M1': '1min',
      'M5': '5min',
      'M15': '15min',
      'M30': '30min',
      'H1': '1h',
      'H4': '4h',
      'D1': '1day',
      'W1': '1week',
    };
    return map[timeframe] || '1h';
  }

  /**
   * Map timeframe to Yahoo format
   */
  mapTimeframeToYahoo(timeframe) {
    const map = {
      'M1': '1m',
      'M5': '5m',
      'M15': '15m',
      'M30': '30m',
      'H1': '1h',
      'H4': '1h', // Yahoo doesn't have 4h
      'D1': '1d',
      'W1': '1wk',
    };
    return map[timeframe] || '1h';
  }

  /**
   * Map symbol to Yahoo format
   */
  mapSymbolToYahoo(symbol) {
    // Metals (check first before forex)
    if (symbol === 'XAUUSD') return 'GC=F';
    if (symbol === 'XAGUSD') return 'SI=F';
    // Indices
    if (symbol === 'US30') return 'YM=F';
    if (symbol === 'US500') return 'ES=F';
    if (symbol === 'US100') return 'NQ=F';
    if (symbol === 'GER40') return 'FDAX';
    if (symbol === 'UK100') return '^FTSE';
    // Forex pairs
    if (symbol.length === 6) {
      return `${symbol.substring(0, 3)}${symbol.substring(3, 6)}=X`;
    }
    
    return symbol;
  }

  /**
   * Get Yahoo range based on timeframe and bars
   */
  getYahooRange(timeframe, bars) {
    const map = {
      'M1': '7d',
      'M5': '60d',
      'M15': '60d',
      'M30': '60d',
      'H1': '2y',
      'H4': '2y',
      'D1': '10y',
      'W1': '10y',
    };
    return map[timeframe] || '2y';
  }

  /**
   * Get supported instruments
   */
  getSupportedInstruments() {
    return SUPPORTED_INSTRUMENTS;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default MarketDataProvider;
