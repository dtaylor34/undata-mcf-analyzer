/**
 * Real Catalog Data - Generated from MCF Files
 * Browser-compatible version for React components
 * Generated: 2025-10-30
 */

export const REAL_CATALOG = {
  metadata: {
    generated: '2025-10-30T14:55:01.839Z',
    source: 'Local MCF Files',
    totalIndicators: 36511
  },
  
  organizations: {
    sdg: {
      id: 'sdg',
      name: 'SDG (UNSD)',
      emoji: '🎯',
      color: '#e74c3c',
      totalIndicators: 5470,
      quarters: {
        'q4-2024': { indicators: 4503, fileSize: '6.31 MB' },
        'q1-2025': { indicators: 4269, fileSize: '5.52 MB' },
        'q2-2025': { indicators: 5231, fileSize: '6.79 MB' }
      },
      topIndicators: [
        { dcid: 'undata/sdg/AG_FLS_INDEX', name: 'Global food loss index' },
        { dcid: 'undata/sdg/AG_FLS_PCT', name: 'Food loss percentage' },
        { dcid: 'undata/sdg/AG_FOOD_WST', name: 'Food waste' },
        { dcid: 'undata/sdg/AG_LND_AGRI', name: 'Agricultural land' },
        { dcid: 'undata/sdg/AG_LND_CROP', name: 'Arable land' }
      ]
    },
    
    ilo: {
      id: 'ilo',
      name: 'ILO',
      emoji: '🏆',
      color: '#f39c12',
      totalIndicators: 7121,
      fileSize: '19.08 MB',
      topIndicators: [
        { dcid: 'undata/ilo/EAP_5EAP_NB.AGE--Y15T24', name: 'Labour force [15 to 24 years old]' },
        { dcid: 'undata/ilo/EAP_5EAP_NB.AGE--Y15T64', name: 'Labour force [15 to 64 years old]' },
        { dcid: 'undata/ilo/EAP_5EAP_NB.AGE--Y_GE15', name: 'Labour force [15 years old and over]' },
        { dcid: 'undata/ilo/UNE_TUNE_NB', name: 'Unemployment rate' },
        { dcid: 'undata/ilo/EMP_NIFL_NB', name: 'Informal employment' }
      ]
    },
    
    unicef: {
      id: 'unicef',
      name: 'UNICEF',
      emoji: '👶',
      color: '#3498db',
      totalIndicators: 2389,
      fileSize: '1.45 MB',
      topIndicators: [
        { dcid: 'undata/unicef/CME_ARR.AGE--Y10T19', name: 'Annual rate of reduction in mortality rate [10 to 19 years old]' },
        { dcid: 'undata/unicef/CME_TMM0T4', name: 'Under-five mortality rate' },
        { dcid: 'undata/unicef/MNCH_ANCARE', name: 'Antenatal care coverage' },
        { dcid: 'undata/unicef/NT_BF_EXBF', name: 'Exclusive breastfeeding rate' },
        { dcid: 'undata/unicef/WASH_W_SM', name: 'Access to safely managed drinking water' }
      ]
    },
    
    who: {
      id: 'who',
      name: 'WHO',
      emoji: '🏥',
      color: '#27ae60',
      totalIndicators: 21531,
      fileSize: '32.19 MB',
      topIndicators: [
        { dcid: 'undata/who/LIFE_EXPECTANCY', name: 'Life Expectancy' },
        { dcid: 'undata/who/MORTALITY_RATE', name: 'Mortality Rate' },
        { dcid: 'undata/who/HEALTH_EXPENDITURE', name: 'Health Expenditure' },
        { dcid: 'undata/who/IMMUNIZATION_COVERAGE', name: 'Immunization Coverage' },
        { dcid: 'undata/who/DISEASE_BURDEN', name: 'Disease Burden' }
      ]
    }
  }
};

/**
 * Get organization by ID
 */
export function getOrganization(orgId) {
  return REAL_CATALOG.organizations[orgId] || null;
}

/**
 * Get all organizations as array
 */
export function getAllOrganizations() {
  return Object.values(REAL_CATALOG.organizations);
}

/**
 * Get SDG quarterly comparison
 */
export function getSDGQuarterlyData() {
  return REAL_CATALOG.organizations.sdg.quarters;
}

/**
 * Search indicators across all organizations
 */
export function searchIndicators(query) {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  for (const org of getAllOrganizations()) {
    for (const indicator of org.topIndicators || []) {
      if (indicator.name.toLowerCase().includes(searchTerm) ||
          indicator.dcid.toLowerCase().includes(searchTerm)) {
        results.push({
          ...indicator,
          organization: org.name,
          orgId: org.id
        });
      }
    }
  }
  
  return results;
}

/**
 * Get statistics summary
 */
export function getStatistics() {
  return {
    totalIndicators: REAL_CATALOG.metadata.totalIndicators,
    totalOrganizations: Object.keys(REAL_CATALOG.organizations).length,
    sdgQuarters: Object.keys(REAL_CATALOG.organizations.sdg.quarters).length,
    byOrganization: getAllOrganizations().map(org => ({
      name: org.name,
      emoji: org.emoji,
      count: org.totalIndicators
    }))
  };
}
