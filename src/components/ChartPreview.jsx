/**
 * FILE: src/components/ChartPreview.jsx
 * PURPOSE: Data visualization with interactive charts
 * 
 * FEATURES:
 * - Line chart for time-series data
 * - Responsive design
 * - Dark/Light theme support
 * - Uses Recharts library
 */

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ChartPreview({ data, indicator, isDarkMode }) {
  // Transform data for charting - data is now a chart object with metadata
  const chartData = data?.data || generateSampleData();
  const chartType = data?.chartType === 'timeSeries' ? 'line' : (data?.chartType === 'bar' ? 'bar' : 'line');
  
  // Extract metadata
  const title = data?.title || indicator?.name || 'Data Visualization';
  const description = data?.description || '';
  const unit = data?.unit || '';
  const dateRange = data?.dateRange;
  const entities = data?.entities || [];
  const statType = data?.statType || '';
  const measuredProperty = data?.measuredProperty || '';
  const observationCount = data?.observationCount || chartData.length;

  // Custom tooltip styling with unit display
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    
    const point = payload[0].payload;
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {point.date || point.name || point.year}
        </p>
        {point.entity && (
          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {point.entity}
          </p>
        )}
        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Value: <span className="font-bold">{payload[0].value}{unit ? ` ${unit}` : ''}</span>
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Enhanced Chart Info with Metadata */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <h4 className={`font-bold mb-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        {description && (
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {observationCount > 0 && (
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Observations:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{observationCount}</span>
            </div>
          )}
          {unit && (
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unit:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{unit}</span>
            </div>
          )}
          {statType && (
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stat Type:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{statType}</span>
            </div>
          )}
          {measuredProperty && (
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Property:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{measuredProperty}</span>
            </div>
          )}
          {dateRange && (
            <div className="col-span-2">
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date Range:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dateRange.start} - {dateRange.end}</span>
            </div>
          )}
          {entities.length > 0 && (
            <div className="col-span-2">
              <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Entities:</span>
              <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{entities.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '14px',
                  color: isDarkMode ? '#e5e7eb' : '#374151'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      <div className={`mt-6 grid grid-cols-3 gap-4`}>
        <StatCard
          label="Data Points"
          value={chartData.length}
          icon="📊"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Min Value"
          value={Math.min(...chartData.map(d => d.value)).toFixed(2)}
          icon="📉"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Max Value"
          value={Math.max(...chartData.map(d => d.value)).toFixed(2)}
          icon="📈"
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, isDarkMode }) {
  return (
    <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
}

// Generate sample data if no real data available
function generateSampleData() {
  const years = [2018, 2019, 2020, 2021, 2022, 2023];
  return years.map(year => ({
    name: year.toString(),
    year,
    value: Math.floor(Math.random() * 50) + 50
  }));
}
