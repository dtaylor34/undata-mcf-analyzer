/**
 * FILE: src/components/GovernancePanel.jsx
 * PURPOSE: Display governance validation results (Theme & SDG alignment)
 */

export function GovernancePanel({ governanceResult, agency, isDarkMode }) {
  if (!governanceResult) {
    return (
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
        <p className="text-gray-500 text-center">No governance data available</p>
      </div>
    );
  }
  
  const { isValid, coverage, errors, warnings } = governanceResult;
  
  // Calculate coverage percentage
  const themeCoverage = (coverage.themeMapped / coverage.total) * 100;
  const sdgCoverage = (coverage.sdgMapped / coverage.total) * 100;
  
  return (
    <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🏛️ Governance Validation</h3>
        {isValid ? (
          <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-300 text-sm font-medium">
            ✓ Valid
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-300 text-sm font-medium">
            ⚠ Issues Found
          </span>
        )}
      </div>
      
      {/* Coverage Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Theme Coverage
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">{themeCoverage.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mb-1">
              ({coverage.themeMapped}/{coverage.total})
            </p>
          </div>
          <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full ${themeCoverage >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${themeCoverage}%` }}
            ></div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            SDG Coverage
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold">{sdgCoverage.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mb-1">
              ({coverage.sdgMapped}/{coverage.total})
            </p>
          </div>
          <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full ${sdgCoverage >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${sdgCoverage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-red-400 mb-2">❌ Errors ({errors.length})</h4>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-red-900/30 text-red-300 text-sm">
                <p className="font-medium">{error.type}</p>
                <p className="text-xs mt-1">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">⚠️ Warnings ({warnings.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {warnings.slice(0, 5).map((warning, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-yellow-900/30 text-yellow-300 text-sm">
                <p className="font-medium">{warning.variable}</p>
                <p className="text-xs mt-1">{warning.message}</p>
                {warning.suggestion && (
                  <p className="text-xs mt-1 text-yellow-400">
                    Suggestion: {Array.isArray(warning.suggestion) ? warning.suggestion.join(', ') : warning.suggestion}
                  </p>
                )}
              </div>
            ))}
            {warnings.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                ... and {warnings.length - 5} more warnings
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
