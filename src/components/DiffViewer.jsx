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

import React, { useState, useRef, useEffect } from 'react';

export default function DiffViewer({ oldVersion, newVersion, oldVersionName, newVersionName, isDarkMode }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'additions', 'deletions', 'modifications', 'unchanged'
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedLines, setLoadedLines] = useState(200); // Start with 200 lines
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);
  
  // Prevent body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);
  
  // Reset loaded lines when filter changes
  useEffect(() => {
    setLoadedLines(200);
  }, [filterMode, oldVersion, newVersion]);
  
  // Smart diff algorithm that properly aligns changes
  const generateDiff = () => {
    if (!oldVersion || !newVersion) return { left: [], right: [], changes: [] };

    // Handle both string content and objects
    const oldText = typeof oldVersion === 'string' ? oldVersion : JSON.stringify(oldVersion, null, 2);
    const newText = typeof newVersion === 'string' ? newVersion : JSON.stringify(newVersion, null, 2);
    
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    // Check if it's a large file (for UI warnings)
    const isLargeFile = oldLines.length > 1000 || newLines.length > 1000;
    
    // Use LCS (Longest Common Subsequence) for proper diff alignment
    // Now we compute the FULL diff, but we'll lazy-load the display
    const diff = computeDiff(oldLines, newLines);
    
    const left = [];
    const right = [];
    const changes = [];
    
    let oldLineNum = 1;
    let newLineNum = 1;
    
    // Group consecutive removed/added lines for word-level diff
    let i = 0;
    while (i < diff.length) {
      const item = diff[i];
      
      if (item.type === 'same') {
        left.push({ type: 'same', content: item.line, line: oldLineNum, wordDiff: null });
        right.push({ type: 'same', content: item.line, line: newLineNum, wordDiff: null });
        oldLineNum++;
        newLineNum++;
        i++;
      } else if (item.type === 'removed') {
        // Check if next item is added (modified line)
        if (i + 1 < diff.length && diff[i + 1].type === 'added') {
          // This is a modification - compute word diff
          const wordDiff = computeWordDiff(item.line, diff[i + 1].line);
          
          left.push({ 
            type: 'removed', 
            content: item.line, 
            line: oldLineNum,
            wordDiff: wordDiff.oldResult 
          });
          right.push({ 
            type: 'added', 
            content: diff[i + 1].line, 
            line: newLineNum,
            wordDiff: wordDiff.newResult 
          });
          
          changes.push({ 
            type: 'modification', 
            oldLine: oldLineNum, 
            newLine: newLineNum,
            oldContent: item.line,
            newContent: diff[i + 1].line 
          });
          
          oldLineNum++;
          newLineNum++;
          i += 2; // Skip both removed and added
        } else {
          // Pure deletion
          left.push({ type: 'removed', content: item.line, line: oldLineNum, wordDiff: null });
          right.push({ type: 'placeholder', content: '', line: null, wordDiff: null });
          changes.push({ type: 'deletion', line: oldLineNum, content: item.line });
          oldLineNum++;
          i++;
        }
      } else if (item.type === 'added') {
        // Pure addition (not paired with removal)
        left.push({ type: 'placeholder', content: '', line: null, wordDiff: null });
        right.push({ type: 'added', content: item.line, line: newLineNum, wordDiff: null });
        changes.push({ type: 'addition', line: newLineNum, content: item.line });
        newLineNum++;
        i++;
      }
    }
    
    return { left, right, changes, isLargeFile, totalOldLines: oldLines.length, totalNewLines: newLines.length };
  };
  
  // Compute diff using LCS algorithm
  const computeDiff = (oldLines, newLines) => {
    const n = oldLines.length;
    const m = newLines.length;
    
    // Build LCS matrix
    const lcs = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }
    
    // Backtrack to build diff
    const diff = [];
    let i = n;
    let j = m;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        diff.unshift({ type: 'same', line: oldLines[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        diff.unshift({ type: 'added', line: newLines[j - 1] });
        j--;
      } else if (i > 0) {
        diff.unshift({ type: 'removed', line: oldLines[i - 1] });
        i--;
      }
    }
    
    return diff;
  };
  
  // Compute word-level diff for inline highlighting
  const computeWordDiff = (oldText, newText) => {
    const oldWords = oldText.split(/(\s+|[{}[\]()":,])/);
    const newWords = newText.split(/(\s+|[{}[\]()":,])/);
    
    const n = oldWords.length;
    const m = newWords.length;
    
    // Build LCS matrix for words
    const lcs = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (oldWords[i - 1] === newWords[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }
    
    // Backtrack to build word diff
    const oldResult = [];
    const newResult = [];
    let i = n;
    let j = m;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
        oldResult.unshift({ type: 'same', text: oldWords[i - 1] });
        newResult.unshift({ type: 'same', text: newWords[j - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        newResult.unshift({ type: 'added', text: newWords[j - 1] });
        j--;
      } else if (i > 0) {
        oldResult.unshift({ type: 'removed', text: oldWords[i - 1] });
        i--;
      }
    }
    
    return { oldResult, newResult };
  };
  
  // Render line with inline diff highlighting
  const renderInlineDiff = (content, type, isDarkMode) => {
    if (type === 'same' || type === 'placeholder') {
      return <span>{content || ' '}</span>;
    }
    
    // For changed lines, we'll just show the content for now
    // The word-level diff will be computed when we pair removed/added lines
    return <span>{content}</span>;
  };

  const { left, right, changes, isLargeFile, totalOldLines, totalNewLines } = generateDiff();
  
  // Synchronized scrolling with lazy loading
  const handleScroll = (source) => (e) => {
    const element = e.target;
    
    // Sync scroll between left and right
    if (syncScroll) {
      const target = source === 'left' ? rightScrollRef : leftScrollRef;
      if (target.current) {
        target.current.scrollTop = element.scrollTop;
      }
    }
    
    // Lazy load more lines when near bottom (within 200px)
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 200;
    
    if (isNearBottom && !isLoadingMore && loadedLines < left.length) {
      setIsLoadingMore(true);
      
      // Simulate async loading (in real app, this would fetch from server)
      setTimeout(() => {
        setLoadedLines(prev => Math.min(prev + 200, left.length));
        setIsLoadingMore(false);
      }, 100);
    }
  };
  
  // Filter lines based on mode
  const filteredIndices = left.map((_, idx) => {
    const leftLine = left[idx];
    const rightLine = right[idx];
    
    if (filterMode === 'all') return true;
    if (filterMode === 'additions' && rightLine.type === 'added') return true;
    if (filterMode === 'deletions' && leftLine.type === 'removed') return true;
    if (filterMode === 'modifications' && (leftLine.wordDiff || rightLine.wordDiff)) return true;
    if (filterMode === 'unchanged' && leftLine.type === 'same') return true;
    
    return false;
  });
  
  const filteredLeft = left.filter((_, idx) => filteredIndices[idx]);
  const filteredRight = right.filter((_, idx) => filteredIndices[idx]);
  
  // Apply lazy loading limit
  const displayLeft = filteredLeft.slice(0, loadedLines);
  const displayRight = filteredRight.slice(0, loadedLines);
  
  // Count different types (from full dataset for accurate counts)
  const additionCount = right.filter(l => l.type === 'added').length;
  const deletionCount = left.filter(l => l.type === 'removed').length;
  const modificationCount = changes.filter(c => c.type === 'modification').length;
  const unchangedCount = left.filter(l => l.type === 'same').length;
  
  // Check if there's more to load
  const hasMore = loadedLines < filteredLeft.length;

  return (
    <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Version Comparison
            </h3>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              // Collapse/Exit Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L14.586 4H13a1 1 0 01-1-1zm-9 9a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 16H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L16 14.586V13a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            ) : (
              // Expand Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 11-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L14.586 4H13zM4 13a1 1 0 011 1v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 17H8a1 1 0 110 2H4a1 1 0 01-1-1v-4a1 1 0 011-1zm9 1a1 1 0 112 0v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L16 14.586V13z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comparing changes between versions
          </p>
          {isFullscreen && (
            <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
              Press <kbd className="font-mono font-bold mx-1">ESC</kbd> to exit fullscreen
            </span>
          )}
        </div>
        {isLargeFile && (
          <div className={`mt-2 p-2 rounded ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              📊 Large files detected ({totalOldLines} vs {totalNewLines} lines). 
              <span className="font-bold ml-1">Lazy loading enabled - scroll to load more!</span>
              {hasMore && (
                <span className="ml-2">
                  (Showing {loadedLines} of {filteredLeft.length} {filterMode !== 'all' ? 'filtered ' : ''}lines)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-4`}>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === 'all'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({left.length})
          </button>
          <button
            onClick={() => setFilterMode('additions')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === 'additions'
                ? 'bg-green-600 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="font-bold mr-1">+</span> Additions ({additionCount})
          </button>
          <button
            onClick={() => setFilterMode('deletions')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === 'deletions'
                ? 'bg-red-600 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="font-bold mr-1">-</span> Deletions ({deletionCount})
          </button>
          <button
            onClick={() => setFilterMode('modifications')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === 'modifications'
                ? 'bg-yellow-600 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="font-bold mr-1">~</span> Modified ({modificationCount})
          </button>
          <button
            onClick={() => setFilterMode('unchanged')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === 'unchanged'
                ? isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-1">=</span> Unchanged ({unchangedCount})
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className={`text-xs flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="rounded"
            />
            Sync Scroll
          </label>
        </div>
      </div>

      {/* Diff Content */}
      <div className="grid grid-cols-2 divide-x divide-gray-700">
        {/* Left Side - Old Version */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
            <span className="font-bold">- {oldVersionName}</span>
          </div>
          <div 
            ref={leftScrollRef}
            onScroll={handleScroll('left')}
            className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-400px)]' : 'max-h-96'} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            {displayLeft.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1 font-mono text-xs border-l-4 ${
                  line.type === 'removed'
                    ? isDarkMode
                      ? 'bg-red-900/70 text-red-100 border-red-500'
                      : 'bg-red-100 text-red-900 border-red-500'
                    : line.type === 'placeholder'
                    ? isDarkMode
                      ? 'bg-gray-800/50 border-transparent'
                      : 'bg-gray-50 border-transparent'
                    : isDarkMode
                    ? 'text-gray-400 border-transparent'
                    : 'text-gray-700 border-transparent'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {line.line || ''}
                </span>
                {line.type === 'removed' && <span className="mr-2 text-red-500 font-bold">-</span>}
                {line.wordDiff ? (
                  <span>
                    {line.wordDiff.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className={
                          word.type === 'removed'
                            ? 'bg-red-600 text-white font-bold px-1 rounded'
                            : ''
                        }
                      >
                        {word.text}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{line.content || ' '}</span>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {(isLoadingMore || hasMore) && (
              <div className={`px-4 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-xs">Loading more...</span>
                  </div>
                ) : hasMore ? (
                  <span className="text-xs">Scroll down to load more ({filteredLeft.length - loadedLines} remaining)</span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - New Version */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'}`}>
            <span className="font-bold">+ {newVersionName}</span>
          </div>
          <div 
            ref={rightScrollRef}
            onScroll={handleScroll('right')}
            className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-400px)]' : 'max-h-96'} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            {displayRight.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1 font-mono text-xs border-l-4 ${
                  line.type === 'added'
                    ? isDarkMode
                      ? 'bg-green-900/70 text-green-100 border-green-500'
                      : 'bg-green-100 text-green-900 border-green-500'
                    : line.type === 'placeholder'
                    ? isDarkMode
                      ? 'bg-gray-800/50 border-transparent'
                      : 'bg-gray-50 border-transparent'
                    : isDarkMode
                    ? 'text-gray-400 border-transparent'
                    : 'text-gray-700 border-transparent'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {line.line || ''}
                </span>
                {line.type === 'added' && <span className="mr-2 text-green-500 font-bold">+</span>}
                {line.wordDiff ? (
                  <span>
                    {line.wordDiff.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className={
                          word.type === 'added'
                            ? 'bg-green-600 text-white font-bold px-1 rounded'
                            : ''
                        }
                      >
                        {word.text}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{line.content || ' '}</span>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {(isLoadingMore || hasMore) && (
              <div className={`px-4 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-xs">Loading more...</span>
                  </div>
                ) : hasMore ? (
                  <span className="text-xs">Scroll down to load more ({filteredRight.length - loadedLines} remaining)</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Changes Summary */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Show specific changes */}
        {changes.length > 0 && (
          <div className={`mt-4 p-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              📝 Detailed Changes ({changes.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-auto">
              {changes.slice(0, 10).map((change, idx) => (
                <div key={idx} className={`text-xs font-mono p-2 rounded ${
                  change.type === 'modification'
                    ? isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                    : change.type === 'addition' 
                    ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                    : isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                }`}>
                  {change.type === 'modification' ? (
                    <>
                      <div className="mb-1">
                        <span className="font-bold text-red-500">- Line {change.oldLine}:</span>
                        <span className={isDarkMode ? 'text-gray-300 ml-2' : 'text-gray-700 ml-2'}>
                          {change.oldContent}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-green-500">+ Line {change.newLine}:</span>
                        <span className={isDarkMode ? 'text-gray-300 ml-2' : 'text-gray-700 ml-2'}>
                          {change.newContent}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={`font-bold ${change.type === 'addition' ? 'text-green-500' : 'text-red-500'}`}>
                        {change.type === 'addition' ? '+' : '-'} Line {change.line}:
                      </span>
                      <span className={isDarkMode ? 'text-gray-300 ml-2' : 'text-gray-700 ml-2'}>
                        {change.content}
                      </span>
                    </>
                  )}
                </div>
              ))}
              {changes.length > 10 && (
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  ... and {changes.length - 10} more changes
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
