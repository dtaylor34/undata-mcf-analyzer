/**
 * Theme & SDG Validation System
 * Analyzes MCF content for governance alignment
 */

import { UNDATA_THEMES, SDG_GOALS, AGENCY_THEME_MAPPING } from '../config/undata-taxonomy.js';
import { parseMCF } from '../src/mcf-parser.js';

/**
 * Analyze MCF content and suggest theme/SDG mappings
 */
export async function analyzeThemeSDGAlignment(mcfContent, agency) {
  const nodes = parseMCF(mcfContent);
  
  // Extract indicator names and descriptions
  const indicators = nodes.filter(n => n.typeOf === 'dcs:StatisticalVariable');
  const indicatorTexts = indicators.map(i => 
    `${i.name || ''} ${i.description || ''} ${i.measuredProperty || ''}`.toLowerCase()
  );
  
  // Score each theme based on keyword matching
  const themeScores = {};
  for (const [themeId, theme] of Object.entries(UNDATA_THEMES)) {
    themeScores[themeId] = 0;
    
    for (const subtheme of theme.subthemes) {
      for (const keyword of subtheme.keywords) {
        const matches = indicatorTexts.filter(text => text.includes(keyword)).length;
        if (matches > 0) {
          themeScores[themeId] += matches;
        }
      }
    }
  }
  
  // Score each SDG
  const sdgScores = {};
  for (const [sdgId, sdg] of Object.entries(SDG_GOALS)) {
    sdgScores[sdgId] = 0;
    
    for (const keyword of sdg.keywords) {
      const matches = indicatorTexts.filter(text => text.includes(keyword)).length;
      if (matches > 0) {
        sdgScores[sdgId] += matches;
      }
    }
  }
  
  // Get top suggestions
  const suggestedThemes = Object.entries(themeScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([themeId, score]) => ({
      themeId,
      theme: UNDATA_THEMES[themeId],
      confidence: score / indicators.length,
      matchCount: score
    }));
  
  const suggestedSDGs = Object.entries(sdgScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sdgId, score]) => ({
      sdgId,
      sdg: SDG_GOALS[sdgId],
      confidence: score / indicators.length,
      matchCount: score
    }));
  
  // Get expected mappings for this agency
  const expected = AGENCY_THEME_MAPPING[agency] || {};
  
  // Validate alignment
  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  };
  
  // Check primary theme alignment
  if (expected.primaryTheme) {
    const hasPrimaryTheme = suggestedThemes.some(t => t.themeId === expected.primaryTheme);
    if (!hasPrimaryTheme) {
      validation.warnings.push(
        `Expected primary theme '${expected.primaryTheme}' not detected. Consider reviewing indicator descriptions.`
      );
    }
  }
  
  // Check SDG alignment
  if (expected.primarySDGs && expected.primarySDGs.length > 0) {
    const matchedSDGs = suggestedSDGs.filter(s => expected.primarySDGs.includes(s.sdgId));
    if (matchedSDGs.length === 0) {
      validation.warnings.push(
        `No expected SDGs (${expected.primarySDGs.join(', ')}) detected. Please verify SDG mapping.`
      );
    }
  }
  
  // Check for missing themes (indicators with no theme match)
  const unmappedIndicators = indicators.filter(indicator => {
    const text = `${indicator.name || ''} ${indicator.description || ''}`.toLowerCase();
    return !Object.values(UNDATA_THEMES).some(theme => 
      theme.subthemes.some(sub => 
        sub.keywords.some(keyword => text.includes(keyword))
      )
    );
  });
  
  if (unmappedIndicators.length > 0) {
    validation.errors.push(
      `${unmappedIndicators.length} indicators have no theme mapping. Manual review required.`
    );
    validation.isValid = false;
  }
  
  return {
    suggestedThemes,
    suggestedSDGs,
    validation,
    unmappedIndicators,
    indicatorCount: indicators.length,
    coveragePercent: ((indicators.length - unmappedIndicators.length) / indicators.length * 100).toFixed(1)
  };
}

/**
 * Apply theme/SDG mappings to MCF content
 */
export function enrichMCFWithThemeSDG(mcfContent, themeMappings, sdgMappings) {
  const nodes = parseMCF(mcfContent);
  
  // Add theme/SDG properties to each StatisticalVariable
  for (const node of nodes) {
    if (node.typeOf === 'dcs:StatisticalVariable') {
      const dcid = node.dcid;
      
      // Add theme
      if (themeMappings[dcid]) {
        node.theme = themeMappings[dcid].map(t => `dcid:${t}`).join(', ');
      }
      
      // Add SDG
      if (sdgMappings[dcid]) {
        node.sdgGoal = sdgMappings[dcid].map(s => `dcid:${s}`).join(', ');
      }
    }
  }
  
  // Convert back to MCF string
  return nodes.map(node => {
    let mcf = `Node: ${node.dcid}\n`;
    for (const [key, value] of Object.entries(node)) {
      if (key !== 'dcid') {
        mcf += `${key}: ${value}\n`;
      }
    }
    return mcf;
  }).join('\n');
}

/**
 * Validate MCF meets minimum governance requirements
 */
export async function validateGovernanceRequirements(mcfContent, agency) {
  const analysis = await analyzeThemeSDGAlignment(mcfContent, agency);
  
  const requirements = {
    minimumCoverage: 95, // 95% of indicators must be mapped
    requireSDGMapping: true,
    requireThemeMapping: true
  };
  
  const results = {
    passed: true,
    coverage: parseFloat(analysis.coveragePercent),
    meetsMinimumCoverage: parseFloat(analysis.coveragePercent) >= requirements.minimumCoverage,
    hasSDGMapping: analysis.suggestedSDGs.length > 0,
    hasThemeMapping: analysis.suggestedThemes.length > 0,
    blockers: []
  };
  
  if (!results.meetsMinimumCoverage) {
    results.passed = false;
    results.blockers.push(
      `Coverage ${analysis.coveragePercent}% is below minimum ${requirements.minimumCoverage}%`
    );
  }
  
  if (requirements.requireSDGMapping && !results.hasSDGMapping) {
    results.passed = false;
    results.blockers.push('No SDG mappings detected');
  }
  
  if (requirements.requireThemeMapping && !results.hasThemeMapping) {
    results.passed = false;
    results.blockers.push('No theme mappings detected');
  }
  
  return results;
}

