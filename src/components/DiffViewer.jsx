/**
 * FILE: src/components/DiffViewer.jsx
 * PURPOSE: Side-by-side diff viewer for comparing versions
 * 
 * FEATURES:
 * - Split view comparison
 * - Line-by-line highlighting
 * - Addition/deletion markers
 * - Material Design
 */

import React from 'react';

export default function DiffViewer({ oldVersion, newVersion, oldVersionName, newVersionName, isDarkMode }) {
  // Generate simple line-by-line diff
  const generateDiff = () => {
    if (!oldVersion || !newVersion) return { left: [], right: [] };

    const oldText = JSON.stringify(oldVersion, null, 2);
    const newText = JSON.stringify(newVersion, null, 2);
    
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    const maxLines = Math.max(oldLines.length, newLines.length);
    const left = [];
    const right = [];
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine === newLine) {
        left.push({ type: 'same', content: oldLine, line: i + 1 });
        right.push({ type: 'same', content: newLine, line: i + 1 });
      } else {
        if (oldLine) {
          left.push({ type: 'removed', content: oldLine, line: i + 1 });
        }
        if (newLine) {
          right.push({ type: 'added', content: newLine, line: i + 1 });
        }
      }
    }
    
    return { left, right };
  };

  const { left, right } = generateDiff();

  return (
    <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚖️</span>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Version Comparison
          </h3>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comparing changes between versions
        </p>
      </div>

      {/* Diff Content */}
      <div className="grid grid-cols-2 divide-x divide-gray-700">
        {/* Left Side - Old Version */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
            <span className="font-bold">- {oldVersionName}</span>
          </div>
          <div className={`overflow-auto max-h-96 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {left.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1 font-mono text-xs ${
                  line.type === 'removed'
                    ? isDarkMode
                      ? 'bg-red-900/50 text-red-200'
                      : 'bg-red-100 text-red-800'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {line.line}
                </span>
                {line.type === 'removed' && <span className="mr-2">-</span>}
                <span>{line.content || ' '}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - New Version */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'}`}>
            <span className="font-bold">+ {newVersionName}</span>
          </div>
          <div className={`overflow-auto max-h-96 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {right.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1 font-mono text-xs ${
                  line.type === 'added'
                    ? isDarkMode
                      ? 'bg-green-900/50 text-green-200'
                      : 'bg-green-100 text-green-800'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {line.line}
                </span>
                {line.type === 'added' && <span className="mr-2">+</span>}
                <span>{line.content || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {right.filter(l => l.type === 'added').length} additions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {left.filter(l => l.type === 'removed').length} deletions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {left.filter(l => l.type === 'same').length} unchanged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
