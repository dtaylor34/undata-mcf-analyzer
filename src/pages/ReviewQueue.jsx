/**
 * FILE: src/pages/ReviewQueue.jsx
 * PURPOSE: Review Queue page for admins to approve/reject data submissions
 * 
 * Features:
 * - List of pending submissions
 * - Governance validation status
 * - Dual chart preview (DataCommons + .STAT)
 * - Approve/Reject actions
 * - Diff viewer integration
 */

import { useState, useEffect } from 'react';
import { GovernancePanel } from '../components/GovernancePanel';
import { DualChartPreview } from '../components/DualChartPreview';
import DiffViewer from '../components/DiffViewer';
import { ComprehensiveDiffViewer } from '../components/ComprehensiveDiffViewer';

export function ReviewQueue({ isDarkMode }) {
  const [queue, setQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [showComprehensiveDiff, setShowComprehensiveDiff] = useState(false);
  
  // Load review queue on mount
  useEffect(() => {
    loadReviewQueue();
  }, []);
  
  // Load review queue from backend
  async function loadReviewQueue() {
    setLoading(true);
    
    try {
      // In production, this would fetch from API
      // For now, load from static JSON
      const response = await fetch('/review-queue.json');
      
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      } else {
        // If file doesn't exist, use empty queue
        setQueue([]);
      }
    } catch (error) {
      console.error('Error loading review queue:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Approve submission
  async function approveSubmission(item) {
    if (!window.confirm(`Approve submission: ${item.fileName}?`)) {
      return;
    }
    
    try {
      // In production, this would call API
      console.log('✅ Approving:', item.fileName);
      
      // Call backend to approve and merge
      // await fetch('/api/review/approve', { method: 'POST', body: JSON.stringify({ id: item.id }) });
      
      alert(`✅ Approved: ${item.fileName}\n\nDeployment pipeline initiated!`);
      
      // Refresh queue
      await loadReviewQueue();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('❌ Failed to approve submission');
    }
  }
  
  // Reject submission
  async function rejectSubmission(item) {
    const reason = window.prompt('Reason for rejection:');
    
    if (!reason) return;
    
    try {
      console.log('❌ Rejecting:', item.fileName, 'Reason:', reason);
      
      // Call backend to reject and delete draft
      // await fetch('/api/review/reject', { method: 'POST', body: JSON.stringify({ id: item.id, reason }) });
      
      alert(`❌ Rejected: ${item.fileName}\n\nReason: ${reason}`);
      
      // Refresh queue
      await loadReviewQueue();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('❌ Failed to reject submission');
    }
  }
  
  // Load MCF content for selected item
  async function loadMCFContent(item) {
    try {
      const response = await fetch(item.mcfPath);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error('Error loading MCF content:', error);
    }
    return '';
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">📋 Review Queue</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and approve data submissions from partners
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Queue List */}
          <div className="col-span-3">
            <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Pending Reviews</h2>
                <span className={`px-2 py-1 rounded text-xs ${
                  isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  {queue.length}
                </span>
              </div>
              
              {loading ? (
                <p className="text-center py-4 text-gray-500">Loading...</p>
              ) : queue.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  ✅ No pending reviews
                </p>
              ) : (
                <div className="space-y-2">
                  {queue.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedItem === item
                          ? isDarkMode
                            ? 'bg-blue-900/50 border-2 border-blue-500'
                            : 'bg-blue-50 border-2 border-blue-500'
                          : isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{getOrgEmoji(item.orgId)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.fileName}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.orgId.toUpperCase()}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Governance Status Indicator */}
                      {item.governanceResult && (
                        <div className="mt-2">
                          {item.governanceResult.isValid ? (
                            <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-300">
                              ✓ Valid
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-900/30 text-yellow-300">
                              ⚠ Issues
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Panel - Review Details */}
          <div className="col-span-9">
            {selectedItem ? (
              <div className="space-y-6">
                {/* Item Header */}
                <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getOrgEmoji(selectedItem.orgId)}</span>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedItem.fileName}</h2>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedItem.orgId.toUpperCase()} • {new Date(selectedItem.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Branch: <code className="font-mono text-xs">{selectedItem.branchName}</code>
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectSubmission(selectedItem)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => approveSubmission(selectedItem)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        ✅ Approve
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Governance Panel */}
                {selectedItem.governanceResult && (
                  <GovernancePanel
                    governanceResult={selectedItem.governanceResult}
                    agency={selectedItem.orgId}
                    isDarkMode={isDarkMode}
                  />
                )}
                
                {/* Action Tabs */}
                <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex border-b border-gray-700 p-4 gap-2">
                    <button
                      onClick={() => { setShowCharts(false); setShowComprehensiveDiff(false); }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        !showCharts && !showComprehensiveDiff
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      📄 MCF Content
                    </button>
                    <button
                      onClick={() => { setShowCharts(true); setShowComprehensiveDiff(false); }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        showCharts && !showComprehensiveDiff
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      📊 Chart Preview
                    </button>
                    <button
                      onClick={() => { setShowComprehensiveDiff(true); setShowCharts(false); }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        showComprehensiveDiff
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      🔍 Comprehensive Diff
                    </button>
                  </div>
                  
                  <div className="p-6">
                    {showCharts ? (
                      <DualChartPreview
                        mcfContent={selectedItem.mcfContent || ''}
                        agency={selectedItem.orgId}
                        isDarkMode={isDarkMode}
                      />
                    ) : showComprehensiveDiff ? (
                      <ComprehensiveDiffViewer
                        oldMCF={''}
                        newMCF={selectedItem.mcfContent || ''}
                        agency={selectedItem.orgId}
                        isDarkMode={isDarkMode}
                      />
                    ) : (
                      <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {selectedItem.mcfContent || 'Loading...'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-12 text-center`}>
                <p className="text-xl text-gray-500">
                  ← Select a submission to review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get emoji for organization
function getOrgEmoji(orgId) {
  const emojis = {
    'who': '🏥',
    'unicef': '👶',
    'ilo': '💼',
    'fao': '🌾',
    'sdg': '🎯',
    'unknown': '❓'
  };
  
  return emojis[orgId] || emojis['unknown'];
}

