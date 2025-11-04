/**
 * FILE: src/utils/transformation-blueprints.js
 * PURPOSE: Define transformation rules and blueprints for converting MCF to different formats
 * 
 * These blueprints explain HOW we convert MCF to .STAT, DataCommons, and Cached formats
 */

export const MCF_STRUCTURE_BLUEPRINT = {
  title: "MCF (Master Catalog Format) Structure",
  description: "The source of truth for all statistical data. Defines variables and observations.",
  structure: {
    "StatisticalVariable": {
      description: "Defines what is being measured",
      requiredFields: ["typeOf", "populationType", "measuredProperty", "statType", "name"],
      example: `Node: dcid:Count_Person_Employed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
name: "Employment Rate"`
    },
    "StatVarObservation": {
      description: "A single data point measurement",
      requiredFields: ["typeOf", "variableMeasured", "observationAbout", "observationDate", "value", "unit"],
      example: `Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent`
    }
  },
  keyPrinciples: [
    "Each Node represents a distinct entity (variable or observation)",
    "DCID (Data Commons ID) provides unique identification",
    "Type system ensures proper classification",
    "Properties link observations to variables and locations"
  ]
};

export const MCF_TO_STAT_BLUEPRINT = {
  title: "MCF → .STAT (SDMX-JSON 2.0) Transformation",
  description: "Converts MCF to SDMX-JSON 2.0 format for UN .Stat Suite compatibility",
  transformationRules: [
    {
      step: 1,
      rule: "Parse MCF nodes into variables and observations",
      logic: "Separate by typeOf: StatisticalVariable vs StatVarObservation"
    },
    {
      step: 2,
      rule: "Build SDMX metadata structure",
      mapping: {
        "organization": "→ meta.sender.id",
        "versionId": "→ meta.id",
        "timestamp": "→ meta.prepared"
      }
    },
    {
      step: 3,
      rule: "Define SDMX dimensions",
      dimensions: [
        "INDICATOR (from variableMeasured)",
        "LOCATION (from observationAbout)",
        "TIME_PERIOD (from observationDate)"
      ]
    },
    {
      step: 4,
      rule: "Convert observations to SDMX format",
      mapping: {
        "value": "→ observations[key][0]",
        "unit": "→ observations[key][1].UNIT_MEASURE",
        "status": "→ observations[key][2].OBS_STATUS (default: A)"
      }
    }
  ],
  exampleTransformation: {
    mcfInput: `Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent`,
    sdmxOutput: `{
  "meta": {
    "schema": "https://sdmx.org/...",
    "id": "version-id",
    "sender": { "id": "ilo" }
  },
  "data": {
    "observations": {
      "0:0:0": [
        45.2,
        { "id": "UNIT_MEASURE", "value": "Percent" },
        { "id": "OBS_STATUS", "value": "A" }
      ]
    }
  }
}`
  }
};

export const MCF_TO_DATACOMMONS_BLUEPRINT = {
  title: "MCF → DataCommons JSON Transformation",
  description: "Converts MCF to Google DataCommons JSON format using Schema.org vocabulary",
  transformationRules: [
    {
      step: 1,
      rule: "Parse MCF nodes into variables and observations",
      logic: "Separate by typeOf: StatisticalVariable vs StatVarObservation"
    },
    {
      step: 2,
      rule: "Build Schema.org Dataset wrapper",
      mapping: {
        "organization + versionId": "→ @type: Dataset, name",
        "timestamp": "→ datePublished",
        "observations": "→ temporalCoverage, spatialCoverage"
      }
    },
    {
      step: 3,
      rule: "Convert variables to Schema.org format",
      mapping: {
        "dcid": "→ @id",
        "name": "→ name",
        "populationType": "→ populationType",
        "measuredProperty": "→ measuredProperty",
        "statType": "→ statType"
      }
    },
    {
      step: 4,
      rule: "Convert observations with provenance",
      mapping: {
        "variableMeasured": "→ variableMeasured",
        "observationAbout": "→ observationAbout { @type: Place }",
        "observationDate": "→ observationDate, observationPeriod",
        "value + unit": "→ value, unit",
        "organization": "→ provenance { @type: Organization }"
      }
    }
  ],
  exampleTransformation: {
    mcfInput: `Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent`,
    datacommonsOutput: `{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "observations": [{
    "@type": "StatVarObservation",
    "variableMeasured": "Count_Person_Employed",
    "observationAbout": {
      "@type": "Place",
      "@id": "country/AFG",
      "name": "Afghanistan"
    },
    "observationDate": "2024",
    "value": 45.2,
    "unit": "PERCENT",
    "provenance": {
      "@type": "Organization",
      "name": "ILO"
    }
  }]
}`
  }
};

