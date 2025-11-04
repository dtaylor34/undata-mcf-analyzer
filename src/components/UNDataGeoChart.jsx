/**
 * FILE: src/components/UNDataGeoChart.jsx
 * PURPOSE: Replicate UN Data website charts using Google Charts API
 * USES: react-google-charts (same as UN Data website)
 */

import React from 'react';
import { Chart } from 'react-google-charts';

export default function UNDataGeoChart({ data, isDarkMode, selectedYear, indicator }) {
  console.log('🌍 UNDataGeoChart rendering with:', { dataLength: data.length, selectedYear });
  
  // Transform data to Google Charts format
  // Format: [['Country', 'Value'], ['United States', 100], ...]
  const chartData = [
    ['Country', indicator?.name || 'Value'],
    ...data.map(country => [
      country.name,
      parseFloat(country.value) || 0
    ])
  ];
  
  console.log('📊 Google Charts data:', chartData.slice(0, 5));
  
  // Google Charts options matching UN Data style
  const options = {
    colorAxis: {
      colors: ['#dbacf6', '#b482f0', '#8b5cf6', '#6d28d9'], // Purple gradient
      minValue: Math.min(...data.map(d => d.value)),
      maxValue: Math.max(...data.map(d => d.value))
    },
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    datalessRegionColor: isDarkMode ? '#374151' : '#e5e7eb',
    defaultColor: isDarkMode ? '#374151' : '#e5e7eb',
    legend: {
      textStyle: {
        color: isDarkMode ? '#9ca3af' : '#4b5563',
        fontSize: 12
      }
    },
    tooltip: {
      textStyle: {
        color: '#000000',
        fontSize: 13
      },
      showColorCode: false
    },
    // UN Data style settings
    displayMode: 'regions',
    resolution: 'countries',
    keepAspectRatio: true,
    width: '100%',
    height: 500
  };
  
  return (
    <div className="space-y-4">
      {/* Chart Title */}
      <div className="text-center">
        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {indicator?.name || 'World Data Visualization'}
        </h4>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Data for {selectedYear} • {data.length} countries
        </p>
      </div>
      
      {/* Google GeoChart */}
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
        <Chart
          chartType="GeoChart"
          width="100%"
          height="500px"
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
                  const country = chartData[row + 1][0];
                  console.log('Selected country:', country);
                }
              }
            }
          ]}
        />
      </div>
      
      {/* Data Source */}
      <div className="text-center">
        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Powered by Google Charts • Hover over countries for details
        </p>
      </div>
      
      {/* Statistics */}
      <div className={`grid grid-cols-3 gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-2xl font-bold text-purple-500">
            {data.length}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Countries
          </div>
        </div>
        <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-2xl font-bold text-purple-500">
            {Math.max(...data.map(d => d.value)).toFixed(1)}%
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Highest
          </div>
        </div>
        <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-2xl font-bold text-purple-500">
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}%
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Average
          </div>
        </div>
      </div>
    </div>
  );
}

