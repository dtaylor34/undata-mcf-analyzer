/**
 * FILE: src/utils/environment-config.js
 * PURPOSE: Environment configuration for UN Data deployments
 * 
 * FEATURES:
 * - Multiple environment support (Staging, Test, Production)
 * - Environment switching in UI
 * - localStorage persistence
 */

/**
 * Available environments for UN Data charts
 */
export const ENVIRONMENTS = {
  STAGING: {
    id: 'staging',
    name: 'Staging',
    baseUrl: 'https://staging.undatacommons.dev/UNSDWebsite/undatacommons',
    description: 'Preview environment with latest changes',
    color: 'orange',
    icon: '🔶'
  },
  TEST: {
    id: 'test',
    name: 'Test',
    baseUrl: 'https://test.undatacommons.dev/UNSDWebsite/undatacommons',
    description: 'Testing environment for validation',
    color: 'blue',
    icon: '🧪'
  },
  PRODUCTION: {
    id: 'production',
    name: 'Production',
    baseUrl: 'https://data.un.org/UNSDWebsite/undatacommons',
    description: 'Live production environment',
    color: 'green',
    icon: '🌍'
  }
};

/**
 * Default environment
 */
export const DEFAULT_ENVIRONMENT = ENVIRONMENTS.STAGING.id;

/**
 * LocalStorage key for environment preference
 */
const STORAGE_KEY = 'undata_mcf_environment';

/**
 * Get current environment setting
 * @returns {string} - Environment ID (staging, test, production)
 */
export function getCurrentEnvironment() {
  if (typeof window === 'undefined') return DEFAULT_ENVIRONMENT;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ENVIRONMENTS[stored.toUpperCase()]) {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read environment preference:', e);
  }
  
  return DEFAULT_ENVIRONMENT;
}

/**
 * Set environment preference
 * @param {string} environmentId - Environment ID to set
 * @returns {boolean} - Success status
 */
export function setEnvironment(environmentId) {
  if (typeof window === 'undefined') return false;
  
  const envKey = environmentId.toUpperCase();
  if (!ENVIRONMENTS[envKey]) {
    console.error(`Invalid environment: ${environmentId}`);
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, environmentId);
    console.log(`✅ Environment set to: ${ENVIRONMENTS[envKey].name}`);
    return true;
  } catch (e) {
    console.error('Failed to save environment preference:', e);
    return false;
  }
}

/**
 * Get environment configuration
 * @param {string} environmentId - Environment ID (optional, uses current if not provided)
 * @returns {object} - Environment config object
 */
export function getEnvironmentConfig(environmentId = null) {
  const envId = environmentId || getCurrentEnvironment();
  const envKey = envId.toUpperCase();
  
  return ENVIRONMENTS[envKey] || ENVIRONMENTS.STAGING;
}

/**
 * Get base URL for current environment
 * @param {string} environmentId - Environment ID (optional)
 * @returns {string} - Base URL
 */
export function getEnvironmentBaseUrl(environmentId = null) {
  const config = getEnvironmentConfig(environmentId);
  return config.baseUrl;
}

/**
 * Get all available environments as array
 * @returns {Array} - Array of environment objects
 */
export function getAllEnvironments() {
  return Object.values(ENVIRONMENTS);
}

/**
 * Check if environment exists
 * @param {string} environmentId - Environment ID to check
 * @returns {boolean}
 */
export function isValidEnvironment(environmentId) {
  return ENVIRONMENTS[environmentId.toUpperCase()] !== undefined;
}

/**
 * Get environment color for UI
 * @param {string} environmentId - Environment ID
 * @returns {string} - Tailwind color name
 */
export function getEnvironmentColor(environmentId = null) {
  const config = getEnvironmentConfig(environmentId);
  return config.color;
}

/**
 * Get environment icon
 * @param {string} environmentId - Environment ID
 * @returns {string} - Emoji icon
 */
export function getEnvironmentIcon(environmentId = null) {
  const config = getEnvironmentConfig(environmentId);
  return config.icon;
}

/**
 * Build chart URL for specific environment
 * @param {object} params - Chart parameters
 * @param {string} params.variableId - Statistical variable ID
 * @param {string} params.organization - Organization code
 * @param {string} params.themeId - Theme ID
 * @param {string} params.categoryId - Category ID
 * @param {string} params.mode - View mode (carousel/explore)
 * @param {string} environmentId - Target environment (optional, uses current)
 * @returns {string} - Complete chart URL
 */
export function buildEnvironmentChartUrl(params, environmentId = null) {
  const baseUrl = getEnvironmentBaseUrl(environmentId);
  const { organization, categoryId, variableId, themeId, mode = 'carousel' } = params;
  
  // Base64 encode the path component
  const pathComponent = btoa(`Earth&0&${organization}&`);
  
  // Build hash (use + as separator, not _)
  const hash = `#${mode}+${categoryId}+dc/svpg/${variableId}+dc/topic/${themeId}`;
  
  return `${baseUrl}/areas/${pathComponent}${hash}`;
}

