/**
 * Dual Chart Preview Component
 * Shows side-by-side comparison of DataCommons and .STAT charts
 */

import { useState, useEffect } from 'react';
import { DataCommonsChartPreview } from './DataCommonsChartPreview';
import { StatChartPreview } from './StatChartPreview';
import { extractObservations } from '../mcf-parser';
import { convertToSDMXJSON } from '../utils/mcf-to-stat';

export function DualChartPreview({ mcfContent, agency }) {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function generateCharts() {
      if (!mcfContent) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Parse MCF and extract observations
        const observations = extractObservations(mcfContent);
        
        if (observations.length === 0) {
          setCharts([]);
          setLoading(false);
          return;
        }
        
        // Group by statistical variable
        const byVariable = {};
        observations.forEach(obs => {
          const varId = obs.variableMeasured || 'unknown';
          if (!byVariable[varId]) {
            byVariable[varId] = [];
          }
          byVariable[varId].push(obs);
        });
        
        // Generate chart data for each variable
        const chartData = await Promise.all(
          Object.entries(byVariable).map(async ([varId, obs]) => {
            // Convert to SDMX for .STAT preview
            const sdmxData = await convertToSDMXJSON(obs, varId, agency);
            
            return {
              variableId: varId,
              title: obs[0]?.name || varId,
              observations: obs,
              sdmxData: sdmxData,
              dataflowId: `${agency.toUpperCase()}_${varId.replace(/[^a-zA-Z0-9]/g, '_')}`
            };
          })
        );
        
        setCharts(chartData);
      } catch (error) {
        console.error('Error generating charts:', error);
        setCharts([]);
      }
      
      setLoading(false);
    }
    
    generateCharts();
  }, [mcfContent, agency]);
  
  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <div>Generating chart previews...</div>
      </div>
    );
  }
  
  if (charts.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#fff8e1',
        borderRadius: '8px',
        border: '1px solid #ffd54f'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#f57f17' }}>No Charts Available</h3>
        <p style={{ margin: 0, color: '#f9a825' }}>
          This MCF file contains no observations to visualize. 
          Charts require StatVarObservation nodes with data values.
        </p>
      </div>
    );
  }
  
  return (
    <div className="dual-chart-preview">
      <div className="preview-header" style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0' }}>📊 Production Chart Preview</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          See how your data will appear in both UN Data Website and .STAT Explorer
        </p>
      </div>
      
      <div className="charts-grid">
        {charts.map((chart, index) => (
          <div 
            key={`chart-${index}`} 
            className="chart-row"
            style={{
              marginBottom: '32px',
              padding: '20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              paddingBottom: '12px',
              borderBottom: '2px solid #e0e0e0',
              color: '#333'
            }}>
              {chart.title}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div className="chart-col">
                <DataCommonsChartPreview
                  observations={chart.observations}
                  variableId={chart.variableId}
                  title={chart.title}
                />
              </div>
              
              <div className="chart-col">
                <StatChartPreview
                  sdmxData={chart.sdmxData}
                  dataflowId={chart.dataflowId}
                  title={chart.title}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="preview-footer" style={{
        marginTop: '24px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📌 Important Notes:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>Charts use the same data but may look different due to library styling</li>
          <li>Both visualizations are production-ready and will appear exactly as shown</li>
          <li>You can test interactivity (hover, zoom, filter) in both previews</li>
          <li>Generated {charts.length} chart{charts.length !== 1 ? 's' : ''} from {charts.reduce((sum, c) => sum + c.observations.length, 0)} observations</li>
        </ul>
      </div>
    </div>
  );
}

