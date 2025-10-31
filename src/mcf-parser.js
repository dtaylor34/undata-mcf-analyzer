/**
 * MCF Parser
 * Parses MCF files and extracts data for visualization
 */

/**
 * Parse MCF content into nodes
 */
export function parseMCF(mcfContent) {
  if (!mcfContent) return [];
  
  const nodes = [];
  const nodeBlocks = mcfContent.split(/\n\s*\n/).filter(block => block.trim());
  
  nodeBlocks.forEach(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;
    
    const node = {};
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
        
        if (key === 'Node') {
          node.dcid = value;
        } else {
          node[key] = value;
        }
      }
    });
    
    if (node.dcid) {
      nodes.push(node);
    }
  });
  
  return nodes;
}

/**
 * Extract observations from MCF nodes for charting
 */
export function extractObservations(nodes) {
  const observations = nodes.filter(node => 
    node.typeOf === 'dcs:StatVarObservation' || 
    node.typeOf === 'StatVarObservation'
  );
  
  return observations.map(obs => ({
    dcid: obs.dcid,
    variable: obs.variableMeasured,
    date: obs.observationDate,
    value: parseFloat(obs.value) || 0,
    about: obs.observationAbout,
    ...obs
  }));
}

/**
 * Group observations by variable for multiple chart series
 */
export function groupObservationsByVariable(observations) {
  const grouped = {};
  
  observations.forEach(obs => {
    const varKey = obs.variable || 'Unknown';
    if (!grouped[varKey]) {
      grouped[varKey] = [];
    }
    grouped[varKey].push(obs);
  });
  
  // Sort each series by date
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateA.localeCompare(dateB);
    });
  });
  
  return grouped;
}

/**
 * Convert observations to chart data format
 */
export function observationsToChartData(observations) {
  if (!observations || observations.length === 0) {
    return [];
  }
  
  // Group by variable
  const grouped = groupObservationsByVariable(observations);
  const variables = Object.keys(grouped);
  
  // If only one variable, simple time series
  if (variables.length === 1) {
    return grouped[variables[0]].map(obs => ({
      name: obs.date || 'N/A',
      value: obs.value,
      label: obs.date || 'N/A'
    }));
  }
  
  // Multiple variables - create multi-series data
  // Build union of all dates
  const allDates = new Set();
  observations.forEach(obs => {
    if (obs.date) allDates.add(obs.date);
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  return sortedDates.map(date => {
    const dataPoint = { name: date };
    variables.forEach(variable => {
      const obs = grouped[variable].find(o => o.date === date);
      dataPoint[variable] = obs ? obs.value : null;
    });
    return dataPoint;
  });
}

/**
 * Detect chart type based on observations
 */
export function detectChartType(observations) {
  if (!observations || observations.length === 0) {
    return 'none';
  }
  
  // Check if there are dates (time series)
  const hasDates = observations.some(obs => obs.date);
  
  if (hasDates) {
    return 'line'; // Time series
  }
  
  // Check if there are categories (bar chart)
  const hasCategories = observations.some(obs => obs.about);
  if (hasCategories) {
    return 'bar';
  }
  
  return 'table'; // Fallback to table view
}

/**
 * Get chart configuration based on observations
 */
export function getChartConfig(observations) {
  const chartType = detectChartType(observations);
  const grouped = groupObservationsByVariable(observations);
  const variables = Object.keys(grouped);
  
  return {
    type: chartType,
    series: variables,
    hasMultipleSeries: variables.length > 1,
    observationCount: observations.length,
    dateRange: observations.length > 0 ? {
      start: observations[0].date,
      end: observations[observations.length - 1].date
    } : null
  };
}

/**
 * Extract statistical variables from nodes
 */
export function extractStatisticalVariables(nodes) {
  return nodes.filter(node => 
    node.typeOf === 'dcs:StatisticalVariable' || 
    node.typeOf === 'StatisticalVariable'
  );
}

