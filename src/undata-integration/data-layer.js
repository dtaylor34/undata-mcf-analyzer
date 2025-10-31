/**
 * Data Layer - UPDATED with Real MCF Catalog
 * Browser-compatible version using localStorage
 * 
 * CHANGES FROM PREVIOUS VERSION:
 * ✅ Line 12: Import real catalog
 * ✅ Line 45: Load real indicator metadata
 * ✅ Line 98: Use real organization data
 * ✅ Line 150: Return real DCIDs and names
 */

import { REAL_CATALOG, getOrganization, getAllOrganizations, getSDGQuarterlyData } from './real-catalog';

// Cache configuration
const CACHE_CONFIG = {
  enabled: true,
  prefix: 'undata_cache_',
  maxAge: 3600000, // 1 hour
  maxSize: 100 // max items in cache
};

// Performance tracking
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  apiCalls: 0,
  totalRequests: 0,
  avgResponseTime: 0
};

/**
 * Main data access function with three-tier fallback
 * Cache → .STAT API → Live Data Commons
 */
export async function getData(orgId, indicatorId, options = {}) {
  const startTime = Date.now();
  performanceMetrics.totalRequests++;

  try {
    // ✅ UPDATED: Load real indicator metadata
    const indicatorMetadata = loadRealIndicator(orgId, indicatorId);
    
    if (!indicatorMetadata) {
      throw new Error(`Indicator ${indicatorId} not found in ${orgId}`);
    }

    // Tier 1: Try cache first
    if (CACHE_CONFIG.enabled && !options.bypassCache) {
      const cached = getCachedData(orgId, indicatorId);
      if (cached) {
        performanceMetrics.cacheHits++;
        recordResponseTime(startTime);
        return {
          source: 'cache',
          data: cached,
          metadata: indicatorMetadata,
          cached: true,
          timestamp: Date.now()
        };
      }
    }

    performanceMetrics.cacheMisses++;

    // Tier 2: Try .STAT API
    try {
      const statData = await fetchFromStatAPI(orgId, indicatorId);
      if (statData) {
        cacheData(orgId, indicatorId, statData);
        recordResponseTime(startTime);
        return {
          source: 'stat',
          data: statData,
          metadata: indicatorMetadata,
          cached: false,
          timestamp: Date.now()
        };
      }
    } catch (statError) {
      console.warn('.STAT API failed, falling back to Data Commons:', statError.message);
    }

    // Tier 3: Fallback to Live Data Commons
    const dcData = await fetchFromDataCommons(orgId, indicatorId);
    cacheData(orgId, indicatorId, dcData);
    recordResponseTime(startTime);
    
    return {
      source: 'datacommons',
      data: dcData,
      metadata: indicatorMetadata,
      cached: false,
      timestamp: Date.now()
    };

  } catch (error) {
    recordResponseTime(startTime);
    throw new Error(`Failed to fetch data for ${indicatorId}: ${error.message}`);
  }
}

/**
 * ✅ NEW: Load real indicator from catalog
 */
function loadRealIndicator(orgId, indicatorId) {
  const org = getOrganization(orgId);
  
  if (!org) {
    return null;
  }

  // Find indicator in org's top indicators
  const indicator = org.topIndicators?.find(i => i.dcid === indicatorId);
  
  return {
    dcid: indicatorId,
    name: indicator ? indicator.name : indicatorId,
    organization: org.name,
    organizationId: orgId,
    emoji: org.emoji,
    totalIndicators: org.totalIndicators,
    quarters: org.quarters || null
  };
}

/**
 * ✅ UPDATED: Get all available indicators for an organization
 */
export function getIndicatorList(orgId) {
  const org = getOrganization(orgId);
  
  if (!org) {
    return [];
  }

  // Return real indicators from catalog
  return org.topIndicators || [];
}

/**
 * ✅ NEW: Get quarterly data for SDG
 */
export function getQuarterlyComparison() {
  return getSDGQuarterlyData();
}

/**
 * ✅ UPDATED: Get catalog statistics
 */
export function getCatalogStats() {
  return {
    totalIndicators: REAL_CATALOG.metadata.totalIndicators,
    organizations: getAllOrganizations().map(org => ({
      id: org.id,
      name: org.name,
      emoji: org.emoji,
      count: org.totalIndicators
    })),
    generated: REAL_CATALOG.metadata.generated,
    source: REAL_CATALOG.metadata.source
  };
}

