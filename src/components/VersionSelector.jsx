/**
 * FILE: src/components/VersionSelector.jsx
 * PURPOSE: Version selection and diff toggle for partner data
 * 
 * FEATURES:
 * - Version dropdown (Q4-2024, Q1-2025, Q2-2025 for SDG, or other versions)
 * - Indicator picker
 * - Compare version selector
 * - Diff toggle switch
 * - Material Design
 */

import React from 'react';
import { getOrganization } from '../undata-integration/real-catalog';

export default function VersionSelector({
  organization,
  selectedVersion,
  compareVersion,
  onVersionSelect,
  onCompareVersionSelect,
  onIndicatorSelect,
  showDiff,
  onToggleDiff,
  isDarkMode
}) {
  const orgData = getOrganization(organization.id);
  const versions = orgData?.quarters ? Object.keys(orgData.quarters) : ['latest'];
  const indicators = orgData?.topIndicators || [];

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indicator Selector */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Indicator
          </label>
          <select
            onChange={(e) => {
              const indicator = indicators.find(i => i.dcid === e.target.value);
              onIndicatorSelect(indicator);
            }}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Indicator...</option>
            {indicators.map(indicator => (
              <option key={indicator.dcid} value={indicator.dcid}>
                {indicator.name}
              </option>
            ))}
          </select>
        </div>

        {/* Version Selector */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Version
          </label>
          <select
            value={selectedVersion || ''}
            onChange={(e) => onVersionSelect(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Latest Version</option>
            {versions.map(version => (
              <option key={version} value={version}>
                {version.toUpperCase()}
                {orgData?.quarters?.[version] && 
                  ` (${orgData.quarters[version].indicators.toLocaleString()})`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Compare Version Selector */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Compare With
          </label>
          <select
            value={compareVersion || ''}
            onChange={(e) => onCompareVersionSelect(e.target.value)}
            disabled={!showDiff}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                : 'bg-white border-gray-300 text-gray-900 disabled:opacity-50'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Version...</option>
            {versions.filter(v => v !== selectedVersion).map(version => (
              <option key={version} value={version}>
                {version.toUpperCase()}
                {orgData?.quarters?.[version] && 
                  ` (${orgData.quarters[version].indicators.toLocaleString()})`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Diff Toggle */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Show Diff
          </label>
          <button
            onClick={onToggleDiff}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              showDiff
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showDiff ? '✓ Diff Enabled' : 'Enable Diff'}
          </button>
        </div>
      </div>

      {/* Version Info */}
      {selectedVersion && orgData?.quarters?.[selectedVersion] && (
        <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Version
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedVersion.toUpperCase()}
              </p>
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Indicators
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {orgData.quarters[selectedVersion].indicators.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                File Size
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {orgData.quarters[selectedVersion].fileSize}
              </p>
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Status
              </p>
              <p className={`text-lg font-bold text-green-500`}>
                ✓ Loaded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diff Info */}
      {showDiff && compareVersion && (
        <div className={`mt-4 p-4 rounded-lg border-2 ${isDarkMode ? 'border-blue-700 bg-blue-900/20' : 'border-blue-300 bg-blue-50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Comparing: {selectedVersion?.toUpperCase() || 'Latest'} vs {compareVersion.toUpperCase()}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Diff viewer will show changes between versions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
