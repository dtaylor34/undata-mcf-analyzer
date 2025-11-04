/**
 * FILE: src/utils/cache-generator.js
 * PURPOSE: Generate optimized JSON cache files from MCF content
 * 
 * FEATURES:
 * - Parse MCF and extract observations
 * - Generate country-specific cache files
 * - Generate SDG-specific cache files
 * - Generate theme-specific cache files
 * - Generate partner-specific cache files
 * - Generate comparison files
 */

import { parseMCF, extractStatisticalVariables, extractObservations } from '../mcf-parser';

/**
 * Main cache generation orchestrator
 * @param {string} mcfContent - MCF file content
 * @param {string} organization - Organization name (ilo, sdg, unicef, who)
 * @param {string} versionId - Version identifier
 * @returns {Promise<Object>} - Generation results
 */
export async function generateAllCaches(mcfContent, organization, versionId) {
  console.log(`🚀 Starting cache generation for ${organization} ${versionId}`);
  
  const startTime = Date.now();
  const results = {
    success: true,
    organization,
    versionId,
    timestamp: new Date().toISOString(),
    stats: {
      countriesGenerated: 0,
      sdgsGenerated: 0,
      themesGenerated: 0,
      partnersGenerated: 0,
      totalFiles: 0,
      totalSize: 0
    },
    files: [],
    errors: []
  };
  
  try {
    // Parse MCF content
    console.log('📊 Parsing MCF content...');
    const nodes = parseMCF(mcfContent);
    const variables = extractStatisticalVariables(nodes);
    const observations = extractObservations(nodes);
    
    console.log(`✅ Parsed: ${nodes.length} nodes, ${variables.length} variables, ${observations.length} observations`);
    
    if (observations.length === 0) {
      throw new Error('No observations found in MCF content');
    }
    
    // Generate caches
    const countryCache = await generateCountryCache(observations, variables, organization);
    const sdgCache = await generateSDGCache(observations, variables, organization);
    const themeCache = await generateThemeCache(observations, variables, organization);
    const partnerCache = await generatePartnerCache(observations, variables, organization);
    
    // Combine results
    results.stats.countriesGenerated = countryCache.files.length;
    results.stats.sdgsGenerated = sdgCache.files.length;
    results.stats.themesGenerated = themeCache.files.length;
    results.stats.partnersGenerated = partnerCache.files.length;
    results.stats.totalFiles = countryCache.files.length + sdgCache.files.length + themeCache.files.length + partnerCache.files.length;
    
    results.files = [
      ...countryCache.files,
      ...sdgCache.files,
      ...themeCache.files,
      ...partnerCache.files
    ];
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Cache generation complete in ${duration}s`);
    console.log(`📁 Generated ${results.stats.totalFiles} files`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Cache generation failed:', error);
    results.success = false;
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Generate country-specific cache files
 */
export async function generateCountryCache(observations, variables, organization) {
  console.log('🌍 Generating country cache...');
  
  const countryMap = new Map();
  
  // Group observations by country
  observations.forEach(obs => {
    const country = obs.observationAbout || obs.location || 'Unknown';
    
    if (!countryMap.has(country)) {
      countryMap.set(country, {
        country: extractCountryName(country),
        countryCode: extractCountryCode(country),
        lastUpdated: new Date().toISOString(),
        sources: new Set(),
        indicators: [],
        trends: {}
      });
    }
    
    const countryData = countryMap.get(country);
    countryData.sources.add(organization.toUpperCase());
    
    // Find variable metadata
    const variable = variables.find(v => v.id === obs.variableMeasured);
    
    const indicator = {
      id: obs.variableMeasured,
      name: variable?.name || obs.variableMeasured,
      value: parseFloat(obs.value) || obs.value,
      unit: obs.unit || variable?.unit || '',
      year: parseInt(obs.observationDate) || new Date().getFullYear(),
      source: organization.toUpperCase(),
      metadata: variable?.metadata || {}
    };
    
    countryData.indicators.push(indicator);
    
    // Build trends
    const trendKey = obs.variableMeasured;
    if (!countryData.trends[trendKey]) {
      countryData.trends[trendKey] = [];
    }
    countryData.trends[trendKey].push({
      year: indicator.year,
      value: indicator.value
    });
  });
  
  // Convert to array and create files
  const files = [];
  
  for (const [countryId, data] of countryMap.entries()) {
    data.sources = Array.from(data.sources);
    
    // Sort trends by year
    Object.keys(data.trends).forEach(key => {
      data.trends[key].sort((a, b) => a.year - b.year);
    });
    
    const countryCode = data.countryCode || sanitizeFilename(countryId);
    const filename = `${countryCode}.json`;
    const path = `cache/locations/by-country/${filename}`;
    
    files.push({
      path,
      filename,
      content: JSON.stringify(data, null, 2),
      size: JSON.stringify(data).length,
      type: 'country'
    });
  }
  
  console.log(`✅ Generated ${files.length} country cache files`);
  
  return { files };
}

/**
 * Generate SDG-specific cache files
 */
export async function generateSDGCache(observations, variables, organization) {
  console.log('🎯 Generating SDG cache...');
  
  const sdgMap = new Map();
  
  // Group observations by SDG goal
  observations.forEach(obs => {
    const variable = variables.find(v => v.id === obs.variableMeasured);
    const sdgGoal = extractSDGGoal(obs, variable);
    
    if (!sdgGoal) return; // Skip if no SDG mapping
    
    if (!sdgMap.has(sdgGoal)) {
      sdgMap.set(sdgGoal, {
        goal: sdgGoal,
        goalName: getSDGGoalName(sdgGoal),
        lastUpdated: new Date().toISOString(),
        sources: new Set(),
        countries: new Set(),
        indicators: [],
        totalObservations: 0
      });
    }
    
    const sdgData = sdgMap.get(sdgGoal);
    sdgData.sources.add(organization.toUpperCase());
    sdgData.countries.add(extractCountryCode(obs.observationAbout || obs.location));
    sdgData.totalObservations++;
    
    sdgData.indicators.push({
      id: obs.variableMeasured,
      name: variable?.name || obs.variableMeasured,
      country: extractCountryName(obs.observationAbout || obs.location),
      countryCode: extractCountryCode(obs.observationAbout || obs.location),
      value: parseFloat(obs.value) || obs.value,
      unit: obs.unit || '',
      year: parseInt(obs.observationDate) || new Date().getFullYear(),
      source: organization.toUpperCase()
    });
  });
  
  const files = [];
  
  for (const [goalNumber, data] of sdgMap.entries()) {
    data.sources = Array.from(data.sources);
    data.countries = Array.from(data.countries);
    
    const filename = `goal-${goalNumber}.json`;
    const path = `cache/sdgs/${filename}`;
    
    files.push({
      path,
      filename,
      content: JSON.stringify(data, null, 2),
      size: JSON.stringify(data).length,
      type: 'sdg'
    });
  }
  
  console.log(`✅ Generated ${files.length} SDG cache files`);
  
  return { files };
}

/**
 * Generate theme-specific cache files
 */
export async function generateThemeCache(observations, variables, organization) {
  console.log('🎨 Generating theme cache...');
  
  const themeMap = new Map();
  
  // Group observations by theme
  observations.forEach(obs => {
    const variable = variables.find(v => v.id === obs.variableMeasured);
    const theme = extractTheme(obs, variable, organization);
    
    if (!themeMap.has(theme)) {
      themeMap.set(theme, {
        theme,
        themeName: theme,
        lastUpdated: new Date().toISOString(),
        sources: new Set(),
        countries: new Set(),
        indicators: [],
        totalObservations: 0
      });
    }
    
    const themeData = themeMap.get(theme);
    themeData.sources.add(organization.toUpperCase());
    themeData.countries.add(extractCountryCode(obs.observationAbout || obs.location));
    themeData.totalObservations++;
    
    themeData.indicators.push({
      id: obs.variableMeasured,
      name: variable?.name || obs.variableMeasured,
      country: extractCountryName(obs.observationAbout || obs.location),
      countryCode: extractCountryCode(obs.observationAbout || obs.location),
      value: parseFloat(obs.value) || obs.value,
      unit: obs.unit || '',
      year: parseInt(obs.observationDate) || new Date().getFullYear(),
      source: organization.toUpperCase()
    });
  });
  
  const files = [];
  
  for (const [themeName, data] of themeMap.entries()) {
    data.sources = Array.from(data.sources);
    data.countries = Array.from(data.countries);
    
    const filename = `${sanitizeFilename(themeName)}.json`;
    const path = `cache/themes/${filename}`;
    
    files.push({
      path,
      filename,
      content: JSON.stringify(data, null, 2),
      size: JSON.stringify(data).length,
      type: 'theme'
    });
  }
  
  console.log(`✅ Generated ${files.length} theme cache files`);
  
  return { files };
}

/**
 * Generate partner-specific cache files
 */
export async function generatePartnerCache(observations, variables, organization) {
  console.log('🤝 Generating partner cache...');
  
  const partnerData = {
    partner: organization.toUpperCase(),
    partnerName: organization.toUpperCase(),
    lastUpdated: new Date().toISOString(),
    countries: new Set(),
    indicators: new Set(),
    totalObservations: observations.length,
    data: []
  };
  
  observations.forEach(obs => {
    const variable = variables.find(v => v.id === obs.variableMeasured);
    
    partnerData.countries.add(extractCountryCode(obs.observationAbout || obs.location));
    partnerData.indicators.add(obs.variableMeasured);
    
    partnerData.data.push({
      id: obs.variableMeasured,
      name: variable?.name || obs.variableMeasured,
      country: extractCountryName(obs.observationAbout || obs.location),
      countryCode: extractCountryCode(obs.observationAbout || obs.location),
      value: parseFloat(obs.value) || obs.value,
      unit: obs.unit || '',
      year: parseInt(obs.observationDate) || new Date().getFullYear()
    });
  });
  
  partnerData.countries = Array.from(partnerData.countries);
  partnerData.indicators = Array.from(partnerData.indicators);
  
  const filename = `${organization.toLowerCase()}.json`;
  const path = `cache/partners/${filename}`;
  
  const files = [{
    path,
    filename,
    content: JSON.stringify(partnerData, null, 2),
    size: JSON.stringify(partnerData).length,
    type: 'partner'
  }];
  
  console.log(`✅ Generated ${files.length} partner cache file`);
  
  return { files };
}

/**
 * Helper: Extract country name from DCID
 */
function extractCountryName(dcid) {
  if (!dcid) return 'Unknown';
  
  const match = dcid.match(/country\/([A-Z]{3})/);
  if (match) {
    return countryCodeToName(match[1]);
  }
  
  return dcid.replace('dcid:', '').replace('country/', '');
}

/**
 * Helper: Extract country code from DCID
 */
function extractCountryCode(dcid) {
  if (!dcid) return 'UNK';
  
  const match = dcid.match(/country\/([A-Z]{3})/);
  if (match) {
    return match[1];
  }
  
  return dcid.substring(0, 3).toUpperCase();
}

/**
 * Helper: Extract SDG goal number
 */
function extractSDGGoal(obs, variable) {
  // Check variable metadata for SDG mapping
  if (variable?.metadata?.sdgGoal) {
    return parseInt(variable.metadata.sdgGoal);
  }
  
  // Check variable ID for SDG pattern
  const idMatch = obs.variableMeasured?.match(/SDG[_-]?(\d+)/i);
  if (idMatch) {
    return parseInt(idMatch[1]);
  }
  
  // Check variable name
  if (variable?.name) {
    const nameMatch = variable.name.match(/Goal\s+(\d+)/i);
    if (nameMatch) {
      return parseInt(nameMatch[1]);
    }
  }
  
  return null;
}

/**
 * Helper: Get SDG goal name
 */
function getSDGGoalName(goalNumber) {
  const sdgNames = {
    1: 'No Poverty',
    2: 'Zero Hunger',
    3: 'Good Health and Well-being',
    4: 'Quality Education',
    5: 'Gender Equality',
    6: 'Clean Water and Sanitation',
    7: 'Affordable and Clean Energy',
    8: 'Decent Work and Economic Growth',
    9: 'Industry, Innovation and Infrastructure',
    10: 'Reduced Inequalities',
    11: 'Sustainable Cities and Communities',
    12: 'Responsible Consumption and Production',
    13: 'Climate Action',
    14: 'Life Below Water',
    15: 'Life on Land',
    16: 'Peace, Justice and Strong Institutions',
    17: 'Partnerships for the Goals'
  };
  
  return sdgNames[goalNumber] || `Goal ${goalNumber}`;
}

/**
 * Helper: Extract theme from observation
 */
function extractTheme(obs, variable, organization) {
  // Organization-specific theme mappings
  const themeKeywords = {
    'ilo': {
      'employment': ['employment', 'employed', 'job', 'work'],
      'unemployment': ['unemployment', 'jobless'],
      'labour': ['labour', 'labor', 'workforce'],
      'wages': ['wage', 'salary', 'income', 'earnings']
    },
    'unicef': {
      'health': ['health', 'mortality', 'disease', 'medical'],
      'nutrition': ['nutrition', 'stunting', 'wasting', 'malnutrition'],
      'education': ['education', 'school', 'learning'],
      'protection': ['protection', 'violence', 'abuse']
    },
    'who': {
      'health': ['health', 'life expectancy', 'mortality'],
      'diseases': ['disease', 'malaria', 'tuberculosis', 'hiv'],
      'sanitation': ['sanitation', 'water', 'hygiene']
    },
    'sdg': {
      'poverty': ['poverty', 'income'],
      'hunger': ['hunger', 'food', 'nutrition'],
      'health': ['health', 'mortality'],
      'education': ['education', 'literacy']
    }
  };
  
  const orgKeywords = themeKeywords[organization.toLowerCase()] || {};
  const varName = (variable?.name || obs.variableMeasured || '').toLowerCase();
  
  for (const [theme, keywords] of Object.entries(orgKeywords)) {
    if (keywords.some(keyword => varName.includes(keyword))) {
      return theme;
    }
  }
  
  return 'general';
}

/**
 * Helper: Country code to name mapping
 */
function countryCodeToName(code) {
  const countries = {
    'AFG': 'Afghanistan',
    'PAK': 'Pakistan',
    'IND': 'India',
    'USA': 'United States',
    'CHN': 'China',
    'BRA': 'Brazil',
    'NGA': 'Nigeria',
    'ETH': 'Ethiopia',
    'BGD': 'Bangladesh',
    'RUS': 'Russia'
    // Add more as needed
  };
  
  return countries[code] || code;
}

/**
 * Helper: Sanitize filename
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Save cache files to filesystem (browser simulation using localStorage)
 */
export async function saveCacheFiles(files) {
  console.log(`💾 Saving ${files.length} cache files...`);
  
  const savedFiles = [];
  
  for (const file of files) {
    try {
      // In browser, we'll use localStorage as simulation
      // In production, this would be actual file writes via API
      const storageKey = `cache_${file.path.replace(/\//g, '_')}`;
      localStorage.setItem(storageKey, file.content);
      
      savedFiles.push({
        path: file.path,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      console.error(`Failed to save ${file.path}:`, error);
    }
  }
  
  console.log(`✅ Saved ${savedFiles.length} cache files`);
  
  return savedFiles;
}

/**
 * Load cache file from storage
 */
export function loadCacheFile(path) {
  const storageKey = `cache_${path.replace(/\//g, '_')}`;
  const content = localStorage.getItem(storageKey);
  
  if (!content) {
    return null;
  }
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to parse cache file ${path}:`, error);
    return null;
  }
}

/**
 * List all cached files by type
 */
export function listCachedFiles(type = null) {
  const files = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key.startsWith('cache_')) {
      const path = key.replace('cache_', '').replace(/_/g, '/');
      const content = localStorage.getItem(key);
      
      if (type) {
        if (path.includes(`/${type}/`)) {
          files.push({
            path,
            size: content.length,
            type
          });
        }
      } else {
        files.push({
          path,
          size: content.length
        });
      }
    }
  }
  
  return files;
}

