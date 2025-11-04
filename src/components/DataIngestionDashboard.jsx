/**
 * FILE: src/components/DataIngestionDashboard.jsx
 * PURPOSE: Dashboard for tracking data through the ingestion pipeline
 * 
 * FEATURES:
 * - View all versions across pipeline stages (Raw → CSV → MCF → Deployed)
 * - Track progress for each dataset
 * - Version comparison
 * - Generate MCF from CSV
 * - Deploy to environments
 */

import React, { useState, useEffect } from 'react';
import { Upload, FileText, File, Rocket, ChevronDown, ChevronRight, GitCompare, Eye, Edit, Check, Clock, AlertCircle, Trash2, BookOpen } from 'lucide-react';
import FileUploader from './FileUploader';
import { generateAllCaches, saveCacheFiles } from '../utils/cache-generator';
import { completeTestCleanup, getCacheStatistics } from '../utils/test-data-cleanup';
import { convertToSDMX, saveSDMXFile, loadSDMXFile } from '../utils/stat-converter';
import { convertToDataCommons, saveDataCommonsFile, loadDataCommonsFile } from '../utils/datacommons-converter';
import { getBlueprint } from '../utils/transformation-blueprints';
import BlueprintViewer from './BlueprintViewer';

export default function DataIngestionDashboard({ isDarkMode, userRole = 'admin', userOrganization = null }) {
  const [showUploader, setShowUploader] = useState(false);
  const [versions, setVersions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, deployed
  const [expandedVersions, setExpandedVersions] = useState([]);
  const [deployMenuOpen, setDeployMenuOpen] = useState(null); // Track which version's deploy menu is open
  const [deployingTo, setDeployingTo] = useState(null); // Track active deployment
  const [deployProgress, setDeployProgress] = useState(null); // Deployment progress message
  const [viewingVersion, setViewingVersion] = useState(null); // Track which version's formats are being viewed
  const [activeFormatTab, setActiveFormatTab] = useState('csv'); // csv, mcf, stat, datacommons, cached
  const [loadedContent, setLoadedContent] = useState({}); // Cache loaded file content
  const [showBlueprint, setShowBlueprint] = useState(null); // Track which blueprint to show
  const [currentRole, setCurrentRole] = useState(userRole); // admin or partner
  
  // Determine organization based on role
  const effectiveOrganization = currentRole === 'partner' 
    ? 'ILO'
    : currentRole === 'partner-sdg'
    ? 'SDG'
    : currentRole === 'partner-unicef'
    ? 'UNICEF'
    : userOrganization;
  
  // Load versions from API or localStorage
  useEffect(() => {
    loadVersions();
  }, []);
  
  const loadVersions = () => {
    // TODO: Replace with actual API call
    const mockVersions = [
      {
        id: 'ilo-q4-2025',
        organization: 'ILO',
        name: 'Q4 2025',
        status: 'csv', // raw, csv, mcf, deployed
        progress: 60,
        timeline: [
          { stage: 'uploaded', date: '2025-11-01T10:00:00Z', status: 'completed', user: 'user@ilo.org' },
          { stage: 'csv-exported', date: '2025-11-02T14:30:00Z', status: 'completed', version: 'v2', user: 'user@ilo.org' },
          { stage: 'mcf-generation', date: null, status: 'pending', user: null },
          { stage: 'deployment', date: null, status: 'not-started', user: null }
        ],
        files: {
          raw: { name: 'employment-raw.xlsx', size: '1.2 MB', path: '/raw/ilo/q4-2025/employment-raw.xlsx' },
          csvVersions: [
            { version: 'v1', name: 'employment-indicators-v1.csv', size: '856 KB', date: '2025-11-02T14:30:00Z', rows: 1234 },
            { version: 'v2', name: 'employment-indicators-v2.csv', size: '862 KB', date: '2025-11-03T10:15:00Z', rows: 1279, current: true }
          ],
          mcf: null
        },
        changes: {
          fromV1toV2: [
            'Added 45 new rows (Q4 data)',
            'Fixed country codes for 3 entries',
            'Updated methodology notes'
          ]
        }
      },
      {
        id: 'sdg-q3-2025',
        organization: 'SDG',
        name: 'Q3 2025',
        status: 'mcf',
        progress: 85,
        timeline: [
          { stage: 'uploaded', date: '2025-10-15T09:00:00Z', status: 'completed', user: 'admin@un.org' },
          { stage: 'csv-exported', date: '2025-10-16T11:20:00Z', status: 'completed', version: 'v1', user: 'admin@un.org' },
          { stage: 'mcf-generation', date: '2025-10-17T08:45:00Z', status: 'completed', user: 'system' },
          { stage: 'deployment', date: null, status: 'pending-approval', user: null }
        ],
        files: {
          raw: { name: 'sdg-indicators-q3.csv', size: '2.1 MB', path: '/raw/sdg/q3-2025/sdg-indicators-q3.csv' },
          csvVersions: [
            { version: 'v1', name: 'sdg-indicators-v1.csv', size: '2.0 MB', date: '2025-10-16T11:20:00Z', rows: 3456, current: true }
          ],
          mcf: { name: 'sdg-q3-2025-schema.mcf', size: '12.4 MB', path: '/datacommons/sdg/q3-2025/' }
        },
        changes: null
      },
      {
        id: 'TEST-ilo-q4-2024',
        organization: 'ILO',
        name: 'TEST Q4 2024',
        status: 'csv',
        progress: 40,
        timeline: [
          { stage: 'uploaded', date: new Date().toISOString(), status: 'completed', user: 'test@example.com' },
          { stage: 'csv-exported', date: new Date().toISOString(), status: 'completed', version: 'v1', user: 'test@example.com' },
          { stage: 'mcf-generation', date: null, status: 'pending', user: null },
          { stage: 'deployment', date: null, status: 'not-started', user: null }
        ],
        files: {
          raw: { name: 'TEST-ilo-employment-q4-2024.csv', size: '2.5 KB', path: '/raw/ilo/pending/TEST-ilo-employment-q4-2024.csv' },
          csvVersions: [
            { version: 'v1', name: 'TEST-employment-indicators-v1.csv', size: '2.5 KB', date: new Date().toISOString(), rows: 24, current: true }
          ],
          mcf: null
        },
        changes: null
      },
      {
        id: 'unicef-v02',
        organization: 'UNICEF',
        name: 'V02',
        status: 'deployed',
        progress: 100,
        timeline: [
          { stage: 'uploaded', date: '2025-10-01T14:00:00Z', status: 'completed', user: 'data@unicef.org' },
          { stage: 'csv-exported', date: '2025-10-02T10:15:00Z', status: 'completed', version: 'v1', user: 'data@unicef.org' },
          { stage: 'mcf-generation', date: '2025-10-03T09:30:00Z', status: 'completed', user: 'system' },
          { stage: 'deployment', date: '2025-10-05T16:00:00Z', status: 'completed', environment: 'staging', user: 'admin@un.org' }
        ],
        files: {
          raw: { name: 'unicef-data-v02.xlsx', size: '3.4 MB', path: '/raw/unicef/v02/unicef-data-v02.xlsx' },
          csvVersions: [
            { version: 'v1', name: 'unicef-indicators-v1.csv', size: '3.2 MB', date: '2025-10-02T10:15:00Z', rows: 5678, current: true }
          ],
          mcf: { name: 'unicef-v02-schema.mcf', size: '18.2 MB', path: '/datacommons/unicef/v02/' }
        },
        deployment: {
          stat: { date: '2025-10-05T16:00:00Z', status: 'deployed', url: 'https://stat.undata.org/unicef' },
          datacommons: { date: '2025-10-05T16:00:00Z', status: 'deployed', url: 'https://datacommons.undata.org' },
          undata: { date: null, status: 'pending', url: null }
        }
      }
    ];
    
    setVersions(mockVersions);
  };
  
  const toggleVersion = (versionId) => {
    setExpandedVersions(prev => 
      prev.includes(versionId) 
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'raw': return { icon: <Upload className="h-5 w-5" />, color: 'text-orange-500', label: 'Raw Data', bg: 'bg-orange-500/10' };
      case 'csv': return { icon: <FileText className="h-5 w-5" />, color: 'text-blue-500', label: 'CSV Stage', bg: 'bg-blue-500/10' };
      case 'mcf': return { icon: <File className="h-5 w-5" />, color: 'text-purple-500', label: 'MCF Generated', bg: 'bg-purple-500/10' };
      case 'deployed': return { icon: <Rocket className="h-5 w-5" />, color: 'text-green-500', label: 'Deployed', bg: 'bg-green-500/10' };
      default: return { icon: <AlertCircle className="h-5 w-5" />, color: 'text-gray-500', label: 'Unknown', bg: 'bg-gray-500/10' };
    }
  };
  
  const getOrgEmoji = (org) => {
    const emojis = {
      'ILO': '🏆',
      'SDG': '🎯',
      'UNICEF': '👶',
      'WHO': '🏥'
    };
    return emojis[org] || '📊';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  // Apply role-based filtering
  const roleFilteredVersions = (currentRole.startsWith('partner') && effectiveOrganization)
    ? versions.filter(v => v.organization.toLowerCase() === effectiveOrganization.toLowerCase())
    : versions;
  
  const filteredVersions = roleFilteredVersions.filter(version => {
    if (filter === 'all') return true;
    if (filter === 'pending') return version.status === 'raw' || version.status === 'csv';
    if (filter === 'approved') return version.status === 'mcf';
    if (filter === 'deployed') return version.status === 'deployed';
    return true;
  });
  
  const handleUploadComplete = (fileInfo) => {
    console.log('File uploaded:', fileInfo);
    // TODO: Add to versions list and refresh
    setShowUploader(false);
    loadVersions(); // Reload versions
  };
  
  const handleDeployToUNData = async (version) => {
    console.log('🚀 Deploying to UN Data:', version.id);
    
    setDeployingTo(version.id);
    setDeployProgress('Generating JSON cache files...');
    setDeployMenuOpen(null);
    
    try {
      // Get MCF content (in real app, would fetch from server)
      let mcfContent = version.files.mcf?.content;
      
      // Generate test MCF content for TEST version
      if (version.id === 'TEST-ilo-q4-2024' && !mcfContent) {
        mcfContent = `
Node: dcid:Count_Person_Employed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Employment Rate"

Node: dcid:Count_Person_Unemployed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Unemployment Rate"

Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent

Node: dcid:o/AFG_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 11.2
unit: Percent

Node: dcid:o/AFG_2023_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2023"
variableMeasured: dcid:Count_Person_Employed
value: 43.8
unit: Percent

Node: dcid:o/AFG_2023_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2023"
variableMeasured: dcid:Count_Person_Unemployed
value: 12.1
unit: Percent

Node: dcid:o/PAK_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/PAK
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 51.3
unit: Percent

Node: dcid:o/PAK_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/PAK
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 6.5
unit: Percent

Node: dcid:o/IND_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/IND
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 46.8
unit: Percent

Node: dcid:o/IND_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/IND
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 7.8
unit: Percent

Node: dcid:o/BGD_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/BGD
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 58.2
unit: Percent

Node: dcid:o/BGD_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/BGD
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 4.3
unit: Percent
`;
      }
      
      if (!mcfContent) {
        mcfContent = 'Node: Example\ntypeOf: dcs:StatVarObservation\nvalue: 123';
      }
      
      // Generate all cache files
      setDeployProgress('Parsing MCF content...');
      const results = await generateAllCaches(mcfContent, version.organization, version.id);
      
      if (!results.success) {
        throw new Error(results.errors.join(', '));
      }
      
      // Save cache files
      setDeployProgress(`Saving ${results.stats.totalFiles} cache files...`);
      await saveCacheFiles(results.files);
      
      // Update version deployment status
      setDeployProgress('Updating deployment status...');
      const updatedVersions = versions.map(v => {
        if (v.id === version.id) {
          return {
            ...v,
            deployment: {
              ...v.deployment,
              undata: {
                status: 'deployed',
                date: new Date().toISOString(),
                url: '/cache/',
                stats: results.stats
              }
            }
          };
        }
        return v;
      });
      
      setVersions(updatedVersions);
      setDeployProgress(`✅ Success! Generated ${results.stats.totalFiles} cache files`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 3000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeployProgress(`❌ Deployment failed: ${error.message}`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 5000);
    }
  };
  
  const handleDeployToStat = async (version) => {
    console.log('📊 Deploying to .STAT:', version.id);
    
    setDeployingTo(version.id);
    setDeployProgress('Converting MCF to SDMX-JSON 2.0 format...');
    setDeployMenuOpen(null);
    
    try {
      // Get MCF content
      let mcfContent = version.files.mcf?.content;
      
      // For test data, generate sample MCF if needed
      if (version.id === 'TEST-ilo-q4-2024' && !mcfContent) {
        mcfContent = `
Node: dcid:Count_Person_Employed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Employment Rate"

Node: dcid:Count_Person_Unemployed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Unemployment Rate"

Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent

Node: dcid:o/AFG_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 11.2
unit: Percent
`;
      }
      
      if (!mcfContent) {
        throw new Error('No MCF content available');
      }
      
      setDeployProgress('Generating SDMX structure...');
      const result = convertToSDMX(mcfContent, version.organization, version.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setDeployProgress('Saving .STAT file...');
      saveSDMXFile(version.organization, version.id, result.content);
      
      // Update version deployment status
      const updatedVersions = versions.map(v => {
        if (v.id === version.id) {
          return {
            ...v,
            deployment: {
              ...v.deployment,
              stat: {
                status: 'deployed',
                date: new Date().toISOString(),
                url: 'https://stat.undata.org',
                stats: result.stats
              }
            }
          };
        }
        return v;
      });
      
      setVersions(updatedVersions);
      setDeployProgress(`✅ Success! Deployed to .STAT (${result.stats.observations} observations)`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 3000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeployProgress(`❌ Deployment failed: ${error.message}`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 5000);
    }
  };
  
  const handleDeployToDataCommons = async (version) => {
    console.log('🌐 Deploying to DataCommons:', version.id);
    
    setDeployingTo(version.id);
    setDeployProgress('Converting MCF to DataCommons JSON format...');
    setDeployMenuOpen(null);
    
    try {
      // Get MCF content
      let mcfContent = version.files.mcf?.content;
      
      // For test data, generate sample MCF if needed
      if (version.id === 'TEST-ilo-q4-2024' && !mcfContent) {
        mcfContent = `
Node: dcid:Count_Person_Employed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Employment Rate"

Node: dcid:Count_Person_Unemployed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Unemployment Rate"

Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent

Node: dcid:o/AFG_2024_UNEMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Unemployed
value: 11.2
unit: Percent
`;
      }
      
      if (!mcfContent) {
        throw new Error('No MCF content available');
      }
      
      setDeployProgress('Generating DataCommons structure...');
      const result = convertToDataCommons(mcfContent, version.organization, version.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setDeployProgress('Saving DataCommons file...');
      saveDataCommonsFile(version.organization, version.id, result.content);
      
      // Update version deployment status
      const updatedVersions = versions.map(v => {
        if (v.id === version.id) {
          return {
            ...v,
            deployment: {
              ...v.deployment,
              datacommons: {
                status: 'deployed',
                date: new Date().toISOString(),
                url: 'https://datacommons.undata.org',
                stats: result.stats
              }
            }
          };
        }
        return v;
      });
      
      setVersions(updatedVersions);
      setDeployProgress(`✅ Success! Deployed to DataCommons (${result.stats.observations} observations)`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 3000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeployProgress(`❌ Deployment failed: ${error.message}`);
      
      setTimeout(() => {
        setDeployingTo(null);
        setDeployProgress(null);
      }, 5000);
    }
  };
  
  const handleGenerateMCF = (version) => {
    console.log('📄 Generating MCF for:', version.id);
    
    // Update the version to add MCF content
    const updatedVersions = versions.map(v => {
      if (v.id === version.id) {
        return {
          ...v,
          status: 'mcf',
          progress: 85,
          timeline: v.timeline.map(t => {
            if (t.stage === 'mcf-generation') {
              return { ...t, status: 'completed', date: new Date().toISOString(), user: 'system' };
            }
            return t;
          }),
          files: {
            ...v.files,
            mcf: {
              name: `${version.id}-schema.mcf`,
              size: '8.5 KB',
              path: `/datacommons/${version.organization.toLowerCase()}/${version.id}/`,
              content: null // Will be generated during deployment
            }
          }
        };
      }
      return v;
    });
    
    setVersions(updatedVersions);
    
    alert(`✅ MCF Generated!\n\nVersion "${version.name}" is now ready for deployment.`);
  };
  
  const handleClearTestData = () => {
    if (window.confirm('⚠️ Clear all TEST data?\n\nThis will remove:\n- Test cache files\n- Test versions\n- All data labeled with "TEST"\n\nProduction data will NOT be affected.')) {
      console.log('🧹 Clearing test data...');
      
      const result = completeTestCleanup();
      
      alert(`✅ Test cleanup complete!\n\n` +
            `Cache files removed: ${result.summary.cacheFilesRemoved}\n` +
            `Versions removed: ${result.summary.versionsRemoved}\n` +
            `Total items removed: ${result.summary.totalItemsRemoved}`);
      
      // Reload versions to reflect changes
      loadVersions();
    }
  };
  
  const handleRemoveVersion = (version) => {
    const versionName = `${version.organization}: ${version.name}`;
    if (window.confirm(`🗑️ Remove Version?\n\nAre you sure you want to remove "${versionName}"?\n\nThis will:\n- Remove the version from the list\n- Delete associated cache files (if any)\n- This action cannot be undone`)) {
      console.log('🗑️ Removing version:', version.id);
      
      // Remove cache files if this version was deployed to UN Data
      if (version.deployment?.undata?.status === 'deployed') {
        try {
          // Clean up cache files from localStorage
          const cacheKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(`cache_${version.organization.toLowerCase()}_${version.id}`)
          );
          
          cacheKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🧹 Removed cache: ${key}`);
          });
          
          console.log(`✅ Removed ${cacheKeys.length} cache files`);
        } catch (error) {
          console.error('Error removing cache files:', error);
        }
      }
      
      // Remove version from state
      const updatedVersions = versions.filter(v => v.id !== version.id);
      setVersions(updatedVersions);
      
      // Close expanded view if it was open
      setExpandedVersions(prev => prev.filter(id => id !== version.id));
      
      // Close deploy menu if it was open
      if (deployMenuOpen === version.id) {
        setDeployMenuOpen(null);
      }
      
      console.log(`✅ Version "${versionName}" removed successfully`);
    }
  };
  
  const handleViewFormats = async (version) => {
    console.log('👁️ Viewing formats for:', version.id);
    setViewingVersion(version);
    setActiveFormatTab('csv'); // Reset to CSV tab
    setLoadedContent({}); // Clear previous content
    
    // Load CSV content
    if (version.files.csvVersions && version.files.csvVersions.length > 0) {
      const currentCSV = version.files.csvVersions.find(v => v.current);
      if (currentCSV) {
        try {
          // For test data, try to load from the raw file path
          const csvPath = version.files.raw?.path || `/datacommons/${version.organization.toLowerCase()}/${version.id}/${currentCSV.name}`;
          console.log('📄 Loading CSV from:', csvPath);
          const response = await fetch(csvPath);
          const csvContent = await response.text();
          setLoadedContent(prev => ({ ...prev, csv: csvContent }));
        } catch (error) {
          console.error('Error loading CSV:', error);
          setLoadedContent(prev => ({ ...prev, csv: `# Error loading CSV file\n# ${error.message}` }));
        }
      }
    }
    
    // Load MCF content if available
    if (version.files.mcf?.content) {
      setLoadedContent(prev => ({ ...prev, mcf: version.files.mcf.content }));
    } else if (version.files.mcf?.path) {
      try {
        console.log('📄 Loading MCF from:', version.files.mcf.path);
        const response = await fetch(`${version.files.mcf.path}${version.files.mcf.name}`);
        const mcfContent = await response.text();
        setLoadedContent(prev => ({ ...prev, mcf: mcfContent }));
      } catch (error) {
        console.error('Error loading MCF:', error);
        setLoadedContent(prev => ({ ...prev, mcf: `# Error loading MCF file\n# ${error.message}` }));
      }
    }
    
    // Load .STAT content if deployed
    if (version.deployment?.stat?.status === 'deployed') {
      const statContent = loadSDMXFile(version.organization, version.id);
      if (statContent) {
        setLoadedContent(prev => ({ ...prev, stat: statContent }));
      }
    }
    
    // Load DataCommons content if deployed
    if (version.deployment?.datacommons?.status === 'deployed') {
      const dcContent = loadDataCommonsFile(version.organization, version.id);
      if (dcContent) {
        setLoadedContent(prev => ({ ...prev, datacommons: dcContent }));
      }
    }
  };
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Data Ingestion Pipeline
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track data from upload to deployment
            {currentRole.startsWith('partner') && effectiveOrganization && (
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                {effectiveOrganization} Partner
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Role Selector (Admin only) */}
          {userRole === 'admin' && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>View as:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className={`text-sm font-medium rounded px-2 py-1 ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <option value="admin">Administrator</option>
                <option value="partner">ILO Partner</option>
                <option value="partner-sdg">SDG Partner</option>
                <option value="partner-unicef">UNICEF Partner</option>
              </select>
            </div>
          )}
          <button
            onClick={() => setShowUploader(!showUploader)}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              showUploader
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Upload className="h-5 w-5" />
            {showUploader ? 'Close Uploader' : 'Upload New File'}
          </button>
          
          <button
            onClick={handleClearTestData}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 border ${
              isDarkMode
                ? 'border-red-700 text-red-400 hover:bg-red-900/20'
                : 'border-red-300 text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="h-5 w-5" />
            Clear Test Data
          </button>
        </div>
      </div>
      
      {/* File Uploader */}
      {showUploader && (
        <div className="mb-6">
          <FileUploader 
            isDarkMode={isDarkMode} 
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}
      
      {/* Deployment Progress */}
      {deployProgress && (
        <div className={`mb-6 p-4 rounded-lg border ${
          deployProgress.includes('✅') 
            ? isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            : deployProgress.includes('❌')
            ? isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
            : isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {!deployProgress.includes('✅') && !deployProgress.includes('❌') && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
            <span className={`font-medium ${
              deployProgress.includes('✅') 
                ? 'text-green-500'
                : deployProgress.includes('❌')
                ? 'text-red-500'
                : 'text-blue-500'
            }`}>
              {deployProgress}
            </span>
          </div>
        </div>
      )}
      
      {/* Pipeline Stages Overview */}
      <div className={`mb-6 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Pipeline Stages
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Upload className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RAW</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {versions.filter(v => v.status === 'raw').length} files
            </div>
          </div>
          
          <div className="flex-shrink-0 px-4">
            <div className={`h-0.5 w-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 rounded-full bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CSV</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {versions.filter(v => v.status === 'csv').length} ready
            </div>
          </div>
          
          <div className="flex-shrink-0 px-4">
            <div className={`h-0.5 w-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 rounded-full bg-purple-500/10">
                <File className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MCF</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {versions.filter(v => v.status === 'mcf').length} approved
            </div>
          </div>
          
          <div className="flex-shrink-0 px-4">
            <div className={`h-0.5 w-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 rounded-full bg-green-500/10">
                <Rocket className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>DEPLOYED</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {versions.filter(v => v.status === 'deployed').length} live
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Versions ({versions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Pending ({versions.filter(v => v.status === 'raw' || v.status === 'csv').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'approved'
              ? 'bg-blue-600 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Approved ({versions.filter(v => v.status === 'mcf').length})
        </button>
        <button
          onClick={() => setFilter('deployed')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'deployed'
              ? 'bg-blue-600 text-white'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Deployed ({versions.filter(v => v.status === 'deployed').length})
        </button>
      </div>
      
      {/* Versions List */}
      <div className="space-y-4">
        {filteredVersions.map((version) => {
          const isExpanded = expandedVersions.includes(version.id);
          const statusInfo = getStatusIcon(version.status);
          const currentCSV = version.files.csvVersions?.find(v => v.current);
          
          return (
            <div 
              key={version.id}
              className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
            >
              {/* Version Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleVersion(version.id)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      ) : (
                        <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getOrgEmoji(version.organization)}</span>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {version.organization}: {version.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                          {statusInfo.icon}
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${version.progress}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {version.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Partner-specific buttons */}
                    {currentRole.startsWith('partner') && version.status === 'mcf' && (
                      <>
                        <button 
                          onClick={() => {
                            if (window.confirm(`✅ Approve Dataset?\n\nYou are approving:\n${version.organization}: ${version.name}\n\nThis will allow the data to be deployed to production systems.`)) {
                              alert(`✅ Approved!\n\n"${version.name}" has been approved for deployment.\n\nThe UN Data team will be notified.`);
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium"
                        >
                          ✓ Approve Data
                        </button>
                        <button 
                          onClick={() => {
                            const feedback = prompt(`📝 Request Changes\n\nPlease describe the changes needed for:\n${version.organization}: ${version.name}`, '');
                            if (feedback) {
                              alert(`✅ Feedback Submitted!\n\nYour change request has been sent to the UN Data team:\n\n"${feedback}"\n\nYou will be notified when updates are available.`);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-medium border ${
                            isDarkMode ? 'border-orange-700 text-orange-400 hover:bg-orange-900/20' : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          📝 Request Changes
                        </button>
                      </>
                    )}
                    
                    {/* Admin-only buttons */}
                    {currentRole === 'admin' && version.status === 'csv' && (
                      <button 
                        onClick={() => handleGenerateMCF(version)}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium"
                      >
                        Generate MCF
                      </button>
                    )}
                    {currentRole === 'admin' && version.status === 'mcf' && (
                      <div className="relative">
                        <button 
                          onClick={() => setDeployMenuOpen(deployMenuOpen === version.id ? null : version.id)}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2"
                        >
                          Approve & Deploy
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        
                        {/* Deploy Dropdown Menu */}
                        {deployMenuOpen === version.id && (
                          <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg border z-10 ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}>
                            <div className="p-2">
                              <button 
                                onClick={() => handleDeployToStat(version)}
                                disabled={version.deployment?.stat?.status === 'deployed'}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 ${
                                  version.deployment?.stat?.status === 'deployed'
                                    ? isDarkMode ? 'opacity-50 cursor-not-allowed' : 'opacity-50 cursor-not-allowed'
                                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  version.deployment?.stat?.status === 'deployed'
                                    ? 'bg-blue-500 border-blue-500'
                                    : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                  {version.deployment?.stat?.status === 'deployed' && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Deploy to .STAT
                                    {version.deployment?.stat?.status === 'deployed' && (
                                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                        Deployed
                                      </span>
                                    )}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    SDMX format
                                  </div>
                                </div>
                              </button>
                              
                              <button 
                                onClick={() => handleDeployToDataCommons(version)}
                                disabled={version.deployment?.datacommons?.status === 'deployed'}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 ${
                                  version.deployment?.datacommons?.status === 'deployed'
                                    ? isDarkMode ? 'opacity-50 cursor-not-allowed' : 'opacity-50 cursor-not-allowed'
                                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  version.deployment?.datacommons?.status === 'deployed'
                                    ? 'bg-blue-500 border-blue-500'
                                    : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                  {version.deployment?.datacommons?.status === 'deployed' && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Deploy to DataCommons
                                    {version.deployment?.datacommons?.status === 'deployed' && (
                                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                        Deployed
                                      </span>
                                    )}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    MCF format
                                  </div>
                                </div>
                              </button>
                              
                              <button 
                                onClick={() => handleDeployToUNData(version)}
                                disabled={version.deployment?.undata?.status === 'deployed' || deployingTo === version.id}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 ${
                                  version.deployment?.undata?.status === 'deployed'
                                    ? isDarkMode ? 'opacity-50 cursor-not-allowed' : 'opacity-50 cursor-not-allowed'
                                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  version.deployment?.undata?.status === 'deployed'
                                    ? 'bg-blue-500 border-blue-500'
                                    : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                  {version.deployment?.undata?.status === 'deployed' && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Deploy to UN Data
                                    {version.deployment?.undata?.status === 'deployed' && (
                                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                        Deployed
                                      </span>
                                    )}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Cached JSON (fast)
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button 
                      onClick={() => handleRemoveVersion(version)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-red-900/20 hover:border-red-700' : 'hover:bg-red-50 hover:border-red-200'} border border-transparent`}
                      title="Remove this version"
                    >
                      <Trash2 className={`h-5 w-5 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`} />
                    </button>
                    <button 
                      onClick={() => handleViewFormats(version)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-blue-900/20 hover:border-blue-700' : 'hover:bg-blue-50 hover:border-blue-200'} border border-transparent`}
                      title="View all formats (CSV, MCF, .STAT, DataCommons, Cached)"
                    >
                      <Eye className={`h-5 w-5 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
                  {/* Timeline */}
                  <div className="mb-6">
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      {version.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {event.status === 'completed' && <Check className="h-5 w-5 text-green-500" />}
                            {event.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                            {event.status === 'pending-approval' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                            {event.status === 'not-started' && <div className={`h-5 w-5 rounded-full border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {event.stage === 'uploaded' && '📤 Uploaded'}
                              {event.stage === 'csv-exported' && '📝 CSV Exported'}
                              {event.stage === 'mcf-generation' && '📄 MCF Generation'}
                              {event.stage === 'deployment' && '🚀 Deployment'}
                              {event.version && ` (${event.version})`}
                            </div>
                            {event.date && (
                              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {formatDate(event.date)} {event.user && `• ${event.user}`}
                              </div>
                            )}
                            {event.status === 'pending-approval' && (
                              <div className="text-xs text-orange-500 font-medium">
                                Pending approval
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Files */}
                  <div className="mb-6">
                    <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Files
                    </h4>
                    <div className="space-y-2">
                      {version.files.raw && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                📄 Raw: {version.files.raw.name}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {version.files.raw.size}
                              </div>
                            </div>
                            <button className={`text-sm text-blue-500 hover:text-blue-600`}>
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {version.files.csvVersions && version.files.csvVersions.length > 0 && (
                        <div>
                          <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            CSV Versions:
                          </div>
                          {version.files.csvVersions.map((csv, idx) => (
                            <div key={idx} className={`p-3 rounded-lg mb-2 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    📊 {csv.name} {csv.current && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">CURRENT</span>}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {csv.size} • {csv.rows.toLocaleString()} rows • {formatDate(csv.date)}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button className={`text-sm text-blue-500 hover:text-blue-600`}>
                                    View
                                  </button>
                                  <button className={`text-sm text-blue-500 hover:text-blue-600`}>
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {version.files.mcf && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                📄 MCF: {version.files.mcf.name}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {version.files.mcf.size}
                              </div>
                            </div>
                            <button className={`text-sm text-blue-500 hover:text-blue-600`}>
                              View in Dataset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Changes */}
                  {version.changes && (
                    <div>
                      <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Changes from v1 → v2
                      </h4>
                      <div className="space-y-2">
                        {version.changes.fromV1toV2.map((change, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {change}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-3 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
                        <GitCompare className="h-4 w-4" />
                        Compare v1 ↔ v2
                      </button>
                    </div>
                  )}
                  
                  {/* Deployment Info */}
                  {version.deployment && (
                    <div className="mt-6">
                      <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Deployment Targets
                      </h4>
                      <div className="space-y-3">
                        {/* .STAT Deployment */}
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {version.deployment.stat?.status === 'deployed' ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  .STAT (SDMX)
                                </div>
                                {version.deployment.stat?.status === 'deployed' ? (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Deployed: {formatDate(version.deployment.stat.date)}
                                  </div>
                                ) : (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Not deployed
                                  </div>
                                )}
                              </div>
                            </div>
                            {version.deployment.stat?.status === 'deployed' ? (
                              <a 
                                href={version.deployment.stat.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                View Live
                              </a>
                            ) : (
                              <button className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                                Deploy
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* DataCommons Deployment */}
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {version.deployment.datacommons?.status === 'deployed' ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  DataCommons (MCF)
                                </div>
                                {version.deployment.datacommons?.status === 'deployed' ? (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Deployed: {formatDate(version.deployment.datacommons.date)}
                                  </div>
                                ) : (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Not deployed
                                  </div>
                                )}
                              </div>
                            </div>
                            {version.deployment.datacommons?.status === 'deployed' ? (
                              <a 
                                href={version.deployment.datacommons.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                View Live
                              </a>
                            ) : (
                              <button className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                                Deploy
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* UN Data (Cached JSON) Deployment */}
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {version.deployment.undata?.status === 'deployed' ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  UN Data (Cached JSON)
                                </div>
                                {version.deployment.undata?.status === 'deployed' ? (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Deployed: {formatDate(version.deployment.undata.date)}
                                  </div>
                                ) : (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Not deployed • Optimized for fast queries
                                  </div>
                                )}
                              </div>
                            </div>
                            {version.deployment.undata?.status === 'deployed' ? (
                              <a 
                                href={version.deployment.undata.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                View Live
                              </a>
                            ) : (
                              <button className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                                Deploy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Format Viewer - Inline */}
      {viewingVersion && (
        <div className={`mt-6 rounded-lg shadow-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getOrgEmoji(viewingVersion.organization)} {viewingVersion.organization}: {viewingVersion.name}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View data pipeline across all formats
              </p>
            </div>
            <button
              onClick={() => setViewingVersion(null)}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              ✕ Close
            </button>
          </div>
          
          {/* Format Tabs */}
          <div className={`flex gap-2 px-4 pt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} overflow-x-auto`}>
            <button
              onClick={() => setActiveFormatTab('csv')}
              className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                activeFormatTab === 'csv'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-blue-500' 
                    : 'bg-white text-gray-900 border-blue-500'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-400 hover:text-gray-300 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setActiveFormatTab('mcf')}
              className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                activeFormatTab === 'mcf'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-blue-500' 
                    : 'bg-white text-gray-900 border-blue-500'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-400 hover:text-gray-300 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              MCF
            </button>
            <button
              onClick={() => setActiveFormatTab('stat')}
              className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                activeFormatTab === 'stat'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-blue-500' 
                    : 'bg-white text-gray-900 border-blue-500'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-400 hover:text-gray-300 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              .STAT
            </button>
            <button
              onClick={() => setActiveFormatTab('datacommons')}
              className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                activeFormatTab === 'datacommons'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-blue-500' 
                    : 'bg-white text-gray-900 border-blue-500'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-400 hover:text-gray-300 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              DataCommons
            </button>
            <button
              onClick={() => setActiveFormatTab('cached')}
              className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
                activeFormatTab === 'cached'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white border-blue-500' 
                    : 'bg-white text-gray-900 border-blue-500'
                  : isDarkMode 
                    ? 'bg-gray-800 text-gray-400 hover:text-gray-300 border-transparent' 
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              Cached
            </button>
          </div>
            
            {/* Format Content - Single View Based on Active Tab */}
            <div className="flex-1 overflow-auto p-6">
              {/* CSV Format */}
              {activeFormatTab === 'csv' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📊 CSV Format
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cleaned & Structured Data (Current: {viewingVersion.files.csvVersions?.find(v => v.current)?.version || 'v1'})
                      </p>
                    </div>
                    {viewingVersion.files.csvVersions && viewingVersion.files.csvVersions.length > 0 && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {viewingVersion.files.csvVersions.find(v => v.current)?.rows || 0} rows
                      </div>
                    )}
                  </div>
                  {loadedContent.csv ? (
                    <pre className={`p-4 rounded-lg font-mono text-xs overflow-auto ${
                      isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                    }`} style={{ maxHeight: '60vh' }}>
{loadedContent.csv}
                    </pre>
                  ) : (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading CSV data...
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* MCF Format */}
              {activeFormatTab === 'mcf' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📄 MCF Format
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Master Catalog Format (Source of Truth)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBlueprint('mcf')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      View MCF Structure
                    </button>
                    {viewingVersion.files.mcf && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {viewingVersion.files.mcf.size}
                      </div>
                    )}
                  </div>
                  {viewingVersion.files.mcf && loadedContent.mcf ? (
                    <pre className={`p-4 rounded-lg font-mono text-xs overflow-auto ${
                      isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                    }`} style={{ maxHeight: '60vh' }}>
{loadedContent.mcf}
                    </pre>
                  ) : viewingVersion.files.mcf ? (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading MCF data...
                      </p>
                    </div>
                  ) : (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        ⏳ MCF file not yet generated
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Click "Generate MCF" button to convert CSV to MCF format
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* .STAT Format */}
              {activeFormatTab === 'stat' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📈 .STAT Format
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        SDMX-JSON 2.0 (UN .Stat Suite)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBlueprint('stat')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      MCF → .STAT Blueprint
                    </button>
                  </div>
                  {viewingVersion.deployment?.stat?.status === 'deployed' ? (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          ✅ Deployed on {formatDate(viewingVersion.deployment.stat.date)}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Observations:</span>
                            <span className={`ml-2 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {viewingVersion.deployment.stat.stats?.observations || 0}
                            </span>
                          </div>
                          <a href={viewingVersion.deployment.stat.url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-500 hover:underline">
                            View Live →
                          </a>
                        </div>
                      </div>
                      {loadedContent.stat ? (
                        <pre className={`p-4 rounded font-mono text-xs overflow-auto ${
                          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                        }`} style={{ maxHeight: '50vh' }}>
{loadedContent.stat}
                        </pre>
                      ) : (
                        <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Loading .STAT data...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        ⏳ Not yet deployed to .STAT
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Deploy from "Approve & Deploy" menu to generate .STAT format
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* DataCommons Format */}
              {activeFormatTab === 'datacommons' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🌍 DataCommons Format
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Google DataCommons JSON
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBlueprint('datacommons')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      MCF → DataCommons Blueprint
                    </button>
                  </div>
                  {viewingVersion.deployment?.datacommons?.status === 'deployed' ? (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          ✅ Deployed on {formatDate(viewingVersion.deployment.datacommons.date)}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Observations:</span>
                            <span className={`ml-2 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {viewingVersion.deployment.datacommons.stats?.observations || 0}
                            </span>
                          </div>
                          <a href={viewingVersion.deployment.datacommons.url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-500 hover:underline">
                            View Live →
                          </a>
                        </div>
                      </div>
                      {loadedContent.datacommons ? (
                        <pre className={`p-4 rounded font-mono text-xs overflow-auto ${
                          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                        }`} style={{ maxHeight: '50vh' }}>
{loadedContent.datacommons}
                        </pre>
                      ) : (
                        <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Loading DataCommons data...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        ⏳ Not yet deployed to DataCommons
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Deploy from "Approve & Deploy" menu to generate DataCommons format
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Cached Format */}
              {activeFormatTab === 'cached' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ⚡ Cached Format
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        UN Data Website Optimized JSON (Fast Query Performance)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBlueprint('cached')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      MCF → Cached Blueprint
                    </button>
                  </div>
                  {viewingVersion.deployment?.undata?.status === 'deployed' ? (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          ✅ Deployed on {formatDate(viewingVersion.deployment.undata.date)}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Files:</span>
                            <span className={`ml-2 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {viewingVersion.deployment.undata.stats?.totalFiles || 0}
                            </span>
                          </div>
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Locations:</span>
                            <span className={`ml-2 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {viewingVersion.deployment.undata.stats?.locations || 0}
                            </span>
                          </div>
                          <div>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Variables:</span>
                            <span className={`ml-2 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {viewingVersion.deployment.undata.stats?.variables || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <pre className={`p-4 rounded font-mono text-xs overflow-auto ${
                        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                      }`} style={{ maxHeight: '50vh' }}>
{`// UN Data Cached JSON Format Example
// Organized by Location, Theme, SDG, and Partner

// Location-based cache (e.g., cache/locations/AFG.json)
{
  "location": "AFG",
  "name": "Afghanistan",
  "data": [
    {
      "indicator": "Employment Rate",
      "value": 45.2,
      "year": "2024",
      "unit": "Percent",
      "source": "${viewingVersion.organization}"
    }
  ]
}

// Theme-based cache (e.g., cache/themes/employment.json)
{
  "theme": "employment",
  "indicators": [
    {
      "id": "employment_rate",
      "locations": ["AFG", "PAK", "IND"],
      "timeseries": {
        "2023": {...},
        "2024": {...}
      }
    }
  ]
}`}
                      </pre>
                    </div>
                  ) : (
                    <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        ⏳ Not yet deployed to UN Data
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Deploy from "Approve & Deploy" → "Deploy to UN Data" to generate optimized cache files
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      )}
      
      {/* Blueprint Viewer */}
      {showBlueprint && (
        <BlueprintViewer
          blueprint={getBlueprint(showBlueprint)}
          isDarkMode={isDarkMode}
          onClose={() => setShowBlueprint(null)}
        />
      )}
    </div>
  );
}

