/**
 * FILE: src/components/ComprehensiveDiffViewer.jsx
 * PURPOSE: Show comprehensive diff across ALL formats (MCF, .STAT, DataCommons, Cached, Charts)
 * 
 * Allows users to see impact of changes across the entire pipeline
 */

import { useState, useEffect } from 'react';
import DiffViewer from './DiffViewer';
import { DualChartPreview } from './DualChartPreview';
import { DataPipeline } from '../utils/data-pipeline';

export function ComprehensiveDiffViewer({ oldMCF, newMCF, agency, isDarkMode }) {
  const [activeSection, setActiveSection] = useState('mcf');
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!newMCF) return;
    
    setLoading(true);
    
    try {
      // Initialize data pipeline with both versions
      const pipelineInstance = new DataPipeline(newMCF, oldMCF || null);
      setPipeline(pipelineInstance);
    } catch (error) {
      console.error('Error initializing pipeline:', error);
    } finally {
      setLoading(false);
    }
  }, [oldMCF, newMCF]);
  
  if (loading || !pipeline) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Analyzing changes across all formats...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      {pipeline.impact && (
        <div className={`rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-4`}>
          <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            📊 Impact Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Risk Level:</p>
              <p className="font-bold">{pipeline.impact.overallRisk}</p>
            </div>
            <div>
              <p className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Variables Changed:</p>
              <p className="font-bold">{pipeline.impact.variableCount} vars</p>
            </div>
            <div>
              <p className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Observations:</p>
              <p className="font-bold">{pipeline.impact.observationCount} obs</p>
            </div>
            <div>
              <p className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Chart Impact:</p>
              <p className="font-bold">{pipeline.impact.chartImpact} charts</p>
            </div>
          </div>
          
          {pipeline.impact.breakingChanges && pipeline.impact.breakingChanges.length > 0 && (
            <div className="mt-3 p-2 rounded bg-red-900/30 text-red-300">
              <p className="font-bold text-sm">⚠️ Breaking Changes Detected:</p>
              <ul className="text-xs mt-1 space-y-1">
                {pipeline.impact.breakingChanges.map((change, idx) => (
                  <li key={idx}>• {change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Format Tabs */}
      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex border-b border-gray-700 p-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('mcf')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'mcf'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📄 MCF Diff
          </button>
          <button
            onClick={() => setActiveSection('stat')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'stat'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📈 .STAT Diff
          </button>
          <button
            onClick={() => setActiveSection('datacommons')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'datacommons'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🌐 DataCommons Diff
          </button>
          <button
            onClick={() => setActiveSection('cached')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'cached'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            💾 Cached Diff
          </button>
          <button
            onClick={() => setActiveSection('charts')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'charts'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📊 Chart Impact
          </button>
        </div>
        
        <div className="p-6">
          {activeSection === 'mcf' && pipeline.diffs && (
            <DiffViewer
              oldVersion={oldMCF}
              newVersion={newMCF}
              oldVersionName="Previous Version"
              newVersionName="New Version"
              isDarkMode={isDarkMode}
            />
          )}
          
          {activeSection === 'stat' && pipeline.diffs && pipeline.diffs.stat && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Impact on .STAT SDMX-JSON format
              </p>
              <DiffViewer
                oldVersion={pipeline.transformations?.stat || {}}
                newVersion={pipeline.transformations?.stat || {}}
                oldVersionName=".STAT (Previous)"
                newVersionName=".STAT (New)"
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          
          {activeSection === 'datacommons' && pipeline.diffs && pipeline.diffs.datacommons && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Impact on DataCommons JSON format
              </p>
              <DiffViewer
                oldVersion={pipeline.transformations?.datacommons || {}}
                newVersion={pipeline.transformations?.datacommons || {}}
                oldVersionName="DataCommons (Previous)"
                newVersionName="DataCommons (New)"
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          
          {activeSection === 'cached' && pipeline.diffs && pipeline.diffs.cached && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Impact on Cached/Optimized format
              </p>
              <DiffViewer
                oldVersion={pipeline.transformations?.cached || {}}
                newVersion={pipeline.transformations?.cached || {}}
                oldVersionName="Cached (Previous)"
                newVersionName="Cached (New)"
                isDarkMode={isDarkMode}
              />
            </div>
          )}
          
          {activeSection === 'charts' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Visual comparison of how charts will change
              </p>
              <DualChartPreview
                mcfContent={newMCF}
                agency={agency}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

