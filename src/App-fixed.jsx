import React, { useState, useEffect } from 'react';
import './App.css';
import IndicatorPreview from './components/IndicatorPreview';
import DataLayer from './undata-integration/data-layer';
import config from './undata-integration/config.dev';

function App() {
  const [dataLayer, setDataLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize DataLayer - NO initialize() call needed!
    try {
      console.log('Initializing data layer...');
      const dl = new DataLayer(config);
      
      // DataLayer is ready to use immediately
      setDataLayer(dl);
      setLoading(false);
      console.log('Data layer initialized successfully!');
    } catch (err) {
      console.error('Failed to initialize data layer:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading UN Data Commons...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>Initialization Error</h2>
          <p>{error}</p>
          <p>Please check your configuration and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>🌍 UN Data Commons Dashboard</h1>
        <p>Sustainable Development Goals Indicators</p>
      </header>

      <main style={{ 
        padding: '0 20px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* SDG 1: No Poverty */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#e5243b', 
            marginBottom: '20px',
            fontSize: '24px',
            borderBottom: '3px solid #e5243b',
            paddingBottom: '10px'
          }}>
            SDG 1: No Poverty
          </h2>
          <div className="indicator-card">
            <IndicatorPreview 
              indicatorId="dc/sdg_1_1_1"
              dataLayer={dataLayer}
              defaultLocation="country/USA"
              defaultStartYear={2015}
              defaultEndYear={2023}
            />
          </div>
        </section>

        {/* SDG 2: Zero Hunger */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#dda63a', 
            marginBottom: '20px',
            fontSize: '24px',
            borderBottom: '3px solid #dda63a',
            paddingBottom: '10px'
          }}>
            SDG 2: Zero Hunger
          </h2>
          <div className="indicator-card">
            <IndicatorPreview 
              indicatorId="dc/sdg_2_1_1"
              dataLayer={dataLayer}
              defaultLocation="country/USA"
              defaultStartYear={2015}
              defaultEndYear={2023}
            />
          </div>
        </section>

        {/* SDG 3: Good Health and Well-Being */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#4c9f38', 
            marginBottom: '20px',
            fontSize: '24px',
            borderBottom: '3px solid #4c9f38',
            paddingBottom: '10px'
          }}>
            SDG 3: Good Health and Well-Being
          </h2>
          <div className="indicator-card">
            <IndicatorPreview 
              indicatorId="dc/sdg_3_1_1"
              dataLayer={dataLayer}
              defaultLocation="country/USA"
              defaultStartYear={2015}
              defaultEndYear={2023}
            />
          </div>
        </section>

        {/* Cache Statistics */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#666', 
            marginBottom: '20px',
            fontSize: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px'
          }}>
            💾 Performance Statistics
          </h2>
          <div className="indicator-card" style={{ background: '#f9f9f9' }}>
            {dataLayer && (
              <CacheStats dataLayer={dataLayer} />
            )}
          </div>
        </section>
      </main>

      <footer style={{
        background: '#333',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p>Data source: UN Data Commons | Built with React</p>
      </footer>
    </div>
  );
}

// Cache Statistics Component
function CacheStats({ dataLayer }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      if (dataLayer && dataLayer.cache) {
        const cacheStats = dataLayer.cache.getStats();
        setStats(cacheStats);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [dataLayer]);

  if (!stats) return <p>Loading statistics...</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
          {stats.entries}
        </div>
        <div style={{ color: '#666', marginTop: '5px' }}>
          Cached Entries
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
          {stats.sizeMB} MB
        </div>
        <div style={{ color: '#666', marginTop: '5px' }}>
          Cache Size
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
          {stats.sizeBytes.toLocaleString()}
        </div>
        <div style={{ color: '666', marginTop: '5px' }}>
          Bytes Stored
        </div>
      </div>
    </div>
  );
}

export default App;
