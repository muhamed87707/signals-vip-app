/**
 * BankForecast MongoDB Model
 * Requirements: 2.1, 2.2, 2.3
 */

import mongoose from 'mongoose';

const BankForecastSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    enum: ['JP Morgan', 'Goldman Sachs', 'Citi', 'Morgan Stanley', 'UBS', 'Commerzbank'],
  },
  forecastPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  timeframe: {
    type: String,
    required: true,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Year-End'],
  },
  analystLogic: {
    type: String,
    required: true,
  },
  analyst: {
    type: String,
  },
  createdBy: {
    type: String,
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
BankForecastSchema.index({ bankName: 1, timeframe: 1 });
BankForecastSchema.index({ createdAt: -1 });

// Static method to calculate consensus price
BankForecastSchema.statics.calculateConsensus = async function(timeframe = null) {
  const query = timeframe ? { timeframe } : {};
  const forecasts = await this.find(query);
  
  if (forecasts.length === 0) {
    return null;
  }
  
  const sum = forecasts.reduce((acc, f) => acc + f.forecastPrice, 0);
  return sum / forecasts.length;
};

// Static method to get latest forecasts by bank
BankForecastSchema.statics.getLatestByBank = async function() {
  const banks = ['JP Morgan', 'Goldman Sachs', 'Citi', 'Morgan Stanley', 'UBS', 'Commerzbank'];
  const forecasts = [];
  
  for (const bank of banks) {
    const latest = await this.findOne({ bankName: bank }).sort({ createdAt: -1 });
    if (latest) {
      forecasts.push(latest);
    }
  }
  
  return forecasts;
};

export default mongoose.models.BankForecast || mongoose.model('BankForecast', BankForecastSchema);
