/**
 * FILE: src/utils/test-data-cleanup.js
 * PURPOSE: Utilities for managing and cleaning up test data
 * 
 * FEATURES:
 * - Clear test cache files
 * - Clear all cache files
 * - List test files
 * - Identify test data by naming convention
 */

/**
 * Clear all test cache files from localStorage
 * Test files are identified by:
 * - Path contains "TEST" or "test"
 * - Organization is "test"
 * - Version ID contains "test"
 */
export function clearTestCacheFiles() {
  console.log('🧹 Clearing test cache files...');
  
  const removed = [];
  const keysToRemove = [];
  
  // Find all test-related cache keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache_')) {
      const value = localStorage.getItem(key);
      
      // Check if it's test data
      if (key.toLowerCase().includes('test') || 
          (value && value.toLowerCase().includes('"organization":"test"')) ||
          (value && value.toLowerCase().includes('test-'))) {
        keysToRemove.push(key);
        removed.push(key.replace('cache_', '').replace(/_/g, '/'));
      }
    }
  }
  
  // Remove all test cache files
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`✅ Removed ${removed.length} test cache files`);
  
  return {
    success: true,
    filesRemoved: removed.length,
    files: removed
  };
}

/**
 * Clear ALL cache files (use with caution!)
 */
export function clearAllCacheFiles() {
  console.log('🧹 Clearing ALL cache files...');
  
  const removed = [];
  const keysToRemove = [];
  
  // Find all cache keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache_')) {
      keysToRemove.push(key);
      removed.push(key.replace('cache_', '').replace(/_/g, '/'));
    }
  }
  
  // Remove all cache files
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`✅ Removed ${removed.length} cache files`);
  
  return {
    success: true,
    filesRemoved: removed.length,
    files: removed
  };
}

/**
 * List all cache files (test and non-test)
 */
export function listAllCacheFiles() {
  const cacheFiles = {
    test: [],
    production: [],
    total: 0
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache_')) {
      const path = key.replace('cache_', '').replace(/_/g, '/');
      const size = localStorage.getItem(key)?.length || 0;
      
      const fileInfo = {
        path,
        size,
        sizeKB: (size / 1024).toFixed(2)
      };
      
      if (key.toLowerCase().includes('test')) {
        cacheFiles.test.push(fileInfo);
      } else {
        cacheFiles.production.push(fileInfo);
      }
      
      cacheFiles.total++;
    }
  }
  
  return cacheFiles;
}

/**
 * Get total cache size in localStorage
 */
export function getCacheSize() {
  let totalSize = 0;
  let testSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('cache_')) {
      const value = localStorage.getItem(key);
      const size = value?.length || 0;
      
      totalSize += size;
      
      if (key.toLowerCase().includes('test')) {
        testSize += size;
      }
    }
  }
  
  return {
    totalBytes: totalSize,
    totalKB: (totalSize / 1024).toFixed(2),
    totalMB: (totalSize / 1024 / 1024).toFixed(2),
    testBytes: testSize,
    testKB: (testSize / 1024).toFixed(2),
    testMB: (testSize / 1024 / 1024).toFixed(2),
    productionBytes: totalSize - testSize,
    productionKB: ((totalSize - testSize) / 1024).toFixed(2),
    productionMB: ((totalSize - testSize) / 1024 / 1024).toFixed(2)
  };
}

/**
 * Clear test versions from localStorage
 */
export function clearTestVersions() {
  console.log('🧹 Clearing test versions...');
  
  const removed = [];
  const keysToRemove = [];
  
  // Find all test version keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && (key.startsWith('csv_version_') || key.startsWith('csv_versions_'))) {
      const value = localStorage.getItem(key);
      
      // Check if it's test data
      if (key.toLowerCase().includes('test') || 
          (value && value.toLowerCase().includes('test'))) {
        keysToRemove.push(key);
        removed.push(key);
      }
    }
  }
  
  // Remove all test versions
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`✅ Removed ${removed.length} test versions`);
  
  return {
    success: true,
    versionsRemoved: removed.length,
    versions: removed
  };
}

/**
 * Complete test data cleanup
 * Clears everything related to test data
 */
export function completeTestCleanup() {
  console.log('🧹 Starting complete test data cleanup...');
  
  const cacheResult = clearTestCacheFiles();
  const versionResult = clearTestVersions();
  
  const result = {
    success: true,
    summary: {
      cacheFilesRemoved: cacheResult.filesRemoved,
      versionsRemoved: versionResult.versionsRemoved,
      totalItemsRemoved: cacheResult.filesRemoved + versionResult.versionsRemoved
    },
    details: {
      cacheFiles: cacheResult.files,
      versions: versionResult.versions
    }
  };
  
  console.log('✅ Test cleanup complete:', result.summary);
  
  return result;
}

/**
 * Export cache statistics
 */
export function getCacheStatistics() {
  const files = listAllCacheFiles();
  const size = getCacheSize();
  
  return {
    files: {
      total: files.total,
      test: files.test.length,
      production: files.production.length
    },
    size,
    testFiles: files.test,
    productionFiles: files.production
  };
}

