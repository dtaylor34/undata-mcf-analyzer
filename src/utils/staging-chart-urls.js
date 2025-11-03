/**
 * FILE: src/utils/staging-chart-urls.js
 * PURPOSE: Generate URLs for live UN Data charts (Staging, Test, Production)
 * 
 * FEATURES:
 * - Convert MCF variable IDs to live chart URLs
 * - Support for carousel (chart view) and explorer modes
 * - Handle ILO, WHO, UNICEF, SDG organizations
 * - Multi-environment support (Staging, Test, Production)
 */

import { buildEnvironmentChartUrl, getCurrentEnvironment } from './environment-config';

/**
 * Extract the statistical variable ID from various MCF formats
 * @param {string} variableId - Full variable ID (e.g., "dcid:undata/ilo/EES_XPLV_RT.00135.001")
 * @returns {string} - Clean variable ID for URL (e.g., "EES_XPLV_RT.00135.001")
 */
export function extractVariableId(variableId) {
  if (!variableId) return null;
  
  // Remove "dcid:" prefix if present
  let cleaned = variableId.replace(/^dcid:/, '');
  
  // Extract just the indicator code after the organization
  // Pattern: undata/{org}/{indicator_code}
  const match = cleaned.match(/undata\/[^\/]+\/(.+)/);
  if (match) {
    return match[1];
  }
  
  return cleaned;
}

/**
 * Get organization code from variable ID
 * @param {string} variableId - Full variable ID
 * @returns {string} - Organization code (ILO, WHO, UNICEF, SDG)
 */
export function getOrganizationFromVariable(variableId) {
  if (!variableId) return null;
  
  const upperVar = variableId.toUpperCase();
  
  if (upperVar.includes('/ILO/')) return 'ILO';
  if (upperVar.includes('/WHO/')) return 'WHO';
  if (upperVar.includes('/UNICEF/')) return 'UNICEF';
  if (upperVar.includes('/SDG/')) return 'SDG';
  
  return null;
}

/**
 * Generate chart URL for a specific environment (Staging, Test, or Production)
 * @param {object} params - Chart parameters
 * @param {string} params.variableId - Statistical variable ID
 * @param {string} params.organization - Organization code (ILO, WHO, etc.)
 * @param {string} params.themeId - UN theme ID (optional)
 * @param {string} params.categoryId - Category ID (optional)
 * @param {string} params.mode - 'carousel' (default) or 'explore'
 * @param {string} environmentId - Target environment (staging/test/production), uses current if not provided
 * @returns {string|null} - Full chart URL or null if cannot generate
 */
export function generateStagingChartUrl({ variableId, organization, themeId, categoryId, mode = 'carousel' }, environmentId = null) {
  if (!variableId) return null;
  
  // Extract clean variable ID
  const cleanVarId = extractVariableId(variableId);
  if (!cleanVarId) return null;
  
  // Determine organization if not provided
  const org = organization || getOrganizationFromVariable(variableId);
  if (!org) return null;
  
  // Default category and theme if not provided
  const category = categoryId || '422725642'; // Default: Child protection
  const theme = themeId || 'UN_SUB_THEME_25';
  
  // Use environment-aware URL builder
  return buildEnvironmentChartUrl({
    variableId: cleanVarId,
    organization: org,
    categoryId: category,
    themeId: theme,
    mode
  }, environmentId);
}

/**
 * Known chart mappings for ILO indicators
 * Maps statistical variable IDs to their theme and category
 */
export const ILO_CHART_MAPPINGS = {
  // Parental Leave Indicators
  'undata/ilo/EES_XPLV_RT.00135.001': {
    title: 'Share of Employees With Access to Parental Leave',
    themeId: 'UN_SUB_THEME_25',
    categoryId: '422725642',
    category: 'Child protection',
    thematicArea: 'Children and Youth'
  },
  'undata/ilo/EES_XPLV_RT.00136.001': {
    title: 'Share of Employees With Access to Parental Leave, by Sex',
    themeId: 'UN_SUB_THEME_25',
    categoryId: '422725642',
    category: 'Child protection',
    thematicArea: 'Children and Youth'
  },
  
  // Employment Indicators
  'undata/ilo/EMP_TEMP_SEX_AGE_NB': {
    title: 'Employment by Sex and Age',
    themeId: 'UN_SUB_THEME_42',
    categoryId: '1113442900',
    category: 'Work and employment',
    thematicArea: 'Economic development'
  },
  'undata/ilo/UNE_DEAP_SEX_AGE_RT': {
    title: 'Unemployment Rate by Sex and Age',
    themeId: 'UN_SUB_THEME_42',
    categoryId: '1113442900',
    category: 'Work and employment',
    thematicArea: 'Economic development'
  }
};

/**
 * Get chart metadata from mapping
 * @param {string} variableId - Statistical variable ID
 * @returns {object|null} - Chart metadata or null
 */
export function getChartMapping(variableId) {
  if (!variableId) return null;
  
  // Try exact match first
  if (ILO_CHART_MAPPINGS[variableId]) {
    return ILO_CHART_MAPPINGS[variableId];
  }
  
  // Try without "dcid:" prefix
  const cleaned = variableId.replace(/^dcid:/, '');
  if (ILO_CHART_MAPPINGS[cleaned]) {
    return ILO_CHART_MAPPINGS[cleaned];
  }
  
  return null;
}

/**
 * Generate chart URL with automatic mapping lookup (respects current environment)
 * @param {string} variableId - Statistical variable ID
 * @param {string} organization - Organization code (optional, will be detected)
 * @param {string} environmentId - Target environment (optional, uses current)
 * @returns {string|null} - Full chart URL or null
 */
export function generateStagingUrlAuto(variableId, organization = null, environmentId = null) {
  if (!variableId) return null;
  
  // Look up mapping
  const mapping = getChartMapping(variableId);
  const org = organization || getOrganizationFromVariable(variableId);
  
  if (mapping) {
    // Use mapped values and current/specified environment
    return generateStagingChartUrl({
      variableId,
      organization: org,
      themeId: mapping.themeId,
      categoryId: mapping.categoryId
    }, environmentId);
  }
  
  // No mapping found - return null (cannot generate URL without theme/category)
  return null;
}

/**
 * Check if a variable has a known staging chart
 * @param {string} variableId - Statistical variable ID
 * @returns {boolean}
 */
export function hasStagingChart(variableId) {
  return getChartMapping(variableId) !== null;
}

