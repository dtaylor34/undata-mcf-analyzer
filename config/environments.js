/**
 * Multi-Environment Configuration
 * Test, Staging, and Production settings
 */

const BASE_CONFIG = {
  cache: {
    enabled: true,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 10 * 1024 * 1024 // 10 MB
  },
  api: {
    timeout: 30000,
    retries: 3
  }
};

export const ENVIRONMENTS = {
  test: {
    ...BASE_CONFIG,
    name: 'Test',
    urls: {
      stat: 'https://test-nsi-undata-dst.dev.officialstatistics.org',
      datacommons: 'https://test-datacommons.undata.org',
      website: 'https://test-data.un.org'
    },
    api: {
      ...BASE_CONFIG.api,
      stat: 'https://test-nsi-undata-dst.dev.officialstatistics.org/rest',
      datacommons: 'https://test-datacommons.undata.org/api'
    },
    features: {
      mockData: true,
      verbose: true,
      experimentalFeatures: true
    }
  },
  
  staging: {
    ...BASE_CONFIG,
    name: 'Staging',
    urls: {
      stat: 'https://staging-nsi-undata-dst.dev.officialstatistics.org',
      datacommons: 'https://staging-datacommons.undata.org',
      website: 'https://staging-data.un.org'
    },
    api: {
      ...BASE_CONFIG.api,
      stat: 'https://staging-nsi-undata-dst.dev.officialstatistics.org/rest',
      datacommons: 'https://staging-datacommons.undata.org/api'
    },
    features: {
      mockData: false,
      verbose: true,
      experimentalFeatures: true
    }
  },
  
  production: {
    ...BASE_CONFIG,
    name: 'Production',
    urls: {
      stat: 'https://de-undata-dst.dev.officialstatistics.org',
      datacommons: 'https://datacommons.undata.org',
      website: 'https://data.un.org'
    },
    api: {
      ...BASE_CONFIG.api,
      stat: 'https://nsi-reset-undata-dst.dev.officialstatistics.org/rest',
      datacommons: 'https://datacommons.undata.org/api'
    },
    features: {
      mockData: false,
      verbose: false,
      experimentalFeatures: false
    },
    monitoring: {
      enabled: true,
      errorTracking: true
    }
  }
};

export function getEnvironmentConfig(env = 'staging') {
  return ENVIRONMENTS[env] || ENVIRONMENTS.staging;
}

export function getCurrentEnvironment() {
  // Detect from hostname or environment variable
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (hostname.includes('test')) return 'test';
  if (hostname.includes('staging')) return 'staging';
  if (hostname.includes('data.un.org')) return 'production';
  
  // Default to staging for local development
  return process.env.NODE_ENV === 'production' ? 'production' : 'staging';
}

