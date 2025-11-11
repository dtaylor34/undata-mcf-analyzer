/**
 * FILE: src/components/UNDataGeoChart.jsx
 * PURPOSE: Replicate UN Data website charts using Google Charts API
 * MATCHES: Exact styling from staging.undatacommons.dev
 * USES: react-google-charts (same as UN Data website)
 */

import React, { useState } from 'react';
import { Chart } from 'react-google-charts';
import { Download, Search } from 'lucide-react';

export default function UNDataGeoChart({ data, isDarkMode, selectedYear, indicator }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentYear] = useState(selectedYear || 2022);
  
  console.log('🌍 UNDataGeoChart rendering with:', { dataLength: data.length, selectedYear, indicator });
  
  // Get unique locations sorted alphabetically
  const availableLocations = data.map(country => ({
    code: country.code,
    name: country.name,
    value: country.value
  })).sort((a, b) => a.name.localeCompare(b.name));
  
  // Filter locations by search
  const filteredLocations = searchQuery 
    ? availableLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableLocations;
  
  // Transform data to Google Charts format (show all countries on map)
  const chartData = [
    ['Country', 'Value'],
    ...data.map(country => [
      country.name,
      parseFloat(country.value) || 0
    ])
  ];
  
  // Calculate stats
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  
  // Google Charts options - EXACT UN Data site orange/brown color scheme
  const options = {
    colorAxis: {
      // Orange/brown gradient matching UN Data site exactly
      colors: ['#f5f5f5', '#ffd699', '#ffb366', '#ff9933', '#cc7a29', '#995c1f'],
      minValue: minValue,
      maxValue: maxValue
    },
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    datalessRegionColor: isDarkMode ? '#334155' : '#d1d5db', // Grey for countries without data
    defaultColor: isDarkMode ? '#334155' : '#d1d5db',
    legend: 'none',
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
    <div className="space-y-4">
      {/* Title Bar - matching UN Data site */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-lg ${
        isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
          }`} />
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {indicator?.name || 'Share of employees with access to parental leave (1)'}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-md text-sm font-medium ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
        }`}>
          {indicator?.source || 'ILO'}
        </div>
      </div>
      
      {/* Two-Panel Layout - Map on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Map View */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Map Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className={`text-lg font-normal mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {indicator?.name || 'Share of Employees With Access to Parental Leave in the World'} ({currentYear})
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Source: <a href="https://rshiny.ilo.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                rshiny.ilo.org
              </a>
            </p>
          </div>
          
          {/* Map */}
          <div className="p-4">
            <Chart
              chartType="GeoChart"
              width="100%"
              height="380px"
              data={chartData}
              options={options}
            />
          </div>
          
          {/* Timeline Slider - matching UN Data site */}
          <div className="px-8 pb-6">
            <div className="relative">
              <input
                type="range"
                min="2005"
                max="2024"
                value={currentYear}
                readOnly
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>2005</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {currentYear}
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>2024</span>
              </div>
            </div>
            <p className={`text-xs text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              * Most recent date with highest coverage
            </p>
            <p className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              This chart incorporates various dates to create the most relevant visual.
            </p>
          </div>
          
          {/* Download Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-gray-800' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* RIGHT PANEL: Data Table */}
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className={`text-lg font-normal mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {indicator?.name || 'Share of Employees With Access to Parental Leave in the World'} ({currentYear})
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Source: <a href="https://rshiny.ilo.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                rshiny.ilo.org
              </a>
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Filter by location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {/* Year Selector */}
            <div className="flex items-center justify-end mt-3">
              <select 
                value={currentYear}
                className={`px-4 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>
          
          {/* Data Table */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full">
              <tbody>
                {filteredLocations.map((location, index) => (
                  <tr 
                    key={location.code}
                    className={`border-b ${
                      isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {location.name}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {location.value.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer Note */}
          <div className="p-4 border-t border-gray-200">
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Data based in alphabetical order. Some places may be missing due to incomplete reporting that year.
            </p>
          </div>
          
          {/* Download Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-gray-800' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
