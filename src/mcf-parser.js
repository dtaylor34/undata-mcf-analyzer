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
 * Extract statistical variables metadata from MCF nodes
 */
export function extractStatisticalVariables(nodes) {
  return nodes.filter(node => 
    node.typeOf === 'dcs:StatisticalVariable' || 
    node.typeOf === 'StatisticalVariable'
  ).map(node => ({
    dcid: node.dcid,
    name: node.name,
    description: node.description,
    populationType: node.populationType,
    measuredProperty: node.measuredProperty,
    statType: node.statType,
    measurementMethod: node.measurementMethod,
    unit: node.unit,
    ...node
  }));
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
    unit: obs.unit,
    scalingFactor: obs.scalingFactor,
    measurementMethod: obs.measurementMethod,
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
 * Convert observations to chart data format with full metadata
 * Returns array of chart objects for multiple charts
 */
export function observationsToChartData(observations, statisticalVariables = []) {
  if (!observations || observations.length === 0) {
    return [];
  }
  
  // Group by variable
  const grouped = groupObservationsByVariable(observations);
  const variables = Object.keys(grouped);
  
  // Create chart for each variable with metadata
  return variables.map(variable => {
    const varObservations = grouped[variable];
    
    // Find metadata for this variable
    const varMetadata = statisticalVariables.find(v => 
      v.dcid === variable || v.name === variable
    ) || {};
    
    // Extract entities (observationAbout)
    const entities = [...new Set(varObservations.map(obs => obs.about).filter(Boolean))];
    
    // Get date range
    const dates = varObservations.map(obs => obs.date).filter(Boolean).sort();
    const dateRange = dates.length > 0 ? {
      start: dates[0],
      end: dates[dates.length - 1]
    } : null;
    
    // Get unit info
    const unit = varObservations.find(obs => obs.unit)?.unit || varMetadata.unit || '';
    
    // Build chart title
    const chartTitle = varMetadata.name || variable || 'Untitled Chart';
    
    // Convert to chart data points
    const data = varObservations.map(obs => ({
      name: obs.date || obs.about || 'N/A',
      value: obs.value,
      label: obs.date || obs.about || 'N/A',
      entity: obs.about,
      unit: obs.unit || unit,
      date: obs.date
    }));
    
    return {
      // Chart identification
      id: variable,
      dcid: variable,
      title: chartTitle,
      
      // Metadata
      description: varMetadata.description || '',
      populationType: varMetadata.populationType || '',
      measuredProperty: varMetadata.measuredProperty || '',
      statType: varMetadata.statType || '',
      measurementMethod: varMetadata.measurementMethod || '',
      unit: unit,
      
      // Data structure
      data: data,
      
      // Additional info
      entities: entities,
      dateRange: dateRange,
      observationCount: varObservations.length,
      
      // Chart configuration hints
      chartType: dates.length > 0 ? 'timeSeries' : (entities.length > 0 ? 'bar' : 'table'),
      hasMultipleEntities: entities.length > 1,
      hasTimeSeries: dates.length > 0
    };
  });
}

/**
 * Enhanced parser that returns both data and metadata
 */
export function parseAndAnalyzeMCF(mcfContent) {
  const nodes = parseMCF(mcfContent);
  const statisticalVariables = extractStatisticalVariables(nodes);
  const observations = extractObservations(nodes);
  const chartData = observationsToChartData(observations, statisticalVariables);
  
  return {
    nodes,
    statisticalVariables,
    observations,
    chartData,
    summary: {
      totalNodes: nodes.length,
      variableCount: statisticalVariables.length,
      observationCount: observations.length,
      chartCount: chartData.length
    }
  };
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
