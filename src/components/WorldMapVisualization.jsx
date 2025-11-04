/**
 * FILE: src/components/WorldMapVisualization.jsx
 * PURPOSE: Interactive world map matching UN Data website style
 * USES: react-simple-maps for geographic visualization
 */

import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export default function WorldMapVisualization({ data, isDarkMode, selectedYear }) {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Create a map of country codes to values
  const dataMap = {};
  data.forEach(country => {
    // Map country codes (handle different formats)
    const code = country.code?.toUpperCase() || country.name;
    dataMap[code] = country.value;
  });
  
  // Get min/max for color scaling
  const values = data.map(d => d.value).filter(v => v !== undefined);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Get color for a country based on its value (UN Data purple gradient)
  const getCountryColor = (countryCode) => {
    const value = dataMap[countryCode];
    if (value === undefined) {
      return isDarkMode ? '#374151' : '#e5e7eb'; // No data color
    }
    
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    
    // Purple gradient from light to dark (matching UN Data)
    const r = Math.round(219 - normalized * 80);  // 219 -> 139
    const g = Math.round(172 - normalized * 80);  // 172 -> 92
    const b = Math.round(246 - normalized * 29);  // 246 -> 217
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const handleMouseEnter = (geo, event) => {
    const countryCode = geo.properties.ISO_A3 || geo.properties.ADM0_A3;
    const countryName = geo.properties.name || geo.properties.NAME;
    const value = dataMap[countryCode];
    
    if (value !== undefined) {
      const countryData = data.find(d => d.code === countryCode || d.name === countryName);
      setTooltipContent({
        name: countryData?.name || countryName,
        value: value,
        indicator: countryData?.indicator,
        unit: countryData?.unit || '%'
      });
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  
  const handleMouseLeave = () => {
    setTooltipContent(null);
  };
  
  const handleMouseMove = (event) => {
    if (tooltipContent) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  
  return (
    <div className="relative">
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
            center: [0, 20]
          }}
          width={800}
          height={450}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup zoom={1}>
            <Sphere stroke={isDarkMode ? '#4b5563' : '#d1d5db'} strokeWidth={0.5} fill="none" />
            <Graticule stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode = geo.properties.ISO_A3 || geo.properties.ADM0_A3;
                  const fillColor = getCountryColor(countryCode);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                      strokeWidth={0.5}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                      style={{
                        default: { outline: 'none' },
                        hover: { 
                          fill: '#f59e0b',
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: { outline: 'none' }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Color Legend */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {minValue.toFixed(1)}%
        </span>
        <div className="flex-1 max-w-md h-3 rounded" style={{
          background: `linear-gradient(to right, rgb(219, 172, 246), rgb(180, 130, 240), rgb(139, 92, 246), rgb(109, 40, 217))`
        }} />
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {maxValue.toFixed(1)}%
        </span>
      </div>
      
      <div className="mt-2 text-center">
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Hover over countries to see detailed data • {selectedYear}
        </span>
      </div>
      
      {/* Tooltip */}
      {tooltipContent && (
        <div
          className={`fixed z-50 p-3 rounded-lg shadow-xl pointer-events-none ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            transform: 'translate(0, -50%)'
          }}
        >
          <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {tooltipContent.name}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {tooltipContent.value.toFixed(1)}{tooltipContent.unit}
          </p>
          {tooltipContent.indicator && (
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {tooltipContent.indicator}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

