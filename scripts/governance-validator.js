/**
 * FILE: scripts/governance-validator.js
 * PURPOSE: Validate MCF content against UNData Themes and SDG taxonomy
 * 
 * Ensures all data is properly tagged with:
 * - UNData Theme (DSS, ECS, ENV, etc.)
 * - SDG Goals (SDG01-SDG17)
 * - Proper alignment with agency expectations
 */

const { UNDATA_THEMES, SDG_GOALS, AGENCY_THEME_MAPPING } = require('../config/undata-taxonomy');

/**
 * Validate governance compliance
 */
async function validateGovernance(mcfContent, agency) {
  console.log(`🔍 Validating governance for ${agency}...`);
  
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    coverage: {
      themeMapped: 0,
      sdgMapped: 0,
      total: 0
    }
  };
  
  // Parse MCF to extract statistical variables
  const statVars = extractStatisticalVariables(mcfContent);
  result.coverage.total = statVars.length;
  
  console.log(`📊 Found ${statVars.length} statistical variables`);
  
  // Check each variable for theme and SDG alignment
  statVars.forEach(statVar => {
    const hasTheme = statVar.theme || statVar.content.includes('theme:');
    const hasSDG = statVar.sdgGoal || statVar.content.includes('sdgGoal:');
    
    if (hasTheme) result.coverage.themeMapped++;
    if (hasSDG) result.coverage.sdgMapped++;
    
    // Check if variable name/description suggests a theme
    const suggestedTheme = suggestTheme(statVar, agency);
    const suggestedSDG = suggestSDG(statVar, agency);
    
    if (!hasTheme && suggestedTheme) {
      result.warnings.push({
        variable: statVar.dcid,
        type: 'missing_theme',
        message: `No theme assigned. Suggested: ${suggestedTheme}`,
        suggestion: suggestedTheme
      });
    }
    
    if (!hasSDG && suggestedSDG) {
      result.warnings.push({
        variable: statVar.dcid,
        type: 'missing_sdg',
        message: `No SDG Goal assigned. Suggested: ${suggestedSDG.join(', ')}`,
        suggestion: suggestedSDG
      });
    }
  });
  
  // Calculate coverage percentage
  const themeCoverage = (result.coverage.themeMapped / result.coverage.total) * 100;
  const sdgCoverage = (result.coverage.sdgMapped / result.coverage.total) * 100;
  
  console.log(`📈 Theme Coverage: ${themeCoverage.toFixed(1)}%`);
  console.log(`📈 SDG Coverage: ${sdgCoverage.toFixed(1)}%`);
  
  // Set validation status
  if (themeCoverage < 80 || sdgCoverage < 80) {
    result.isValid = false;
    result.errors.push({
      type: 'low_coverage',
      message: `Insufficient governance coverage (Theme: ${themeCoverage.toFixed(1)}%, SDG: ${sdgCoverage.toFixed(1)}%). Minimum required: 80%`
    });
  }
  
  // Check alignment with agency expectations
  const expectedMapping = AGENCY_THEME_MAPPING[agency];
  if (expectedMapping) {
    const alignmentCheck = checkAgencyAlignment(statVars, expectedMapping);
    
    if (!alignmentCheck.aligned) {
      result.warnings.push({
        type: 'agency_alignment',
        message: `Data may not align with expected ${agency.toUpperCase()} themes: ${expectedMapping.primaryTheme}`,
        details: alignmentCheck.details
      });
    }
  }
  
  return result;
}

/**
 * Extract statistical variables from MCF
 */
