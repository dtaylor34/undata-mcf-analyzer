/**
 * FILE: src/components/OrganizationSelector.jsx
 * PURPOSE: Organization selection with real MCF catalog data
 * 
 * FEATURES:
 * - Shows 4 organizations (SDG, ILO, UNICEF, WHO)
 * - Real indicator counts from parsed MCF files
 * - SDG shows quarterly breakdown
 * - Material Design cards
 */

import React from 'react';
import { getAllOrganizations } from '../undata-integration/real-catalog';

export default function OrganizationSelector({ onSelect, selected, isDarkMode }) {
  const organizations = getAllOrganizations();

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Select Organization
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {organizations.map(org => (
          <button
            key={org.id}
            onClick={() => onSelect(org)}
            className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
              selected?.id === org.id
                ? isDarkMode
                  ? 'bg-blue-900 border-2 border-blue-500'
                  : 'bg-blue-50 border-2 border-blue-500'
                : isDarkMode
                ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            } shadow-lg`}
          >
            {/* Emoji Icon */}
            <div className="text-5xl mb-4">{org.emoji}</div>
            
            {/* Organization Name */}
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {org.name}
            </h3>
            
            {/* Indicator Count or Quarters */}
            {org.quarters ? (
              <div>
                <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {Object.keys(org.quarters).length} quarters
                </p>
                <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {Object.entries(org.quarters).map(([quarter, data]) => (
                    <div key={quarter} className="flex justify-between">
                      <span>{quarter.toUpperCase()}</span>
                      <span>{data.indicators.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {org.totalIndicators.toLocaleString()} indicators
              </p>
            )}
            
            {/* Total Count */}
            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Total: {org.totalIndicators.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
