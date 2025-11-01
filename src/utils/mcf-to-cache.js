/**
 * MCF to Cached/Optimized Format Converter
 * Pre-computes aggregations and chart configurations for fast website loading
 */

import { observationsToChartData } from '../mcf-parser.js';

export function generateOptimizedCache(observations, variables) {
  // Generate chart configurations
  const charts = generateChartConfigs(observations, variables);
  
  // Pre-compute aggregations
  const aggregations = computeAggregations(observations);
  
  // Build optimized structure
  return {
    version: '1.0',
    generated: new Date().toISOString(),
    metadata: {
      variableCount: variables.length,
      observationCount: observations.length,
      dateRange: getDateRange(observations)
    },
    charts: charts,
    aggregations: aggregations,
    quickStats: {
      latestValue: getLatestValue(observations),
      trend: calculateTrend(observations),
      coverage: calculateCoverage(observations)
    }
  };
}

function generateChartConfigs(observations, variables) {
  const byVariable = {};
  observations.forEach(obs => {
    const varId = obs.variableMeasured;
    if (!byVariable[varId]) {
      byVariable[varId] = [];
    }
    byVariable[varId].push(obs);
  });
  
  return Object.entries(byVariable).map(([varId, obs]) => {
    const variable = variables.find(v => v.dcid === varId);
    return {
      id: varId,
      title: variable?.name || varId,
      type: 'line',
      data: observationsToChartData(obs),
      config: {
        xAxis: 'observationDate',
        yAxis: 'value',
        groupBy: 'observationAbout'
      }
    };
  });
}

function computeAggregations(observations) {
  return {
    byYear: aggregateByYear(observations),
    byRegion: aggregateByRegion(observations)
  };
}

function aggregateByYear(observations) {
  const byYear = {};
  observations.forEach(obs => {
    const year = (obs.observationDate || '').substring(0, 4);
    if (!byYear[year]) {
      byYear[year] = { count: 0, sum: 0, values: [] };
    }
    const value = parseFloat(obs.value || 0);
    byYear[year].count++;
    byYear[year].sum += value;
    byYear[year].values.push(value);
  });
  
  // Calculate averages
  Object.keys(byYear).forEach(year => {
    byYear[year].average = byYear[year].sum / byYear[year].count;
  });
  
  return byYear;
}

function aggregateByRegion(observations) {
  const byRegion = {};
  observations.forEach(obs => {
    const region = obs.observationAbout || 'Unknown';
    if (!byRegion[region]) {
      byRegion[region] = { count: 0, latestValue: null };
    }
    byRegion[region].count++;
    byRegion[region].latestValue = parseFloat(obs.value || 0);
  });
  return byRegion;
}

function getDateRange(observations) {
  const dates = observations
    .map(o => o.observationDate || o.TIME_PERIOD)
    .filter(d => d)
    .sort();
  
  return {
    start: dates[0] || null,
    end: dates[dates.length - 1] || null
  };
}

function getLatestValue(observations) {
  if (observations.length === 0) return null;
  const sorted = observations.sort((a, b) => 
    (b.observationDate || '').localeCompare(a.observationDate || '')
  );
  return parseFloat(sorted[0].value || 0);
}

function calculateTrend(observations) {
  // Simplified trend calculation
  if (observations.length < 2) return 'stable';
  const values = observations.map(o => parseFloat(o.value || 0));
  const first = values[0];
  const last = values[values.length - 1];
  
  if (last > first * 1.1) return 'increasing';
  if (last < first * 0.9) return 'decreasing';
  return 'stable';
}

function calculateCoverage(observations) {
  return {
    countries: new Set(observations.map(o => o.observationAbout)).size,
    years: new Set(observations.map(o => (o.observationDate || '').substring(0, 4))).size
  };
}

