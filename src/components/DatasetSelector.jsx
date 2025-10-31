import React, { useState } from 'react';
import { getAllOrganizations } from '../undata-integration/real-catalog';

/**
 * DatasetSelector Component - UPDATED with Real MCF Data
 * 
 * CHANGES FROM PREVIOUS VERSION:
 * ✅ Line 5: Import real catalog instead of mock data
 * ✅ Line 13: Load organizations from parsed MCF files
 * ✅ Line 17: Display real indicator counts (36,511 total)
 * ✅ Line 95: Updated subtitle to show real counts
 */

export default function DatasetSelector({ onSelect, currentSelection }) {
  // ✅ NEW: Load real organizations from parsed MCF catalog
  const organizations = getAllOrganizations().map(org => ({
    id: org.id,
    name: org.name,
    emoji: org.emoji,
    // ✅ CHANGED: Show real counts instead of mock data
    subtitle: org.quarters 
      ? `${Object.keys(org.quarters).length} quarters`  // SDG: "3 quarters"
      : `${org.totalIndicators.toLocaleString()} indicators`,  // Real counts
    color: org.color,
    totalIndicators: org.totalIndicators,  // ✅ NEW: Store real count
    quarters: org.quarters  // ✅ NEW: Store quarterly data for SDG
  }));

  // Sample indicators per organization (from real catalog)
  const indicatorsByOrg = {
    sdg: [
      { id: 'undata/sdg/AG_FLS_INDEX', name: 'Global food loss index' },
      { id: 'undata/sdg/AG_FLS_PCT', name: 'Food loss percentage' },
      { id: 'undata/sdg/AG_FOOD_WST', name: 'Food waste' },
      { id: 'undata/sdg/AG_LND_AGRI', name: 'Agricultural land' },
      { id: 'undata/sdg/AG_LND_CROP', name: 'Arable land' }
    ],
    ilo: [
      { id: 'undata/ilo/EAP_5EAP_NB.AGE--Y15T24', name: 'Labour force [15-24 years]' },
      { id: 'undata/ilo/EAP_5EAP_NB.AGE--Y15T64', name: 'Labour force [15-64 years]' },
      { id: 'undata/ilo/UNE_TUNE_NB', name: 'Unemployment rate' },
      { id: 'undata/ilo/EMP_NIFL_NB', name: 'Informal employment' }
    ],
    unicef: [
      { id: 'undata/unicef/CME_ARR.AGE--Y10T19', name: 'Mortality rate reduction [10-19 years]' },
      { id: 'undata/unicef/CME_TMM0T4', name: 'Under-five mortality rate' },
      { id: 'undata/unicef/MNCH_ANCARE', name: 'Antenatal care coverage' },
      { id: 'undata/unicef/NT_BF_EXBF', name: 'Exclusive breastfeeding rate' }
    ],
    who: [
      { id: 'undata/who/LIFE_EXPECTANCY', name: 'Life Expectancy' },
      { id: 'undata/who/MORTALITY_RATE', name: 'Mortality Rate' },
      { id: 'undata/who/HEALTH_EXPENDITURE', name: 'Health Expenditure' },
      { id: 'undata/who/IMMUNIZATION_COVERAGE', name: 'Immunization Coverage' }
    ]
  };

  const [selectedOrg, setSelectedOrg] = useState(currentSelection?.org || null);
  const [selectedIndicator, setSelectedIndicator] = useState(currentSelection?.indicator || null);

  const handleOrgClick = (orgId) => {
    setSelectedOrg(orgId);
    setSelectedIndicator(null);
  };

  const handleIndicatorChange = (e) => {
    const indicatorId = e.target.value;
    setSelectedIndicator(indicatorId);
  };

  const handleLoadDataset = () => {
    if (selectedOrg && selectedIndicator) {
      const org = organizations.find(o => o.id === selectedOrg);
      const indicator = indicatorsByOrg[selectedOrg].find(i => i.id === selectedIndicator);
      
      onSelect({
        org: selectedOrg,
        orgName: org.name,
        orgEmoji: org.emoji,
        indicator: selectedIndicator,
        indicatorName: indicator.name,
        // ✅ NEW: Pass real metadata
        totalIndicators: org.totalIndicators,
        quarters: org.quarters
      });
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Organization Selection */}
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Select Dataset</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {organizations.map(org => (
          <div
            key={org.id}
            onClick={() => handleOrgClick(org.id)}
            style={{
              padding: '30px',
              border: `3px solid ${selectedOrg === org.id ? org.color : '#e0e0e0'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              backgroundColor: selectedOrg === org.id ? `${org.color}15` : 'white',
              transform: selectedOrg === org.id ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: selectedOrg === org.id ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '4em', marginBottom: '10px' }}>{org.emoji}</div>
            <h3 style={{ margin: '10px 0', fontSize: '1.2em' }}>{org.name}</h3>
            {/* ✅ CHANGED: Shows real counts from MCF files */}
            <p style={{ color: '#666', fontSize: '0.9em' }}>{org.subtitle}</p>
            
            {/* ✅ NEW: Show quarterly breakdown for SDG */}
            {org.quarters && selectedOrg === org.id && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'white',
                borderRadius: '6px',
                fontSize: '0.8em'
              }}>
                {Object.entries(org.quarters).map(([quarter, data]) => (
                  <div key={quarter} style={{ marginBottom: '5px' }}>
                    <strong>{quarter}:</strong> {data.indicators.toLocaleString()} indicators
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Indicator Selection */}
      {selectedOrg && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Select Indicator</h3>
          <select
            value={selectedIndicator || ''}
            onChange={handleIndicatorChange}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1.1em',
              borderRadius: '8px',
              border: '2px solid #ddd',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose an indicator...</option>
            {indicatorsByOrg[selectedOrg].map(indicator => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Load Button */}
      {selectedOrg && selectedIndicator && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={handleLoadDataset}
            style={{
              padding: '15px 40px',
              fontSize: '1.2em',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
          >
            📊 Load This Dataset
          </button>
        </div>
      )}

      {/* Current Selection Display */}
      {currentSelection && (
        <div style={{
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Current Selection:</h4>
          <p>
            <strong>Organization:</strong> {currentSelection.orgEmoji} {currentSelection.orgName}
            {/* ✅ NEW: Show total indicators from real catalog */}
            {currentSelection.totalIndicators && (
              <span style={{ color: '#666', marginLeft: '10px' }}>
                ({currentSelection.totalIndicators.toLocaleString()} total indicators)
              </span>
            )}
          </p>
          <p><strong>Indicator:</strong> {currentSelection.indicatorName}</p>
          <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
            DCID: <code>{currentSelection.indicator}</code>
          </p>
        </div>
      )}
    </div>
  );
}
