/**
 * FILE: src/utils/datacommons-converter.js
 * PURPOSE: Convert MCF format to Google DataCommons JSON format
 * 
 * DataCommons uses Schema.org vocabulary with custom extensions
 * Spec: https://docs.datacommons.org/api/
 */

/**
 * Parse MCF content into structured data
 */
function parseMCF(mcfContent) {
  const nodes = [];
  const lines = mcfContent.split('\n');
  let currentNode = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('Node:')) {
      if (currentNode) {
        nodes.push(currentNode);
      }
      currentNode = {
        dcid: trimmed.substring(5).trim(),
        properties: {}
      };
    } else if (currentNode && trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      currentNode.properties[key] = value;
    }
  }
  
  if (currentNode) {
    nodes.push(currentNode);
  }
  
  return nodes;
}

/**
 * Convert MCF to DataCommons JSON format
 */
export function convertToDataCommons(mcfContent, organization, versionId) {
  console.log('🌍 Converting MCF to DataCommons JSON format...');
  
  try {
    const nodes = parseMCF(mcfContent);
    
    // Separate variables and observations
    const variables = nodes.filter(n => n.properties.typeOf === 'dcs:StatisticalVariable');
    const observations = nodes.filter(n => n.properties.typeOf === 'dcs:StatVarObservation');
    
    console.log(`✅ Found ${variables.length} variables and ${observations.length} observations`);
    
    // Build DataCommons structure
    const dataCommonsData = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": `${organization}: ${versionId}`,
      "description": `Statistical data from ${organization}`,
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "provider": {
        "@type": "Organization",
        "name": organization,
        "url": `https://data.un.org/${organization.toLowerCase()}`
      },
      "datePublished": new Date().toISOString(),
      "temporalCoverage": extractTemporalCoverage(observations),
      "spatialCoverage": extractSpatialCoverage(observations),
      "variableMeasured": variables.map(v => ({
        "@type": "StatisticalVariable",
        "@id": v.dcid,
        "name": v.properties.name || v.dcid,
        "description": v.properties.description || `Statistical variable: ${v.properties.name || v.dcid}`,
        "populationType": v.properties.populationType?.replace('dcs:', '') || 'Thing',
        "measuredProperty": v.properties.measuredProperty?.replace('dcs:', '') || 'count',
        "statType": v.properties.statType?.replace('dcs:', '') || 'measuredValue'
      })),
      "observations": observations.map(obs => ({
        "@type": "StatVarObservation",
        "@id": obs.dcid,
        "variableMeasured": obs.properties.variableMeasured?.replace('dcid:', '') || 'unknown',
        "observationAbout": {
          "@type": "Place",
          "@id": obs.properties.observationAbout?.replace('dcid:', '') || 'unknown',
          "name": extractLocationName(obs.properties.observationAbout)
        },
        "observationDate": obs.properties.observationDate || 'unknown',
        "observationPeriod": extractObservationPeriod(obs.properties.observationDate),
        "value": parseFloat(obs.properties.value) || 0,
        "unit": obs.properties.unit || 'PERCENT',
        "measurementMethod": obs.properties.measurementMethod || 'standard',
        "provenance": {
          "@type": "Organization",
          "name": organization,
          "url": `https://data.un.org/${organization.toLowerCase()}`
        }
      }))
    };
    
    return {
      success: true,
      content: JSON.stringify(dataCommonsData, null, 2),
      stats: {
        variables: variables.length,
        observations: observations.length,
        format: 'DataCommons JSON'
      }
    };
    
  } catch (error) {
    console.error('❌ Error converting to DataCommons:', error);
    return {
      success: false,
      error: error.message,
      content: null
    };
  }
}

/**
 * Extract temporal coverage from observations
 */
function extractTemporalCoverage(observations) {
  const dates = observations
    .map(o => o.properties.observationDate)
    .filter(d => d && d !== 'unknown')
    .sort();
  
  if (dates.length === 0) return 'unknown';
  if (dates.length === 1) return dates[0];
  
  return `${dates[0]}/${dates[dates.length - 1]}`;
}

/**
 * Extract spatial coverage from observations
 */
function extractSpatialCoverage(observations) {
  const locations = new Set(
    observations
      .map(o => extractLocationName(o.properties.observationAbout))
      .filter(l => l !== 'Unknown')
  );
  
  if (locations.size === 0) return 'Global';
  if (locations.size === 1) return Array.from(locations)[0];
  
  return {
    "@type": "Place",
    "name": `Multiple locations (${locations.size})`,
    "geo": Array.from(locations)
  };
}

/**
 * Extract location name from DCID
 */
function extractLocationName(dcid) {
  if (!dcid) return 'Unknown';
  
  // Extract country code from dcid:country/CODE format
  const match = dcid.match(/country\/([A-Z]{2,3})/);
  if (match) {
    const code = match[1];
    // Map common country codes to names (subset for demo)
    const countryNames = {
      'AFG': 'Afghanistan',
      'PAK': 'Pakistan',
      'IND': 'India',
      'BGD': 'Bangladesh',
      'USA': 'United States',
      'CHN': 'China',
      'GBR': 'United Kingdom',
      'FRA': 'France',
      'DEU': 'Germany',
      'JPN': 'Japan'
    };
    return countryNames[code] || code;
  }
  
  return dcid.replace('dcid:', '').replace('country/', '');
}

/**
 * Extract observation period (year, month, etc.)
 */
function extractObservationPeriod(date) {
  if (!date || date === 'unknown') return 'unknown';
  
  // If it's just a year
  if (/^\d{4}$/.test(date)) {
    return 'P1Y'; // ISO 8601 duration: 1 year
  }
  
  // If it's YYYY-MM
  if (/^\d{4}-\d{2}$/.test(date)) {
    return 'P1M'; // ISO 8601 duration: 1 month
  }
  
  // If it's a full date
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    return 'P1D'; // ISO 8601 duration: 1 day
  }
  
  return 'unknown';
}

/**
 * Save DataCommons content to localStorage (for demo purposes)
 */
export function saveDataCommonsFile(organization, versionId, content) {
  const key = `datacommons_${organization.toLowerCase()}_${versionId}`;
  localStorage.setItem(key, content);
  console.log(`💾 Saved DataCommons file: ${key}`);
  return key;
}

/**
 * Load DataCommons content from localStorage
 */
export function loadDataCommonsFile(organization, versionId) {
  const key = `datacommons_${organization.toLowerCase()}_${versionId}`;
  return localStorage.getItem(key);
}

