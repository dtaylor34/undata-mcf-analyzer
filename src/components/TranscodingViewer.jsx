import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { calculateConfidence, groupMappingsByEnumeration, getTranscodingStats } from '../utils/transcoding-confidence';

/**
 * TranscodingViewer Component
 * 
 * Displays SDG transcoding matrix with confidence scoring
 * Shows OLD taxonomy → NEW taxonomy mappings
 * Allows filtering, searching, smart grouping, and bulk approval
 */
export default function TranscodingViewer({ isDarkMode }) {
  const [transcodingData, setTranscodingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnumeration, setSelectedEnumeration] = useState('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW
  const [viewMode, setViewMode] = useState('table'); // table, grouped
  const [editMode, setEditMode] = useState(false);
  const [showApprovalDropdown, setShowApprovalDropdown] = useState(false);
  const approvalDropdownRef = useRef(null);
  
  // Load transcoding data from API or file
  useEffect(() => {
    loadTranscodingData();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (approvalDropdownRef.current && !approvalDropdownRef.current.contains(event.target)) {
        setShowApprovalDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  async function loadTranscodingData() {
    setIsLoading(true);
    try {
      console.log('📊 Loading SDG Q2-2025 transcoding data...');
      
      // Load real data from parsed JSON file
      const response = await fetch('/transcoding/sdg-q2-2025.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Loaded ${data.mappings.length} mappings`);
      console.log('Metadata:', data.metadata);
      
      setTranscodingData(data.mappings);
    } catch (error) {
      console.error('❌ Error loading transcoding data:', error);
      console.log('⚠️ Falling back to sample data for demonstration');
      
      // Fallback to sample data if file not found
      const sampleData = generateSampleData();
      setTranscodingData(sampleData);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Generate sample data for demonstration
  function generateSampleData() {
    return [
      // High confidence examples
      { Enumeration_Code: 'ACTIVITY', Enumeration_Name: 'Activity', EnumerationValue_Code: 'TOTAL', EnumerationValue_Name: 'No breakdown', Enumeration_Code2: 'ECONOMIC_ACTIVITY', Enumeration_Name2: 'Economic activity', EnumerationValue_Code2: '_T', EnumerationValue_Name2: 'Total or no breakdown' },
      { Enumeration_Code: 'SEX', Enumeration_Name: 'Sex', EnumerationValue_Code: 'M', EnumerationValue_Name: 'Male', Enumeration_Code2: 'SEX', Enumeration_Name2: 'Sex', EnumerationValue_Code2: 'M', EnumerationValue_Name2: 'Male' },
      { Enumeration_Code: 'SEX', Enumeration_Name: 'Sex', EnumerationValue_Code: 'F', EnumerationValue_Name: 'Female', Enumeration_Code2: 'SEX', Enumeration_Name2: 'Sex', EnumerationValue_Code2: 'F', EnumerationValue_Name2: 'Female' },
      { Enumeration_Code: 'AGE', Enumeration_Name: 'Age', EnumerationValue_Code: 'Y15T24', EnumerationValue_Name: '15 to 24 years old', Enumeration_Code2: 'AGE_GROUP', Enumeration_Name2: 'Age group', EnumerationValue_Code2: '15-24', EnumerationValue_Name2: '15 to 24 years' },
      // Medium confidence examples
      { Enumeration_Code: 'ACTIVITY', Enumeration_Name: 'Activity', EnumerationValue_Code: 'PRIV_HH', EnumerationValue_Name: 'Private households', Enumeration_Code2: 'ECONOMIC_ACTIVITY', Enumeration_Name2: 'Economic activity', EnumerationValue_Code2: 'HH', EnumerationValue_Name2: 'Households' },
      { Enumeration_Code: 'LOCATION', Enumeration_Name: 'Location', EnumerationValue_Code: 'URB', EnumerationValue_Name: 'Urban', Enumeration_Code2: 'LOCATION_TYPE', Enumeration_Name2: 'Location type', EnumerationValue_Code2: 'URBAN', EnumerationValue_Name2: 'Urban areas' },
      // Low confidence examples
      { Enumeration_Code: 'EDUCATION', Enumeration_Name: 'Education', EnumerationValue_Code: 'ISCED3', EnumerationValue_Name: 'Upper secondary education', Enumeration_Code2: 'EDU_LEVEL', Enumeration_Name2: 'Education level', EnumerationValue_Code2: 'SEC_UPP', EnumerationValue_Name2: 'Secondary upper' },
      { Enumeration_Code: 'CUSTOM', Enumeration_Name: 'Custom code', EnumerationValue_Code: 'XYZ123', EnumerationValue_Name: 'Custom indicator', Enumeration_Code2: 'CUSTOM_NEW', Enumeration_Name2: 'Custom code', EnumerationValue_Code2: 'ABC789', EnumerationValue_Name2: 'New custom indicator' },
    ];
  }
  
  // Calculate confidence for all data and cache it
  const dataWithConfidence = useMemo(() => {
    return transcodingData.map(row => ({
      ...row,
      confidence: calculateConfidence(row)
    }));
  }, [transcodingData]);
  
  // Get statistics
  const stats = useMemo(() => getTranscodingStats(transcodingData), [transcodingData]);
  
  // Get grouped data
  const groupedData = useMemo(() => groupMappingsByEnumeration(transcodingData), [transcodingData]);
  
  // Get unique enumerations for filter
  const enumerations = ['ALL', ...Object.keys(groupedData)];
  
  // Filter data based on all filters
  const filteredData = dataWithConfidence.filter(row => {
    // Search filter
    const matchesSearch = !searchTerm || 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Enumeration filter
    const enumCode = row.Enumeration_Code || row.enumeration_code;
    const matchesEnum = selectedEnumeration === 'ALL' || enumCode === selectedEnumeration;
    
    // Confidence filter
    let matchesConfidence = true;
    if (confidenceFilter !== 'ALL') {
      matchesConfidence = row.confidence.level === confidenceFilter.toLowerCase();
    }
    
    return matchesSearch && matchesEnum && matchesConfidence;
  });
  
  if (isLoading) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading transcoding matrix...</p>
      </div>
    );
  }
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🔄 SDG Transcoding Matrix
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Review and approve automated taxonomy mappings
        </p>
      </div>
      
      {/* Smart Stats with Confidence Scoring */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Mappings"
          value={stats.total}
          icon="📊"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Auto-Approved"
          value={stats.autoApproved}
          icon="✅"
          subtitle={`${stats.autoApprovedPercent}%`}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Needs Review"
          value={stats.needsReview}
          icon="⚠️"
          subtitle={`${stats.needsReviewPercent}%`}
          color="yellow"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Time Saved"
          value={`${stats.timeSaved}%`}
          icon="⏱️"
          subtitle={`${stats.autoApproved} rows skipped`}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Enumerations"
          value={enumerations.length - 1}
          icon="🏷️"
          isDarkMode={isDarkMode}
        />
      </div>
      
      {/* Confidence Summary Banner */}
      {stats.autoApprovedPercent >= 80 && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                Excellent! {stats.autoApprovedPercent}% Can Be Auto-Approved
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                Only {stats.needsReview} mappings need human review instead of {stats.total}. 
                This saves approximately {Math.round((stats.autoApproved / stats.total) * 100)}% of review time!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Search */}
        <input
          type="text"
          placeholder="Search mappings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        
        {/* Confidence Filter */}
        <select
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="ALL">All Confidence Levels</option>
          <option value="HIGH">✅ High Confidence Only</option>
          <option value="MEDIUM">⚠️ Medium Confidence Only</option>
          <option value="LOW">❌ Low Confidence Only</option>
        </select>
        
        {/* Enumeration Filter */}
        <select
          value={selectedEnumeration}
          onChange={(e) => setSelectedEnumeration(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {enumerations.map(enum_code => (
            <option key={enum_code} value={enum_code}>
              {enum_code === 'ALL' ? 'All Enumerations' : enum_code}
            </option>
          ))}
        </select>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📄 Table
          </button>
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'grouped'
                ? 'bg-blue-600 text-white'
                : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📦 Grouped
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      {stats.autoApproved > 0 && (
        <div className="flex gap-4 mb-6">
          {/* Approval Dropdown */}
          <div className="relative" ref={approvalDropdownRef}>
            <button
              onClick={() => setShowApprovalDropdown(!showApprovalDropdown)}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2"
            >
              ✅ Approval Actions ({stats.autoApproved} high confidence)
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showApprovalDropdown && (
              <div className={`absolute top-full left-0 mt-2 rounded-lg shadow-lg border z-50 min-w-[320px] ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    alert(`✅ Approved ${stats.autoApproved} high-confidence mappings!`);
                    setShowApprovalDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-green-600 hover:text-white first:rounded-t-lg transition-colors ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  <div className="font-medium">✅ Approve all High Confidence</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Approve {stats.autoApproved} mappings with confidence ≥ 85%
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    alert(`⚠️ Marked as "Needs Work" - Review required before approval`);
                    setShowApprovalDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-yellow-600 hover:text-white transition-colors border-t ${
                    isDarkMode ? 'text-gray-200 border-gray-700' : 'text-gray-900 border-gray-200'
                  }`}
                >
                  <div className="font-medium">⚠️ Not approved, needs work</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mark for further review and refinement
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    alert(`💬 Flagged for team discussion - Questions raised`);
                    setShowApprovalDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-600 hover:text-white transition-colors border-t ${
                    isDarkMode ? 'text-gray-200 border-gray-700' : 'text-gray-900 border-gray-200'
                  }`}
                >
                  <div className="font-medium">💬 Have questions, need to sync with team</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Request team discussion before proceeding
                  </div>
                </button>
                
                <button
                  onClick={() => setShowApprovalDropdown(false)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-600 hover:text-white last:rounded-b-lg transition-colors border-t ${
                    isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
                  }`}
                >
                  <div className="font-medium">✕ Close</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Cancel without taking action
                  </div>
                </button>
              </div>
            )}
          </div>
          
          <button
            className={`px-6 py-2 rounded-lg border font-medium ${
              isDarkMode
                ? 'border-gray-700 text-white hover:bg-gray-800'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => {
              setConfidenceFilter('MEDIUM');
              setViewMode('table');
            }}
          >
            ⚠️ Show Only Needs Review ({stats.needsReview})
          </button>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <thead>
            <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              <th className={`px-4 py-3 text-left border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                🤖 Confidence
              </th>
              <th className={`px-4 py-3 text-left border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} colSpan="3">
                🔴 OLD Taxonomy
              </th>
              <th className={`px-4 py-3 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                →
              </th>
              <th className={`px-4 py-3 text-left border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} colSpan="3">
                🟢 NEW Taxonomy
              </th>
            </tr>
            <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Score
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Enumeration
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Value Code
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Value Name
              </th>
              <th className={`px-4 py-2 text-center text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Enumeration
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Value Code
              </th>
              <th className={`px-4 py-2 text-left text-xs border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                Value Name
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No mappings found
                </td>
              </tr>
            ) : (
              filteredData.slice(0, 100).map((row, idx) => {
                const confidence = row.confidence || calculateConfidence(row);
                const confidenceBadge = getConfidenceBadge(confidence);
                
                return (
                  <tr key={idx} className={`
                    ${idx % 2 === 0 ? (isDarkMode ? 'bg-gray-900' : 'bg-white') : (isDarkMode ? 'bg-gray-850' : 'bg-gray-50')}
                    hover:${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}
                  `}>
                    <td className={`px-4 py-2 text-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{confidenceBadge.icon}</span>
                        <div>
                          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {confidence.score}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {confidence.level}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-2 text-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.Enumeration_Code || row.enumeration_code}
                    </td>
                    <td className={`px-4 py-2 text-sm border font-mono ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.EnumerationValue_Code || row.enum_value_code || '—'}
                    </td>
                    <td className={`px-4 py-2 text-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.EnumerationValue_Name || row.enum_value_name || '—'}
                    </td>
                    <td className={`px-4 py-2 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      →
                    </td>
                    <td className={`px-4 py-2 text-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.Enumeration_Code2 || row.enumeration_code2}
                    </td>
                    <td className={`px-4 py-2 text-sm border font-mono ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.EnumerationValue_Code2 || row.enum_value_code2 || '—'}
                    </td>
                    <td className={`px-4 py-2 text-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {row.EnumerationValue_Name2 || row.enum_value_name2 || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {filteredData.length > 100 && (
          <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing first 100 of {filteredData.length} results. Use filters to narrow down.
          </div>
        )}
      </div>
      
      {/* Actions */}
      {editMode && (
        <div className="mt-6 flex gap-4 justify-end">
          <button
            className={`px-6 py-2 rounded-lg border ${
              isDarkMode
                ? 'border-gray-700 text-white hover:bg-gray-800'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
          >
            ❌ Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium"
          >
            ✅ Approve & Deploy
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to get confidence badge
function getConfidenceBadge(confidence) {
  if (confidence.level === 'high') {
    return { icon: '✅', color: 'green', label: 'High' };
  } else if (confidence.level === 'medium') {
    return { icon: '⚠️', color: 'yellow', label: 'Medium' };
  } else {
    return { icon: '❌', color: 'red', label: 'Low' };
  }
}

// StatCard component with enhanced features
function StatCard({ label, value, icon, subtitle, color, isDarkMode }) {
  const colorClasses = {
    green: isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-300',
    yellow: isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-100 border-yellow-300',
    blue: isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-100 border-blue-300',
    red: isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-300',
  };
  
  const bgClass = color ? `${colorClasses[color]} border` : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100');
  
  return (
    <div className={`p-4 rounded-lg ${bgClass}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {subtitle}
        </div>
      )}
      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
}

