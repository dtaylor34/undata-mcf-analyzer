/**
 * CSV to MCF Converter
 * Converts CSV data to MCF observations using TMCF templates
 */

export function csvToMCF(csvContent, tmcfTemplate) {
  // Parse CSV
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  let mcfOutput = '';

  rows.forEach((row, index) => {
    const values = row.split(',');
    const rowData = {};
    
    headers.forEach((header, i) => {
      rowData[header.trim()] = values[i]?.trim() || '';
    });

    // Generate observation node
    const nodeId = `obs_${rowData.SERIES}_${rowData.GEOGRAPHY}_${rowData.TIME_PERIOD}`;
    
    mcfOutput += `Node: dcid:${nodeId}\n`;
    mcfOutput += `typeOf: dcs:StatVarObservation\n`;
    mcfOutput += `variableMeasured: dcid:undata/sdg/${rowData.SERIES}\n`;
    mcfOutput += `observationAbout: dcid:country/${rowData.GEOGRAPHY}\n`;
    mcfOutput += `observationDate: "${rowData.TIME_PERIOD}"\n`;
    mcfOutput += `value: ${rowData.OBS_VALUE}\n`;
    if (rowData.UNIT_MEASURE) {
      mcfOutput += `unit: dcid:undata/sdg/${rowData.UNIT_MEASURE}\n`;
    }
    mcfOutput += `\n`;
  });

  return mcfOutput;
}

export function generateAllFormats(mcfContent) {
  // Parse MCF to get observations
  const observations = [];
  const nodes = mcfContent.split('\n\n').filter(n => n.trim());
  
  nodes.forEach(nodeText => {
    const lines = nodeText.split('\n');
    const obs = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key.includes('Node')) {
        obs.dcid = value.replace('dcid:', '');
      } else if (key.trim() === 'variableMeasured') {
        obs.variable = value.replace('dcid:undata/sdg/', '').replace('dcid:', '');
      } else if (key.trim() === 'observationAbout') {
        obs.geography = value.replace('dcid:country/', '').replace('dcid:', '');
      } else if (key.trim() === 'observationDate') {
        obs.date = value.replace(/"/g, '');
      } else if (key.trim() === 'value') {
        obs.value = parseFloat(value);
      } else if (key.trim() === 'unit') {
        obs.unit = value.replace('dcid:undata/sdg/', '').replace('dcid:', '');
      }
    });
    
    if (obs.dcid) {
      observations.push(obs);
    }
  });

  return observations;
}

export function observationToFormats(observation) {
  // MCF Format
  const mcfFormat = `Node: dcid:${observation.dcid}
typeOf: dcs:StatVarObservation
variableMeasured: dcid:undata/sdg/${observation.variable}
observationAbout: dcid:country/${observation.geography}
observationDate: "${observation.date}"
value: ${observation.value}
unit: dcid:undata/sdg/${observation.unit || 'PERCENT'}`;

  // .STAT Format (SDMX-JSON 2.0 structure)
  const statFormat = {
    meta: {
      id: "SDG_DATA",
      prepared: new Date().toISOString(),
      sender: { id: "UNSD" }
    },
    data: {
      dataSets: [{
        series: {
          "0:0:0": {
            observations: {
              "0": [observation.value]
            },
            attributes: [0, 0]
          }
        }
      }],
      structure: {
        dimensions: {
          series: [
            { id: "SERIES", name: "Indicator", values: [{ id: observation.variable }] },
            { id: "GEO_PICT", name: "Geography", values: [{ id: observation.geography }] },
            { id: "TIME_PERIOD", name: "Time", values: [{ id: observation.date }] }
          ]
        }
      }
    }
  };

  // DataCommons Format
  const datacommonsFormat = {
    dcid: `country/${observation.geography}`,
    variable: `undata/sdg/${observation.variable}`,
    observations: [{
      date: observation.date,
      value: observation.value,
      unit: observation.unit || "PERCENT"
    }]
  };

  // Cached Format (UN Data website optimized)
  const cachedFormat = {
    id: observation.dcid,
    indicator: {
      code: observation.variable,
      name: "Proportion of population below international poverty line"
    },
    geography: {
      code: observation.geography,
      name: observation.geography
    },
    timePeriod: observation.date,
    value: observation.value,
    unit: observation.unit || "PERCENT",
    source: "World Bank",
    lastUpdated: new Date().toISOString()
  };

  return {
    mcf: mcfFormat,
    stat: statFormat,
    datacommons: datacommonsFormat,
    cached: cachedFormat
  };
}

