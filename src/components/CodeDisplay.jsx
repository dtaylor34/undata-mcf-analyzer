/**
 * FILE: src/components/CodeDisplay.jsx
 * PURPOSE: Syntax highlighted code display
 * 
 * FEATURES:
 * - Monospace font display
 * - Line numbers (optional, controlled by formatted prop)
 * - Copy to clipboard
 * - Dark/Light theme support
 * - Minimal "raw" view without line numbers
 */

import React, { useState } from 'react';

export default function CodeDisplay({ code, language = 'text', isDarkMode, formatted = true }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
      {/* Header with language and copy button */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <span className={`text-xs font-mono font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* Code content */}
      <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {formatted ? (
          /* Formatted view with line numbers */
          <div className="flex">
            {/* Line numbers */}
            <div className={`py-4 px-4 select-none ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
              {lines.map((_, idx) => (
                <div key={idx} className="font-mono text-xs text-right leading-6">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code */}
            <div className="flex-1 py-4 px-4 overflow-x-auto">
              <pre className={`font-mono text-xs leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                {code}
              </pre>
            </div>
          </div>
        ) : (
          /* Raw view without line numbers - minimal, read-only style */
          <div className="py-4 px-4 overflow-x-auto">
            <pre className={`font-mono text-xs leading-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap break-all`}>
              {code}
            </pre>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className={`px-4 py-2 text-xs border-t ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
        {lines.length} lines • {code.length} characters
      </div>
    </div>
  );
}
