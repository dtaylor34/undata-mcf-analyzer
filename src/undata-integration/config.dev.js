/**
 * Development Configuration - Browser Version
 * 
 * Location: src/undata-integration/config.dev.js
 */

const config = {
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    autoSave: true,
    maxSize: 10 * 1024 * 1024 // 10 MB max cache size
  },

  // API endpoints
  api: {
    dataCommons: process.env.REACT_APP_DC_API_ENDPOINT || 'https://datacommons.org/api',
    stat: process.env.REACT_APP_STAT_API_ENDPOINT || 'https://data.un.org/api',
    timeout: 10000, // 10 seconds
    retries: 3
  },

  // Data layer behavior
  dataLayer: {
    preferCache: true, // Try cache first
    fallbackToStat: true, // Fall back to .STAT if cache misses
    fallbackToDC: true, // Fall back to Data Commons if .STAT fails
    refreshInterval: 24 * 60 * 60 * 1000 // Refresh cache daily
  },

  // Development features
  dev: {
    verbose: true, // Log detailed information
    mockData: true, // Use mock data for development
    simulateLatency: 100 // Simulate 100ms API latency
  }
};

export default config;
