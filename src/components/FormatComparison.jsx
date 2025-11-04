import React, { useState, useEffect } from 'react';

// Helper function to generate CSV representation from observation
const generateCSVFromObservation = (obs) => {
  if (!obs) return 'No data available';
  
  // Generate a CSV row that represents this observation
  const csvHeader = 'Geography,Indicator,Year,Value,Unit';
  const csvRow = `${obs.geography || 'Unknown'},${obs.variable || 'Unknown'},${obs.date || 'Unknown'},${obs.value || 'N/A'},${obs.unit || 'PERCENT'}`;
  
  return `${csvHeader}\n${csvRow}`;
};

export const FormatComparison = ({ observation, allObservations = [], initialIndex = 0, onIndexChange, onClose, isDarkMode, selectedFileId }) => {
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex !== null && initialIndex !== undefined ? initialIndex : 
    (allObservations.findIndex(obs => obs.dcid === observation?.dcid) || 0)
  );
  const [activeTab, setActiveTab] = useState('csv'); // csv, mcf, stat, datacommons, cached
  
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allObservations.length - 1;
    setCurrentIndex(newIndex);
    if (onIndexChange) onIndexChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < allObservations.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    if (onIndexChange) onIndexChange(newIndex);
  };
  
  const handleJumpTo = (newIndex) => {
    setCurrentIndex(newIndex);
    if (onIndexChange) onIndexChange(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allObservations.length]);
  
  const currentObs = allObservations[currentIndex] || observation;
  
  if (!currentObs) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">🔄 Format Comparison</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Same observation across all output formats {allObservations.length > 0 && `(${currentIndex + 1} of ${allObservations.length})`}
            </p>
          </div>
          
          {/* Navigation Controls */}
          {allObservations.length > 1 && (
            <div className="flex items-center gap-2 mx-4">
              <button
                onClick={handlePrevious}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Previous observation"
              >
                ← Previous
              </button>
              <span className="text-sm font-mono px-2">
                {currentIndex + 1}/{allObservations.length}
              </span>
              <button
                onClick={handleNext}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Next observation"
              >
                Next →
              </button>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* File Selector */}
        <div className="p-4 bg-purple-900/10 border-b border-border">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground">
              Viewing Dataset:
            </label>
            <div className={`flex-1 px-4 py-2 rounded font-mono text-sm font-bold ${
              isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
            }`}>
              {selectedFileId || 'No file selected'}
            </div>
          </div>
        </div>

        {/* Format Tabs */}
        <div className={`flex gap-2 p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} overflow-x-auto`}>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'csv'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            CSV
          </button>
          <button
            onClick={() => setActiveTab('mcf')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'mcf'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            MCF
          </button>
          <button
            onClick={() => setActiveTab('stat')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'stat'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            .STAT
          </button>
          <button
            onClick={() => setActiveTab('datacommons')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'datacommons'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            DataCommons
          </button>
          <button
            onClick={() => setActiveTab('cached')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'cached'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cached
          </button>
        </div>

        {/* Observation Summary */}
        <div className="p-4 bg-blue-900/10 border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Indicator</div>
              <div className="font-mono font-bold">{currentObs.variable}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Geography</div>
              <div className="font-mono font-bold">{currentObs.geography}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Year</div>
              <div className="font-mono font-bold">{currentObs.date}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Value</div>
              <div className="font-mono font-bold text-green-400">{currentObs.value}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Unit</div>
              <div className="font-mono font-bold">{currentObs.unit || 'PERCENT'}</div>
            </div>
          </div>
        </div>

        {/* Format Content - Single View Based on Active Tab */}
        <div className="p-6">
          
          {/* CSV Format */}
          {activeTab === 'csv' && (
            <FormatCard
              title="📊 CSV Format"
              subtitle="Original Raw Data (Before Conversion)"
              isDarkMode={isDarkMode}
            >
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{currentObs.formats?.csv || generateCSVFromObservation(currentObs)}
              </pre>
            </FormatCard>
          )}
          
          {/* MCF Format */}
          {activeTab === 'mcf' && (
            <FormatCard
              title="📄 MCF Format"
              subtitle="Master Catalog Format (Source of Truth)"
              isDarkMode={isDarkMode}
            >
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{currentObs.formats.mcf}
              </pre>
            </FormatCard>
          )}

          {/* .STAT Format */}
          {activeTab === 'stat' && (
            <FormatCard
              title="📈 .STAT Format"
              subtitle="SDMX-JSON 2.0 (UN .Stat Suite)"
              isDarkMode={isDarkMode}
            >
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.stat, null, 2)}
              </pre>
            </FormatCard>
          )}

          {/* DataCommons Format */}
          {activeTab === 'datacommons' && (
            <FormatCard
              title="🌍 DataCommons Format"
              subtitle="Google DataCommons JSON"
              isDarkMode={isDarkMode}
            >
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.datacommons, null, 2)}
              </pre>
            </FormatCard>
          )}

          {/* Cached Format */}
          {activeTab === 'cached' && (
            <FormatCard
              title="📊 Cached Format"
              subtitle="UN Data Website Optimized JSON"
              isDarkMode={isDarkMode}
            >
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.cached, null, 2)}
              </pre>
            </FormatCard>
          )}

        </div>

        {/* Quick Selector */}
        {allObservations.length > 1 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <label className="block text-sm font-medium mb-2">
              🔍 Jump to Observation:
            </label>
            <select
              value={currentIndex}
              onChange={(e) => handleJumpTo(parseInt(e.target.value))}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {allObservations.map((obs, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {obs.geography} - {obs.date} - {obs.variable} = {obs.value}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground flex-1">
              <strong>💡 Key Insight:</strong> This is the SAME data point represented across 5 formats.
              Starting from CSV (raw data), converted to MCF (source of truth), then transformed into .STAT, DataCommons, and Cached formats for different use cases.
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('📋 URL copied! Share this link to show this exact observation.');
              }}
              className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              title="Copy shareable URL with current observation"
            >
              🔗 Copy URL
            </button>
          </div>
          {allObservations.length > 1 && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              <strong>⌨️ Keyboard Shortcuts:</strong> Use ← → arrow keys to navigate | ESC to close
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FormatCard = ({ title, subtitle, children, isDarkMode }) => (
  <div className={`rounded-lg border overflow-hidden ${
    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
  }`}>
    <div className="p-3 border-b border-border bg-gradient-to-r from-blue-900/10 to-purple-900/10">
      <h3 className="font-bold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <div className="p-3 max-h-64 overflow-auto">
      {children}
    </div>
  </div>
);

