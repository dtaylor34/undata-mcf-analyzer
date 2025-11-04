/**
 * FILE: src/components/UNDataGeoChart.jsx
 * PURPOSE: Replicate UN Data website charts using Google Charts API
 * USES: react-google-charts (same as UN Data website)
 */

import React, { useState } from 'react';
import { Chart } from 'react-google-charts';
import { ChevronDown, MapPin } from 'lucide-react';

export default function UNDataGeoChart({ data, isDarkMode, selectedYear, indicator }) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  console.log('🌍 UNDataGeoChart rendering with:', { dataLength: data.length, selectedYear });
  
  // Get unique locations
  const availableLocations = [
    { code: 'all', name: 'All Locations', count: data.length },
    ...data.map(country => ({
      code: country.code,
      name: country.name,
      value: country.value
    })).sort((a, b) => a.name.localeCompare(b.name))
  ];
  
  // Filter data based on selected location
  const filteredData = selectedLocation === 'all' 
    ? data 
    : data.filter(d => d.code === selectedLocation);
  
  // Transform data to Google Charts format
  const chartData = [
    ['Country', indicator?.name || 'Value'],
    ...filteredData.map(country => [
      country.name,
      parseFloat(country.value) || 0
    ])
  ];
  
  console.log('📊 Google Charts data:', chartData.slice(0, 5));
  
  // Google Charts options - cleaner UN Data style
  const options = {
    colorAxis: {
      colors: ['#e0d4f7', '#c4b0f0', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'], // Softer purple gradient
      minValue: Math.min(...filteredData.map(d => d.value)),
      maxValue: Math.max(...filteredData.map(d => d.value))
    },
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    datalessRegionColor: isDarkMode ? '#1e293b' : '#f1f5f9',
    defaultColor: isDarkMode ? '#1e293b' : '#f1f5f9',
    legend: 'none', // Cleaner look like UN Data
    tooltip: {
      textStyle: {
        color: '#1e293b',
        fontSize: 14,
        fontName: 'Inter, system-ui, sans-serif'
      },
      showColorCode: true
    },
    displayMode: 'regions',
    resolution: 'countries',
    keepAspectRatio: false,
    width: '100%',
    height: 450
  };
  
  return (
    <div className="space-y-6">
      {/* Header Section - UN Data Style */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-light mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {indicator?.name || 'Employment Rate'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Source: {indicator?.source || 'ILO'} • {selectedYear}
          </p>
        </div>
        
        {/* Location Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedLocation === 'all' 
                ? `All Locations (${data.length})` 
                : availableLocations.find(l => l.code === selectedLocation)?.name
              }
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {/* Dropdown */}
          {showLocationDropdown && (
            <div className={`absolute right-0 top-full mt-2 w-72 rounded-lg shadow-xl z-50 border max-h-96 overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`sticky top-0 p-3 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  SELECT LOCATION
                </p>
              </div>
              
              {availableLocations.map((location) => (
                <button
                  key={location.code}
                  onClick={() => {
                    setSelectedLocation(location.code);
                    setShowLocationDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } ${selectedLocation === location.code ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                >
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {location.name}
                  </span>
                  {location.value && (
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {location.value.toFixed(1)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Google GeoChart - Cleaner Container */}
      <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Chart
          chartType="GeoChart"
          width="100%"
          height="450px"
          data={chartData}
          options={options}
          chartEvents={[
            {
              eventName: 'select',
              callback: ({ chartWrapper }) => {
                const chart = chartWrapper.getChart();
                const selection = chart.getSelection();
                if (selection.length > 0) {
                  const row = selection[0].row;
                  const countryName = chartData[row + 1][0];
                  const country = data.find(d => d.name === countryName);
                  if (country) {
                    setSelectedLocation(country.code);
                    setShowLocationDropdown(false);
                  }
                }
              }
            }
          ]}
        />
      </div>
      
      {/* Color Scale Legend - UN Data Style */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {Math.min(...filteredData.map(d => d.value)).toFixed(1)}%
        </span>
        <div className="flex-1 max-w-md h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #e0d4f7, #c4b0f0, #a78bfa, #8b5cf6, #7c3aed, #6d28d9)'
        }} />
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {Math.max(...filteredData.map(d => d.value)).toFixed(1)}%
        </span>
      </div>
      
      {/* Clean Stats Bar - UN Data Style */}
      <div className={`flex items-center justify-center gap-8 py-4 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            Coverage
          </div>
          <div className="text-2xl font-light">
            {filteredData.length} <span className="text-base">countries</span>
          </div>
        </div>
        <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            Highest Value
          </div>
          <div className="text-2xl font-light">
            {Math.max(...filteredData.map(d => d.value)).toFixed(1)}<span className="text-base">%</span>
          </div>
        </div>
        <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            Global Average
          </div>
          <div className="text-2xl font-light">
            {(filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length).toFixed(1)}<span className="text-base">%</span>
          </div>
        </div>
      </div>
      
      {/* Source Attribution - Subtle */}
      <div className="text-center">
        <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Visualization powered by Google Charts
        </p>
      </div>
    </div>
  );
}