// ========================================
// CACHE FUNCTIONS
// ========================================

function getCachedData(orgId, indicatorId) {
  if (!CACHE_CONFIG.enabled) return null;

  const cacheKey = `${CACHE_CONFIG.prefix}${orgId}_${indicatorId}`;
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;

    if (age > CACHE_CONFIG.maxAge) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Cache parse error:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function cacheData(orgId, indicatorId, data) {
  if (!CACHE_CONFIG.enabled) return;

  const cacheKey = `${CACHE_CONFIG.prefix}${orgId}_${indicatorId}`;
  const cacheEntry = {
    data,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    enforceMaxCacheSize();
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

function enforceMaxCacheSize() {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(CACHE_CONFIG.prefix)
  );

  if (keys.length <= CACHE_CONFIG.maxSize) return;

  // Remove oldest entries
  const entries = keys.map(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return { key, timestamp: data.timestamp };
    } catch {
      return { key, timestamp: 0 };
    }
  });

  entries.sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = entries.slice(0, entries.length - CACHE_CONFIG.maxSize);
  toRemove.forEach(entry => localStorage.removeItem(entry.key));
}

export function clearCache() {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(CACHE_CONFIG.prefix)
  );
  keys.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keys.length} cache entries`);
}

// ========================================
// API FUNCTIONS
// ========================================

async function fetchFromStatAPI(orgId, indicatorId) {
  performanceMetrics.apiCalls++;

  // Simulate .STAT API call (replace with real endpoint)
  // Example: https://data.un.org/api/sdmx/data/...
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For now, return null to trigger fallback
      // In production, implement actual .STAT API call
      resolve(null);
    }, 100);
  });
}

async function fetchFromDataCommons(orgId, indicatorId) {
  performanceMetrics.apiCalls++;

  // Simulate Data Commons API call (replace with real endpoint)
  // Example: https://datacommons.undata.org/api/...
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate sample data for visualization
      // In production, fetch from actual Data Commons API
      const data = generateSampleTimeSeriesData();
      resolve(data);
    }, 500);
  });
}

function generateSampleTimeSeriesData() {
  const years = [2018, 2019, 2020, 2021, 2022, 2023];
  return years.map(year => ({
    year,
    value: Math.floor(Math.random() * 100) + 50,
    label: year.toString()
  }));
}

// ========================================
// PERFORMANCE TRACKING
// ========================================

function recordResponseTime(startTime) {
  const responseTime = Date.now() - startTime;
  const { avgResponseTime, totalRequests } = performanceMetrics;
  
  performanceMetrics.avgResponseTime = 
    (avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
}

export function getPerformanceMetrics() {
  const cacheHitRate = performanceMetrics.totalRequests > 0
    ? (performanceMetrics.cacheHits / performanceMetrics.totalRequests) * 100
    : 0;

  return {
    ...performanceMetrics,
    cacheHitRate: cacheHitRate.toFixed(2) + '%',
    avgResponseTime: Math.round(performanceMetrics.avgResponseTime) + 'ms'
  };
}

export function resetMetrics() {
  performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
    totalRequests: 0,
    avgResponseTime: 0
  };
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Search indicators across all organizations
 */
export function searchIndicators(query) {
  const results = [];
  const searchTerm = query.toLowerCase();

  for (const org of getAllOrganizations()) {
    for (const indicator of org.topIndicators || []) {
      if (
        indicator.name.toLowerCase().includes(searchTerm) ||
        indicator.dcid.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          ...indicator,
          organization: org.name,
          orgId: org.id,
          emoji: org.emoji
        });
      }
    }
  }

  return results;
}

/**
 * Get organization summary
 */
export function getOrganizationSummary() {
  return getAllOrganizations().map(org => ({
    id: org.id,
    name: org.name,
    emoji: org.emoji,
    totalIndicators: org.totalIndicators,
    hasQuarterly: !!org.quarters,
    quarters: org.quarters ? Object.keys(org.quarters) : []
  }));
}

/**
 * Validate indicator exists
 */
export function indicatorExists(orgId, indicatorId) {
  const org = getOrganization(orgId);
  if (!org) return false;
  
  return org.topIndicators?.some(i => i.dcid === indicatorId) || false;
}

// Export configuration for external access
export const config = CACHE_CONFIG;
