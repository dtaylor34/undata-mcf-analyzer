/**
 * FILE: src/components/CachedDataViewer.jsx
 * PURPOSE: View all available charts from cached JSON data
 * 
 * FEATURES:
 * - 4 view modes: Location, Theme, SDG, Partner
 * - Load data from generated cache files
 * - Display charts for each variation
 * - Filter and search capabilities
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Target, Users, Search, BarChart3, TrendingUp } from 'lucide-react';
import { listCachedFiles, loadCacheFile } from '../utils/cache-generator';
import ChartPreview from './ChartPreview';

export default function CachedDataViewer({ isDarkMode }) {
  const [viewMode, setViewMode] = useState('location'); // location, theme, sdg, partner
  const [cachedData, setCachedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Load cached files on mount and when view mode changes
  useEffect(() => {
    loadCachedData();
  }, [viewMode]);
  
  const loadCachedData = () => {
    setIsLoading(true);
    
    try {
      let files = [];
      
      switch (viewMode) {
        case 'location':
          files = listCachedFiles('by-country');
          break;
        case 'theme':
          files = listCachedFiles('themes');
          break;
        case 'sdg':
          files = listCachedFiles('sdgs');
          break;
        case 'partner':
          files = listCachedFiles('partners');
          break;
        default:
          files = [];
      }
      
      // Load the actual content for each file
      const loadedData = files.map(file => {
        const content = loadCacheFile(file.path);
        return {
          ...file,
          data: content,
          name: extractNameFromPath(file.path)
        };
      }).filter(item => item.data !== null);
      
      setCachedData(loadedData);
      console.log(`📊 Loaded ${loadedData.length} cached files for ${viewMode}`);
      
    } catch (error) {
      console.error('Failed to load cached data:', error);
      setCachedData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractNameFromPath = (path) => {
    const filename = path.split('/').pop();
    return filename.replace('.json', '').replace(/-/g, ' ').toUpperCase();
  };
  
  const filteredData = cachedData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getViewIcon = (mode) => {
    switch (mode) {
      case 'location': return <MapPin className="h-5 w-5" />;
      case 'theme': return <Layers className="h-5 w-5" />;
      case 'sdg': return <Target className="h-5 w-5" />;
      case 'partner': return <Users className="h-5 w-5" />;
      default: return null;
    }
  };
  
  const getViewLabel = (mode) => {
    switch (mode) {
      case 'location': return 'By Location';
      case 'theme': return 'By Theme';
      case 'sdg': return 'By SDG Goal';
      case 'partner': return 'By Data Partner';
      default: return mode;
    }
  };
  
  const generateChartsFromData = (item) => {
    if (!item.data) return [];
    
    const charts = [];
    
    // Generate charts based on the data structure
    if (item.data.indicators && Array.isArray(item.data.indicators)) {
      // Group by indicator type
      const indicatorGroups = {};
      
      item.data.indicators.forEach(indicator => {
        if (!indicatorGroups[indicator.id]) {
          indicatorGroups[indicator.id] = {
            id: indicator.id,
            name: indicator.name,
            unit: indicator.unit,
            dataPoints: []
          };
        }
        
        indicatorGroups[indicator.id].dataPoints.push({
          year: indicator.year,
          value: indicator.value,
          country: indicator.country || item.data.country,
          countryCode: indicator.countryCode || item.data.countryCode
        });
      });
      
      // Create a chart for each indicator
      Object.values(indicatorGroups).forEach(group => {
        if (group.dataPoints.length > 0) {
          charts.push({
            title: group.name,
            subtitle: `${item.name} - ${group.unit}`,
            type: 'line',
            data: group.dataPoints.sort((a, b) => a.year - b.year)
          });
        }
      });
    }
    
    // Generate charts from trends if available
    if (item.data.trends) {
      Object.entries(item.data.trends).forEach(([indicatorId, trendData]) => {
        const indicator = item.data.indicators?.find(i => i.id === indicatorId);
        charts.push({
          title: indicator?.name || indicatorId,
          subtitle: `${item.name} - Trend`,
          type: 'line',
          data: trendData
        });
      });
    }
    
    return charts;
  };
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Cached Data Viewer
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View charts generated from cached JSON files
        </p>
      </div>
      
      {/* View Mode Selector */}
      <div className="mb-6 flex gap-3">
        {['location', 'theme', 'sdg', 'partner'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {getViewIcon(mode)}
            {getViewLabel(mode)}
          </button>
        ))}
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading cached data...
          </p>
        </div>
      )}
      
      {/* No Data State */}
      {!isLoading && cachedData.length === 0 && (
        <div className={`text-center py-12 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Cached Data Available
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Deploy data to UN Data (Cached JSON) to see charts here
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      )}
      
      {/* Data Grid */}
      {!isLoading && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, idx) => {
            const charts = generateChartsFromData(item);
            const indicatorCount = item.data.indicators?.length || item.data.totalObservations || 0;
            
            return (
              <div
                key={idx}
                className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => setSelectedItem(item)}
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {indicatorCount} indicators
                    </span>
                    {item.data.countries && (
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {Array.isArray(item.data.countries) ? item.data.countries.length : 0} countries
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {charts.length} charts available
                    </span>
                  </div>
                  {item.data.sources && Array.isArray(item.data.sources) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.data.sources.map((source, sidx) => (
                        <span
                          key={sidx}
                          className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Preview Chart (if available) */}
                {charts.length > 0 && charts[0].data && charts[0].data.length > 0 && (
                  <div className="mt-4">
                    <div className={`h-32 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Click to view charts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Detailed View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setSelectedItem(null)}>
          <div
            className={`max-w-7xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 p-6 border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} z-10`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedItem.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    UN Data Thematic Area Visualization
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ChartPreview
                cachedData={selectedItem.data}
                isDarkMode={isDarkMode}
                onClose={() => setSelectedItem(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

