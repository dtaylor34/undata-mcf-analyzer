import { useState, useEffect } from 'react';
import { FileSelectorV2 } from './components/FileSelectorV2';
import { DataSourceSelector } from './components/DataSourceSelector';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import DiffViewer from './components/DiffViewer';
import CodeDisplay from './components/CodeDisplay';
import ChartPreview from './components/ChartPreview';
import { CodeEditor } from './components/CodeEditor';
import { ChartFilter } from './components/ChartFilter';
import { DualChartPreview } from './components/DualChartPreview';
import { ThematicAreasExplorer } from './components/ThematicAreasExplorer';
import { FormatComparison } from './components/FormatComparison';
import TranscodingViewer from './components/TranscodingViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Sun, Moon, Database, ChevronDown, GitCompare, Share2 } from 'lucide-react';
import { Label } from './components/ui/label';
import { getAllOrganizations, getStatistics } from './real-catalog';
import { useUrlState } from './hooks/useUrlState';
import { getCurrentPermissions, filterOrganizations, filterFiles, filterDataSources, validateUrlPermissions, isAdmin } from './utils/permissions';
import { parseMCF, extractStatisticalVariables, extractObservations, observationsToChartData, parseAndAnalyzeMCF } from './mcf-parser';
import { loadCSVAndConvert, combineSchemaAndObservations } from './csv-to-mcf-converter';
import { csvToMCF, generateAllFormats, observationToFormats } from './utils/csv-to-mcf';
import { getOrganizations } from './mcf-file-index-v2';

// Dynamic MCF file loader - loads real files from public folder
async function loadMCFFile(fileId) {
  try {
    // Convert file ID to public URL path
    const publicPath = `/datacommons/${fileId}`;
    
    console.log('🔍 Loading MCF file:', publicPath);
    
    // Fetch the actual MCF file
    const response = await fetch(publicPath);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log('✅ Loaded file successfully:', publicPath, `(${content.length} chars)`);
    
    return content;
  } catch (error) {
    console.error('❌ Error loading MCF file:', fileId, error);
    
    // Fallback: try GitHub if local fetch fails
    try {
      const githubUrl = `https://raw.githubusercontent.com/UN-Data-Commons/un-data-commons-etl/main/datacommons/${fileId}`;
      console.log('🔄 Trying GitHub fallback:', githubUrl);
      
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        console.log('✅ Loaded from GitHub:', githubUrl, `(${content.length} chars)`);
        return content;
      }
    } catch (githubError) {
      console.error('❌ GitHub fallback failed:', githubError);
    }
    
    return null;
  }
}

// Mock MCF data kept for reference (not used - real files loaded via fetch)
const mockMCFData = {
  'unemployment_rate.mcf': {
    'v1.0.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1`,
    'v1.1.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue
name: "Unemployment Rate"

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1

Node: Observation_UnemploymentRate_US_2021
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2021"
value: 5.4`,
    'v1.2.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue
name: "Unemployment Rate"
description: "Percentage of labor force that is unemployed"

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1

Node: Observation_UnemploymentRate_US_2021
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2021"
value: 5.4

Node: Observation_UnemploymentRate_US_2022
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2022"
value: 3.6`,
  },
  'population_census.mcf': {
    'v1.0.0': `Node: PopulationTotal
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue`,
  },
  'gdp_annual.mcf': {
    'v1.0.0': `Node: GDP_Annual
typeOf: dcs:StatisticalVariable
measuredProperty: dcs:amount
statType: dcs:measuredValue`,
  },
  'climate_temperature.mcf': {
    'v1.0.0': `Node: Temperature_Average
typeOf: dcs:StatisticalVariable
measuredProperty: dcs:temperature
statType: dcs:measuredValue`,
  },
};

// Transform functions for different views
const generateRawCode = (mcf) => mcf;

const generateFormattedCode = (mcf) => {
  return mcf
    .split('\n')
    .map((line) => {
      if (line.startsWith('Node:')) return line;
      if (line.trim() === '') return line;
      return '  ' + line;
    })
    .join('\n');
};

const generateStatView = (mcf) => {
  return `# STAT Format
# Generated from MCF

[StatisticalVariable]
${mcf
  .split('\n')
  .filter((line) => line.includes(':'))
  .map((line) => line.replace(/^(Node: |typeOf: |populationType: )/, ''))
  .join('\n')}

# End of STAT file`;
};

const generateDataCommonsView = (mcf) => {
  const nodes = mcf.split('\n\n');
  const jsonNodes = nodes.map((node) => {
    const lines = node.split('\n').filter((l) => l.trim());
    const obj = {};
    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/"/g, '');
      if (key.trim() !== '') {
        obj[key.trim()] = value || '';
      }
    });
    return obj;
  });

  return JSON.stringify({ nodes: jsonNodes }, null, 2);
};

const generateCachedVersion = (mcf) => {
  return `/* 
 * Cached MCF File
 * Generated: ${new Date().toISOString()}
 * Optimized for local website use
 */

${mcf}

/* End of cached file */`;
};

const generateChartData = (mcf) => {
  const observations = mcf.match(/observationDate: "(\d+)"\s+value: ([\d.]+)/g);
  if (!observations) {
    return [
      { name: '2020', value: 8.1 },
      { name: '2021', value: 5.4 },
      { name: '2022', value: 3.6 },
    ];
  }

  return observations.map((obs) => {
    const dateMatch = obs.match(/observationDate: "(\d+)"/);
    const valueMatch = obs.match(/value: ([\d.]+)/);
    return {
      name: dateMatch ? dateMatch[1] : '',
      value: valueMatch ? parseFloat(valueMatch[1]) : 0,
    };
  });
};

const generateYAMLView = (mcf) => {
  // Convert MCF to YAML format
  const nodes = mcf.split('\n\n').filter(n => n.trim());
  
  let yaml = '# MCF to YAML conversion\n---\n';
  
  nodes.forEach((node, idx) => {
    const lines = node.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    
    yaml += `\nnode_${idx + 1}:\n`;
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^"|"$/g, '');
        yaml += `  ${key}: "${value}"\n`;
      }
    });
  });
  
  return yaml;
};

const generateStatYAML = (mcf) => {
  const statContent = generateStatView(mcf);
  return `# STAT Format (YAML)\n---\nstat_format:\n  content: |\n${statContent.split('\n').map(l => '    ' + l).join('\n')}`;
};

const generateDataCommonsYAML = (mcf) => {
  const jsonContent = generateDataCommonsView(mcf);
  try {
    const parsed = JSON.parse(jsonContent);
    return `# DataCommons (YAML)\n---\n${JSON.stringify(parsed, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}`;
  } catch {
    return '# Error converting to YAML';
  }
};

const generateCachedYAML = (mcf) => {
  const cachedContent = generateCachedVersion(mcf);
  return `# Cached Version (YAML)\n---\ncached:\n  timestamp: "${new Date().toISOString()}"\n  content: |\n${cachedContent.split('\n').map(l => '    ' + l).join('\n')}`;
};

