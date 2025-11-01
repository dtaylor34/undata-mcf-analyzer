/**
 * MCF to .STAT (SDMX-JSON) Converter
 * Transforms MCF observations into SDMX-compliant format
 */

export async function convertToSDMXJSON(observations, variableId, agency) {
  // Extract dimensions from observations
  const dimensions = extractDimensions(observations);
  
  // Build SDMX structure
  const sdmxData = {
    meta: {
      id: `${agency.toUpperCase()}_${variableId}`,
      prepared: new Date().toISOString(),
      sender: {
        id: agency.toUpperCase(),
        name: getAgencyName(agency)
      }
    },
    dimensions: dimensions.map(dim => ({
      id: dim.id,
      name: dim.name,
      values: dim.values
    })),
    observations: observations.map(obs => ({
      dimensions: extractDimensionValues(obs, dimensions),
      value: parseFloat(obs.value || obs.OBS_VALUE || 0),
      attributes: extractAttributes(obs)
    }))
  };
  
  return sdmxData;
}

function extractDimensions(observations) {
  const dimensionSets = {};
  
  observations.forEach(obs => {
    // Common SDMX dimensions
    if (obs.observationAbout || obs.REF_AREA) {
      if (!dimensionSets.REF_AREA) {
        dimensionSets.REF_AREA = new Set();
      }
      dimensionSets.REF_AREA.add(obs.observationAbout || obs.REF_AREA);
    }
    
    if (obs.observationDate || obs.TIME_PERIOD) {
      if (!dimensionSets.TIME_PERIOD) {
        dimensionSets.TIME_PERIOD = new Set();
      }
      dimensionSets.TIME_PERIOD.add(obs.observationDate || obs.TIME_PERIOD);
    }
  });
  
  return Object.entries(dimensionSets).map(([id, values]) => ({
    id,
    name: id.replace(/_/g, ' '),
    values: Array.from(values)
  }));
}

function extractDimensionValues(obs, dimensions) {
  const values = {};
  dimensions.forEach(dim => {
    if (dim.id === 'REF_AREA') {
      values.REF_AREA = obs.observationAbout || obs.REF_AREA;
    } else if (dim.id === 'TIME_PERIOD') {
      values.TIME_PERIOD = obs.observationDate || obs.TIME_PERIOD;
    }
  });
  return values;
}

function extractAttributes(obs) {
  return {
    UNIT_MEASURE: obs.unit || obs.UNIT_MEASURE,
    DATA_SOURCE: obs.dataSource || obs.DATA_SOURCE
  };
}

function getAgencyName(agency) {
  const names = {
    'who': 'World Health Organization',
    'unicef': 'UNICEF',
    'ilo': 'International Labour Organization',
    'fao': 'Food and Agriculture Organization'
  };
  return names[agency] || agency.toUpperCase();
}

