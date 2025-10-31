/**
 * Production Configuration
 * 
 * Use this configuration for production deployment
 * IMPORTANT: Set environment variables for sensitive data
 */

module.exports = {
  // Cache configuration
  cache: {
    enabled: true,
    
    // Primary cache: File-based
    path: './catalog-ui-cache.json',
    maxAge: 3600000, // 1 hour
    
    // Secondary cache: Redis for distributed systems
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      ttl: 3600, // 1 hour TTL
      keyPrefix: 'undata:cache:'
    },
    
    // Auto-save settings
    autoSave: true,
    saveInterval: 300000, // Save every 5 minutes
    
    // Backup settings
    backup: {
      enabled: true,
      path: './backups',
      maxBackups: 10,
      interval: 86400000 // Daily backups
    }
  },

  // .STAT API configuration
  stat: {
    baseURL: process.env.STAT_API_URL || 'https://data.un.org/api/v1',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 2000,
    
    // Rate limiting
    rateLimit: {
      maxRequests: 100,
      perMinutes: 1
    },
    
    // Circuit breaker
    circuitBreaker: {
      enabled: true,
      threshold: 5, // Open after 5 failures
      timeout: 60000, // Try again after 1 minute
      resetTimeout: 300000 // Full reset after 5 minutes
    }
  },

  // Data Commons configuration
  dataCommons: {
    baseURL: process.env.DC_API_URL || 'https://datacommons.undata.org/api',
    apiKey: process.env.DC_API_KEY, // Required in production!
    timeout: 30000,
    
    // Connection pool
    pool: {
      maxSockets: 50,
      keepAlive: true,
      keepAliveMsecs: 1000
    },
    
    // Retry configuration
    retries: 3,
    retryDelay: 2000,
    
    // Rate limiting
    rateLimit: {
      maxRequests: 500,
      perMinutes: 1
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    console: false, // Don't log to console in production
    
    // File logging
    file: {
      enabled: true,
      path: process.env.LOG_PATH || './logs/production.log',
      maxSize: '20m',
      maxFiles: 10,
      compress: true
    },
    
    // Error tracking (e.g., Sentry)
    errorTracking: {
      enabled: process.env.SENTRY_DSN != null,
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      sampleRate: 1.0
    }
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    
    // APM (e.g., New Relic, Datadog)
    apm: {
      enabled: process.env.APM_ENABLED === 'true',
      serviceName: 'undata-integration',
      serverUrl: process.env.APM_SERVER_URL,
      secretToken: process.env.APM_SECRET_TOKEN
    },
    
    // Metrics
    metrics: {
      enabled: true,
      port: parseInt(process.env.METRICS_PORT) || 9090,
      endpoint: '/metrics'
    },
    
    // Health checks
    healthCheck: {
      enabled: true,
      port: parseInt(process.env.HEALTH_CHECK_PORT) || 8080,
      endpoint: '/health'
    }
  },

  // Security
  security: {
    // API key validation
    validateApiKeys: true,
    
    // CORS settings
    cors: {
      enabled: true,
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['https://datacommons.undata.org'],
      allowedMethods: ['GET', 'POST'],
      allowCredentials: true
    },
    
    // Rate limiting (application level)
    rateLimit: {
      enabled: true,
      maxRequests: 1000,
      windowMs: 60000, // 1 minute
      message: 'Too many requests, please try again later'
    },
    
    // Request validation
    validation: {
      maxQuerySize: 10000,
      maxResponseSize: 10485760, // 10MB
      sanitizeInput: true
    }
  },

  // Performance optimization
  performance: {
    // Response compression
    compression: {
      enabled: true,
      level: 6 // Balance between speed and compression
    },
    
    // Request pooling
    pooling: {
      enabled: true,
      maxPoolSize: 100,
      timeout: 5000
    },
    
    // Batch processing
    batching: {
      enabled: true,
      maxBatchSize: 50,
      batchDelay: 100 // ms
    }
  },

  // Graceful shutdown
  shutdown: {
    timeout: 30000, // 30 seconds to complete ongoing requests
    forceTimeout: 35000, // Force shutdown after 35 seconds
    signals: ['SIGTERM', 'SIGINT']
  },

  // Feature flags
  features: {
    advancedSearch: true,
    disaggregations: true,
    chartExport: true,
    realTimeData: false, // Enable when ready
    experimentalAPIs: false
  }
};
