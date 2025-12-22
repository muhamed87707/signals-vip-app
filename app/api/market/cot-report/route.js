import { NextResponse } from 'next/server';

// Cache for COT data
let cachedCOTData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour (COT updates weekly on Friday)

/**
 * Fetch REAL COT data from CFTC
 * Gold futures contract code: 088691 (COMEX Gold)
 * Data source: CFTC Commitment of Traders Report
 */
async function fetchCOTData() {
    // Try multiple sources for real COT data
    
    // Source 1: Quandl/NASDAQ Data Link
    try {
        const response = await fetch(
            'https://data.nasdaq.com/api/v3/datasets/CFTC/088691_FO_ALL.json?rows=52',
            { next: { revalidate: 3600 } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data?.dataset?.data && data.dataset.data.length > 0) {
                return parseCFTCData(data);
            }
        }
    } catch (error) {
        console.error('NASDAQ Data Link API error:', error.message);
    }

    // Source 2: Try alternative CFTC data source
    try {
        const response = await fetch(
            'https://publicreporting.cftc.gov/resource/6dca-aqww.json?$where=cftc_contract_market_code=%27088691%27&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=52',
            { next: { revalidate: 3600 } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return parseCFTCDirectData(data);
            }
        }
    } catch (error) {
        console.error('CFTC Direct API error:', error.message);
    }

    // NO FALLBACK - Return empty data with error flag
    return {
        error: true,
        message: 'Unable to fetch real COT data from CFTC',
        reportDate: null,
        commercial: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
        nonCommercial: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
        smallSpeculators: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
        openInterest: { total: 0, change: 0 },
        cotIndex: { value: '0', signal: 'unavailable', min52w: 0, max52w: 0 },
        historicalData: [],
        source: 'CFTC - DATA UNAVAILABLE',
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Parse CFTC data from NASDAQ Data Link format
 */
function parseCFTCData(data) {
    const columns = data.dataset.column_names;
    const rows = data.dataset.data;
    
    // Find column indices
    const dateIdx = columns.indexOf('Date');
    const commercialLongIdx = columns.indexOf('Commercial Long');
    const commercialShortIdx = columns.indexOf('Commercial Short');
    const nonCommercialLongIdx = columns.indexOf('Noncommercial Long');
    const nonCommercialShortIdx = columns.indexOf('Noncommercial Short');
    const openInterestIdx = columns.indexOf('Open Interest');
    
    const latestRow = rows[0];
    const previousRow = rows[1] || latestRow;

    // Calculate positions
    const commercialLong = latestRow[commercialLongIdx] || 0;
    const commercialShort = latestRow[commercialShortIdx] || 0;
    const nonCommercialLong = latestRow[nonCommercialLongIdx] || 0;
    const nonCommercialShort = latestRow[nonCommercialShortIdx] || 0;
    const openInterest = latestRow[openInterestIdx] || 0;

    const prevCommercialLong = previousRow[commercialLongIdx] || 0;
    const prevCommercialShort = previousRow[commercialShortIdx] || 0;
    const prevNonCommercialLong = previousRow[nonCommercialLongIdx] || 0;
    const prevNonCommercialShort = previousRow[nonCommercialShortIdx] || 0;
    const prevOpenInterest = previousRow[openInterestIdx] || 0;

    const commercialNet = commercialLong - commercialShort;
    const nonCommercialNet = nonCommercialLong - nonCommercialShort;
    const prevCommercialNet = prevCommercialLong - prevCommercialShort;
    const prevNonCommercialNet = prevNonCommercialLong - prevNonCommercialShort;

    // Calculate 52-week range for COT Index
    const nonCommercialNets = rows.map(r => (r[nonCommercialLongIdx] || 0) - (r[nonCommercialShortIdx] || 0));
    const min52w = Math.min(...nonCommercialNets);
    const max52w = Math.max(...nonCommercialNets);
    const cotIndex = max52w !== min52w ? ((nonCommercialNet - min52w) / (max52w - min52w)) * 100 : 50;

    // Historical data
    const historicalData = rows.slice(0, 52).map(row => ({
        date: row[dateIdx],
        nonCommercialNet: (row[nonCommercialLongIdx] || 0) - (row[nonCommercialShortIdx] || 0),
        commercialNet: (row[commercialLongIdx] || 0) - (row[commercialShortIdx] || 0),
        openInterest: row[openInterestIdx] || 0
    })).reverse();

    return {
        error: false,
        reportDate: latestRow[dateIdx],
        releaseDate: latestRow[dateIdx], // CFTC releases on Friday for Tuesday data
        contract: 'Gold (COMEX)',
        contractCode: '088691',
        
        commercial: {
            long: commercialLong,
            short: commercialShort,
            net: commercialNet,
            change: commercialNet - prevCommercialNet,
            percentLong: ((commercialLong / (commercialLong + commercialShort)) * 100).toFixed(1)
        },
        
        nonCommercial: {
            long: nonCommercialLong,
            short: nonCommercialShort,
            net: nonCommercialNet,
            change: nonCommercialNet - prevNonCommercialNet,
            percentLong: ((nonCommercialLong / (nonCommercialLong + nonCommercialShort)) * 100).toFixed(1)
        },
        
        smallSpeculators: {
            long: 0, // Not available in this dataset
            short: 0,
            net: 0,
            change: 0,
            percentLong: '0'
        },
        
        openInterest: {
            total: openInterest,
            change: openInterest - prevOpenInterest
        },
        
        cotIndex: {
            value: cotIndex.toFixed(1),
            signal: cotIndex > 80 ? 'extreme_bullish' : 
                    cotIndex > 60 ? 'bullish' :
                    cotIndex < 20 ? 'extreme_bearish' :
                    cotIndex < 40 ? 'bearish' : 'neutral',
            min52w,
            max52w
        },
        
        historicalData,
        source: 'CFTC Commitment of Traders (via NASDAQ Data Link)',
        dataDate: latestRow[dateIdx],
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Parse CFTC direct API data
 */
function parseCFTCDirectData(data) {
    const latest = data[0];
    const previous = data[1] || latest;

    const commercialLong = parseInt(latest.comm_positions_long_all) || 0;
    const commercialShort = parseInt(latest.comm_positions_short_all) || 0;
    const nonCommercialLong = parseInt(latest.noncomm_positions_long_all) || 0;
    const nonCommercialShort = parseInt(latest.noncomm_positions_short_all) || 0;
    const openInterest = parseInt(latest.open_interest_all) || 0;

    const prevCommercialLong = parseInt(previous.comm_positions_long_all) || 0;
    const prevCommercialShort = parseInt(previous.comm_positions_short_all) || 0;
    const prevNonCommercialLong = parseInt(previous.noncomm_positions_long_all) || 0;
    const prevNonCommercialShort = parseInt(previous.noncomm_positions_short_all) || 0;
    const prevOpenInterest = parseInt(previous.open_interest_all) || 0;

    const commercialNet = commercialLong - commercialShort;
    const nonCommercialNet = nonCommercialLong - nonCommercialShort;
    const prevCommercialNet = prevCommercialLong - prevCommercialShort;
    const prevNonCommercialNet = prevNonCommercialLong - prevNonCommercialShort;

    // Calculate 52-week range
    const nonCommercialNets = data.map(d => 
        (parseInt(d.noncomm_positions_long_all) || 0) - (parseInt(d.noncomm_positions_short_all) || 0)
    );
    const min52w = Math.min(...nonCommercialNets);
    const max52w = Math.max(...nonCommercialNets);
    const cotIndex = max52w !== min52w ? ((nonCommercialNet - min52w) / (max52w - min52w)) * 100 : 50;

    const historicalData = data.slice(0, 52).map(d => ({
        date: d.report_date_as_yyyy_mm_dd,
        nonCommercialNet: (parseInt(d.noncomm_positions_long_all) || 0) - (parseInt(d.noncomm_positions_short_all) || 0),
        commercialNet: (parseInt(d.comm_positions_long_all) || 0) - (parseInt(d.comm_positions_short_all) || 0),
        openInterest: parseInt(d.open_interest_all) || 0
    })).reverse();

    return {
        error: false,
        reportDate: latest.report_date_as_yyyy_mm_dd,
        releaseDate: latest.report_date_as_yyyy_mm_dd,
        contract: 'Gold (COMEX)',
        contractCode: '088691',
        
        commercial: {
            long: commercialLong,
            short: commercialShort,
            net: commercialNet,
            change: commercialNet - prevCommercialNet,
            percentLong: ((commercialLong / (commercialLong + commercialShort)) * 100).toFixed(1)
        },
        
        nonCommercial: {
            long: nonCommercialLong,
            short: nonCommercialShort,
            net: nonCommercialNet,
            change: nonCommercialNet - prevNonCommercialNet,
            percentLong: ((nonCommercialLong / (nonCommercialLong + nonCommercialShort)) * 100).toFixed(1)
        },
        
        smallSpeculators: {
            long: 0,
            short: 0,
            net: 0,
            change: 0,
            percentLong: '0'
        },
        
        openInterest: {
            total: openInterest,
            change: openInterest - prevOpenInterest
        },
        
        cotIndex: {
            value: cotIndex.toFixed(1),
            signal: cotIndex > 80 ? 'extreme_bullish' : 
                    cotIndex > 60 ? 'bullish' :
                    cotIndex < 20 ? 'extreme_bearish' :
                    cotIndex < 40 ? 'bearish' : 'neutral',
            min52w,
            max52w
        },
        
        historicalData,
        source: 'CFTC Commitment of Traders (Direct)',
        dataDate: latest.report_date_as_yyyy_mm_dd,
        lastUpdated: new Date().toISOString()
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        // Return cached data if valid
        if (!forceRefresh && cachedCOTData && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({
                ...cachedCOTData,
                cached: true
            });
        }

        // Fetch fresh data
        const cotData = await fetchCOTData();
        
        // Update cache only if we got real data
        if (!cotData.error) {
            cachedCOTData = cotData;
            lastFetchTime = now;
        }

        return NextResponse.json(cotData);
    } catch (error) {
        console.error('COT Report API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch COT data: ' + error.message,
            reportDate: null,
            commercial: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
            nonCommercial: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
            smallSpeculators: { long: 0, short: 0, net: 0, change: 0, percentLong: '0' },
            openInterest: { total: 0, change: 0 },
            cotIndex: { value: '0', signal: 'unavailable', min52w: 0, max52w: 0 },
            historicalData: [],
            source: 'CFTC - ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
