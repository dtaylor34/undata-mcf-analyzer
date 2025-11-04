/**
 * FILE: src/components/UNDataCharts.jsx
 * PURPOSE: Professional charts matching UN Data website style
 * USES: Recharts library for data visualization
 */

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

/**
 * World Map Chart - Shows country-level data
 */
export function WorldMapChart({ data, isDarkMode, onCountryHover }) {
  if (!data || data.length === 0) {
    return <EmptyChart isDarkMode={isDarkMode} message="No map data available" />;
  }
  
  // Sort by value for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 30);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
        />
        <XAxis 
          type="number"
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
        <YAxis 
          type="category" 
          dataKey="name"
          width={90}
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
          labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000' }}
          formatter={(value, name) => [`${value.toFixed(1)}%`, 'Value']}
        />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={getGradientColor(entry.value, sortedData)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Trend Line Chart - Shows data over time
 */
export function TrendLineChart({ data, isDarkMode, title }) {
  if (!data || data.length === 0) {
    return <EmptyChart isDarkMode={isDarkMode} message="No trend data available" />;
  }
  
  return (
    <div>
      {title && (
        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="year"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Area Chart - Shows filled trend area
 */
export function AreaTrendChart({ data, isDarkMode, title }) {
  if (!data || data.length === 0) {
    return <EmptyChart isDarkMode={isDarkMode} message="No data available" />;
  }
  
  return (
    <div>
      {title && (
        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="year"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Comparison Bar Chart - Compare multiple countries/entities
 */
export function ComparisonBarChart({ data, isDarkMode, title }) {
  if (!data || data.length === 0) {
    return <EmptyChart isDarkMode={isDarkMode} message="No comparison data available" />;
  }
  
  // Take top 15 for better visibility
  const topData = [...data].sort((a, b) => b.value - a.value).slice(0, 15);
  
  return (
    <div>
      {title && (
        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={topData}
          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="name"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
            formatter={(value) => [`${value.toFixed(1)}%`, 'Value']}
          />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]}
          >
            {topData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getGradientColor(entry.value, topData)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Multi-line comparison chart
 */
export function MultiLineChart({ data, isDarkMode, title, lines }) {
  if (!data || data.length === 0) {
    return <EmptyChart isDarkMode={isDarkMode} message="No data available" />;
  }
  
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <div>
      {title && (
        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="year"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
            labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ color: isDarkMode ? '#ffffff' : '#000000' }}
          />
          {lines && lines.map((line, idx) => (
            <Line 
              key={line}
              type="monotone" 
              dataKey={line} 
              stroke={colors[idx % colors.length]} 
              strokeWidth={2}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Empty state for charts
 */
function EmptyChart({ isDarkMode, message }) {
  return (
    <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

/**
 * Get gradient color based on value (purple gradient matching UN Data)
 */
function getGradientColor(value, dataset) {
  const values = dataset.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const normalized = (value - min) / (max - min || 1);
  
  // Purple gradient from light to dark
  const r = Math.round(219 - normalized * 80);  // 219 -> 139
  const g = Math.round(172 - normalized * 80);  // 172 -> 92
  const b = Math.round(246 - normalized * 29);  // 246 -> 217
  
  return `rgb(${r}, ${g}, ${b})`;
}

export default {
  WorldMapChart,
  TrendLineChart,
  AreaTrendChart,
  ComparisonBarChart,
  MultiLineChart
};