export const MCF_TO_CACHED_BLUEPRINT = {
  title: "MCF → UN Data Cached JSON Transformation",
  description: "Converts MCF to optimized cached JSON files organized by Location, Theme, SDG, and Partner",
  transformationRules: [
    {
      step: 1,
      rule: "Parse MCF and extract key entities",
      logic: "Extract variables, observations, locations, themes from MCF nodes"
    },
    {
      step: 2,
      rule: "Generate Location-based cache files",
      structure: "One JSON file per location (e.g., cache/locations/AFG.json)",
      content: "All indicators for that location with timeseries data"
    },
    {
      step: 3,
      rule: "Generate Theme-based cache files",
      structure: "One JSON file per theme (e.g., cache/themes/employment.json)",
      content: "All locations and timeseries for indicators in that theme"
    },
    {
      step: 4,
      rule: "Generate SDG-based cache files",
      structure: "One JSON file per SDG goal (e.g., cache/sdgs/8.json)",
      content: "All indicators mapped to that SDG goal"
    },
    {
      step: 5,
      rule: "Generate Partner-based cache files",
      structure: "One JSON file per partner (e.g., cache/partners/ilo.json)",
      content: "All data from that organization"
    }
  ],
  exampleTransformation: {
    mcfInput: `Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent`,
    cachedOutputs: {
      locationFile: {
        path: "cache/locations/AFG.json",
        content: `{
  "location": "AFG",
  "name": "Afghanistan",
  "data": [{
    "indicator": "Employment Rate",
    "value": 45.2,
    "year": "2024",
    "unit": "Percent",
    "source": "ILO"
  }]
}`
      },
      themeFile: {
        path: "cache/themes/employment.json",
        content: `{
  "theme": "employment",
  "indicators": [{
    "id": "employment_rate",
    "locations": ["AFG", "PAK"],
    "timeseries": {
      "2024": { "AFG": 45.2, "PAK": 51.3 }
    }
  }]
}`
      }
    }
  },
  performanceOptimization: [
    "Pre-computed aggregations for fast queries",
    "Denormalized structure reduces join operations",
    "Smaller file sizes enable client-side filtering",
    "Multiple index paths support different query patterns"
  ]
};

/**
 * Get all blueprints
 */
export function getAllBlueprints() {
  return {
    mcfStructure: MCF_STRUCTURE_BLUEPRINT,
    toStat: MCF_TO_STAT_BLUEPRINT,
    toDataCommons: MCF_TO_DATACOMMONS_BLUEPRINT,
    toCached: MCF_TO_CACHED_BLUEPRINT
  };
}

/**
 * Get blueprint for a specific format
 */
export function getBlueprint(format) {
  const blueprints = {
    'mcf': MCF_STRUCTURE_BLUEPRINT,
    'stat': MCF_TO_STAT_BLUEPRINT,
    'datacommons': MCF_TO_DATACOMMONS_BLUEPRINT,
    'cached': MCF_TO_CACHED_BLUEPRINT
  };
  
  return blueprints[format] || null;
}

