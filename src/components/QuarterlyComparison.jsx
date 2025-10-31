/**
 * FILE: src/components/QuarterlyComparison.jsx
 * PURPOSE: SDG quarterly data comparison (Q4-2024 → Q1-2025 → Q2-2025)
 * 
 * FEATURES:
 * - Visual timeline of quarterly releases
 * - Indicator count changes
 * - Growth/decline visualization
 * - Summary statistics
 */

import React from 'react';
import { getSDGQuarterlyData } from '../undata-integration/real-catalog';

export default function QuarterlyComparison({ isDarkMode }) {
  const quarters = getSDGQuarterlyData();
  const quarterKeys = ['q4-2024', 'q1-2025', 'q2-2025'];
  
  // Calculate changes
  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return current - previous;
  };

  const calculatePercentChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📈</span>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            SDG Quarterly Comparison
          </h3>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Tracking indicator changes across SDG quarterly releases
        </p>
      </div>

      {/* Quarterly Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quarterKeys.map((quarter, index) => {
            const data = quarters[quarter];
            const prevQuarter = index > 0 ? quarters[quarterKeys[index - 1]] : null;
            const change = prevQuarter ? calculateChange(data.indicators, prevQuarter.indicators) : 0;
            const percentChange = prevQuarter ? calculatePercentChange(data.indicators, prevQuarter.indicators) : 0;
            
            return (
              <div
                key={quarter}
                className={`p-6 rounded-lg border-2 ${
                  index === 0
                    ? isDarkMode ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-400'
                    : index === 1
                    ? isDarkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-400'
                    : isDarkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-400'
                }`}
              >
                <div className="text-center">
                  <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quarter.toUpperCase()}
                  </h4>
                  
                  <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {data.indicators.toLocaleString()}
                  </div>
                  
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    indicators
                  </p>
                  
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    File: {data.fileSize}
                  </p>
                  
                  {change !== 0 && (
                    <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      <div className={`font-bold text-lg ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {change > 0 ? '▲' : '▼'} {Math.abs(change).toLocaleString()}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {change > 0 ? 'added' : 'removed'} ({percentChange}%)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Analysis */}
        <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Quarterly Analysis Summary
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Q4 → Q1 */}
            <div>
              <h5 className={`font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Q4-2024 → Q1-2025
              </h5>
              <p className="text-2xl font-bold text-red-500 mb-1">
                ▼ {(quarters['q4-2024'].indicators - quarters['q1-2025'].indicators).toLocaleString()}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.abs(calculatePercentChange(quarters['q1-2025'].indicators, quarters['q4-2024'].indicators))}% reduction
              </p>
            </div>
            
            {/* Q1 → Q2 */}
            <div>
              <h5 className={`font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Q1-2025 → Q2-2025
              </h5>
              <p className="text-2xl font-bold text-green-500 mb-1">
                ▲ {(quarters['q2-2025'].indicators - quarters['q1-2025'].indicators).toLocaleString()}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {calculatePercentChange(quarters['q2-2025'].indicators, quarters['q1-2025'].indicators)}% growth
              </p>
            </div>
          </div>

          {/* Net Change */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <h5 className={`font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              Net Change: Q4-2024 → Q2-2025
            </h5>
            <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              +{(quarters['q2-2025'].indicators - quarters['q4-2024'].indicators).toLocaleString()} indicators
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Overall growth: {calculatePercentChange(quarters['q2-2025'].indicators, quarters['q4-2024'].indicators)}%
            </p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <h5 className={`font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Growth Timeline
          </h5>
          <div className="flex items-center justify-between">
            {quarterKeys.map((quarter, index) => {
              const data = quarters[quarter];
              const percentage = (data.indicators / quarters['q2-2025'].indicators) * 100;
              
              return (
                <React.Fragment key={quarter}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                    >
                      {Math.round(percentage)}%
                    </div>
                    <div className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {quarter.toUpperCase()}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {data.indicators.toLocaleString()}
                    </div>
                  </div>
                  {index < quarterKeys.length - 1 && (
                    <div className="flex-1 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-2"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
