/**
 * CSV to MCF Converter
 * Converts CSV files using TMCF templates into MCF observations
 * This allows chart generation from CSV data
 */

/**
 * Parse CSV string into array of objects
 */
export function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }
  
  return rows;
}

/**
 * Convert CSV rows to MCF observations based on TMCF template
 * 
 * Example TMCF:
 *   Node: E:SDG->E1
 *   typeOf: dcs:StatVarObservation
 *   variableMeasured: C:SDG->SERIES
 *   observationAbout: C:SDG->GEOGRAPHY
 *   observationDate: C:SDG->TIME_PERIOD
 *   value: C:SDG->OBS_VALUE
 *   unit: C:SDG->UNIT_MEASURE
 */
export function convertCSVToObservations(csvRows, tmcfMapping) {
  const observations = [];
  
  // Default TMCF mapping (works for WHO, SDG format)
  const defaultMapping = {
    variableMeasured: 'SERIES',
    observationAbout: 'GEOGRAPHY',
    observationDate: 'TIME_PERIOD',
    value: 'OBS_VALUE',
    unit: 'UNIT_MEASURE',
    measurementMethod: 'MEASUREMENT_METHOD',
    observationPeriod: 'OBSERVATION_PERIOD'
  };
  
  const mapping = tmcfMapping || defaultMapping;
  
  csvRows.forEach((row, index) => {
    const obs = {
      dcid: `obs_${index}_${Date.now()}`,
      typeOf: 'dcs:StatVarObservation'
    };
    
    // Map CSV columns to MCF properties
    if (row[mapping.variableMeasured]) {
      obs.variableMeasured = row[mapping.variableMeasured].replace('dcs:', 'dcid:');
    }
    
    if (row[mapping.observationAbout]) {
      obs.observationAbout = row[mapping.observationAbout];
    }
    
    if (row[mapping.observationDate]) {
      obs.observationDate = row[mapping.observationDate];
    }
    
    if (row[mapping.value]) {
      obs.value = parseFloat(row[mapping.value]) || 0;
    }
    
    if (row[mapping.unit]) {
      obs.unit = row[mapping.unit];
    }
    
    if (row[mapping.measurementMethod]) {
      obs.measurementMethod = row[mapping.measurementMethod];
    }
    
    observations.push(obs);
  });
  
  return observations;
}

/**
 * Convert MCF observations back to MCF format string
 */
export function observationsToMCFString(observations) {
  return observations.map(obs => {
    const lines = [`Node: ${obs.dcid}`];
    
    Object.entries(obs).forEach(([key, value]) => {
      if (key !== 'dcid') {
        lines.push(`${key}: ${value}`);
      }
    });
    
    return lines.join('\n');
  }).join('\n\n');
}

/**
 * Combine schema MCF (StatisticalVariables) with CSV observations
 */
export function combineSchemaAndObservations(schemaMCF, observations) {
  const observationsMCF = observationsToMCFString(observations);
  return schemaMCF + '\n\n' + observationsMCF;
}

/**
 * Auto-detect CSV file path from schema file path
 * e.g., 'who/schema/sv.mcf' → 'who/csv/WHO__*.csv'
 */
export function detectCSVPathsForOrg(orgId) {
  const csvPaths = {
    'who': '/datacommons/who/csv/',
    'sdg': '/datacommons/sdg/data/', // If SDG has CSV files
    'ilo': '/datacommons/ilo/data/', // If ILO has CSV files
    'unicef': '/datacommons/unicef/data/' // If UNICEF has CSV files
  };
  
  return csvPaths[orgId] || null;
}

/**
 * Load and convert CSV file to observations
 */
export async function loadCSVAndConvert(csvFileName, basePath = '/datacommons/who/csv/') {
  try {
    const response = await fetch(basePath + csvFileName);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvContent = await response.text();
    const rows = parseCSV(csvContent);
    const observations = convertCSVToObservations(rows);
    
    console.log(`✅ Converted ${observations.length} observations from ${csvFileName}`);
    return observations;
  } catch (error) {
    console.error(`❌ Error loading CSV ${csvFileName}:`, error);
    return [];
  }
}

/**
 * Get list of available CSV files for an organization
 */
export async function getAvailableCSVFiles(orgId) {
  // For WHO, we know there are 522 CSV files
  // You could implement a directory listing API or have a manifest file
  const csvManifest = {
    'who': [
      'WHO__Adult_curr_tob_use.csv',
      'WHO__MALARIA_EST_CASES.csv',
      'WHO__HIV_ARTCOVERAGE.csv',
      'WHO__LIFE_0000000030.csv',
      'WHO__CHILDMORT_DEATHS_10TO14.csv',
      // Add more as needed, or fetch from a manifest file
    ]
  };
  
  return csvManifest[orgId] || [];
}

/**
 * Sample usage function showing how to integrate CSV data
 */
export async function loadMCFWithCSVData(schemaFileId, csvFileName) {
  try {
    // 1. Load schema MCF (StatisticalVariables)
    const schemaResponse = await fetch(`/datacommons/${schemaFileId}`);
    const schemaMCF = await schemaResponse.text();
    
    // 2. Load and convert CSV to observations
    const observations = await loadCSVAndConvert(csvFileName);
    
    // 3. Combine schema + observations
    const completeMCF = combineSchemaAndObservations(schemaMCF, observations);
    
    return completeMCF;
  } catch (error) {
    console.error('Error loading MCF with CSV data:', error);
    return '';
  }
}

