/**
 * Main App Component - COMPLETE
 * 
 * Location: src/App.jsx
 * 
 * Integrates DatasetSelector, IndicatorPreview, and architecture visualization
 * Shows complete data pipeline: RAW → MCF → .STAT → LIVE DC → Cached → Chart → Table
 */

import React, { useEffect, useState } from 'react';
import './App.css';
import IndicatorPreview from './components/IndicatorPreview';
import DatasetSelector from './components/DatasetSelector';
import * as DataLayer from './undata-integration/data-layer';
import config from './undata-integration/config.dev';

function App() {
  const [dataLayer, setDataLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);

  useEffect(() => {
    const initDataLayer = async () => {
      try {
        console.log('Initializing data layer...');
        const dl = new DataLayer(config);
        await dl.initialize();
        setDataLayer(dl);
        setLoading(false);
        console.log('Data layer initialized successfully');
      } catch (err) {
        console.error('Failed to initialize data layer:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    initDataLayer();
  }, []);

  const handleDatasetSelect = (dataset) => {
    console.log('Selected dataset:', dataset);
    setSelectedDataset(dataset);
  };

  if (loading) {
    return (
      <div className="App" style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '6px solid #f3f3f3',
          borderTop: '6px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2>Loading UN Data Commons...</h2>
        <p>Please wait while we initialize the data layer</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App" style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ color: '#d32f2f' }}>Error Loading Data Layer</h2>
        <p>{error}</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Check the console for more details
        </p>
      </div>
    );
  }

  if (!dataLayer) {
    return (
      <div className="App" style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h2>Data layer not available</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <header style={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
        color: 'white', 
        padding: '40px 20px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '36px', fontWeight: '700' }}>
            UN Data Commons Dashboard
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '16px' }}>
            Complete Data Pipeline Visualization: RAW → MCF → .STAT → LIVE DC → Cached → Visualization
          </p>
        </div>
      </header>

      <main style={{ 
        padding: '0 20px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* Dataset Selector */}
        <DatasetSelector onSelect={handleDatasetSelect} />

        {/* Architecture Visualization */}
        {!selectedDataset && (
          <div style={{ 
            marginBottom: '32px',
            padding: '32px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333', textAlign: 'center' }}>
              Data Pipeline Architecture
            </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {[
                { icon: '📝', title: '1. RAW', desc: 'CSV Format', color: '#1976d2' },
                { icon: '📄', title: '2. MCF', desc: 'Knowledge Graph', color: '#4caf50' },
                { icon: '🌐', title: '3. .STAT', desc: 'SDMX-JSON', color: '#2196f3' },
                { icon: '🔴', title: '4. LIVE DC', desc: 'API Query', color: '#f44336' },
                { icon: '💾', title: '5. Cached', desc: 'Fast Access', color: '#ff9800' },
                { icon: '📊', title: '6. Chart', desc: 'Visualization', color: '#9c27b0' },
                { icon: '📋', title: '7. Table', desc: 'Data View', color: '#00bcd4' }
              ].map((stage, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: '1 1 120px', minWidth: '100px' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '8px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: stage.color,
                    marginBottom: '4px'
                  }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {stage.desc}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              padding: '20px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#666'
            }}>
              <strong style={{ color: '#333' }}>How it works:</strong> Select a dataset above to see each stage of the data pipeline. 
              Click through the tabs to explore how data transforms from raw CSV format through MCF and .STAT 
              standards to live Data Commons API, cached catalog, and finally visual representations.
            </div>
          </div>
        )}

        {/* Selected Dataset Info */}
        {selectedDataset && (
          <div style={{
            padding: '20px',
            background: '#e3f2fd',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '2px solid #1976d2'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1565c0', marginBottom: '4px' }}>
                  Currently Viewing
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {selectedDataset.organizationName} 
                  {selectedDataset.quarter && ` • ${selectedDataset.quarter}`}
                  {selectedDataset.indicator && ` • ${selectedDataset.indicator.name}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedDataset(null)}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#1976d2',
                  border: '2px solid #1976d2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Change Dataset
              </button>
            </div>
          </div>
        )}

        {/* Indicator Preview */}
        {selectedDataset && selectedDataset.indicator && (
          <IndicatorPreview 
            indicatorId={selectedDataset.indicator.id}
            dataLayer={dataLayer}
            defaultLocation="country/USA"
            defaultStartYear={2015}
            defaultEndYear={2023}
          />
        )}

        {/* Empty State */}
        {!selectedDataset && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>Select a Dataset to Begin</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Choose an organization and indicator above to visualize the complete data pipeline
            </p>
          </div>
        )}

        {/* Performance Statistics */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
            Performance Statistics
          </h3>
          <PerformanceStats dataLayer={dataLayer} />
        </div>

        {/* Available Datasets Overview */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
            Available Datasets
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              { icon: '🎯', name: 'SDG (UNSD)', count: '7 indicators', releases: 'Q4-2024, Q1-2025, Q2-2025', color: '#1976d2' },
              { icon: '👷', name: 'ILO', count: '4 indicators', releases: 'Latest release', color: '#f57c00' },
              { icon: '👶', name: 'UNICEF', count: '4 indicators', releases: 'Latest release', color: '#00bcd4' },
              { icon: '🏥', name: 'WHO', count: '4 indicators', releases: 'Latest release', color: '#4caf50' }
            ].map((dataset, idx) => (
              <div key={idx} style={{
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '8px',
                border: `2px solid ${dataset.color}20`
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{dataset.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  {dataset.name}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {dataset.count}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {dataset.releases}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{
        padding: '32px 20px',
        textAlign: 'center',
        background: '#f5f5f5',
        marginTop: '48px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>UN Data Commons Integration Dashboard • Built with React + Data Commons API</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          Visualizing: RAW → MCF → .STAT → LIVE Data Commons → Cached Catalog → Preview Charts
        </p>
      </footer>
    </div>
  );
}

/**
 * Performance Statistics Component
 */
function PerformanceStats({ dataLayer }) {
  const stats = dataLayer.getStats();
  const cacheStats = dataLayer.getCacheStats();

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px'
    }}>
      <StatCard label="Total Queries" value={stats.totalQueries} icon="📊" />
      <StatCard label="Cache Hits" value={stats.cacheHits} icon="⚡" color="#4caf50" />
      <StatCard label="Cache Misses" value={stats.cacheMisses} icon="🔍" color="#ff9800" />
      <StatCard label="Hit Rate" value={stats.cacheHitRate} icon="📈" color="#2196f3" />
      <StatCard label="Cached Items" value={cacheStats.size} icon="💾" />
      <StatCard label="API Requests" value={stats.statRequests} icon="🌐" />
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon, color = '#1976d2' }) {
  return (
    <div style={{
      padding: '16px',
      background: '#f9f9f9',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: '600', color: color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {label}
      </div>
    </div>
  );
}

export default App;
