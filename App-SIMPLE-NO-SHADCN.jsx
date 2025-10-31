/**
 * FILE: src/App.jsx
 * PURPOSE: MCF Pipeline Viewer - Exact Figma Layout (NO SHADCN/UI REQUIRED)
 * 
 * This version uses native HTML select and button elements
 * Matches the Figma layout exactly
 */

import { useState, useEffect } from "react";
import DiffViewer from "./components/DiffViewer";
import CodeDisplay from "./components/CodeDisplay";
import ChartPreview from "./components/ChartPreview";
import { getAllOrganizations } from "./undata-integration/real-catalog";
import { getData } from "./undata-integration/data-layer";
import "./App.css";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState("sdg");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("q2-2025");
  const [compareVersion, setCompareVersion] = useState("q4-2024");
  const [showDiff, setShowDiff] = useState(false);
  const [activeTab, setActiveTab] = useState("raw");
  const [currentData, setCurrentData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [isDarkMode]);

  // Get organizations
  const organizations = getAllOrganizations();
  
  // Get sample indicators for selected org
  const getSampleIndicators = (orgId) => {
    return [
      { dcid: `${orgId}_unemployment_rate`, name: `Unemployment Rate (${orgId.toUpperCase()})` },
      { dcid: `${orgId}_poverty_rate`, name: `Poverty Rate (${orgId.toUpperCase()})` },
      { dcid: `${orgId}_gdp_per_capita`, name: `GDP Per Capita (${orgId.toUpperCase()})` },
      { dcid: `${orgId}_life_expectancy`, name: `Life Expectancy (${orgId.toUpperCase()})` },
      { dcid: `${orgId}_literacy_rate`, name: `Literacy Rate (${orgId.toUpperCase()})` },
    ];
  };
  
  const indicators = getSampleIndicators(selectedOrg);
  
  // Get versions for current org
  const getVersions = (orgId) => {
    if (orgId === 'sdg') {
      return ['q4-2024', 'q1-2025', 'q2-2025'];
    }
    return ['latest'];
  };
  
  const versions = getVersions(selectedOrg);

  // Load data when selection changes
  useEffect(() => {
    if (selectedIndicator) {
      loadData();
    }
  }, [selectedIndicator, selectedVersion, showDiff, compareVersion]);

  const loadData = async () => {
    if (!selectedIndicator) return;
    
    setLoading(true);
    try {
      const current = await getData(selectedOrg, selectedIndicator, { 
        version: selectedVersion 
      });
      setCurrentData(current);

      if (showDiff && compareVersion) {
        const compare = await getData(selectedOrg, selectedIndicator, { 
          version: compareVersion 
        });
        setCompareData(compare);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentMCF = currentData ? generateMCF(currentData) : '';
  const compareMCF = compareData ? generateMCF(compareData) : '';

  const styles = {
    header: {
      borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      padding: '1rem'
    },
    selectorBar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
    },
    select: {
      padding: '0.5rem 2rem 0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: isDarkMode ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: isDarkMode ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDarkMode ? '#1e40af' : '#3b82f6',
      color: '#ffffff',
      fontSize: '0.875rem',
      cursor: 'pointer',
      fontWeight: '500'
    },
    buttonOutline: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: isDarkMode ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: 'transparent',
      color: isDarkMode ? '#ffffff' : '#000000',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    tabsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '0.25rem',
      backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
      padding: '0.25rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem'
    },
    tab: {
      padding: '0.5rem 1rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: isDarkMode ? '#94a3b8' : '#64748b',
      fontSize: '0.875rem',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      fontWeight: '500'
    },
    tabActive: {
      padding: '0.5rem 1rem',
      border: 'none',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#0f172a',
      fontSize: '0.875rem',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      fontWeight: '600',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000'
    }}>
      {/* Header */}
      <header style={styles.header}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '2rem' }}>🗄️</span>
              <div>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  MCF Pipeline Viewer
                </h1>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  margin: 0
                }}>
                  End-to-end MCF transformation pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1rem' }}>☀️</span>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isDarkMode ? '#3b82f6' : '#cbd5e1',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: isDarkMode ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }}></span>
                </span>
              </label>
              <span style={{ fontSize: '1rem' }}>🌙</span>
            </div>
          </div>
        </div>
      </header>

      {/* File Selector Bar */}
      <div style={styles.selectorBar}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <span style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            Source MCF:
          </span>
        </div>
        
        <select 
          value={selectedOrg} 
          onChange={(e) => setSelectedOrg(e.target.value)}
          style={styles.select}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.emoji} {org.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedIndicator} 
          onChange={(e) => setSelectedIndicator(e.target.value)}
          style={{...styles.select, width: '280px'}}
        >
          <option value="">Select Indicator...</option>
          {indicators.map((ind) => (
            <option key={ind.dcid} value={ind.dcid}>
              {ind.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedVersion} 
          onChange={(e) => setSelectedVersion(e.target.value)}
          style={{...styles.select, width: '140px'}}
        >
          {versions.map((v) => (
            <option key={v} value={v}>
              {v.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowDiff(!showDiff)}
          style={showDiff ? styles.button : styles.buttonOutline}
        >
          {showDiff ? '✓ Hide Diff' : 'Show Diff'}
        </button>

        {showDiff && (
          <select 
            value={compareVersion} 
            onChange={(e) => setCompareVersion(e.target.value)}
            style={{...styles.select, width: '140px'}}
          >
            {versions.filter(v => v !== selectedVersion).map((v) => (
              <option key={v} value={v}>
                {v.toUpperCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Diff Viewer */}
        {showDiff && compareMCF && currentMCF && (
          <div className="mb-6">
            <DiffViewer
              oldVersion={compareMCF}
              newVersion={currentMCF}
              oldVersionName={compareVersion}
              newVersionName={selectedVersion}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Tabs */}
        {selectedIndicator ? (
          <div>
            <div style={styles.tabsList}>
              {['raw', 'formatted', 'stat', 'datacommons', 'cached', 'chart'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={activeTab === tab ? styles.tabActive : styles.tab}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid ' + (isDarkMode ? '#1e293b' : '#e2e8f0'),
                      borderTopColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto'
                    }}
                  ></div>
                </div>
              ) : (
                <>
                  {activeTab === 'raw' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        Raw MCF file content without formatting
                      </p>
                      <CodeDisplay code={generateRawCode(currentMCF)} language="mcf" isDarkMode={isDarkMode} />
                    </div>
                  )}
                  {activeTab === 'formatted' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        Formatted MCF file with proper indentation
                      </p>
                      <CodeDisplay code={generateFormattedCode(currentMCF)} language="mcf" isDarkMode={isDarkMode} />
                    </div>
                  )}
                  {activeTab === 'stat' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        .STAT format representation
                      </p>
                      <CodeDisplay code={generateStatView(currentMCF)} language="stat" isDarkMode={isDarkMode} />
                    </div>
                  )}
                  {activeTab === 'datacommons' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        DataCommons JSON representation
                      </p>
                      <CodeDisplay code={generateDataCommonsView(currentMCF)} language="json" isDarkMode={isDarkMode} />
                    </div>
                  )}
                  {activeTab === 'cached' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        Cached version optimized for website use
                      </p>
                      <CodeDisplay code={generateCachedVersion(currentMCF)} language="mcf" isDarkMode={isDarkMode} />
                    </div>
                  )}
                  {activeTab === 'chart' && (
                    <div>
                      <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
                        Visual representation of the data
                      </p>
                      <ChartPreview data={currentData} indicator={{ name: selectedIndicator }} isDarkMode={isDarkMode} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.25rem',
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Select an Indicator to Begin
            </h3>
            <p style={{ fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Choose an organization and indicator above
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        marginTop: '3rem',
        padding: '1.5rem'
      }}>
        <div className="container mx-auto">
          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            MCF Pipeline Viewer • Material Design Dark Mode
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Helper functions
function generateMCF(data) {
  if (!data || !data.metadata) return '';
  
  return `Node: dcid:${data.metadata.dcid}
typeOf: dcs:StatisticalVariable
name: "${data.metadata.name}"
measuredProperty: dcs:value
organization: ${data.metadata.organization}`;
}

function generateRawCode(mcf) {
  return mcf || '// No data available';
}

function generateFormattedCode(mcf) {
  if (!mcf) return '// No data available';
  return mcf.split('\n').map(line => 
    line.startsWith('Node:') ? line : '  ' + line
  ).join('\n');
}

function generateStatView(mcf) {
  return `# .STAT Format\n${mcf || '// No data'}`;
}

function generateDataCommonsView(mcf) {
  return JSON.stringify({ dataCommons: mcf || 'No data' }, null, 2);
}

function generateCachedVersion(mcf) {
  return `/* Cached ${new Date().toISOString()} */\n${mcf || '// No data'}`;
}
