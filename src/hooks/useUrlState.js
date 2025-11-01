import { useCallback } from 'react';

/**
 * Custom hook for managing application state via URL parameters
 * Enables shareable, bookmarkable URLs for specific data views
 * Uses native browser History API (no React Router required)
 * 
 * @returns {Object} URL state management functions
 */
export function useUrlState() {
  /**
   * Read all URL parameters and return as object
   */
  const readUrlParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    return {
      org: params.get('org') || null,
      fileType: params.get('file') || null,
      version: params.get('version') || null,
      compareVersion: params.get('compare') || null,
      showDiff: params.get('diff') === 'true',
      dataSources: params.get('data') ? params.get('data').split(',') : [],
      activeTab: params.get('tab') || 'raw',
      viewMode: params.get('view') || 'formatted',
      selectedCharts: params.get('charts') ? params.get('charts').split(',') : [],
      isDarkMode: params.get('theme') === 'dark',
      showComparison: params.get('compare-formats') === 'true',
      obsIndex: params.get('obs') ? parseInt(params.get('obs'), 10) : null,
    };
  }, []);

  /**
   * Update URL with new state (without page reload)
   * @param {Object} state - State object to encode in URL
   */
  const updateUrl = useCallback((state) => {
    const params = new URLSearchParams();
    
    // Only add non-null/non-empty values to keep URLs clean
    if (state.org) params.set('org', state.org);
    if (state.fileType) params.set('file', state.fileType);
    if (state.version) params.set('version', state.version);
    if (state.compareVersion) params.set('compare', state.compareVersion);
    if (state.showDiff) params.set('diff', 'true');
    if (state.dataSources && state.dataSources.length > 0) {
      params.set('data', state.dataSources.join(','));
    }
    if (state.activeTab && state.activeTab !== 'raw') params.set('tab', state.activeTab);
    if (state.viewMode && state.viewMode !== 'formatted') params.set('view', state.viewMode);
    if (state.selectedCharts && state.selectedCharts.length > 0) {
      params.set('charts', state.selectedCharts.join(','));
    }
    if (state.isDarkMode) params.set('theme', 'dark');
    if (state.showComparison) params.set('compare-formats', 'true');
    if (state.obsIndex !== null && state.obsIndex !== undefined) params.set('obs', state.obsIndex.toString());
    
    // Use replaceState to avoid cluttering browser history with every state change
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, []);

  /**
   * Get shareable URL for current state
   * @param {Object} state - Current application state
   * @returns {string} Full shareable URL
   */
  const getShareableUrl = useCallback((state) => {
    const params = new URLSearchParams();
    
    if (state.org) params.set('org', state.org);
    if (state.fileType) params.set('file', state.fileType);
    if (state.version) params.set('version', state.version);
    if (state.compareVersion) params.set('compare', state.compareVersion);
    if (state.showDiff) params.set('diff', 'true');
    if (state.dataSources && state.dataSources.length > 0) {
      params.set('data', state.dataSources.join(','));
    }
    if (state.activeTab) params.set('tab', state.activeTab);
    if (state.viewMode) params.set('view', state.viewMode);
    if (state.selectedCharts && state.selectedCharts.length > 0) {
      params.set('charts', state.selectedCharts.join(','));
    }
    if (state.isDarkMode) params.set('theme', 'dark');
    if (state.showComparison) params.set('compare-formats', 'true');
    if (state.obsIndex !== null && state.obsIndex !== undefined) params.set('obs', state.obsIndex.toString());
    
    const queryString = params.toString();
    return `${window.location.origin}${window.location.pathname}${queryString ? '?' + queryString : ''}`;
  }, []);

  /**
   * Validate URL parameters against available data
   * @param {Object} params - URL parameters to validate
   * @param {Object} validOptions - Valid options for each parameter
   * @returns {Object} Validated parameters
   */
  const validateUrlParams = useCallback((params, validOptions = {}) => {
    const validated = { ...params };
    
    // Validate org
    if (validated.org && validOptions.orgs && !validOptions.orgs.includes(validated.org)) {
      console.warn(`Invalid org in URL: ${validated.org}`);
      validated.org = null;
    }
    
    // Validate tab
    const validTabs = ['raw', 'stat', 'datacommons', 'cached'];
    if (validated.activeTab && !validTabs.includes(validated.activeTab)) {
      console.warn(`Invalid tab in URL: ${validated.activeTab}`);
      validated.activeTab = 'raw';
    }
    
    // Validate view mode
    const validViews = ['formatted', 'raw', 'yaml', 'chart', 'edit'];
    if (validated.viewMode && !validViews.includes(validated.viewMode)) {
      console.warn(`Invalid view in URL: ${validated.viewMode}`);
      validated.viewMode = 'formatted';
    }
    
    return validated;
  }, []);

  return {
    readUrlParams,
    updateUrl,
    getShareableUrl,
    validateUrlParams,
  };
}

