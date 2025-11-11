/**
 * MCF File Index V2 - Hierarchical Structure
 * 
 * Structure:
 * Organization → Version → [Complete Package | Individual Files]
 * 
 * When you select a VERSION (parent), it loads ALL files combined
 * When you select a FILE (child), it loads just that file for inspection
 */

export const MCF_FILE_INDEX_V2 = {
  ilo: {
    name: 'ILO',
    emoji: '🏆',
    versions: {
      'sample-data': {
        name: '📊 Sample Data (With Charts)',
        isComplete: true,
        hasCSV: true,
        files: [
          { id: 'ilo/data/ilo-sample-schema.mcf', name: 'ilo-sample-schema.mcf', type: 'schema', description: 'Employment & unemployment indicators' },
        ],
        csvFiles: [
          { id: 'ilo/data/employment-indicators.csv', name: 'employment-indicators.csv', type: 'csv', description: '30 observations: Employment & unemployment 2020-2022' },
        ]
      },
      'v01': {
        name: 'V01 (Schema Only)',
        isComplete: true,  // Has all component files
        files: [
          { id: 'ilo/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types & enumerations' },
          { id: 'ilo/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables (7000+ indicators)' },
          { id: 'ilo/schema/unit.mcf', name: 'unit.mcf', type: 'units', description: 'Units of measurement' },
          { id: 'ilo/schema/ilo_topics.mcf', name: 'ilo_topics.mcf', type: 'topics', description: 'UN thematic areas' },
          { id: 'ilo/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series metadata' },
          { id: 'ilo/schema/ilo_measurement_method.mcf', name: 'ilo_measurement_method.mcf', type: 'methods', description: 'Measurement methods' },
          { id: 'ilo/schema/ilo.mcf', name: 'ilo.mcf', type: 'master', description: 'Master reference file' },
        ],
        // CSV files for observations (if available)
        csvFiles: []
      },
      // Future version example:
      // 'v02': {
      //   name: 'V02 (Draft)',
      //   isComplete: true,
      //   files: [ ... ]
      // }
    }
  },
  
  sdg: {
    name: 'SDG',
    emoji: '🎯',
    versions: {
      'sample-data': {
        name: 'Sample Data (With Charts)',
        isComplete: false,  // Only has sample file, not full package
        files: [
          { id: 'sdg/sample-observations.mcf', name: 'sample-observations.mcf', type: 'observations', description: 'Sample data with observations' },
        ]
      },
      'test-data': {
        name: '🧪 Test Data (CSV → All Formats)',
        isComplete: true,
        hasCSV: true,  // Flag to indicate CSV source data
        files: [
          { id: 'sdg/test-data/test-schema.mcf', name: 'test-schema.mcf', type: 'schema', description: 'Schema for poverty indicator' },
        ],
        csvFiles: [
          { id: 'sdg/test-data/poverty-sample.csv', name: 'poverty-sample.csv', type: 'csv', description: '12 observations across 4 countries' },
        ]
      },
      'child-protection': {
        name: '👶 Child Protection (Real UN Data)',
        isComplete: true,
        files: [
          { id: 'test-data/child-protection-sdg.mcf', name: 'child-protection-sdg.mcf', type: 'observations', description: 'SDG: Birth registration & early marriage (32 countries, 2 indicators)' },
          { id: 'test-data/child-protection-ilo.mcf', name: 'child-protection-ilo.mcf', type: 'observations', description: 'ILO: Parental leave access (26 countries, 1 indicator)' },
          { id: 'test-data/child-protection-who.mcf', name: 'child-protection-who.mcf', type: 'observations', description: 'WHO: Child mortality & violence/punishment indicators (28 countries, 5 indicators)' },
          { id: 'test-data/child-protection-unicef.mcf', name: 'child-protection-unicef.mcf', type: 'observations', description: 'UNICEF: 17 child protection indicators - Birth registration, Child labour, Marriage, Violence, FGM (75 observations)' },
        ]
      },
      'q4-2024': {
        name: 'Q4 2024',
        isComplete: true,
        files: [
          { id: 'sdg/q4-2024/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types & enumerations' },
          { id: 'sdg/q4-2024/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables' },
          { id: 'sdg/q4-2024/schema/unit.mcf', name: 'unit.mcf', type: 'units', description: 'Units of measurement' },
          { id: 'sdg/q4-2024/schema/sdg_topics.mcf', name: 'sdg_topics.mcf', type: 'topics', description: 'SDG themes' },
          { id: 'sdg/q4-2024/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series' },
          { id: 'sdg/q4-2024/schema/sdg_measurement_method.mcf', name: 'sdg_measurement_method.mcf', type: 'methods', description: 'Methods' },
          { id: 'sdg/q4-2024/schema/sdg.mcf', name: 'sdg.mcf', type: 'master', description: 'Master file' },
          { id: 'sdg/q4-2024/schema/sdg.tmcf', name: 'sdg.tmcf', type: 'template', description: 'Template MCF' },
        ]
      },
      'q1-2025': {
        name: 'Q1 2025',
        isComplete: true,
        files: [
          { id: 'sdg/q1-2025/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types & enumerations' },
          { id: 'sdg/q1-2025/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables' },
          { id: 'sdg/q1-2025/schema/unit.mcf', name: 'unit.mcf', type: 'units', description: 'Units of measurement' },
          { id: 'sdg/q1-2025/schema/sdg_topics.mcf', name: 'sdg_topics.mcf', type: 'topics', description: 'SDG themes' },
          { id: 'sdg/q1-2025/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series' },
          { id: 'sdg/q1-2025/schema/sdg_measurement_method.mcf', name: 'sdg_measurement_method.mcf', type: 'methods', description: 'Methods' },
          { id: 'sdg/q1-2025/schema/sdg.mcf', name: 'sdg.mcf', type: 'master', description: 'Master file' },
          { id: 'sdg/q1-2025/schema/sdg.tmcf', name: 'sdg.tmcf', type: 'template', description: 'Template MCF' },
        ]
      },
      'q2-2025': {
        name: 'Q2 2025',
        isComplete: true,
        files: [
          { id: 'sdg/q2-2025/20250910_133848-01K4TBAV0G0GV9ZYBEYCCKW5FH/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types' },
          { id: 'sdg/q2-2025/20250910_133848-01K4TBAV0G0GV9ZYBEYCCKW5FH/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables' },
          { id: 'sdg/q2-2025/20250910_133848-01K4TBAV0G0GV9ZYBEYCCKW5FH/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series' },
          { id: 'sdg/q2-2025/20250910_133848-01K4TBAV0G0GV9ZYBEYCCKW5FH/schema/sdg.mcf', name: 'sdg.mcf', type: 'master', description: 'Master file' },
          { id: 'sdg/q2-2025/20250910_133848-01K4TBAV0G0GV9ZYBEYCCKW5FH/schema/sdg.tmcf', name: 'sdg.tmcf', type: 'template', description: 'Template MCF' },
        ]
      }
    }
  },
  
  unicef: {
    name: 'UNICEF',
    emoji: '👶',
    versions: {
      'sample-data': {
        name: '📊 Sample Data (With Charts)',
        isComplete: true,
        hasCSV: true,
        files: [
          { id: 'unicef/data/unicef-sample-schema.mcf', name: 'unicef-sample-schema.mcf', type: 'schema', description: 'Child health indicators' },
        ],
        csvFiles: [
          { id: 'unicef/data/child-indicators.csv', name: 'child-indicators.csv', type: 'csv', description: '24 observations: Child mortality & immunization 2019-2022' },
        ]
      },
      'v01': {
        name: 'V01 (Schema Only)',
        isComplete: true,
        files: [
          { id: 'unicef/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types & enumerations' },
          { id: 'unicef/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables' },
          { id: 'unicef/schema/unit.mcf', name: 'unit.mcf', type: 'units', description: 'Units of measurement' },
          { id: 'unicef/schema/unicef_topics.mcf', name: 'unicef_topics.mcf', type: 'topics', description: 'UNICEF themes' },
          { id: 'unicef/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series' },
          { id: 'unicef/schema/unicef_measurement_method.mcf', name: 'unicef_measurement_method.mcf', type: 'methods', description: 'Methods' },
          { id: 'unicef/schema/unicef.mcf', name: 'unicef.mcf', type: 'master', description: 'Master file' },
          { id: 'unicef/schema/unicef.tmcf', name: 'unicef.tmcf', type: 'template', description: 'Template MCF' },
        ]
      }
    }
  },
  
  who: {
    name: 'WHO',
    emoji: '🏥',
    versions: {
      'sample-data': {
        name: '📊 Sample Data (With Charts)',
        isComplete: true,
        hasCSV: true,
        files: [
          { id: 'who/data/who-sample-schema.mcf', name: 'who-sample-schema.mcf', type: 'schema', description: 'Health indicators' },
        ],
        csvFiles: [
          { id: 'who/data/health-indicators.csv', name: 'health-indicators.csv', type: 'csv', description: '32 observations: Life expectancy & infant mortality 2019-2022' },
        ]
      },
      'v01': {
        name: 'V01 (Schema Only)',
        isComplete: true,
        files: [
          { id: 'who/schema/schema.mcf', name: 'schema.mcf', type: 'schema', description: 'Base types & enumerations' },
          { id: 'who/schema/sv.mcf', name: 'sv.mcf', type: 'variables', description: 'Statistical variables' },
          { id: 'who/schema/topics.mcf', name: 'topics.mcf', type: 'topics', description: 'WHO themes' },
          { id: 'who/schema/series.mcf', name: 'series.mcf', type: 'series', description: 'Data series' },
          { id: 'who/schema/who.mcf', name: 'who.mcf', type: 'master', description: 'Master file' },
        ],
        // Sample CSV files (522 available)
        csvFiles: [
          'WHO__Adult_curr_tob_use.csv',
          'WHO__MALARIA_EST_CASES.csv',
          'WHO__HIV_ARTCOVERAGE.csv',
          'WHO__LIFE_0000000030.csv',
          'WHO__CHILDMORT_DEATHS_10TO14.csv',
        ]
      }
    }
  }
};