export default function App() {
  // URL state management hook
  const { readUrlParams, updateUrl, getShareableUrl } = useUrlState();
  
  // Permission system
  const [currentPermissions, setCurrentPermissions] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('raw');
  
  // Organization selection (now in header)
  const [selectedOrg, setSelectedOrg] = useState('sdg');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const organizationsForDropdown = getOrganizations();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOrgDropdown && !event.target.closest('.org-dropdown')) {
        setShowOrgDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOrgDropdown]);
  
  // File selection state (can be version or individual file)
  const [selectedFileId, setSelectedFileId] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState([]); // For combined loading
  const [compareFileId, setCompareFileId] = useState('');
  const [compareFileIds, setCompareFileIds] = useState([]); // For combined comparison
  const [showDiff, setShowDiff] = useState(false);
  const [isMultiFile, setIsMultiFile] = useState(false); // Track if loading multiple files
  
  // MCF content state
  const [currentMCFContent, setCurrentMCFContent] = useState('');
  const [compareMCFContent, setCompareMCFContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // File analysis & data source combination
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [combinedMCFContent, setCombinedMCFContent] = useState('');
  
  // View mode states for each tab: 'formatted' | 'raw' | 'yaml' | 'chart' | 'edit'
  const [rawViewMode, setRawViewMode] = useState('formatted');
  const [statViewMode, setStatViewMode] = useState('formatted');
  const [datacommonsViewMode, setDatacommonsViewMode] = useState('formatted');
  const [cachedViewMode, setCachedViewMode] = useState('formatted');
  
  // Edit format preference for each tab: 'formatted' | 'raw'
  const [rawEditFormat, setRawEditFormat] = useState('formatted');
  const [statEditFormat, setStatEditFormat] = useState('formatted');
  const [datacommonsEditFormat, setDatacommonsEditFormat] = useState('formatted');
  const [cachedEditFormat, setCachedEditFormat] = useState('formatted');
  
  // Edit mode content states
  const [rawEditContent, setRawEditContent] = useState('');
  const [statEditContent, setStatEditContent] = useState('');
  const [datacommonsEditContent, setDatacommonsEditContent] = useState('');
  const [cachedEditContent, setCachedEditContent] = useState('');
  
  // Edit mode chart preview states
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [editPreviewData, setEditPreviewData] = useState([]);
  
  // Dual chart preview (DataCommons + .STAT side-by-side)
  const [showDualCharts, setShowDualCharts] = useState(false);
  const [showTranscodingViewer, setShowTranscodingViewer] = useState(false);
  
  // Chart filtering states
  const [selectedCharts, setSelectedCharts] = useState([]);
  
  // Format comparison state (test feature)
  const [showFormatComparison, setShowFormatComparison] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [selectedObsIndex, setSelectedObsIndex] = useState(0);
  const [allObservations, setAllObservations] = useState([]);
  const [initialUrlLoad, setInitialUrlLoad] = useState(true); // Track if we're loading from URL
  
  // Handler for chart data point clicks - opens Format Comparison
  const handleChartDataPointClick = (pointData) => {
    console.log('📊 Chart point clicked:', pointData);
    
    if (!allObservations || allObservations.length === 0) {
      console.warn('⚠️ No observations loaded');
      return;
    }
    
    // Find the matching observation in allObservations
    let matchedIndex = -1;
    
    // Try to match by observation reference first (most reliable)
    if (pointData.observation) {
      matchedIndex = allObservations.findIndex(obs => 
        obs.variable === pointData.observation.variable &&
        obs.date === pointData.observation.date &&
        obs.about === pointData.observation.about &&
        obs.value === pointData.observation.value
      );
    }
    
    // Fallback: match by date, value, and entity
    if (matchedIndex === -1) {
      matchedIndex = allObservations.findIndex(obs => 
        obs.date === pointData.date &&
        parseFloat(obs.value) === parseFloat(pointData.value) &&
        obs.about === pointData.entity
      );
    }
    
    if (matchedIndex !== -1) {
      console.log(`✅ Found matching observation at index ${matchedIndex}`);
      setSelectedObsIndex(matchedIndex);
      setSelectedObservation(allObservations[matchedIndex]);
      setShowFormatComparison(true);
    } else {
      console.warn('⚠️ Could not find matching observation for clicked point');
    }
  };
  
  // Initialize permissions on mount
  useEffect(() => {
    const permissions = getCurrentPermissions();
    setCurrentPermissions(permissions);
    setIsAdminUser(isAdmin(permissions));
    console.log('🔐 Current permissions loaded:', permissions);
  }, []);
  
  // Initialize state from URL on mount (after permissions)
  useEffect(() => {
    if (!currentPermissions) return; // Wait for permissions to load
    
    const urlParams = readUrlParams();
    console.log('📥 Loading state from URL:', urlParams);
    
    // Validate URL params against permissions
    const validation = validateUrlPermissions(urlParams, currentPermissions);
    if (!validation.isValid) {
      console.warn('⚠️ URL contains restricted parameters:', validation.errors);
    }
    
    // Apply URL params to state (only if they exist and are allowed)
    if (urlParams.isDarkMode !== undefined) setIsDarkMode(urlParams.isDarkMode);
    if (urlParams.activeTab) setActiveTab(urlParams.activeTab);
    
    // Auto-select file from URL params
    if (urlParams.org && urlParams.fileType) {
      const fileId = `${urlParams.org}/${urlParams.fileType}`;
      console.log('📂 Auto-selecting file from URL:', fileId);
      
      // IMPORTANT: Clear old file IDs first to prevent loading wrong files
      setSelectedFileIds([]);
      setSelectedFileId(fileId);
      
      // Handle comparison if specified in URL
      if (urlParams.compareVersion) {
        const compareFileId = urlParams.compareVersion; // This is already the full file ID
        
        // CRITICAL: Prevent comparing a file with itself
        if (compareFileId !== fileId) {
          console.log('📊 Auto-selecting comparison from URL:', compareFileId);
          setCompareFileId(compareFileId);
          
          // Load comparison file IDs
          import('./mcf-file-index-v2.js').then(({ getAllFileIdsForVersion }) => {
            const [compareOrg, compareVersion] = compareFileId.split('/');
            try {
              const compareIds = getAllFileIdsForVersion(compareOrg, compareVersion);
              if (compareIds && compareIds.length > 0) {
                setCompareFileIds(compareIds);
                console.log(`📋 Loaded ${compareIds.length} comparison file IDs for ${compareFileId}`);
              }
            } catch (err) {
              console.warn('Could not get comparison file IDs:', err);
            }
          });
          
          // Only enable showDiff if we have both base and valid comparison
          if (urlParams.showDiff) {
            setShowDiff(true);
          }
        } else {
          console.warn('⚠️ Cannot compare a file with itself - ignoring URL compare parameter');
          // Clear the invalid comparison from URL
          setCompareFileId('');
          setCompareFileIds([]);
          setShowDiff(false);
        }
      } else {
        // No comparison in URL - only enable showDiff if there's a base file
        if (urlParams.showDiff) {
          setShowDiff(urlParams.showDiff);
        }
      }
      
      // Try to get the correct file IDs for this version
      import('./mcf-file-index-v2.js').then(({ getAllFileIdsForVersion }) => {
        const [org, version] = fileId.split('/');
        try {
          const fileIds = getAllFileIdsForVersion(org, version);
          if (fileIds && fileIds.length > 0) {
            setSelectedFileIds(fileIds);
            console.log(`📋 Loaded ${fileIds.length} file IDs for ${fileId}`);
          }
        } catch (err) {
          console.warn('Could not get file IDs:', err);
        }
      });
    } else if (urlParams.showDiff) {
      console.warn('⚠️ Cannot enable diff mode without a base file selected');
    }
    
    // Don't open comparison modal yet - wait for observations to load
    // This will be handled by the separate useEffect below
  }, [currentPermissions]); // Run when permissions are loaded
  
  // Safety check: Turn off diff mode if no base is selected
  useEffect(() => {
    if (showDiff && !selectedFileId) {
      console.warn('⚠️ Diff mode active without base selected - turning off');
      setShowDiff(false);
      setCompareFileId('');
      setCompareFileIds([]);
    }
  }, [showDiff, selectedFileId]);
  
  // Auto-open format comparison and jump to observation if specified in URL (runs ONCE when observations load)
  useEffect(() => {
    // Only run if we have observations and haven't opened the modal yet
    if (allObservations.length === 0 || showFormatComparison) return;
    
    const urlParams = readUrlParams();
    console.log('🔗 Checking URL params for comparison:', { 
      showComparison: urlParams.showComparison, 
      obsIndex: urlParams.obsIndex,
      observationsLoaded: allObservations.length,
      modalAlreadyOpen: showFormatComparison
    });
    
    // Open modal if URL requests it
    if (urlParams.showComparison) {
      console.log('✅ Opening Format Comparison from URL');
      const targetIndex = (urlParams.obsIndex !== null && urlParams.obsIndex >= 0 && urlParams.obsIndex < allObservations.length) 
        ? urlParams.obsIndex 
        : 0;
      
      setSelectedObsIndex(targetIndex);
      setSelectedObservation(allObservations[targetIndex]);
      setShowFormatComparison(true);
      
      console.log(`📊 Showing observation ${targetIndex + 1} of ${allObservations.length}`);
      
      // Now that modal is open, we can allow URL updates
      setTimeout(() => setInitialUrlLoad(false), 100);
    }
  }, [allObservations.length]); // Only depend on observation count, not the array or modal state
  
  // Fallback: Enable URL updates after 5 seconds even if observations never load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (initialUrlLoad) {
        console.log('⏱️ Initial URL load timeout - enabling URL updates');
        setInitialUrlLoad(false);
      }
    }, 5000); // Increased from 2 to 5 seconds
    
    return () => clearTimeout(timeout);
  }, [initialUrlLoad]);
  
  // Update URL whenever relevant state changes (but skip during initial load)
  useEffect(() => {
    // Don't update URL during initial load to preserve incoming URL parameters
    if (initialUrlLoad) {
      console.log('⏸️ Skipping URL update during initial load');
      return;
    }
    
    // CRITICAL: Only include compareVersion if it's different from base
    const validCompareVersion = (compareFileId && compareFileId !== selectedFileId) ? compareFileId : null;
    
    const state = {
      isDarkMode,
      activeTab,
      showDiff,
      org: selectedFileId ? selectedFileId.split('/')[0] : null,
      fileType: selectedFileId ? selectedFileId.split('/').slice(1).join('/') : null,
      compareVersion: validCompareVersion,
      dataSources: selectedDataSources.map(s => s.csvFile),
      selectedCharts: selectedCharts.length > 0 ? selectedCharts : null,
      showComparison: showFormatComparison,
      obsIndex: showFormatComparison ? selectedObsIndex : null,
    };
    
    updateUrl(state);
  }, [isDarkMode, activeTab, showDiff, selectedFileId, compareFileId, selectedDataSources, selectedCharts, showFormatComparison, selectedObsIndex, initialUrlLoad, updateUrl]);

  // Auto-select all charts when MCF content changes
  // Process MCF content for charts (using combined content as source of truth)
  // This runs AFTER currentMCF is computed from combinedMCFContent || currentMCFContent
  useEffect(() => {
    // Use the source of truth (defined later in code)
    const mcfContent = combinedMCFContent || currentMCFContent;
    
    if (mcfContent) {
      try {
        console.log('📊 Processing MCF content for charts...');
        console.log('MCF Content length:', mcfContent.length);
        
        const nodes = parseMCF(mcfContent);
        console.log('✅ Parsed nodes:', nodes.length);
        
        const statisticalVariables = extractStatisticalVariables(nodes);
        console.log('✅ Statistical Variables:', statisticalVariables.length, statisticalVariables.map(v => v.dcid || v.name));
        
        const observations = extractObservations(nodes);
        console.log('✅ Observations:', observations.length);
        
        if (observations.length > 0) {
          console.log('Sample observation:', observations[0]);
        }
        
        const chartDataArray = observationsToChartData(observations, statisticalVariables);
        console.log('✅ Chart Data Array:', chartDataArray.length);
        
        if (chartDataArray.length > 0) {
          console.log('Sample chart:', {
            id: chartDataArray[0].id,
            title: chartDataArray[0].title,
            dataPoints: chartDataArray[0].data?.length,
            unit: chartDataArray[0].unit
          });
        }
        
        // Auto-select all charts
        if (chartDataArray.length > 0) {
          const allChartIds = chartDataArray.map((_, index) => `chart-${index}`);
          setSelectedCharts(allChartIds);
          console.log(`✅ Auto-selected ${allChartIds.length} charts:`, allChartIds);
        } else {
          console.warn('⚠️ No charts generated - no observations found in MCF');
          setSelectedCharts([]);
        }
      } catch (error) {
        console.error('❌ Error processing MCF for charts:', error);
        setSelectedCharts([]);
      }
    } else {
      console.log('ℹ️ No MCF content to process');
      setSelectedCharts([]);
    }
  }, [combinedMCFContent, currentMCFContent]);

  // Load real catalog data
  const [catalogStats, setCatalogStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    // Load real data statistics
    const stats = getStatistics();
    const orgs = getAllOrganizations();
    setCatalogStats(stats);
    setOrganizations(orgs);
    console.log('📊 Real Catalog Loaded:', stats);
    console.log('🏢 Organizations:', orgs);
  }, []);
  
  // Load MCF file(s) when selection changes
  useEffect(() => {
    async function loadFiles() {
      // CRITICAL: Check if selectedFileIds actually belong to the current selectedFileId's org
      // Use selectedFileIds if available and they match the current organization
      let fileIds = [selectedFileId];
      
      if (selectedFileIds.length > 0) {
        // Extract organization from selectedFileId (e.g., "ilo/sample-data" -> "ilo")
        const currentOrg = selectedFileId.split('/')[0];
        
        // Check if ALL selectedFileIds belong to this organization
        const allMatch = selectedFileIds.every(id => id.startsWith(currentOrg + '/'));
        
        if (allMatch) {
          fileIds = selectedFileIds;
          console.log(`✅ Using ${selectedFileIds.length} file IDs: ${selectedFileIds.join(', ')}`);
        } else {
          console.log(`⚠️ Ignoring cached file IDs (don't match org: ${currentOrg}), falling back to: ${selectedFileId}`);
        }
      } else {
        console.log(`ℹ️ No cached file IDs, using: ${selectedFileId}`);
      }
      
      if (fileIds.length === 0 || !fileIds[0]) return;
      
      // CRITICAL: Clear observations FIRST to prevent accumulation
      setAllObservations([]);
      
      setIsLoading(true);
      setIsMultiFile(selectedFileIds.length > 1);
      
      try {
        // Store the loaded schema content for later use with CSV
        let loadedSchemaContent = '';
        
        if (fileIds.length === 1) {
          // Single file mode
          const content = await loadMCFFile(fileIds[0]);
          loadedSchemaContent = content || '';
          setCurrentMCFContent(loadedSchemaContent);
          console.log('📄 Loaded file:', fileIds[0]);
          
          // Analyze the file
          const analysis = analyzeMCFFile(loadedSchemaContent);
          setFileAnalysis(analysis);
          console.log('📊 File Analysis:', analysis);
        } else {
          // Multiple files mode - load and combine all
          console.log(`📦 Loading ${fileIds.length} files...`);
          const contents = await Promise.all(
            fileIds.map(fileId => loadMCFFile(fileId))
          );
          
          // Combine all files with separators
          const combined = contents
            .map((content, idx) => {
              const fileName = fileIds[idx].split('/').pop();
              return `\n\n# ========================================\n# File: ${fileName}\n# ========================================\n\n${content}`;
            })
            .join('\n');
          
          loadedSchemaContent = combined;
          setCurrentMCFContent(loadedSchemaContent);
          console.log(`✅ Combined ${fileIds.length} files (${combined.length} chars)`);
          
          // Analyze combined content
          const analysis = analyzeMCFFile(loadedSchemaContent);
          setFileAnalysis(analysis);
          console.log('📊 Combined File Analysis:', analysis);
        }
        
        // Check if this version has CSV files
        if (selectedFileId) {
          const parts = selectedFileId.split('/');
          const org = parts[0];
          const versionOrFile = parts.length > 1 ? parts[1] : null;
          
          // Try to find version info in file index
          let versionInfo = null;
          try {
            const { MCF_FILE_INDEX_V2 } = await import('./mcf-file-index-v2.js');
            if (MCF_FILE_INDEX_V2[org]?.versions?.[versionOrFile]) {
              versionInfo = MCF_FILE_INDEX_V2[org].versions[versionOrFile];
            }
          } catch (err) {
            console.warn('Could not load file index:', err);
          }
          
          // If this version has CSV files, load them
          if (versionInfo?.hasCSV && versionInfo?.csvFiles?.length > 0) {
            console.log(`📊 CSV data detected for ${org}/${versionOrFile} - loading...`);
            try {
              const csvFile = versionInfo.csvFiles[0]; // Load first CSV file
              const csvPath = `/datacommons/${csvFile.id}`;
              console.log(`🔍 Loading CSV: ${csvPath}`);
              
              const csvResponse = await fetch(csvPath);
              if (csvResponse.ok) {
                const csvContent = await csvResponse.text();
                console.log('✅ Loaded CSV file');
                
                // Convert CSV to MCF observations
                const mcfObservations = csvToMCF(csvContent);
                
                // CRITICAL: Use freshly loaded schema, not stale state
                const finalMCF = loadedSchemaContent + '\n\n' + mcfObservations;
                setCurrentMCFContent(finalMCF);
                console.log(`✅ Combined schema (${loadedSchemaContent.length} chars) + CSV observations`);
                
                // Generate all observations with all formats for comparison
                const observations = generateAllFormats(finalMCF);
                const observationsWithFormats = observations.map(obs => ({
                  ...obs,
                  formats: observationToFormats(obs)
                }));
                setAllObservations(observationsWithFormats);
                console.log(`✅ Generated ${observations.length} observations with all formats`);
              } else {
                console.warn(`⚠️ CSV file not found: ${csvPath}`);
              }
            } catch (csvError) {
              console.error('❌ Error loading CSV:', csvError);
            }
          }
        }
        
        // Reset data sources when changing files
        setSelectedDataSources([]);
        setCombinedMCFContent('');
        
        // Clear all edit content states when file changes
        setRawEditContent('');
        setStatEditContent('');
        setDatacommonsEditContent('');
        setCachedEditContent('');
        
        // Clear edit preview
        setShowEditPreview(false);
        setEditPreviewData([]);
        
      } catch (error) {
        console.error('Error loading files:', error);
        setCurrentMCFContent('');
        setFileAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFiles();
  }, [selectedFileId, selectedFileIds]);
  
  // Load compare version when diff is shown
  useEffect(() => {
    async function loadCompareFile() {
      if (!showDiff || !compareFileId) {
        setCompareMCFContent('');
        return;
      }
      
      try {
        const content = await loadMCFFile(compareFileId);
        setCompareMCFContent(content || '');
        console.log('📄 Loaded compare file:', compareFileId);
      } catch (error) {
        console.error('Error loading compare file:', error);
        setCompareMCFContent('');
      }
    }
    
    loadCompareFile();
  }, [showDiff, compareFileId]);
  
  // Combine schema MCF with selected CSV data sources
  // THIS IS WHERE MCF SOURCE OF TRUTH IS MAINTAINED
  useEffect(() => {
    async function combineDataSources() {
      // If no data sources selected, use original content
      if (selectedDataSources.length === 0) {
        setCombinedMCFContent('');
        return;
      }
      
      try {
        console.log(`🔗 Combining schema with ${selectedDataSources.length} data source(s)...`);
        
        // Load all CSV files and convert to observations
        let allObservations = [];
        for (const source of selectedDataSources) {
          const observations = await loadCSVAndConvert(source.csvFile, source.basePath);
          allObservations = [...allObservations, ...observations];
          console.log(`  ✅ Loaded ${observations.length} observations from ${source.csvFile}`);
        }
        
        // Combine schema with observations - MCF remains source of truth
        const combined = combineSchemaAndObservations(currentMCFContent, allObservations);
        setCombinedMCFContent(combined);
        console.log(`✅ Combined MCF with ${allObservations.length} observations`);
        
      } catch (error) {
        console.error('❌ Error combining data sources:', error);
        setCombinedMCFContent('');
      }
    }
    
    combineDataSources();
  }, [currentMCFContent, selectedDataSources]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Analyze MCF file to determine if it has observations (data)
   * Returns status and counts for UI display
   */
  const analyzeMCFFile = (mcfContent) => {
    if (!mcfContent) return null;
    
    try {
      const nodes = parseMCF(mcfContent);
      const variables = extractStatisticalVariables(nodes);
      const observations = extractObservations(nodes);
      
      return {
        status: observations.length > 0 ? 'COMPLETE' : 'NEEDS_DATA',
        variableCount: variables.length,
        observationCount: observations.length,
        canGenerateCharts: observations.length > 0,
        chartCount: observations.length > 0 ? observationsToChartData(observations, variables).length : 0
      };
    } catch (error) {
      console.error('Error analyzing MCF file:', error);
      return {
        status: 'ERROR',
        variableCount: 0,
        observationCount: 0,
        canGenerateCharts: false,
        chartCount: 0
      };
    }
  };

  // Use combined content if available, otherwise use original
  // THIS IS THE SOURCE OF TRUTH FOR ALL TABS
  const currentMCF = combinedMCFContent || currentMCFContent;
  const compareMCF = compareMCFContent;

  // ============================================================
  // MCF TRANSFORMATION FUNCTIONS
  // All formats are dynamically generated from MCF source
  // ============================================================

  /**
   * Format MCF with proper spacing (source display)
   */
  const generateFormattedCode = (mcfContent) => {
    if (!mcfContent) return '';
    // Format MCF with proper spacing between nodes
    return mcfContent.split('\n\n').map(block => block.trim()).join('\n\n');
  };

  /**
   * Transform MCF → .STAT (SDMX) Format
   * Extracts dimensions, measures, and builds SDMX-compliant structure
   */
  const generateStatView = (mcfContent) => {
    if (!mcfContent) return '';
    
    try {
      const nodes = parseMCF(mcfContent);
      const statisticalVariables = extractStatisticalVariables(nodes);
      const observations = extractObservations(nodes);
      
      if (observations.length === 0) {
        return '# No observations found in MCF file\n# .STAT format requires observation data\n\n' + mcfContent;
      }
      
      // Extract dimensions from observations
      const dimensions = {
        INDICATOR: [...new Set(observations.map(o => o.variable))],
        REF_AREA: [...new Set(observations.map(o => o.about).filter(Boolean))],
        TIME_PERIOD: [...new Set(observations.map(o => o.date).filter(Boolean))].sort(),
      };
      
      // Build SDMX structure
      const sdmxData = {
        dataStructureDefinition: {
          id: statisticalVariables[0]?.dcid || 'DATASET',
          name: statisticalVariables[0]?.name || 'Statistical Dataset',
          dimensions: Object.entries(dimensions).map(([id, values]) => ({
            id,
            name: id.replace(/_/g, ' '),
            values: values.length
          })),
          measures: [{
            id: 'OBS_VALUE',
            name: 'Observation Value',
            unit: statisticalVariables[0]?.unit || observations[0]?.unit || ''
          }]
        },
        observations: observations.map(obs => ({
          indicator: obs.variable,
          refArea: obs.about || 'N/A',
          timePeriod: obs.date || 'N/A',
          value: obs.value,
          unit: obs.unit,
          measurementMethod: obs.measurementMethod
        }))
      };
      
      return JSON.stringify(sdmxData, null, 2);
    } catch (error) {
      console.error('Error transforming to .STAT format:', error);
      return '# Error transforming to .STAT format\n\n' + mcfContent;
    }
  };

  /**
   * Transform MCF → DataCommons JSON Format
   * Converts to DC API-compatible structure
   */
  const generateDataCommonsView = (mcfContent) => {
    if (!mcfContent) return '';
    
    try {
      const nodes = parseMCF(mcfContent);
      const statisticalVariables = extractStatisticalVariables(nodes);
      const observations = extractObservations(nodes);
      
      const dcFormat = {
        variables: statisticalVariables.map(v => ({
          dcid: v.dcid,
          name: v.name,
          description: v.description,
          populationType: v.populationType,
          measuredProperty: v.measuredProperty,
          statType: v.statType,
          measurementMethod: v.measurementMethod,
          unit: v.unit
        })),
        observations: observations.map(obs => ({
          variable: obs.variable,
          entity: obs.about,
          date: obs.date,
          value: obs.value,
          unit: obs.unit,
          measurementMethod: obs.measurementMethod,
          scalingFactor: obs.scalingFactor
        })),
        metadata: {
          generatedFrom: 'MCF',
          timestamp: new Date().toISOString(),
          observationCount: observations.length,
          variableCount: statisticalVariables.length
        }
      };
      
      return JSON.stringify(dcFormat, null, 2);
    } catch (error) {
      console.error('Error transforming to DataCommons format:', error);
      return '# Error transforming to DataCommons format\n\n' + mcfContent;
    }
  };

  /**
   * Transform MCF → Cached/Optimized Format
   * Pre-computes statistics and chart configurations for fast loading
   */
  const generateCachedVersion = (mcfContent) => {
    if (!mcfContent) return '';
    
    try {
      const nodes = parseMCF(mcfContent);
      const statisticalVariables = extractStatisticalVariables(nodes);
      const observations = extractObservations(nodes);
      const chartData = observationsToChartData(observations, statisticalVariables);
      
      const cachedFormat = {
        metadata: {
          cacheVersion: '1.0',
          generatedAt: new Date().toISOString(),
          sourceHash: btoa(mcfContent.substring(0, 100)), // Simple hash
          observationCount: observations.length,
          variableCount: statisticalVariables.length,
          chartCount: chartData.length,
          isMultiFile: isMultiFile,
          fileCount: isMultiFile ? selectedFileIds.length : 1,
          sourceFiles: isMultiFile ? selectedFileIds.map(id => id.split('/').pop()) : [selectedFileId.split('/').pop()]
        },
        
        // Pre-computed chart configurations
        charts: chartData.map(chart => ({
          id: chart.dcid,
          title: chart.title,
          description: chart.description,
          type: chart.chartType,
          unit: chart.unit,
          
          // Pre-computed statistics
          stats: {
            min: Math.min(...chart.data.map(d => d.value)),
            max: Math.max(...chart.data.map(d => d.value)),
            avg: chart.data.reduce((sum, d) => sum + d.value, 0) / chart.data.length,
            count: chart.data.length
          },
          
          // Chart configuration
          config: {
            xAxis: chart.hasTimeSeries ? 'date' : 'entity',
            yAxis: 'value',
            chartType: chart.chartType,
            showLegend: chart.hasMultipleEntities,
            dateRange: chart.dateRange
          },
          
          // Actual data
          data: chart.data
        })),
        
        // Searchable index
        searchableText: [
          ...statisticalVariables.map(v => `${v.name} ${v.description}`),
          ...observations.map(o => `${o.variable} ${o.about} ${o.date}`)
        ].join(' ').toLowerCase(),
        
        // API endpoints for live data
        apiEndpoints: {
          datacommons: statisticalVariables.map(v => 
            `https://datacommons.org/tools/visualization#v=${v.dcid}`
          )
        }
      };
      
      return JSON.stringify(cachedFormat, null, 2);
    } catch (error) {
      console.error('Error generating cached version:', error);
      return '# Error generating cached version\n\n' + mcfContent;
    }
  };

  /**
   * Transform MCF → YAML Format
   * Structured, human-readable representation
   */
  const generateYAMLView = (mcfContent) => {
    if (!mcfContent) return '';
    
    try {
      const nodes = parseMCF(mcfContent);
      
      return nodes.map(node => {
        const lines = [`# ${node.typeOf || 'Node'}: ${node.dcid || 'Unknown'}`];
        
        Object.entries(node).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('\n')) {
            // Multi-line string
            lines.push(`${key}: |`);
            value.split('\n').forEach(line => lines.push(`  ${line}`));
          } else {
            lines.push(`${key}: ${JSON.stringify(value)}`);
          }
        });
        
        return lines.join('\n');
      }).join('\n\n---\n\n');
    } catch (error) {
      console.error('Error generating YAML view:', error);
      return '# Error generating YAML view\n' + mcfContent;
    }
  };

  const generateStatYAML = (mcfContent) => {
    // Generate YAML from .STAT JSON
    try {
      const statJson = generateStatView(mcfContent);
      const parsed = JSON.parse(statJson);
      return `# .STAT Format (SDMX) in YAML\n\n${JSON.stringify(parsed, null, 2).replace(/[{}",]/g, '').trim()}`;
    } catch {
      return generateYAMLView(mcfContent);
    }
  };

  const generateDataCommonsYAML = (mcfContent) => {
    // Generate YAML from DataCommons JSON
    try {
      const dcJson = generateDataCommonsView(mcfContent);
      const parsed = JSON.parse(dcJson);
      return `# DataCommons Format in YAML\n\n${JSON.stringify(parsed, null, 2).replace(/[{}",]/g, '').trim()}`;
    } catch {
      return generateYAMLView(mcfContent);
    }
  };

  const generateCachedYAML = (mcfContent) => {
    // Generate YAML from Cached JSON
    try {
      const cachedJson = generateCachedVersion(mcfContent);
      const parsed = JSON.parse(cachedJson);
      return `# Cached Format in YAML\n\n${JSON.stringify(parsed, null, 2).replace(/[{}",]/g, '').trim()}`;
    } catch {
      return generateYAMLView(mcfContent);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h1>MCF Pipeline Viewer</h1>
                  {currentPermissions && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isAdminUser 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {isAdminUser ? '👑 Admin' : '👤 User'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  End-to-end MCF transformation pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Share Button */}
              <button
                onClick={() => {
                  const url = getShareableUrl({
                    isDarkMode,
                    activeTab,
                    showDiff,
                    org: selectedFileId ? selectedFileId.split('/')[0] : null,
                    fileType: selectedFileId ? selectedFileId.split('/').slice(1).join('/') : null,
                    compareVersion: compareFileId || null,
                    dataSources: selectedDataSources.map(s => s.csvFile),
                    selectedCharts: selectedCharts.length > 0 ? selectedCharts : null,
                  });
                  navigator.clipboard.writeText(url);
                  // Optional: Show a toast notification
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share"
                title="Copy shareable link to clipboard"
              >
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation Chips Row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {/* Dataset Dropdown Chip */}
              <div className="relative org-dropdown">
                <button
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <span className={`font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dataset |</span>
                  <span className="font-bold">{organizationsForDropdown.find(o => o.id === selectedOrg)?.name || 'SDG'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showOrgDropdown && (
                  <div className={`absolute top-full left-0 mt-2 rounded-lg shadow-lg border z-50 min-w-[160px] ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                  {organizationsForDropdown.map(org => {
                    const isSelected = selectedOrg === org.id;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          setSelectedOrg(org.id);
                          setShowOrgDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                            : isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}
                      >
                        {/* Checkbox */}
                        <div 
                          className="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? '#3b82f6' : isDarkMode ? '#6b7280' : '#d1d5db',
                            backgroundColor: isSelected ? '#3b82f6' : 'transparent'
                          }}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {org.name}
                      </button>
                    );
                  })}
                  </div>
                )}
              </div>

              {/* Environment Selector Chip */}
              <EnvironmentSelector isDarkMode={isDarkMode} />

              {/* Transcoding Review Chip */}
              <button
                onClick={() => setShowTranscodingViewer(!showTranscodingViewer)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Transcoding Review
              </button>

              {/* Dual Chart Preview Chip */}
              <button
                onClick={() => setShowDualCharts(!showDualCharts)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Dual Chart Preview
              </button>
            </div>

            {/* Show Diff Chip (Right Aligned) */}
            <button
              onClick={() => {
                if (!selectedFileId) return; // Require base to be selected
                const newShowDiff = !showDiff;
                setShowDiff(newShowDiff);
                
                // Clear comparison when turning off diff mode
                if (!newShowDiff) {
                  setCompareFileId('');
                  setCompareFileIds([]);
                  setCompareMCFContent('');
                }
              }}
              disabled={!selectedFileId}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                !selectedFileId
                  ? isDarkMode 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : showDiff
                  ? isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
                  : isDarkMode
                  ? 'bg-transparent text-purple-400 border-2 border-purple-500 hover:bg-purple-900/20'
                  : 'bg-transparent text-purple-600 border-2 border-purple-500 hover:bg-purple-50'
              }`}
              title={!selectedFileId ? 'Select a base item first' : 'Compare two versions side-by-side'}
            >
              <GitCompare className="h-4 w-4" />
              {showDiff ? 'Comparing...' : 'Show Diff'}
            </button>
          </div>
        </div>
      </header>

      {/* File Selector V2 (Hierarchical) */}
      <FileSelectorV2
        selectedOrg={selectedOrg}
        onFileSelected={(selection) => {
          // Handle base deselection
          if (!selection) {
            setSelectedFileId('');
            setSelectedFileIds([]);
            // Turn off diff mode when base is cleared
            setShowDiff(false);
            setCompareFileId('');
            setCompareFileIds([]);
            return;
          }
          
          // Selection can be { type: 'version', path: 'ilo/v01', fileIds: [...] }
          // or { type: 'file', path: 'ilo/schema/sv.mcf', fileIds: ['ilo/schema/sv.mcf'] }
          if (selection.type === 'version') {
            setSelectedFileId(selection.path);
            setSelectedFileIds(selection.fileIds);
          } else {
            setSelectedFileId(selection.path);
            setSelectedFileIds([]);
          }
        }}
        onCompareFileSelected={(selection) => {
          if (!selection) {
            setCompareFileId('');
            setCompareFileIds([]);
            return;
          }
          if (selection.type === 'version') {
            setCompareFileId(selection.path);
            setCompareFileIds(selection.fileIds);
          } else {
            setCompareFileId(selection.path);
            setCompareFileIds([]);
          }
        }}
        showDiff={showDiff}
        isDarkMode={isDarkMode}
      />

      {/* Data Source Selector - Only shown when file needs data */}
      {!isLoading && fileAnalysis && selectedFileId && (
        <div className="container mx-auto px-4 pt-4">
          <DataSourceSelector
            orgId={selectedFileId.split('/')[0]}
            fileAnalysis={fileAnalysis}
            selectedSources={selectedDataSources}
            onSourcesChange={setSelectedDataSources}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Test Data Banner */}
        {selectedFileId && selectedFileId.includes('test-data') && allObservations.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🧪</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-purple-200 mb-1">Test Data Mode Active</h3>
                <p className="text-sm text-purple-300 mb-2">
                  You're viewing a <strong>proof-of-concept demo</strong> showing how CSV data flows through the MCF pipeline to generate multiple output formats.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-200">
                  <div>✅ <strong>CSV Source:</strong> poverty-sample.csv (12 observations)</div>
                  <div>✅ <strong>Countries:</strong> AGO, ETH, KEN, ZMB (4 total)</div>
                  <div>✅ <strong>Time Range:</strong> 2018-2020 (3 years)</div>
                  <div>✅ <strong>Indicator:</strong> SI_POV_DAY1 (Poverty rate)</div>
                </div>
                <p className="text-xs text-purple-400 mt-2 italic">
                  ⚠️ This is demo data created for the MCF Pipeline Viewer. For production, replace with real UN agency data.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 text-center py-4 text-muted-foreground">
            Loading MCF file...
          </div>
        )}
        
        {/* Diff Viewer */}
        {showDiff && !isLoading && compareFileId && (
          <DiffViewer
            oldVersion={compareMCF}
            newVersion={currentMCF}
            oldVersionName={compareFileId}
            newVersionName={selectedFileId}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Transcoding Viewer (SDG Transcoding Matrix Review) */}
        {showTranscodingViewer && (
          <div className="mb-6">
            <TranscodingViewer isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Dual Chart Preview (DataCommons + .STAT side-by-side) */}
        {showDualCharts && currentMCF && (
          <div className="mb-6">
            <DualChartPreview
              mcfContent={currentMCF}
              agency={selectedFileId ? selectedFileId.split('/')[0] : 'unknown'}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="raw" className="text-xs sm:text-sm">
              MCF
            </TabsTrigger>
            <TabsTrigger value="stat" className="text-xs sm:text-sm">
              .STAT
            </TabsTrigger>
            <TabsTrigger value="datacommons" className="text-xs sm:text-sm">
              DataCommons
            </TabsTrigger>
            <TabsTrigger value="cached" className="text-xs sm:text-sm">
              Cached
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="mt-4">
            <div className="space-y-2">
              {/* Multi-file indicator */}
              {isMultiFile && (
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-300 text-sm">
                  <strong>📦 Combined View:</strong> Viewing {selectedFileIds.length} MCF files merged: {selectedFileIds.map(id => id.split('/').pop()).join(', ')}
                </div>
              )}
              
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {rawViewMode === 'formatted' && 'Formatted MCF with proper indentation'}
                  {rawViewMode === 'raw' && 'Unformatted single-line MCF as seen online'}
                  {rawViewMode === 'yaml' && 'YAML representation of MCF data'}
                  {rawViewMode === 'chart' && 'Visual chart representation of the data'}
                  {rawViewMode === 'edit' && 'Edit and modify MCF content - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setRawViewMode('formatted')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'formatted'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setRawViewMode('raw')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'raw'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setRawViewMode('yaml')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'yaml'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    YAML
                  </button>
                  <button
                    onClick={() => setRawViewMode('chart')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'chart'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => {
                      setRawViewMode('edit');
                      if (!rawEditContent) {
                        setRawEditContent(generateFormattedCode(currentMCF));
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'edit'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              {/* Content Display */}
              {rawViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const statisticalVariables = extractStatisticalVariables(nodes);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations, statisticalVariables);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Chart Visualization</h3>
                        <ChartFilter
                          charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))}
                          selectedCharts={selectedCharts}
                          onSelectionChange={setSelectedCharts}
                        />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : rawViewMode === 'edit' ? (
                <div className="space-y-4">
                  {/* Edit Format Sub-Navigation */}
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">
                      {rawEditFormat === 'formatted' ? 'Editing formatted code (pretty-printed, easier to read)' : 'Editing raw code (minified, as stored in production)'}
                    </p>
                    <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                      <button
                        onClick={() => {
                          setRawEditFormat('formatted');
                          if (!rawEditContent || rawEditContent === currentMCF) {
                            setRawEditContent(generateFormattedCode(currentMCF));
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all ${
                          rawEditFormat === 'formatted'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Formatted
                      </button>
                      <button
                        onClick={() => {
                          setRawEditFormat('raw');
                          if (!rawEditContent || rawEditContent === generateFormattedCode(currentMCF)) {
                            setRawEditContent(currentMCF);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all ${
                          rawEditFormat === 'raw'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Raw
                      </button>
                    </div>
                  </div>
                  
                  <CodeEditor
                    value={rawEditContent || (rawEditFormat === 'formatted' ? generateFormattedCode(currentMCF) : currentMCF)}
                    onChange={setRawEditContent}
                    language="mcf"
                    placeholder="Edit MCF content..."
                    isDarkMode={isDarkMode}
                  />
                  <div className="flex gap-2 justify-between">
                    <button
                      onClick={() => {
                        const content = rawEditContent || generateFormattedCode(currentMCF);
                        const nodes = parseMCF(content);
                        const statisticalVariables = extractStatisticalVariables(nodes);
                        const observations = extractObservations(nodes);
                        const chartData = observationsToChartData(observations, statisticalVariables);
                        setEditPreviewData(chartData);
                        setShowEditPreview(true);
                      }}
                      className={`px-4 py-2 text-sm rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Preview Chart
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRawEditContent(rawEditFormat === 'formatted' ? generateFormattedCode(currentMCF) : currentMCF);
                          setShowEditPreview(false);
                        }}
                        className={`px-4 py-2 text-sm rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 text-white hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          const confirmed = window.confirm('Save changes? This will update the current view with your edits.');
                          if (confirmed) {
                            setCurrentMCFContent(rawEditContent);
                            setRawViewMode('formatted');
                            setShowEditPreview(false);
                          }
                        }}
                        className={`px-4 py-2 text-sm rounded transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-900 text-white hover:bg-black' 
                            : 'bg-gray-900 text-white hover:bg-black'
                        }`}
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                  
                  {/* Chart Preview */}
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter
                          charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))}
                          selectedCharts={selectedCharts}
                          onSelectionChange={setSelectedCharts}
                        />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay
                  code={
                    rawViewMode === 'formatted' 
                      ? generateFormattedCode(currentMCF)
                      : rawViewMode === 'yaml'
                      ? generateYAMLView(currentMCF)
                      : generateRawCode(currentMCF)
                  }
                  language={
                    rawViewMode === 'yaml' ? 'yaml' : 'MCF'
                  }
                  formatted={rawViewMode !== 'raw'}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="stat" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {statViewMode === 'formatted' && '.STAT format representation with proper indentation'}
                  {statViewMode === 'raw' && 'Unformatted single-line .STAT as seen online'}
                  {statViewMode === 'yaml' && 'YAML representation of .STAT data'}
                  {statViewMode === 'chart' && 'Visual chart from .STAT data'}
                  {statViewMode === 'edit' && 'Edit .STAT content - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setStatViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setStatViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setStatViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setStatViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setStatViewMode('edit'); if (!statEditContent) setStatEditContent(generateStatView(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {statViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const statisticalVariables = extractStatisticalVariables(nodes);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations, statisticalVariables);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">.STAT Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : statViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor value={statEditContent || generateStatView(currentMCF)} onChange={setStatEditContent} language="mcf" placeholder="Edit .STAT content..." isDarkMode={isDarkMode} />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = statEditContent || generateStatView(currentMCF); const nodes = parseMCF(content); const statisticalVariables = extractStatisticalVariables(nodes); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations, statisticalVariables); setEditPreviewData(chartData); setShowEditPreview(true); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setStatEditContent(generateStatView(currentMCF)); setShowEditPreview(false); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to .STAT view?')) { setStatViewMode('formatted'); setShowEditPreview(false); } }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-900 text-white hover:bg-black'}`}>Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={statViewMode === 'yaml' ? generateStatYAML(currentMCF) : generateStatView(currentMCF)} language={statViewMode === 'yaml' ? 'yaml' : 'stat'} formatted={statViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="datacommons" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {datacommonsViewMode === 'formatted' && 'DataCommons JSON with proper indentation'}
                  {datacommonsViewMode === 'raw' && 'Unformatted single-line JSON as seen online'}
                  {datacommonsViewMode === 'yaml' && 'YAML representation of DataCommons data'}
                  {datacommonsViewMode === 'chart' && 'Visual chart from DataCommons data'}
                  {datacommonsViewMode === 'edit' && 'Edit DataCommons JSON - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setDatacommonsViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setDatacommonsViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setDatacommonsViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setDatacommonsViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setDatacommonsViewMode('edit'); if (!datacommonsEditContent) setDatacommonsEditContent(generateDataCommonsView(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {datacommonsViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const statisticalVariables = extractStatisticalVariables(nodes);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations, statisticalVariables);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">DataCommons Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : datacommonsViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor value={datacommonsEditContent || generateDataCommonsView(currentMCF)} onChange={setDatacommonsEditContent} language="json" placeholder="Edit DataCommons JSON..." isDarkMode={isDarkMode} />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = datacommonsEditContent || generateDataCommonsView(currentMCF); const nodes = parseMCF(content); const statisticalVariables = extractStatisticalVariables(nodes); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations, statisticalVariables); setEditPreviewData(chartData); setShowEditPreview(true); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setDatacommonsEditContent(generateDataCommonsView(currentMCF)); setShowEditPreview(false); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to DataCommons view?')) { setDatacommonsViewMode('formatted'); setShowEditPreview(false); } }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-900 text-white hover:bg-black'}`}>Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={datacommonsViewMode === 'yaml' ? generateDataCommonsYAML(currentMCF) : generateDataCommonsView(currentMCF)} language={datacommonsViewMode === 'yaml' ? 'yaml' : 'json'} formatted={datacommonsViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cached" className="mt-4">
            <div className="space-y-2">
              {/* Multi-file indicator (all modes) */}
              {isMultiFile && (
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-300 text-sm">
                  <strong>📦 Combined View:</strong> Viewing {selectedFileIds.length} files merged together: {selectedFileIds.map(id => id.split('/').pop()).join(', ')}
                </div>
              )}
              
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {cachedViewMode === 'formatted' && 'Cached version with proper indentation'}
                  {cachedViewMode === 'raw' && 'Unformatted single-line cached content as seen online'}
                  {cachedViewMode === 'yaml' && 'YAML representation of cached data'}
                  {cachedViewMode === 'chart' && 'Visual chart from cached data'}
                  {cachedViewMode === 'edit' && 'Edit cached content - changes are local'}
                  {cachedViewMode === 'explorer' && 'Live thematic areas and indicators from UN Data Commons API'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setCachedViewMode('explorer')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'explorer' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>🌍 Explorer</button>
                  <button onClick={() => setCachedViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setCachedViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setCachedViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setCachedViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setCachedViewMode('edit'); if (!cachedEditContent) setCachedEditContent(generateCachedVersion(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {cachedViewMode === 'explorer' ? (
                <ThematicAreasExplorer 
                  organization={selectedFileId ? selectedFileId.split('/')[0] : 'ilo'} 
                  isDarkMode={isDarkMode} 
                />
              ) : cachedViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const statisticalVariables = extractStatisticalVariables(nodes);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations, statisticalVariables);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Cached Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : cachedViewMode === 'edit' ? (
                <div className="space-y-4">
                  {/* Multi-file indicator */}
                  {isMultiFile && (
                    <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-300 text-sm">
                      <strong>📦 Combined View:</strong> You're editing {selectedFileIds.length} files merged together. 
                      The cached format combines all content into one optimized structure.
                    </div>
                  )}
                  
                  {/* Edit Format Sub-Navigation */}
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">
                      {cachedEditFormat === 'formatted' ? 'Editing formatted JSON (pretty-printed, easier to read)' : 'Editing raw JSON (minified, single-line)'}
                    </p>
                    <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                      <button
                        onClick={() => {
                          setCachedEditFormat('formatted');
                          if (!cachedEditContent || cachedEditContent === JSON.stringify(JSON.parse(generateCachedVersion(currentMCF)))) {
                            setCachedEditContent(generateCachedVersion(currentMCF));
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all ${
                          cachedEditFormat === 'formatted'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Formatted
                      </button>
                      <button
                        onClick={() => {
                          setCachedEditFormat('raw');
                          if (!cachedEditContent) {
                            // Minify the JSON
                            const formatted = generateCachedVersion(currentMCF);
                            const minified = JSON.stringify(JSON.parse(formatted));
                            setCachedEditContent(minified);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all ${
                          cachedEditFormat === 'raw'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Raw
                      </button>
                    </div>
                  </div>
                  
                  <CodeEditor 
                    value={cachedEditContent || (cachedEditFormat === 'formatted' ? generateCachedVersion(currentMCF) : JSON.stringify(JSON.parse(generateCachedVersion(currentMCF))))} 
                    onChange={setCachedEditContent} 
                    language="json"
                    placeholder="Edit cached content..." 
                    isDarkMode={isDarkMode}
                  />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = cachedEditContent || generateCachedVersion(currentMCF); const nodes = parseMCF(content); const statisticalVariables = extractStatisticalVariables(nodes); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations, statisticalVariables); setEditPreviewData(chartData); setShowEditPreview(true); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setCachedEditContent(generateCachedVersion(currentMCF)); setShowEditPreview(false); }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to Cached view?')) { setCachedViewMode('formatted'); setShowEditPreview(false); } }} className={`px-4 py-2 text-sm rounded transition-colors ${isDarkMode ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-900 text-white hover:bg-black'}`}>Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart} isDarkMode={isDarkMode} onDataPointClick={handleChartDataPointClick} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={cachedViewMode === 'yaml' ? generateCachedYAML(currentMCF) : generateCachedVersion(currentMCF)} language={cachedViewMode === 'yaml' ? 'yaml' : 'mcf'} formatted={cachedViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            MCF Pipeline Viewer - Material Design Dark Mode
          </p>
        </div>
      </footer>
      
      {/* Format Comparison Modal */}
      {showFormatComparison && selectedObservation && (
        <FormatComparison
          observation={selectedObservation}
          allObservations={allObservations}
          initialIndex={selectedObsIndex}
          onIndexChange={(newIndex) => {
            setSelectedObsIndex(newIndex);
            setSelectedObservation(allObservations[newIndex]);
          }}
          onClose={() => {
            setShowFormatComparison(false);
            setSelectedObsIndex(0);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
