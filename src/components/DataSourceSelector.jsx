import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Database, Plus, X } from 'lucide-react';

/**
 * DataSourceSelector Component
 * Allows users to select CSV files to combine with schema MCF files
 * This maintains MCF as source of truth by explicitly combining data
 */
export function DataSourceSelector({ 
  orgId, 
  fileAnalysis,
  selectedSources,
  onSourcesChange 
}) {
  const [selectedCSV, setSelectedCSV] = useState('');
  
  // Get available CSV files for this organization
  const availableCSVFiles = getAvailableCSVForOrg(orgId);
  
  // Add a CSV file to the selection
  const handleAddSource = () => {
    if (!selectedCSV) return;
    
    const newSource = {
      id: `${orgId}-${selectedCSV}-${Date.now()}`,
      csvFile: selectedCSV,
      basePath: `/datacommons/${orgId}/csv/`,
      name: selectedCSV
    };
    
    onSourcesChange([...selectedSources, newSource]);
    setSelectedCSV(''); // Reset selection
    console.log('➕ Added data source:', selectedCSV);
  };
  
  // Remove a CSV file from selection
  const handleRemoveSource = (sourceId) => {
    const newSources = selectedSources.filter(s => s.id !== sourceId);
    onSourcesChange(newSources);
    console.log('➖ Removed data source');
  };
  
  // Don't show selector if file already has observations
  if (fileAnalysis?.status === 'COMPLETE') {
    return null;
  }
  
  // Don't show if no CSV files available
  if (availableCSVFiles.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
            ⚠️ This file needs data sources
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
            Schema file contains {fileAnalysis?.variableCount || 0} variable definitions but no observations.
            Add CSV files to generate charts.
          </p>
          
          {/* CSV File Selector */}
          <div className="flex gap-2">
            <Select value={selectedCSV} onValueChange={setSelectedCSV}>
              <SelectTrigger className="flex-1 bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select CSV file..." />
              </SelectTrigger>
              <SelectContent>
                {availableCSVFiles.map((csv) => (
                  <SelectItem key={csv} value={csv}>
                    📊 {csv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              size="sm" 
              onClick={handleAddSource}
              disabled={!selectedCSV}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {/* Selected Sources List */}
          {selectedSources.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                Selected data sources:
              </p>
              {selectedSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded px-2 py-1"
                >
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    ✓ {source.name}
                  </span>
                  <button
                    onClick={() => handleRemoveSource(source.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Status Summary */}
          {selectedSources.length > 0 && (
            <div className="mt-2 text-xs text-green-700 dark:text-green-300 font-medium">
              ✅ Ready to combine: Schema + {selectedSources.length} data source(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get available CSV files for an organization
 * This is a placeholder - in production, this would query a manifest or API
 */
function getAvailableCSVForOrg(orgId) {
  const csvManifest = {
    'who': [
      'WHO__Adult_curr_tob_use.csv',
      'WHO__MALARIA_EST_CASES.csv',
      'WHO__HIV_ARTCOVERAGE.csv',
      'WHO__LIFE_0000000030.csv',
      'WHO__CHILDMORT_DEATHS_10TO14.csv',
      'WHO__anc4.csv',
      'WHO__vfull.csv',
      'WHO__AIR_71.csv',
      'WHO__DEVICES18.csv',
    ],
    'sdg': [],  // SDG uses sample-observations.mcf
    'ilo': [],  // Could add ILO CSV files here
    'unicef': []  // Could add UNICEF CSV files here
  };
  
  return csvManifest[orgId] || [];
}

