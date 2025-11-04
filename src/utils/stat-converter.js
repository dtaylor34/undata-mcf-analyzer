/**
 * FILE: src/utils/stat-converter.js
 * PURPOSE: Convert MCF format to SDMX-JSON 2.0 (.STAT format)
 * 
 * SDMX-JSON is the standard format used by UN .Stat Suite
 * Spec: https://github.com/sdmx-twg/sdmx-json/blob/master/data-message/docs/1-sdmx-json-field-guide.md
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
 * Convert MCF to SDMX-JSON 2.0 format
 */
export function convertToSDMX(mcfContent, organization, versionId) {
  console.log('📊 Converting MCF to SDMX-JSON 2.0 format...');
  
  try {
    const nodes = parseMCF(mcfContent);
    
    // Separate variables and observations
    const variables = nodes.filter(n => n.properties.typeOf === 'dcs:StatisticalVariable');
    const observations = nodes.filter(n => n.properties.typeOf === 'dcs:StatVarObservation');
    
    console.log(`✅ Found ${variables.length} variables and ${observations.length} observations`);
    
    // Build SDMX structure
    const sdmxData = {
      meta: {
        schema: "https://raw.githubusercontent.com/sdmx-twg/sdmx-json/master/data-message/tools/schemas/2.0.0/sdmx-json-data-schema.json",
        id: versionId,
        prepared: new Date().toISOString(),
        sender: {
          id: organization.toLowerCase(),
          name: organization
        },
        test: false
      },
      data: {
        dataSets: [{
          action: "Information",
          links: [],
          series: {},
          observations: {}
        }],
        structure: {
          links: [{
            title: "Data Structure Definition",
            rel: "datastructure",
            href: `https://data.un.org/api/datastructure/${organization}/${versionId}`
          }],
          dimensions: {
            observation: [
              { id: "INDICATOR", name: "Indicator", keyPosition: 0 },
              { id: "LOCATION", name: "Location", keyPosition: 1 },
              { id: "TIME_PERIOD", name: "Time Period", keyPosition: 2 }
            ]
          },
          attributes: {
            observation: [
              { id: "UNIT_MEASURE", name: "Unit of Measure" },
              { id: "OBS_STATUS", name: "Observation Status" }
            ]
          }
        }
      }
    };
    
    // Convert observations to SDMX format
    const observationIndex = {};
    observations.forEach((obs, idx) => {
      const indicator = obs.properties.variableMeasured?.replace('dcid:', '') || 'UNKNOWN';
      const location = obs.properties.observationAbout?.replace('dcid:country/', '') || 'UNKNOWN';
      const timePeriod = obs.properties.observationDate || 'UNKNOWN';
      const value = parseFloat(obs.properties.value) || 0;
      const unit = obs.properties.unit || 'PERCENT';
      
      // SDMX uses positional keys: indicator:location:time
      const key = `${idx}:0:0`;
      
      observationIndex[key] = [
        value,
        { id: "UNIT_MEASURE", value: unit },
        { id: "OBS_STATUS", value: "A" } // A = Normal
      ];
    });
    
    sdmxData.data.dataSets[0].observations = observationIndex;
    
    return {
      success: true,
      content: JSON.stringify(sdmxData, null, 2),
      stats: {
        variables: variables.length,
        observations: observations.length,
        format: 'SDMX-JSON 2.0'
      }
    };
    
  } catch (error) {
    console.error('❌ Error converting to SDMX:', error);
    return {
      success: false,
      error: error.message,
      content: null
    };
  }
}

/**
 * Save SDMX content to localStorage (for demo purposes)
 */
export function saveSDMXFile(organization, versionId, content) {
  const key = `sdmx_${organization.toLowerCase()}_${versionId}`;
  localStorage.setItem(key, content);
  console.log(`💾 Saved SDMX file: ${key}`);
  return key;
}

/**
 * Load SDMX content from localStorage
 */
export function loadSDMXFile(organization, versionId) {
  const key = `sdmx_${organization.toLowerCase()}_${versionId}`;
  return localStorage.getItem(key);
}