/**
 * Get all organizations
 */
export function getOrganizations() {
  return Object.entries(MCF_FILE_INDEX_V2).map(([id, data]) => ({
    id,
    name: data.name,
    emoji: data.emoji
  }));
}

/**
 * Get versions for an organization
 */
export function getVersionsForOrg(orgId) {
  const org = MCF_FILE_INDEX_V2[orgId];
  if (!org || !org.versions) return [];
  
  return Object.entries(org.versions).map(([versionId, versionData]) => ({
    id: `${orgId}/${versionId}`,
    versionId,
    name: versionData.name,
    isComplete: versionData.isComplete,
    fileCount: versionData.files.length,
    hasCSV: versionData.csvFiles && versionData.csvFiles.length > 0
  }));
}

/**
 * Get files for a specific version
 */
export function getFilesForVersion(orgId, versionId) {
  const org = MCF_FILE_INDEX_V2[orgId];
  if (!org || !org.versions || !org.versions[versionId]) return [];
  
  const version = org.versions[versionId];
  return version.files.map(file => ({
    ...file,
    orgId,
    versionId,
    displayName: file.name,
    fullId: file.id
  }));
}

/**
 * Get ALL file IDs for a version (for combined loading)
 */
export function getAllFileIdsForVersion(orgId, versionId) {
  const files = getFilesForVersion(orgId, versionId);
  return files.map(f => f.fullId);
}

/**
 * Check if a selection is a "parent" (version) or "child" (individual file)
 */
export function isParentSelection(selection) {
  // Parent format: "ilo/v01"
  // Child format: "ilo/schema/sv.mcf"
  const parts = selection.split('/');
  return parts.length === 2; // org/version = parent
}

/**
 * Get display name for a selection
 */
export function getDisplayName(selection) {
  if (isParentSelection(selection)) {
    const [orgId, versionId] = selection.split('/');
    const org = MCF_FILE_INDEX_V2[orgId];
    const version = org?.versions?.[versionId];
    return version ? `${org.emoji} ${org.name} ${version.name}` : selection;
  } else {
    // Individual file
    const parts = selection.split('/');
    const orgId = parts[0];
    const fileName = parts[parts.length - 1];
    const org = MCF_FILE_INDEX_V2[orgId];
    return org ? `${org.emoji} ${org.name} / ${fileName}` : fileName;
  }
}

/**
 * Parse selection to get org and version
 */
export function parseSelection(selection) {
  const parts = selection.split('/');
  if (parts.length >= 2) {
    return {
      orgId: parts[0],
      versionId: parts[1],
      isParent: parts.length === 2,
      fileId: parts.length > 2 ? selection : null
    };
  }
  return null;
}

