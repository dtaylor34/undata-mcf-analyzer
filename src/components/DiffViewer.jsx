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
import { Search, ChevronDown } from 'lucide-react';
import { getAllEnvironments } from '../utils/environment-config';

export default function DiffViewer({ 
  oldVersion, 
  newVersion, 
  oldVersionName, 
  newVersionName, 
  isDarkMode,
  onLeftEnvironmentChange,
  onRightEnvironmentChange
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'additions', 'deletions', 'modifications', 'unchanged'
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedLines, setLoadedLines] = useState(200); // Start with 200 lines
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(true); // Collapsible diff viewer
  const [showDetailedChanges, setShowDetailedChanges] = useState(false); // Collapsible detailed changes - START COLLAPSED
  const [loadedChanges, setLoadedChanges] = useState(50); // Lazy loading for detailed changes
  const [isLoadingMoreChanges, setIsLoadingMoreChanges] = useState(false);
  const changesScrollRef = useRef(null);
  const [searchLeft, setSearchLeft] = useState(''); // Search term for left panel (base)
  const [searchRight, setSearchRight] = useState(''); // Search term for right panel (comparing)
  
  // Environment selection state
  const [leftEnvironment, setLeftEnvironment] = useState('staging');
  const [rightEnvironment, setRightEnvironment] = useState('staging');
  const [showLeftEnvDropdown, setShowLeftEnvDropdown] = useState(false);
  const [showRightEnvDropdown, setShowRightEnvDropdown] = useState(false);
  
  const environments = getAllEnvironments();
  
  // DEBUG: Log environments to verify they're loading
  console.log('🌍 DiffViewer Environments loaded:', environments);
  
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
  
  // Reset loaded lines when filter or search changes
  useEffect(() => {
    setLoadedLines(200);
  }, [filterMode, searchLeft, searchRight, oldVersion, newVersion]);
  
  // Reset loaded changes when detailed changes section is opened
  useEffect(() => {
    if (showDetailedChanges) {
      setLoadedChanges(50);
    }
  }, [showDetailedChanges]);
  
  // Handle scroll for lazy loading in detailed changes section
  const handleChangesScroll = (e) => {
    if (isLoadingMoreChanges) return;
    
    const element = e.target;
    const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    
    if (scrollPercentage > 0.8) { // Load more when 80% scrolled
      const diff = generateDiff();
      if (loadedChanges < diff.changes.length) {
        setIsLoadingMoreChanges(true);
        setTimeout(() => {
          setLoadedChanges(prev => Math.min(prev + 50, diff.changes.length));
          setIsLoadingMoreChanges(false);
        }, 300);
      }
    }
  };
  
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
  
  // Apply search filtering
  const searchFilteredLeft = searchLeft
    ? filteredLeft.filter(line => line.content.toLowerCase().includes(searchLeft.toLowerCase()))
    : filteredLeft;
  
  const searchFilteredRight = searchRight
    ? filteredRight.filter(line => line.content.toLowerCase().includes(searchRight.toLowerCase()))
    : filteredRight;
  
  // Apply lazy loading limit
  const displayLeft = searchFilteredLeft.slice(0, loadedLines);
  const displayRight = searchFilteredRight.slice(0, loadedLines);
  
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
              // Exit Fullscreen - Corner brackets collapsing
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 14L2 18m0 0l4 4m-4-4h6m6-10l4-4m0 0l-4-4m4 4h-6" />
              </svg>
            ) : (
              // Enter Fullscreen - Corner brackets expanding
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m15 5h-4m4 0v-4m0 4l-5-5" />
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


      {/* Collapsible Diff Viewer Header */}
      <div 
        className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex items-center justify-between cursor-pointer hover:${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'} transition-colors`}
        onClick={() => setShowDiffViewer(!showDiffViewer)}
      >
        <div className="flex items-center gap-3">
          <svg 
            className={`w-5 h-5 transition-transform ${showDiffViewer ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Side-by-Side Comparison
          </h3>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {showDiffViewer ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>

      {showDiffViewer && (
        <>
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

      {/* Legend */}
      <div className={`px-4 py-2 text-xs border-t border-b ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
        <span className="font-semibold mr-4">Legend:</span>
        <span className="inline-flex items-center mr-4">
          <span className="inline-flex items-center justify-center w-5 h-4 mr-1 text-xs font-bold bg-green-600 text-white rounded">+</span>
          <span>Added lines</span>
        </span>
        <span className="inline-flex items-center mr-4">
          <span className="inline-flex items-center justify-center w-5 h-4 mr-1 text-xs font-bold bg-red-600 text-white rounded">-</span>
          <span>Removed lines</span>
        </span>
        <span className="inline-flex items-center mr-4">
          <span className={`px-2 py-0.5 mr-1 text-xs font-bold rounded ${isDarkMode ? 'bg-green-600/60 text-green-50' : 'bg-green-700 text-white'}`}>word</span>
          <span>Added text</span>
        </span>
        <span className="inline-flex items-center">
          <span className={`px-2 py-0.5 mr-1 text-xs font-bold rounded line-through ${isDarkMode ? 'bg-red-600/60 text-red-50' : 'bg-red-700 text-white'}`}>word</span>
          <span>Removed text</span>
        </span>
      </div>

      {/* Diff Content */}
      <div className="grid grid-cols-2 divide-x divide-gray-700">
        {/* Left Side - Base Version (Blue) */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs flex items-center justify-between ${isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            <div className="flex items-center gap-3">
              <div>
                <span className="font-bold">☑️ {newVersionName}</span>
                <span className={`ml-2 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>(Base)</span>
              </div>
              
              {/* Environment Dropdown - Base */}
              {environments && environments.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLeftEnvDropdown(!showLeftEnvDropdown);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 border-2 ${
                      isDarkMode
                        ? 'bg-blue-800 text-blue-100 border-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                    }`}
                  >
                    <span>{environments.find(e => e.id === leftEnvironment)?.icon || '🔶'}</span>
                    <span>{environments.find(e => e.id === leftEnvironment)?.name || 'Staging'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                {showLeftEnvDropdown && (
                  <div className={`absolute top-full left-0 mt-1 rounded-lg shadow-lg border z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeftEnvironment(env.id);
                          if (onLeftEnvironmentChange) onLeftEnvironmentChange(env.id);
                          setShowLeftEnvDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        } ${leftEnvironment === env.id ? 'bg-blue-900/30 font-semibold' : ''}`}
                      >
                        <span>{env.icon}</span>
                        <span>{env.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              ) : (
                <div className="text-xs text-red-500 font-bold">ENV ERROR</div>
              )}
            </div>
            
            {/* Search Box - Base */}
            <div className="relative">
              <input
                type="text"
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                placeholder="Search in base..."
                className={`pl-8 pr-3 py-1 text-xs rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 w-48`}
              />
              <Search className={`absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div 
            ref={leftScrollRef}
            onScroll={handleScroll('left')}
            className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-400px)]' : 'max-h-96'} ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
          >
            {displayRight.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1.5 font-mono text-xs border-l-4 ${
                  line.type === 'added'
                    ? isDarkMode
                      ? 'bg-green-900/40 text-green-100 border-green-500'
                      : 'bg-green-100 text-green-900 border-green-600'
                    : line.type === 'placeholder'
                    ? isDarkMode
                      ? 'bg-slate-800/30 border-transparent text-gray-600'
                      : 'bg-gray-50 border-transparent'
                    : line.type === 'same'
                    ? isDarkMode
                      ? 'text-gray-300 border-transparent'
                      : 'text-gray-700 border-transparent'
                    : isDarkMode
                    ? 'text-gray-200 border-transparent'
                    : 'text-gray-700 border-transparent'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {line.line || ''}
                </span>
                {line.type === 'added' && (
                  <span className="inline-flex items-center justify-center w-6 h-5 mr-2 text-xs font-bold bg-green-600 text-white rounded">
                    +
                  </span>
                )}
                {line.wordDiff ? (
                  <span>
                    {line.wordDiff.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className={
                          word.type === 'added'
                            ? (isDarkMode 
                              ? 'bg-green-600/60 text-green-50 font-bold px-1.5 py-0.5 rounded'
                              : 'bg-green-700 text-white font-bold px-1.5 py-0.5 rounded')
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

        {/* Right Side - Comparing Version (Purple) */}
        <div>
          <div className={`px-4 py-2 font-mono text-xs flex items-center justify-between ${isDarkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
            <div className="flex items-center gap-3">
              <div>
                <span className="font-bold">⬤ {oldVersionName}</span>
                <span className={`ml-2 text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>(Comparing)</span>
              </div>
              
              {/* Environment Dropdown - Comparing */}
              {environments && environments.length > 0 ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRightEnvDropdown(!showRightEnvDropdown);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 border-2 ${
                      isDarkMode
                        ? 'bg-purple-800 text-purple-100 border-purple-600 hover:bg-purple-700'
                        : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-700'
                    }`}
                  >
                    <span>{environments.find(e => e.id === rightEnvironment)?.icon || '🔶'}</span>
                    <span>{environments.find(e => e.id === rightEnvironment)?.name || 'Staging'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                {showRightEnvDropdown && (
                  <div className={`absolute top-full left-0 mt-1 rounded-lg shadow-lg border z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {environments.map(env => (
                      <button
                        key={env.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRightEnvironment(env.id);
                          if (onRightEnvironmentChange) onRightEnvironmentChange(env.id);
                          setShowRightEnvDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        } ${rightEnvironment === env.id ? 'bg-purple-900/30 font-semibold' : ''}`}
                      >
                        <span>{env.icon}</span>
                        <span>{env.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              ) : (
                <div className="text-xs text-red-500 font-bold">ENV ERROR</div>
              )}
            </div>
            
            {/* Search Box - Comparing */}
            <div className="relative">
              <input
                type="text"
                value={searchRight}
                onChange={(e) => setSearchRight(e.target.value)}
                placeholder="Search in comparing..."
                className={`pl-8 pr-3 py-1 text-xs rounded border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 w-48`}
              />
              <Search className={`absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div 
            ref={rightScrollRef}
            onScroll={handleScroll('right')}
            className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-400px)]' : 'max-h-96'} ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
          >
            {displayLeft.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1.5 font-mono text-xs border-l-4 ${
                  line.type === 'removed'
                    ? isDarkMode
                      ? 'bg-red-900/40 text-red-100 border-red-500'
                      : 'bg-red-100 text-red-900 border-red-600'
                    : line.type === 'placeholder'
                    ? isDarkMode
                      ? 'bg-slate-800/30 border-transparent text-gray-600'
                      : 'bg-gray-50 border-transparent'
                    : line.type === 'same'
                    ? isDarkMode
                      ? 'text-gray-300 border-transparent'
                      : 'text-gray-700 border-transparent'
                    : isDarkMode
                    ? 'text-gray-200 border-transparent'
                    : 'text-gray-700 border-transparent'
                }`}
              >
                <span className={`inline-block w-12 text-right mr-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {line.line || ''}
                </span>
                {line.type === 'removed' && (
                  <span className="inline-flex items-center justify-center w-6 h-5 mr-2 text-xs font-bold bg-red-600 text-white rounded">
                    -
                  </span>
                )}
                {line.wordDiff ? (
                  <span>
                    {line.wordDiff.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className={
                          word.type === 'removed'
                            ? (isDarkMode
                              ? 'bg-red-600/60 text-red-50 font-bold px-1.5 py-0.5 rounded line-through'
                              : 'bg-red-700 text-white font-bold px-1.5 py-0.5 rounded line-through')
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
      </div>
        </>
      )}

      {/* Collapsible Detailed Changes Header */}
      <div 
        className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex items-center justify-between cursor-pointer hover:${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'} transition-colors`}
        onClick={() => setShowDetailedChanges(!showDetailedChanges)}
      >
        <div className="flex items-center gap-3">
          <svg 
            className={`w-5 h-5 transition-transform ${showDetailedChanges ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 Change Summary
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {changes.length.toLocaleString()} total changes detected {showDetailedChanges ? `• Loaded ${Math.min(loadedChanges, changes.length)}` : '• Click to expand'}
            </p>
          </div>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {showDetailedChanges ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>

      {showDetailedChanges && changes.length > 0 && (
        <div className={`px-6 py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Explanation banner */}
          <div className={`mb-4 p-3 rounded text-sm ${
            isDarkMode ? 'bg-blue-900/20 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <strong>ℹ️ What you're seeing:</strong> This list shows line-by-line changes between the two versions. Scroll down to load more automatically.
            {changes.length > 10000 && (
              <span className="block mt-1">
                <strong>Note:</strong> These versions have {changes.length.toLocaleString()} total differences, suggesting they may be completely different files or major structural changes.
              </span>
            )}
          </div>
          
          <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div 
              className="space-y-2 max-h-96 overflow-auto"
              onScroll={handleChangesScroll}
              ref={changesScrollRef}
            >
              {changes.slice(0, loadedChanges).map((change, idx) => (
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
              
              {/* Loading indicator or remaining count */}
              {isLoadingMoreChanges && (
                <div className={`mt-3 p-3 rounded text-center ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-xs">Loading more changes...</span>
                  </div>
                </div>
              )}
              
              {!isLoadingMoreChanges && loadedChanges < changes.length && (
                <div className={`mt-3 p-2 rounded text-center ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  <p className="text-xs font-medium">
                    ... and {(changes.length - loadedChanges).toLocaleString()} more changes
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Scroll down to load more • Or use "Side-by-Side Comparison" above
                  </p>
                </div>
              )}
              
              {loadedChanges >= changes.length && changes.length > 50 && (
                <div className={`mt-3 p-2 rounded text-center ${
                  isDarkMode ? 'bg-green-900/20 text-green-300 border border-green-800' : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  <p className="text-xs font-medium">
                    ✅ All {changes.length.toLocaleString()} changes loaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
