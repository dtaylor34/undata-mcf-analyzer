/**
 * FILE: src/utils/csv-version-tracker.js
 * PURPOSE: CSV version tracking and metadata management
 * 
 * FEATURES:
 * - Track CSV versions with metadata
 * - Compare versions
 * - Generate version IDs
 * - Store/load version history
 */

/**
 * Generate a unique version ID
 * @param {string} organization - Organization name (ILO, SDG, etc.)
 * @param {string} datasetName - Dataset name
 * @returns {string} - Version ID (e.g., "ilo-q4-2025-v1")
 */
export function generateVersionId(organization, datasetName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${organization.toLowerCase()}-${datasetName.toLowerCase()}-${random}`;
}

/**
 * Create version metadata
 * @param {Object} params - Version parameters
 * @returns {Object} - Version metadata
 */
export function createVersionMetadata({
  organization,
  datasetName,
  fileName,
  fileSize,
  rowCount,
  columnCount,
  columns,
  sampleData,
  uploadedBy,
  notes
}) {
  return {
    id: generateVersionId(organization, datasetName),
    organization,
    datasetName,
    fileName,
    fileSize,
    rowCount,
    columnCount,
    columns,
    sampleData: sampleData || [],
    uploadedBy: uploadedBy || 'anonymous',
    uploadDate: new Date().toISOString(),
    notes: notes || '',
    status: 'raw', // raw, csv, mcf, deployed
    version: 1,
    previousVersion: null,
    changes: []
  };
}

/**
 * Compare two CSV versions
 * @param {Object} oldVersion - Old version metadata
 * @param {Object} newVersion - New version metadata
 * @returns {Object} - Comparison results
 */
export function compareVersions(oldVersion, newVersion) {
  const changes = [];
  
  // Row count changes
  if (oldVersion.rowCount !== newVersion.rowCount) {
    const diff = newVersion.rowCount - oldVersion.rowCount;
    changes.push({
      type: 'rows',
      action: diff > 0 ? 'added' : 'removed',
      count: Math.abs(diff),
      description: `${Math.abs(diff)} rows ${diff > 0 ? 'added' : 'removed'}`
    });
  }
  
  // Column changes
  const oldColumns = new Set(oldVersion.columns || []);
  const newColumns = new Set(newVersion.columns || []);
  
  const addedColumns = [...newColumns].filter(col => !oldColumns.has(col));
  const removedColumns = [...oldColumns].filter(col => !newColumns.has(col));
  
  if (addedColumns.length > 0) {
    changes.push({
      type: 'columns',
      action: 'added',
      columns: addedColumns,
      description: `Added columns: ${addedColumns.join(', ')}`
    });
  }
  
  if (removedColumns.length > 0) {
    changes.push({
      type: 'columns',
      action: 'removed',
      columns: removedColumns,
      description: `Removed columns: ${removedColumns.join(', ')}`
    });
  }
  
  // File size change
  if (oldVersion.fileSize !== newVersion.fileSize) {
    const diff = newVersion.fileSize - oldVersion.fileSize;
    const diffPercent = ((diff / oldVersion.fileSize) * 100).toFixed(1);
    changes.push({
      type: 'size',
      action: diff > 0 ? 'increased' : 'decreased',
      diff: Math.abs(diff),
      percent: Math.abs(diffPercent),
      description: `File size ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diffPercent)}%`
    });
  }
  
  return {
    hasChanges: changes.length > 0,
    changes,
    summary: {
      rowChange: newVersion.rowCount - oldVersion.rowCount,
      columnChange: newColumns.size - oldColumns.size,
      sizeChange: newVersion.fileSize - oldVersion.fileSize
    }
  };
}

/**
 * Parse CSV content to extract metadata
 * @param {string} csvContent - CSV file content
 * @param {string} fileName - File name
 * @returns {Object} - Parsed metadata
 */
export function parseCSVMetadata(csvContent, fileName) {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Parse header
  const headerLine = lines[0];
  const columns = headerLine.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
  
  // Get row count (excluding header)
  const rowCount = lines.length - 1;
  
  // Get sample data (first 5 rows)
  const sampleData = lines.slice(0, 6).map(line => {
    return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
  });
  
  return {
    fileName,
    fileSize: csvContent.length,
    rowCount,
    columnCount: columns.length,
    columns,
    sampleData
  };
}

/**
 * Save version to localStorage
 * @param {Object} version - Version metadata
 */
export function saveVersion(version) {
  const key = `csv_version_${version.id}`;
  localStorage.setItem(key, JSON.stringify(version));
  
  // Update version list
  const listKey = `csv_versions_${version.organization.toLowerCase()}`;
  const existingList = JSON.parse(localStorage.getItem(listKey) || '[]');
  
  if (!existingList.find(v => v.id === version.id)) {
    existingList.push({
      id: version.id,
      datasetName: version.datasetName,
      version: version.version,
      uploadDate: version.uploadDate,
      status: version.status
    });
    localStorage.setItem(listKey, JSON.stringify(existingList));
  }
}

/**
 * Load version from localStorage
 * @param {string} versionId - Version ID
 * @returns {Object|null} - Version metadata
 */
export function loadVersion(versionId) {
  const key = `csv_version_${versionId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Load all versions for an organization
 * @param {string} organization - Organization name
 * @returns {Array} - List of versions
 */
export function loadVersionsByOrganization(organization) {
  const listKey = `csv_versions_${organization.toLowerCase()}`;
  return JSON.parse(localStorage.getItem(listKey) || '[]');
}

/**
 * Update version status
 * @param {string} versionId - Version ID
 * @param {string} newStatus - New status (raw, csv, mcf, deployed)
 */
export function updateVersionStatus(versionId, newStatus) {
  const version = loadVersion(versionId);
  if (version) {
    version.status = newStatus;
    version.lastModified = new Date().toISOString();
    saveVersion(version);
  }
}

/**
 * Generate version changelog
 * @param {Array} versions - List of versions (ordered by date)
 * @returns {Array} - Changelog entries
 */
export function generateChangelog(versions) {
  const changelog = [];
  
  for (let i = 1; i < versions.length; i++) {
    const oldVersion = loadVersion(versions[i - 1].id);
    const newVersion = loadVersion(versions[i].id);
    
    if (oldVersion && newVersion) {
      const comparison = compareVersions(oldVersion, newVersion);
      changelog.push({
        from: oldVersion.version,
        to: newVersion.version,
        date: newVersion.uploadDate,
        changes: comparison.changes,
        summary: comparison.summary
      });
    }
  }
  
  return changelog;
}

/**
 * Export version metadata to JSON
 * @param {string} versionId - Version ID
 * @returns {string} - JSON string
 */
export function exportVersionMetadata(versionId) {
  const version = loadVersion(versionId);
  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }
  return JSON.stringify(version, null, 2);
}

/**
 * Clear all versions for an organization (dangerous!)
 * @param {string} organization - Organization name
 */
export function clearVersions(organization) {
  const listKey = `csv_versions_${organization.toLowerCase()}`;
  const versions = loadVersionsByOrganization(organization);
  
  // Remove all individual version entries
  versions.forEach(v => {
    localStorage.removeItem(`csv_version_${v.id}`);
  });
  
  // Remove the list
  localStorage.removeItem(listKey);
}

