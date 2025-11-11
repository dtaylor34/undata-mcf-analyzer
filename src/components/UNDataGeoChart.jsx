/**
 * FILE: src/components/UNDataGeoChart.jsx
 * PURPOSE: Replicate UN Data website charts using Google Charts API
 * MATCHES: Exact styling from staging.undatacommons.dev
 * USES: react-google-charts (same as UN Data website)
 */

import React, { useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { Download, Search } from 'lucide-react';
import { getCountryName } from '../utils/country-names';

export default function UNDataGeoChart({ data, isDarkMode, selectedYear, indicator }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentYear] = useState(selectedYear || 2022);
  
  console.log('🌍 UNDataGeoChart rendering with:', { dataLength: data.length, selectedYear, indicator });
  
  // Get unique locations with full country names, sorted alphabetically
  const availableLocations = useMemo(() => 
    data.map(country => ({
      code: country.code,
      name: getCountryName(country.code) || country.name || country.code,
      value: country.value
    })).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );
  
  // Filter locations by search (for table display)
  const filteredLocations = useMemo(() => {
    return searchQuery 
      ? availableLocations.filter(loc => 
          loc.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : availableLocations;
  }, [availableLocations, searchQuery]);
  
  // Transform data to Google Charts format with full country names
  const chartData = useMemo(() => [
    ['Country', 'Value'],
    ...data.map(country => [
      getCountryName(country.code) || country.name || country.code,
      parseFloat(country.value) || 0
    ])
  ], [data]);
  
  // Calculate stats
  const stats = useMemo(() => ({
    minValue: Math.min(...data.map(d => d.value)),
    maxValue: Math.max(...data.map(d => d.value)),
    avgValue: data.reduce((sum, d) => sum + d.value, 0) / data.length
  }), [data]);
  
  // Google Charts options - EXACT UN Data site orange/brown color scheme
  const options = {
    colorAxis: {
      // Orange/brown gradient matching UN Data site exactly
      colors: ['#f5f5f5', '#ffd699', '#ffb366', '#ff9933', '#cc7a29', '#995c1f'],
      minValue: stats.minValue,
      maxValue: stats.maxValue,
      legend: {
        position: 'right',
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 11,
          fontName: 'system-ui, -apple-system, sans-serif'
        }
      }
    },
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    datalessRegionColor: isDarkMode ? '#334155' : '#d1d5db',
    defaultColor: isDarkMode ? '#334155' : '#d1d5db',
    tooltip: {
      textStyle: {
        color: '#1e293b',
        fontSize: 13,
        fontName: 'system-ui, -apple-system, sans-serif'
      },
      showColorCode: false
    },
    displayMode: 'regions',
    resolution: 'countries',
    keepAspectRatio: true,
    width: '100%',
    height: 380
  };
  
  // Download data as CSV
  const handleDownload = () => {
    const csv = [
      ['Country', 'Value', 'Year'],
      ...availableLocations.map(loc => [loc.name, loc.value, currentYear])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${indicator?.name || 'data'}_${currentYear}.csv`;
    a.click();
  };
  
  return (
    <div className={`rounded-lg border overflow-hidden ${
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Title Bar - Purple header matching UN Data site */}
      <div className={`px-4 py-3 ${
        isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-3 h-3 rounded-full ${
              isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
            }`} />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {indicator?.name || 'Share of employees with access to parental leave (1)'}
            </span>
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ml-2 ${
            isDarkMode ? 'bg-purple-400/10 text-purple-400 ring-purple-400/20' : 'bg-purple-50 text-purple-700 ring-purple-700/10'
          }`}>
            {indicator?.source || 'UNICEF'}
          </span>
        </div>
        {indicator?.dcid && (
          <div className={`text-xs mt-2 font-mono ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
            {indicator.dcid}
          </div>
        )}
      </div>
      
      {/* Two-Panel Layout - Map on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        {/* LEFT PANEL: Map View */}
        <div className={`p-4 border-b lg:border-b-0 lg:border-r ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Map Title */}
          <h3 className={`text-base font-normal mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {indicator?.name || 'Share of Employees With Access to Parental Leave'} in the World ({currentYear})
          </h3>
          <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Source: <a 
              href="https://data.unicef.org/resources/resource-type/datasets/" 
              className="text-blue-600 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              data.unicef.org
            </a>
          </p>
          
          {/* Google GeoChart */}
          <Chart
            chartType="GeoChart"
            width="100%"
            height="380px"
            data={chartData}
            options={options}
          />
          
          {/* Timeline Slider */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                2005
              </span>
              <div className={`px-3 py-1 rounded-md text-sm font-semibold ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {currentYear}
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                2024
              </span>
            </div>
            <div className={`h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <div 
                className="h-1 bg-blue-500 rounded-full" 
                style={{ width: `${((currentYear - 2005) / (2024 - 2005)) * 100}%` }}
              />
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              * Most recent date with highest coverage
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This chart incorporates various dates to create the most relevant visual.
            </p>
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className={`mt-3 flex items-center gap-2 text-sm ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
        
        {/* RIGHT PANEL: Data Table */}
        <div className="p-4">
          {/* Table Title */}
          <h3 className={`text-base font-normal mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {indicator?.name || 'Share of Employees With Access to Parental Leave'} in the World ({currentYear})
          </h3>
          <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Source: <a 
              href="https://data.unicef.org/resources/resource-type/datasets/" 
              className="text-blue-600 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              data.unicef.org
            </a>
          </p>
          
          {/* Search Filter */}
          <div className="relative mb-3">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Filter by location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border ${
                isDarkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300'
              }`}
            />
          </div>
          
          {/* Year Dropdown */}
          <div className="mb-3">
            <select
              value={currentYear}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            >
              <option value={currentYear}>{currentYear}</option>
            </select>
          </div>
          
          {/* Data Table */}
          <div className={`max-h-[340px] overflow-y-auto rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <table className="w-full text-sm">
              <tbody>
                {filteredLocations.map((loc) => (
                  <tr 
                    key={loc.code} 
                    className={`border-b last:border-b-0 ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {loc.name}
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${
                      isDarkMode ? 'text-orange-300' : 'text-orange-600'
                    }`}>
                      {loc.value.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Data based in alphabetical order. Some places may be missing due to incomplete reporting that year.
          </p>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className={`mt-3 flex items-center gap-2 text-sm ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
