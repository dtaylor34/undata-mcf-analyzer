/**
 * FILE: scripts/data-processor.js
 * PURPOSE: Process incoming data files and convert to MCF
 * 
 * Handles:
 * - CSV → MCF (with TMCF templates)
 * - SDMX/XML → MCF
 * - MCF validation and enhancement
 */

const fs = require('fs').promises;
const path = require('path');
const { parseCSV, convertCSVToMCF } = require('../src/csv-to-mcf-converter-node');
const { parseMCF, validateMCF } = require('../src/mcf-parser-node');

/**
 * Process incoming file based on type
 */
async function processIncomingFile(filePath, orgId) {
  const fileExt = path.extname(filePath).toLowerCase();
  const content = await fs.readFile(filePath, 'utf-8');
  
  console.log(`📄 Processing ${fileExt} file for ${orgId}...`);
  
  switch (fileExt) {
    case '.csv':
      return await processCSV(content, orgId, filePath);
    
    case '.sdmx':
    case '.xml':
      return await processSDMX(content, orgId);
    
    case '.mcf':
      return await processMCF(content, orgId);
    
    default:
      throw new Error(`Unsupported file type: ${fileExt}`);
  }
}

/**
 * Convert CSV to MCF
 */
async function processCSV(csvContent, orgId, filePath) {
  console.log(`📊 Converting CSV to MCF...`);
  
  // Look for associated TMCF template
  const tmcfPath = filePath.replace('.csv', '.tmcf');
  let tmcf = null;
  
  try {
    tmcf = await fs.readFile(tmcfPath, 'utf-8');
    console.log(`✅ Found TMCF template: ${path.basename(tmcfPath)}`);
  } catch (error) {
    console.log(`ℹ️ No TMCF template found, using default mapping`);
  }
  
  // Parse CSV
  const rows = parseCSV(csvContent);
  console.log(`✅ Parsed ${rows.length} rows`);
  
  // Convert to MCF
  const mcfContent = convertCSVToMCF(rows, tmcf, orgId);
  console.log(`✅ Generated MCF with ${mcfContent.split('\n').length} lines`);
  
  return mcfContent;
}

/**
 * Convert SDMX to MCF
 */
async function processSDMX(sdmxContent, orgId) {
  console.log(`📊 Converting SDMX to MCF...`);
  
  // This is a placeholder - real implementation would parse SDMX XML
  // and extract DataStructureDefinition, Codelist, and Data elements
  
  // For now, return a basic MCF structure
  const mcf = `# Generated from SDMX data
# Organization: ${orgId}
# Generated: ${new Date().toISOString()}

Node: dcid:${orgId}_StatisticalVariable
typeOf: dcs:StatisticalVariable
name: "Imported from SDMX"
description: "Data converted from SDMX format"
`;
  
  return mcf;
}

/**
 * Validate and enhance existing MCF
 */
async function processMCF(mcfContent, orgId) {
  console.log(`📊 Validating MCF...`);
  
  // Parse and validate
  const nodes = parseMCF(mcfContent);
  console.log(`✅ Parsed ${nodes.length} nodes`);
  
  const validation = validateMCF(nodes);
  
  if (!validation.isValid) {
    console.warn(`⚠️ MCF validation warnings:`, validation.errors);
  }
  
  // Add organization metadata if missing
  if (!mcfContent.includes('organization:')) {
    mcfContent = `# Organization: ${orgId}\n` + mcfContent;
  }
  
  // Add timestamp if missing
  if (!mcfContent.includes('generatedAt:')) {
    mcfContent = `# Generated: ${new Date().toISOString()}\n` + mcfContent;
  }
  
  return mcfContent;
}

/**
 * Helper: Parse CSV (Node.js compatible version)
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Helper: Convert CSV rows to MCF
 */
function convertCSVToMCF(rows, tmcf, orgId) {
  let mcf = `# Generated from CSV data\n`;
  mcf += `# Organization: ${orgId}\n`;
  mcf += `# Generated: ${new Date().toISOString()}\n`;
  mcf += `# Rows: ${rows.length}\n\n`;
  
  // Generate StatVar definitions
  const variables = new Set();
  rows.forEach(row => {
    if (row.SERIES || row.Indicator) {
      variables.add(row.SERIES || row.Indicator);
    }
  });
  
  variables.forEach(varId => {
    mcf += `Node: dcid:${orgId}/${varId}\n`;
    mcf += `typeOf: dcs:StatisticalVariable\n`;
    mcf += `name: "${varId}"\n`;
    mcf += `\n`;
  });
  
  // Generate observations
  rows.forEach((row, idx) => {
    const varId = row.SERIES || row.Indicator || 'Unknown';
    const obsId = `obs_${varId}_${row.TIME_PERIOD || idx}`;
    
    mcf += `Node: dcid:${obsId}\n`;
    mcf += `typeOf: dcs:StatVarObservation\n`;
    mcf += `variableMeasured: dcid:${orgId}/${varId}\n`;
    
    if (row.GEO_PICT || row.Geography) {
      mcf += `observationAbout: dcid:${row.GEO_PICT || row.Geography}\n`;
    }
    
    if (row.TIME_PERIOD || row.Year) {
      mcf += `observationDate: "${row.TIME_PERIOD || row.Year}"\n`;
    }
    
    if (row.OBS_VALUE || row.Value) {
      mcf += `value: ${row.OBS_VALUE || row.Value}\n`;
    }
    
    if (row.UNIT_MEASURE || row.Unit) {
      mcf += `unit: "${row.UNIT_MEASURE || row.Unit}"\n`;
    }
    
    mcf += `\n`;
  });
  
  return mcf;
}

module.exports = {
  processIncomingFile,
  processCSV,
  processSDMX,
  processMCF
};

