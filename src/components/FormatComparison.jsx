import React, { useState, useEffect } from 'react';

export const FormatComparison = ({ observation, allObservations = [], initialIndex = 0, onIndexChange, onClose, isDarkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex !== null && initialIndex !== undefined ? initialIndex : 
    (allObservations.findIndex(obs => obs.dcid === observation?.dcid) || 0)
  );
  
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

        {/* Format Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          
          {/* MCF Format */}
          <FormatCard
            title="📄 MCF Format"
            subtitle="Master Catalog Format (Source of Truth)"
            isDarkMode={isDarkMode}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{currentObs.formats.mcf}
            </pre>
          </FormatCard>

          {/* .STAT Format */}
          <FormatCard
            title="📈 .STAT Format"
            subtitle="SDMX-JSON 2.0 (UN .Stat Suite)"
            isDarkMode={isDarkMode}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.stat, null, 2)}
            </pre>
          </FormatCard>

          {/* DataCommons Format */}
          <FormatCard
            title="🌍 DataCommons Format"
            subtitle="Google DataCommons JSON"
            isDarkMode={isDarkMode}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.datacommons, null, 2)}
            </pre>
          </FormatCard>

          {/* Cached Format */}
          <FormatCard
            title="📊 Cached Format"
            subtitle="UN Data Website Optimized JSON"
            isDarkMode={isDarkMode}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{JSON.stringify(currentObs.formats.cached, null, 2)}
            </pre>
          </FormatCard>

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
              <strong>💡 Key Insight:</strong> This is the SAME data point represented in 4 different formats.
              MCF is the source of truth, and the other formats are transformations optimized for different use cases.
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