function extractStatisticalVariables(mcfContent) {
  const statVars = [];
  const lines = mcfContent.split('\n');
  
  let currentNode = null;
  
  lines.forEach(line => {
    if (line.startsWith('Node:')) {
      if (currentNode && currentNode.typeOf === 'dcs:StatisticalVariable') {
        statVars.push(currentNode);
      }
      
      currentNode = {
        dcid: line.split('Node:')[1].trim(),
        content: line,
        typeOf: null,
        name: null,
        theme: null,
        sdgGoal: null
      };
    } else if (currentNode) {
      currentNode.content += '\n' + line;
      
      if (line.includes('typeOf:')) {
        currentNode.typeOf = line.split('typeOf:')[1].trim();
      } else if (line.includes('name:')) {
        currentNode.name = line.split('name:')[1].trim().replace(/"/g, '');
      } else if (line.includes('theme:')) {
        currentNode.theme = line.split('theme:')[1].trim();
      } else if (line.includes('sdgGoal:')) {
        currentNode.sdgGoal = line.split('sdgGoal:')[1].trim();
      }
    }
  });
  
  // Don't forget the last node
  if (currentNode && currentNode.typeOf === 'dcs:StatisticalVariable') {
    statVars.push(currentNode);
  }
  
  return statVars;
}

/**
 * Suggest theme based on keywords
 */
function suggestTheme(statVar, agency) {
  const name = (statVar.name || '').toLowerCase();
  const dcid = (statVar.dcid || '').toLowerCase();
  const content = (name + ' ' + dcid).toLowerCase();
  
  // Check each theme's keywords
  for (const [themeId, theme] of Object.entries(UNDATA_THEMES)) {
    for (const subtheme of theme.subthemes || []) {
      for (const keyword of subtheme.keywords || []) {
        if (content.includes(keyword.toLowerCase())) {
          return `${themeId}-${subtheme.id}`;
        }
      }
    }
  }
  
  // Fallback to agency default
  const agencyMapping = AGENCY_THEME_MAPPING[agency];
  return agencyMapping?.primaryTheme || null;
}

/**
 * Suggest SDG goals based on keywords
 */
function suggestSDG(statVar, agency) {
  const name = (statVar.name || '').toLowerCase();
  const dcid = (statVar.dcid || '').toLowerCase();
  const content = (name + ' ' + dcid).toLowerCase();
  
  const suggestions = [];
  
  // Check each SDG's keywords
  for (const [sdgId, sdg] of Object.entries(SDG_GOALS)) {
    for (const keyword of sdg.keywords || []) {
      if (content.includes(keyword.toLowerCase())) {
        suggestions.push(sdgId);
        break;
      }
    }
  }
  
  // If no match, use agency defaults
  if (suggestions.length === 0) {
    const agencyMapping = AGENCY_THEME_MAPPING[agency];
    return agencyMapping?.primarySDGs || [];
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
}

/**
 * Check alignment with agency expectations
 */
function checkAgencyAlignment(statVars, expectedMapping) {
  const themes = new Set();
  const sdgs = new Set();
  
  statVars.forEach(statVar => {
    if (statVar.theme) themes.add(statVar.theme);
    if (statVar.sdgGoal) sdgs.add(statVar.sdgGoal);
  });
  
  const hasExpectedTheme = themes.has(expectedMapping.primaryTheme) ||
                           expectedMapping.secondaryThemes?.some(t => themes.has(t));
  
  const hasExpectedSDG = expectedMapping.primarySDGs?.some(sdg => sdgs.has(sdg));
  
  return {
    aligned: hasExpectedTheme && hasExpectedSDG,
    details: {
      expectedTheme: expectedMapping.primaryTheme,
      foundThemes: Array.from(themes),
      expectedSDGs: expectedMapping.primarySDGs,
      foundSDGs: Array.from(sdgs)
    }
  };
}

/**
 * Enrich MCF with suggested themes and SDGs
 */
async function enrichMCF(mcfContent, agency) {
  console.log(`✨ Enriching MCF with governance metadata...`);
  
  const statVars = extractStatisticalVariables(mcfContent);
  let enrichedContent = mcfContent;
  
  statVars.forEach(statVar => {
    if (!statVar.theme) {
      const suggestedTheme = suggestTheme(statVar, agency);
      if (suggestedTheme) {
        // Add theme property to the node
        const nodeContent = statVar.content;
        const enrichedNode = nodeContent + `\ntheme: ${suggestedTheme}`;
        enrichedContent = enrichedContent.replace(nodeContent, enrichedNode);
      }
    }
    
    if (!statVar.sdgGoal) {
      const suggestedSDGs = suggestSDG(statVar, agency);
      if (suggestedSDGs.length > 0) {
        // Add SDG property to the node
        const nodeContent = statVar.content;
        const enrichedNode = nodeContent + `\nsdgGoal: ${suggestedSDGs.join(', ')}`;
        enrichedContent = enrichedContent.replace(nodeContent, enrichedNode);
      }
    }
  });
  
  return enrichedContent;
}

module.exports = {
  validateGovernance,
  enrichMCF,
  extractStatisticalVariables,
  suggestTheme,
  suggestSDG
};

