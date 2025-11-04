/**
 * FILE: src/components/ChartPreview.jsx
 * PURPOSE: Preview charts using cached JSON data, matching UN Data Thematic Areas style
 * 
 * Replicates the chart visualization from staging.undatacommons.dev
 * Shows how data will appear on the live UN Data website
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Table as TableIcon, Download, Play, Pause, Info, Filter } from 'lucide-react';

export default function ChartPreview({ 
  cachedData, 
  isDarkMode,
  onClose 
}) {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'table'
  const [selectedYear, setSelectedYear] = useState(2019);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterLocation, setFilterLocation] = useState('world');
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterPartner, setFilterPartner] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  
  // Extract years from data
  const availableYears = useMemo(() => {
    if (!cachedData || !cachedData.locations) return [];
    const years = new Set();
    Object.values(cachedData.locations).forEach(location => {
      location.data?.forEach(d => {
        if (d.year) years.add(d.year);
      });
    });
    return Array.from(years).sort();
  }, [cachedData]);
  
  // Get data for current year
  const currentYearData = useMemo(() => {
    if (!cachedData || !cachedData.locations) return [];
    
    const data = [];
    Object.entries(cachedData.locations).forEach(([code, location]) => {
      const yearData = location.data?.find(d => d.year === selectedYear.toString());
      if (yearData) {
        data.push({
          code,
          name: location.name || code,
          value: parseFloat(yearData.value),
          unit: yearData.unit,
          indicator: yearData.indicator,
          source: yearData.source
        });
      }
    });
    
    return data.sort((a, b) => b.value - a.value);
  }, [cachedData, selectedYear]);
  
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return currentYearData;
    return currentYearData.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentYearData, searchQuery]);
  
  // Get color for value (matching UN Data purple gradient)
  const getColorForValue = (value) => {
    if (!value) return '#e5e7eb';
    const max = Math.max(...currentYearData.map(d => d.value));
    const min = Math.min(...currentYearData.map(d => d.value));
    const normalized = (value - min) / (max - min);
    
    // Purple gradient from light to dark
    const r = Math.round(139 - normalized * 80);
    const g = Math.round(92 - normalized * 40);
    const b = Math.round(246 - normalized * 100);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Timeline animation
  useEffect(() => {
    let interval;
    if (isPlaying && availableYears.length > 0) {
      interval = setInterval(() => {
        setSelectedYear(current => {
          const currentIndex = availableYears.indexOf(current);
          if (currentIndex >= availableYears.length - 1) {
            setIsPlaying(false);
            return current;
          }
          return availableYears[currentIndex + 1];
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, availableYears]);
  
  if (!cachedData) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Chart Data Available</p>
        <p className="text-sm">Deploy to UN Data to generate cached files for chart preview</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {cachedData.indicator?.name || 'Data Visualization'}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Source: {cachedData.source || 'Global SDG Database'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'map'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'table'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            Found {filteredData.length} item(s)
          </button>
          <button
            onClick={() => {/* Download logic */}}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Filter className="h-3 w-3" />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Filters:</span>
        </div>
        
        <input
          type="text"
          placeholder="Filter by location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`px-3 py-1 rounded-full text-sm ${
            isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
        />
      </div>
      
      {/* Map View */}
      {viewMode === 'map' && (
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
          <div className="mb-6">
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {cachedData.indicator?.name || 'World Map Visualization'}
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Data for {selectedYear} • Highest coverage
            </p>
          </div>
          
          {/* Simplified Map Visualization */}
          <div className="relative">
            <svg viewBox="0 0 800 400" className="w-full" style={{ maxHeight: '400px' }}>
              {/* Background */}
              <rect width="800" height="400" fill={isDarkMode ? '#1f2937' : '#f3f4f6'} />
              
              {/* Sample countries as rectangles (simplified for demonstration) */}
              {filteredData.slice(0, 20).map((country, idx) => (
                <g key={country.code}>
                  <rect
                    x={(idx % 10) * 80 + 10}
                    y={Math.floor(idx / 10) * 180 + 20}
                    width="70"
                    height="160"}
                    fill={getColorForValue(country.value)}
                    stroke={isDarkMode ? '#374151' : '#d1d5db'}
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  />
                  <text
                    x={(idx % 10) * 80 + 45}
                    y={Math.floor(idx / 10) * 180 + 100}
                    textAnchor="middle"
                    fill={isDarkMode ? '#fff' : '#000'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {country.code}
                  </text>
                  <text
                    x={(idx % 10) * 80 + 45}
                    y={Math.floor(idx / 10) * 180 + 120}
                    textAnchor="middle"
                    fill={isDarkMode ? '#fff' : '#000'}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {country.value.toFixed(1)}%
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Hover Tooltip */}
            {hoveredCountry && (
              <div className={`absolute top-4 right-4 p-3 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {hoveredCountry.name}
                </p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {hoveredCountry.value.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hoveredCountry.indicator}
                </p>
              </div>
            )}
          </div>
          
          {/* Color Legend */}
          <div className="mt-6 flex items-center gap-3">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Math.min(...currentYearData.map(d => d.value)).toFixed(1)}%
            </span>
            <div className="flex-1 h-3 rounded" style={{
              background: `linear-gradient(to right, rgb(219, 172, 246), rgb(139, 92, 246), rgb(109, 40, 217))`
            }} />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Math.max(...currentYearData.map(d => d.value)).toFixed(1)}%
            </span>
          </div>
          
          {/* Timeline Slider */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedYear}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                * Most recent date with highest coverage
              </span>
            </div>
            
            <input
              type="range"
              min={availableYears[0] || 2010}
              max={availableYears[availableYears.length - 1] || 2021}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full"
              step="1"
            />
            
            <div className="flex justify-between mt-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {availableYears[0]}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {availableYears[availableYears.length - 1]}
              </span>
            </div>
          </div>
          
          <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            This chart incorporates various dates to create the most relevant visual.
          </p>
        </div>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Location
                  </th>
                  <th className={`px-4 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Value ({selectedYear})
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((country, idx) => (
                  <tr 
                    key={country.code}
                    className={`border-t ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {country.name}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {country.value.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={`px-4 py-3 text-xs ${isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-gray-50 text-gray-500'}`}>
            Data based in alphabetical order. Some places may be missing due to incomplete reporting that year.
          </div>
        </div>
      )}
    </div>
  );
}
