/**
 * FILE: src/components/CSVVersionComparison.jsx
 * PURPOSE: Visual comparison between two CSV versions
 * 
 * FEATURES:
 * - Side-by-side version comparison
 * - Highlighted differences
 * - Row/column change visualization
 * - Sample data preview
 * - Export comparison report
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Minus, FileText, Download, X } from 'lucide-react';
import { compareVersions, loadVersion } from '../utils/csv-version-tracker';

export default function CSVVersionComparison({ 
  versionId1, 
  versionId2, 
  onClose,
  isDarkMode 
}) {
  const [version1, setVersion1] = useState(null);
  const [version2, setVersion2] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadVersionsAndCompare();
  }, [versionId1, versionId2]);
  
  const loadVersionsAndCompare = async () => {
    setIsLoading(true);
    
    try {
      const v1 = loadVersion(versionId1);
      const v2 = loadVersion(versionId2);
      
      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }
      
      setVersion1(v1);
      setVersion2(v2);
      setComparison(compareVersions(v1, v2));
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportComparison = () => {
    const report = {
      comparisonDate: new Date().toISOString(),
      version1: {
        id: version1.id,
        uploadDate: version1.uploadDate,
        rowCount: version1.rowCount,
        columnCount: version1.columnCount
      },
      version2: {
        id: version2.id,
        uploadDate: version2.uploadDate,
        rowCount: version2.rowCount,
        columnCount: version2.columnCount
      },
      changes: comparison.changes,
      summary: comparison.summary
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${version1.id}-vs-${version2.id}.json`;
    a.click();
  };
  
  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
        <div className="animate-pulse text-center">Loading comparison...</div>
      </div>
    );
  }
  
  if (!version1 || !version2 || !comparison) {
    return (
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
        <div className="text-center text-red-500">Error loading versions</div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const formatSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };
  
  // Find column differences
  const columns1 = new Set(version1.columns || []);
  const columns2 = new Set(version2.columns || []);
  const addedColumns = [...columns2].filter(col => !columns1.has(col));
  const removedColumns = [...columns1].filter(col => !columns2.has(col));
  const commonColumns = [...columns1].filter(col => columns2.has(col));
  
  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} shadow-lg`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 CSV Version Comparison
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {version1.datasetName} • v{version1.version} → v{version2.version}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportComparison}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${
                isDarkMode 
                  ? 'border-gray-700 text-white hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            📈 Change Summary
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rows</div>
              <div className={`text-2xl font-bold ${
                comparison.summary.rowChange > 0 ? 'text-green-500' : 
                comparison.summary.rowChange < 0 ? 'text-red-500' : 
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {comparison.summary.rowChange > 0 && '+'}
                {comparison.summary.rowChange}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Columns</div>
              <div className={`text-2xl font-bold ${
                comparison.summary.columnChange > 0 ? 'text-green-500' : 
                comparison.summary.columnChange < 0 ? 'text-red-500' : 
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {comparison.summary.columnChange > 0 && '+'}
                {comparison.summary.columnChange}
              </div>
            </div>
            <div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Size</div>
              <div className={`text-2xl font-bold ${
                comparison.summary.sizeChange > 0 ? 'text-green-500' : 
                comparison.summary.sizeChange < 0 ? 'text-red-500' : 
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {comparison.summary.sizeChange > 0 && '+'}
                {formatSize(Math.abs(comparison.summary.sizeChange))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Changes */}
        <div className="mb-6">
          <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔍 Detailed Changes
          </h4>
          {comparison.changes.length === 0 ? (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No changes detected
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {comparison.changes.map((change, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    change.action === 'added' 
                      ? isDarkMode ? 'bg-green-900/20 border border-green-700/50' : 'bg-green-50 border border-green-200'
                      : change.action === 'removed'
                      ? isDarkMode ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'
                      : isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {change.action === 'added' ? (
                      <Plus className="h-5 w-5 text-green-500" />
                    ) : change.action === 'removed' ? (
                      <Minus className="h-5 w-5 text-red-500" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {change.description}
                    </div>
                    {change.columns && (
                      <div className={`text-xs mt-1 font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {change.columns.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-12 gap-6">
          {/* Version 1 */}
          <div className="col-span-5">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FileText className="h-5 w-5" />
                Version {version1.version} (Old)
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Uploaded:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{formatDate(version1.uploadDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Rows:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{version1.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Columns:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{version1.columnCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Size:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{formatSize(version1.fileSize)}</span>
                </div>
              </div>
              
              {/* Column List */}
              <div className="mt-4">
                <div className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Columns:
                </div>
                <div className="space-y-1">
                  {version1.columns.map((col, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        removedColumns.includes(col)
                          ? 'bg-red-500/20 text-red-500 line-through'
                          : isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
                      }`}
                    >
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="col-span-2 flex items-center justify-center">
            <ArrowRight className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          
          {/* Version 2 */}
          <div className="col-span-5">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FileText className="h-5 w-5" />
                Version {version2.version} (New)
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Uploaded:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{formatDate(version2.uploadDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Rows:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{version2.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Columns:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{version2.columnCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Size:</span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{formatSize(version2.fileSize)}</span>
                </div>
              </div>
              
              {/* Column List */}
              <div className="mt-4">
                <div className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Columns:
                </div>
                <div className="space-y-1">
                  {version2.columns.map((col, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        addedColumns.includes(col)
                          ? 'bg-green-500/20 text-green-500 font-bold'
                          : isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
                      }`}
                    >
                      {col} {addedColumns.includes(col) && <span className="ml-1">✨</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Added</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Modified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

