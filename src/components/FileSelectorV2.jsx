/**
 * Hierarchical File Selector V2
 * 
 * Shows organization → version → files structure
 * - Selecting a VERSION (parent) loads ALL files combined (shows charts!)
 * - Selecting a FILE (child) loads just that file (for inspection/comparison)
 */

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, PackageCheck } from 'lucide-react';
import { 
  getOrganizations, 
  getVersionsForOrg, 
  getFilesForVersion,
  getAllFileIdsForVersion,
  isParentSelection,
  getDisplayName 
} from '../mcf-file-index-v2';

export function FileSelectorV2({
  selectedOrg: propSelectedOrg,
  onFileSelected,
  onCompareFileSelected,
  showDiff,
  isDarkMode
}) {
  const [selectedOrg, setSelectedOrg] = useState(propSelectedOrg || 'ilo');
  const [selectedVersion, setSelectedVersion] = useState('v01');
  const [selectedItem, setSelectedItem] = useState(`${propSelectedOrg || 'ilo'}/v01`); // Can be version (parent) or file (child)
  const [compareItem, setCompareItem] = useState('');
  const [expandedVersions, setExpandedVersions] = useState([`${propSelectedOrg || 'ilo'}/v01`]); // Track which versions are expanded
  
  // DEBUG: Log when showDiff prop changes
  console.log('🔍 FileSelectorV2 - showDiff:', showDiff, 'compareItem:', compareItem);
  
  const organizations = getOrganizations();
  
  // Update when prop changes (from header dropdown)
  useEffect(() => {
    if (propSelectedOrg && propSelectedOrg !== selectedOrg) {
      handleOrgChange(propSelectedOrg);
    }
  }, [propSelectedOrg]);
  
  // Initialize selection on mount
  useEffect(() => {
    if (selectedOrg && selectedVersion) {
      const versionPath = `${selectedOrg}/${selectedVersion}`;
      setSelectedItem(versionPath);
      
      // Load ALL files for this version (parent selection)
      const fileIds = getAllFileIdsForVersion(selectedOrg, selectedVersion);
      onFileSelected({ type: 'version', path: versionPath, fileIds });
    }
  }, []); // Only on mount
  
  // Clear comparison when diff mode is turned off OR when no base selected
  useEffect(() => {
    if (!showDiff) {
      // Diff mode is OFF - clear any comparison
      if (compareItem) {
        console.log('🔄 Diff mode OFF - clearing comparison:', compareItem);
        setCompareItem('');
        onCompareFileSelected('');
      }
    } else if (showDiff && !selectedItem) {
      // Diff mode is ON but no base - clear comparison
      console.warn('⚠️ Diff mode ON but no base selected - clearing comparison');
      setCompareItem('');
      onCompareFileSelected('');
    }
  }, [showDiff, selectedItem, compareItem, onCompareFileSelected]);
  
  // Handle organization change
  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    
    // Get first version for this org
    const versions = getVersionsForOrg(orgId);
    if (versions.length > 0) {
      const firstVersion = versions[0];
      setSelectedVersion(firstVersion.versionId);
      
      const versionPath = firstVersion.id;
      setSelectedItem(versionPath);
      setExpandedVersions([versionPath]);
      
      // Load all files for this version
      const fileIds = getAllFileIdsForVersion(orgId, firstVersion.versionId);
      onFileSelected({ type: 'version', path: versionPath, fileIds });
    }
    
    // Clear comparison
    setCompareItem('');
    onCompareFileSelected('');
  };
  
  // Toggle version expansion
  const toggleVersion = (versionPath) => {
    setExpandedVersions(prev => 
      prev.includes(versionPath)
        ? prev.filter(v => v !== versionPath)
        : [...prev, versionPath]
    );
  };
  
  // Handle selection (version or file)
  const handleSelect = (item, type) => {
    if (showDiff) {
      // In diff mode, REQUIRE a base to be selected first
      if (!selectedItem) {
        // No base selected - show warning or do nothing
        console.warn('⚠️ Please select a base item first before comparing');
        return;
      }
      
      // Prevent selecting the base item as comparison
      if (selectedItem === item) {
        console.warn('⚠️ Cannot compare an item with itself - select a different item');
        return;
      }
      
      // In diff mode, toggle the comparison item
      if (compareItem === item) {
        // Clicking the same item again - deselect it
        setCompareItem('');
        onCompareFileSelected('');
      } else {
        // Selecting a new comparison item
        setCompareItem(item);
        if (type === 'version') {
          const [orgId, versionId] = item.split('/');
          const fileIds = getAllFileIdsForVersion(orgId, versionId);
          onCompareFileSelected({ type: 'version', path: item, fileIds });
        } else {
          onCompareFileSelected({ type: 'file', path: item, fileIds: [item] });
        }
      }
    } else {
      // Normal mode - toggle the base item
      if (selectedItem === item) {
        // Clicking the same item again - deselect it (clear base)
        setSelectedItem('');
        onFileSelected(null);
      } else {
        // Selecting a new base item
        setSelectedItem(item);
        if (type === 'version') {
          const [orgId, versionId] = item.split('/');
          const fileIds = getAllFileIdsForVersion(orgId, versionId);
          onFileSelected({ type: 'version', path: item, fileIds });
        } else {
          onFileSelected({ type: 'file', path: item, fileIds: [item] });
        }
      }
    }
  };
  
  // Render a version item
  const renderVersion = (orgId, version) => {
    const versionPath = version.id;
    const isExpanded = expandedVersions.includes(versionPath);
    const isSelected = selectedItem === versionPath;
    const isComparing = compareItem === versionPath;
    const files = getFilesForVersion(orgId, version.versionId);
    
    // Check if all files are selected (for indeterminate state)
    const allFilesSelected = files.every(f => selectedItem === f.fullId);
    const someFilesSelected = files.some(f => selectedItem === f.fullId);
    const isIndeterminate = someFilesSelected && !allFilesSelected && !isSelected;
    
    return (
      <div key={versionPath} className="mb-1">
        {/* Version row (parent) */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? isDarkMode ? 'bg-blue-900/50 border-2 border-blue-500' : 'bg-blue-50 border-2 border-blue-500'
              : isComparing
              ? isDarkMode ? 'bg-purple-900/50 border-2 border-purple-500' : 'bg-purple-50 border-2 border-purple-500'
              : isDarkMode
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-100'
          }`}
        >
          {/* Checkbox */}
          <div 
            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
              (showDiff && !selectedItem && !isSelected) || (showDiff && isSelected)
                ? 'cursor-not-allowed opacity-40' 
                : 'cursor-pointer'
            }`}
            style={{
              borderColor: isComparing ? '#a855f7' : (isSelected || isIndeterminate) ? '#3b82f6' : isDarkMode ? '#6b7280' : '#d1d5db',
              backgroundColor: isSelected ? '#3b82f6' : isComparing ? '#a855f7' : 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Don't allow any action on disabled items in diff mode
              if (showDiff && ((!selectedItem && !isSelected) || isSelected)) {
                return;
              }
              handleSelect(versionPath, 'version');
            }}
            title={
              showDiff && isSelected
                ? '🔒 Base item: Cannot compare with itself'
                : showDiff && !selectedItem && !isSelected
                ? '⚠️ Please select a base item first before comparing'
                : isSelected 
                ? '☑️ Base: All files loaded (click to deselect)' 
                : isComparing
                ? '☑ Comparing: Selected for comparison'
                : isIndeterminate 
                ? '⊟ One file selected: Click to load all files' 
                : showDiff
                ? '☐ Select this to compare with base'
                : '☐ Not loaded: Click to load all files'
            }
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {isComparing && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="4" />
              </svg>
            )}
            {isIndeterminate && !isComparing && (
              <div className="w-2 h-0.5 bg-blue-500 rounded"></div>
            )}
          </div>
          
          {/* Expand/collapse icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVersion(versionPath);
            }}
            className="flex-shrink-0"
            title={isExpanded ? 'Collapse to hide files' : 'Expand to show individual files'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {/* Folder icon */}
          <div 
            className="flex-shrink-0"
            title={isExpanded ? 'Version folder (expanded)' : 'Version folder (collapsed) - Click to expand'}
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          
          {/* Version info */}
          <div
            className={`flex-1 flex items-center justify-between ${
              (showDiff && !selectedItem && !isSelected) || (showDiff && isSelected)
                ? 'cursor-not-allowed opacity-40' 
                : 'cursor-pointer'
            }`}
            onClick={() => {
              // Don't allow any action on disabled items in diff mode
              if (showDiff && ((!selectedItem && !isSelected) || isSelected)) {
                return;
              }
              handleSelect(versionPath, 'version');
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{version.name}</span>
              {version.isComplete && (
                <div 
                  className="relative group"
                  title="Complete package: All component files included (schema, variables, topics, units, etc.)"
                >
                  <PackageCheck className="h-3 w-3 text-green-500 cursor-pointer" />
                  <div className="absolute right-0 top-6 hidden group-hover:block z-50 w-64 p-2 text-xs rounded-lg shadow-lg bg-gray-900 text-white border border-gray-700 whitespace-normal">
                    <strong>✅ Complete Package</strong>
                    <p className="mt-1">All component files included. Selecting this loads all files combined with charts.</p>
                  </div>
                </div>
              )}
            </div>
            <span 
              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
              title={`This version contains ${version.fileCount} MCF file${version.fileCount > 1 ? 's' : ''}${version.hasCSV ? ' plus CSV observation data' : ''}`}
            >
              {version.fileCount} files
              {version.hasCSV && (
                <span title="Includes CSV observation data for charts"> + CSV</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Files list (children) */}
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {files.map(file => {
              const isFileSelected = selectedItem === file.fullId;
              const isFileComparing = compareItem === file.fullId;
              
              return (
                <div
                  key={file.fullId}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-all ${
                    isFileSelected
                      ? isDarkMode ? 'bg-blue-800/50 border border-blue-400' : 'bg-blue-100 border border-blue-400'
                      : isFileComparing
                      ? isDarkMode ? 'bg-purple-800/50 border border-purple-400' : 'bg-purple-100 border border-purple-400'
                      : isDarkMode
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Checkbox for individual file */}
                  <div 
                    className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                      (showDiff && !selectedItem && !isFileSelected) || (showDiff && isFileSelected)
                        ? 'cursor-not-allowed opacity-40' 
                        : 'cursor-pointer'
                    }`}
                    style={{
                      borderColor: isFileComparing ? '#a855f7' : isFileSelected ? '#3b82f6' : isDarkMode ? '#6b7280' : '#d1d5db',
                      backgroundColor: isFileSelected ? '#3b82f6' : isFileComparing ? '#a855f7' : 'transparent'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Don't allow any action on disabled items in diff mode
                      if (showDiff && ((!selectedItem && !isFileSelected) || isFileSelected)) {
                        return;
                      }
                      handleSelect(file.fullId, 'file');
                    }}
                    title={
                      showDiff && isFileSelected
                        ? `🔒 Base item: Cannot compare ${file.name} with itself`
                        : showDiff && !selectedItem && !isFileSelected
                        ? '⚠️ Please select a base item first before comparing'
                        : isFileSelected 
                        ? `☑️ Base: ${file.name} loaded (click to deselect)` 
                        : isFileComparing
                        ? `☑ Comparing: ${file.name} selected for comparison`
                        : showDiff
                        ? `☐ Select ${file.name} to compare with base`
                        : `☐ ${file.name} not loaded: Click to load just this file`
                    }
                  >
                    {isFileSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isFileComparing && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="4" />
                      </svg>
                    )}
                  </div>
                  
                  <File className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <div 
                    className={`flex-1 min-w-0 flex items-center justify-between ${
                      (showDiff && !selectedItem && !isFileSelected) || (showDiff && isFileSelected)
                        ? 'cursor-not-allowed opacity-40' 
                        : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      // Don't allow any action on disabled items in diff mode
                      if (showDiff && ((!selectedItem && !isFileSelected) || isFileSelected)) {
                        return;
                      }
                      handleSelect(file.fullId, 'file');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{file.name}</div>
                      <div className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {file.description}
                      </div>
                    </div>
                    {file.type && (
                      <span 
                        className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 cursor-pointer ${
                          file.type === 'variables' ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') :
                          file.type === 'schema' ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                          file.type === 'topics' ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700') :
                          file.type === 'units' ? (isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700') :
                          file.type === 'series' ? (isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700') :
                          file.type === 'methods' ? (isDarkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700') :
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                        title={
                          file.type === 'variables' ? 'Statistical Variables: Defines indicators (what can be measured). Charts come from these!' :
                          file.type === 'schema' ? 'Schema: Base types, enumerations, and property definitions' :
                          file.type === 'topics' ? 'Topics: Organizes indicators into UN thematic areas' :
                          file.type === 'units' ? 'Units: Measurement units (%, persons, dollars, etc.)' :
                          file.type === 'series' ? 'Series: Data series metadata and source information' :
                          file.type === 'methods' ? 'Methods: Measurement and collection methodologies' :
                          file.type === 'master' ? 'Master: Main reference file that imports/combines others' :
                          file.type === 'template' ? 'Template: TMCF template for CSV to MCF conversion' :
                          file.type === 'observations' ? 'Observations: Contains actual data values for charts' :
                          file.type
                        }
                      >
                        {file.type}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="container mx-auto px-4 py-4">
        {/* Info banner */}
        {/* Warning banner when diff mode is active but no base selected */}
        {showDiff && !selectedItem && (
          <div className={`mb-3 p-3 rounded text-sm border-2 ${
            isDarkMode 
              ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' 
              : 'bg-yellow-50 text-yellow-900 border-yellow-400'
          }`}>
            <strong>⚠️ Select a base item first:</strong> Please select a base version or file before choosing an item to compare.
            Items are disabled until you select a base.
          </div>
        )}
        
        <div className={`mb-3 p-2 rounded text-xs ${
          isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-800'
        }`}>
          <strong>💡 Tip:</strong> Checkboxes show what's loaded. 
          <strong>☑️ Checked</strong> = version (all files), 
          <strong>⊟ Dash</strong> = single file selected, 
          <strong>☐ Empty</strong> = not loaded.
          {showDiff && selectedItem && (
            <span className="ml-2">
              🔍 <strong>Diff mode active:</strong> Select second item to compare. 
              (To change base: turn off "Show Diff" first, then select new base)
            </span>
          )}
        </div>
        
        {/* File tree */}
        <div className={`max-h-96 overflow-y-auto rounded-lg p-2 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {selectedOrg && getVersionsForOrg(selectedOrg).map(version => 
            renderVersion(selectedOrg, version)
          )}
        </div>
        
        {/* Selection summary */}
        <div className={`mt-3 p-2 rounded text-xs ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <strong>Selected:</strong> {getDisplayName(selectedItem)}
              {isParentSelection(selectedItem) && 
                <span 
                  className="ml-2 text-green-500 cursor-pointer"
                  title="All files in this version are loaded and combined. Charts will be generated from the complete dataset."
                >
                  📊 (All files combined)
                </span>
              }
            </div>
            {showDiff && compareItem && (
              <div>
                <strong>Comparing with:</strong> {getDisplayName(compareItem)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

