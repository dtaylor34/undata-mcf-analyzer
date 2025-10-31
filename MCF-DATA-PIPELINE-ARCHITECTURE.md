# MCF Data Pipeline Architecture

## Executive Summary

This document outlines the recommended approach for transforming **MCF (Master Catalog Format)** files into various data representations used across the UN Data Commons ecosystem. MCF serves as the **single source of truth**, ensuring consistency, maintainability, and scalability as the system grows.

---

## Table of Contents

1. [Why MCF as Source of Truth](#why-mcf-as-source-of-truth)
2. [Data Transformation Pipeline](#data-transformation-pipeline)
3. [Format-Specific Transformations](#format-specific-transformations)
4. [Robustness & Future-Proofing](#robustness--future-proofing)
5. [Implementation Guidelines](#implementation-guidelines)

---

## Why MCF as Source of Truth

### Core Principles

**MCF (Master Catalog Format)** is a structured, human-readable format developed by Google's Data Commons project that represents statistical data, metadata, and relationships in a consistent way.

### Benefits of MCF-First Architecture

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | All data originates from MCF files, eliminating synchronization issues between formats |
| **Rich Metadata** | MCF includes comprehensive metadata (units, measurement methods, descriptions) that other formats may lack |
| **Version Control Friendly** | Text-based format works seamlessly with Git for tracking changes |
| **Schema Validation** | MCF follows Data Commons schema, providing built-in validation |
| **Future-Proof** | As Data Commons evolves, MCF files automatically benefit from new features |
| **Interoperability** | MCF is the lingua franca between UN organizations (ILO, WHO, UNICEF, SDG) |

---

## Data Transformation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCF FILES                                 │
│                   (Source of Truth)                              │
│                                                                  │
│  • Statistical Variables (metadata)                             │
│  • Observations (data points)                                   │
│  • Entities (geographic/demographic)                            │
│  • Relationships & Properties                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   MCF Parser & Analyzer       │
         │   (mcf-parser.js)             │
         │                               │
         │  1. Parse MCF syntax          │
         │  2. Extract metadata          │
         │  3. Extract observations      │
         │  4. Build relationships       │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────┐              ┌────────────────┐
│  Rich Chart    │              │   Normalized   │
│  Data Objects  │              │   Data Model   │
│                │              │                │
│ • dcid         │              │ • variables    │
│ • title        │              │ • observations │
│ • description  │              │ • entities     │
│ • unit         │              │ • metadata     │
│ • dateRange    │              └────────┬───────┘
│ • entities     │                       │
│ • observations │                       │
└────────┬───────┘                       │
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FORMAT TRANSFORMERS                           │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│             │             │             │                      │
│   .STAT     │ DataCommons │   Cached    │   YAML / JSON /     │
│   Format    │    API      │  Version    │   Formatted View    │
│             │             │             │                      │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
         │             │             │              │
         ▼             ▼             ▼              ▼
    ┌────────┐   ┌──────────┐  ┌─────────┐   ┌──────────┐
    │ .STAT  │   │   DC     │  │ Cached  │   │  UI      │
    │ Server │   │   API    │  │ Server  │   │  Views   │
    └────────┘   └──────────┘  └─────────┘   └──────────┘
```

---

## Format-Specific Transformations

### 1. MCF → Raw/Formatted View

**Purpose:** Display the original MCF content in human-readable format

#### Transformation Approach
```javascript
// Direct display with formatting
function formatMCF(mcfContent) {
  const nodes = parseMCF(mcfContent);
  return nodes.map(node => {
    return `Node: ${node.dcid}
typeOf: ${node.typeOf}
${Object.entries(node)
  .filter(([key]) => !['dcid', 'typeOf'].includes(key))
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
`;
  }).join('\n\n');
}
```

#### Why This Approach
- ✅ **Zero Data Loss** - Shows exact content from source
- ✅ **Debugging** - Easy to spot issues in source data
- ✅ **Educational** - Helps users understand MCF structure
- ✅ **Copy-Paste Ready** - Can be copied directly for ETL work

#### Robustness
- No transformation = No transformation errors
- Always in sync with source
- Version control diffs show exactly what changed

---

### 2. MCF → YAML View

**Purpose:** Present MCF data in YAML format for easier editing and integration with YAML-based tools

#### Transformation Approach
```javascript
function mcfToYAML(mcfContent) {
  const nodes = parseMCF(mcfContent);
  
  return nodes.map(node => {
    // Group by node type
    const yaml = {
      dcid: node.dcid,
      typeOf: node.typeOf,
      properties: {}
    };
    
    // Extract all properties
    Object.entries(node).forEach(([key, value]) => {
      if (!['dcid', 'typeOf'].includes(key)) {
        yaml.properties[key] = value;
      }
    });
    
    return jsyaml.dump(yaml);
  }).join('\n---\n\n');
}
```

#### Why This Approach
- ✅ **Structured Format** - Easier to read hierarchical data
- ✅ **Tool Integration** - Many config tools use YAML
- ✅ **Comment Support** - YAML allows inline comments
- ✅ **Type Preservation** - Numbers, dates, arrays handled natively

#### Robustness
- One-way lossless transformation
- Reversible (YAML → MCF)
- Schema validation available
- Industry-standard format

---

### 3. MCF → .STAT Format

**Purpose:** Transform MCF data into SDMX-compliant .STAT format for statistical analysis tools

#### Transformation Approach
```javascript
function mcfToSTAT(mcfContent) {
  const nodes = parseMCF(mcfContent);
  const statVars = extractStatisticalVariables(nodes);
  const observations = extractObservations(nodes);
  
  // Build SDMX structure
  const sdmxStructure = {
    dataStructure: {
      dimensions: extractDimensions(statVars, observations),
      measures: extractMeasures(statVars),
      attributes: extractAttributes(statVars)
    },
    dataSet: {
      series: buildSeriesFromObservations(observations)
    }
  };
  
  return sdmxStructure;
}

function extractDimensions(statVars, observations) {
  // Extract unique dimensions from observations
  const dimensions = new Set();
  
  observations.forEach(obs => {
    if (obs.observationAbout) dimensions.add('REF_AREA'); // Geographic
    if (obs.observationDate) dimensions.add('TIME_PERIOD'); // Temporal
  });
  
  statVars.forEach(v => {
    if (v.populationType) dimensions.add('POPULATION');
    if (v.measuredProperty) dimensions.add('INDICATOR');
  });
  
  return Array.from(dimensions).map(dim => ({
    id: dim,
    values: extractValuesForDimension(dim, observations, statVars)
  }));
}
```

#### Why This Approach
- ✅ **SDMX Compliance** - Follows international statistical standards
- ✅ **Dimension Extraction** - Automatically detects dimensions from MCF metadata
- ✅ **Backward Compatible** - Works with existing .STAT infrastructure
- ✅ **Attribute Preservation** - Maintains measurement methods, units, etc.

#### Robustness
- **Metadata Rich**: MCF includes all fields needed for SDMX
- **Auto-Discovery**: Dimensions discovered from data structure, not hardcoded
- **Validation**: Can validate against SDMX schemas
- **Future Data**: New indicators automatically get correct dimensions

#### API Integration
```javascript
// Use transformed data with .STAT API
const statData = mcfToSTAT(mcfContent);
const apiUrl = `https://de-undata-dst.dev.officialstatistics.org/vis?` +
  `df[id]=${statData.indicatorId}&` +
  `df[ag]=UNDATA&` +
  `df[vs]=1.0&` +
  `dq=${statData.dimensions.join('.')}`;
```

---

### 4. MCF → DataCommons API Format

**Purpose:** Transform MCF into format compatible with Google's Data Commons API

#### Transformation Approach
```javascript
function mcfToDataCommons(mcfContent) {
  const nodes = parseMCF(mcfContent);
  const statVars = extractStatisticalVariables(nodes);
  const observations = extractObservations(nodes);
  
  // Build Data Commons observation format
  return {
    variables: statVars.map(v => ({
      dcid: v.dcid,
      name: v.name,
      description: v.description,
      populationType: v.populationType,
      measuredProperty: v.measuredProperty,
      statType: v.statType,
      measurementMethod: v.measurementMethod
    })),
    
    observations: observations.map(obs => ({
      variable: obs.variable,
      entity: obs.about,
      date: obs.date,
      value: obs.value,
      measurementMethod: obs.measurementMethod,
      unit: obs.unit,
      scalingFactor: obs.scalingFactor
    })),
    
    // Data Commons API query format
    apiQueries: statVars.map(v => ({
      entity: observations.find(o => o.variable === v.dcid)?.about || 'Earth',
      variable: v.dcid,
      query: `/api/observations/point?entities=${observations.find(o => o.variable === v.dcid)?.about}&variables=${v.dcid}`
    }))
  };
}
```

#### Why This Approach
- ✅ **Native Format** - MCF is Data Commons' native format
- ✅ **Direct Mapping** - 1:1 relationship between MCF nodes and DC entities
- ✅ **Schema Aligned** - Uses same schema as Data Commons Knowledge Graph
- ✅ **API Ready** - Can generate API queries directly from metadata

#### Robustness
- **Semantic Preservation**: All relationships and semantics maintained
- **Type Safety**: DC schema validates data types
- **Graph Ready**: Can be ingested into DC Knowledge Graph
- **Query Generation**: Automatically generates correct API queries

#### API Integration
```javascript
const dcData = mcfToDataCommons(mcfContent);

// Query Data Commons API
dcData.apiQueries.forEach(async (query) => {
  const response = await fetch(
    `https://api.datacommons.org${query.query}`
  );
  const liveData = await response.json();
  // Compare with MCF data for validation
});
```

---

### 5. MCF → Cached Version

**Purpose:** Generate cached, optimized version for fast frontend display

#### Transformation Approach
```javascript
function mcfToCached(mcfContent, orgContext) {
  const parsed = parseAndAnalyzeMCF(mcfContent);
  
  // Build optimized cache structure
  return {
    metadata: {
      cacheVersion: '2.0',
      generatedAt: new Date().toISOString(),
      sourceHash: hashMCFContent(mcfContent),
      organization: orgContext.id,
      datasetId: parsed.statisticalVariables[0]?.dcid
    },
    
    // Pre-computed chart configurations
    charts: parsed.chartData.map(chart => ({
      id: chart.dcid,
      title: chart.title,
      description: chart.description,
      config: {
        type: chart.chartType,
        xAxis: chart.hasTimeSeries ? 'date' : 'entity',
        yAxis: 'value',
        unit: chart.unit
      },
      data: chart.data,
      
      // Pre-computed aggregations for quick stats
      stats: {
        min: Math.min(...chart.data.map(d => d.value)),
        max: Math.max(...chart.data.map(d => d.value)),
        avg: chart.data.reduce((sum, d) => sum + d.value, 0) / chart.data.length,
        count: chart.observationCount
      }
    })),
    
    // Searchable index
    searchIndex: buildSearchIndex(parsed),
    
    // API endpoint hints
    apiEndpoints: {
      stat: generateStatAPIUrl(parsed, orgContext),
      datacommons: generateDCUrl(parsed),
      raw: generateRawMCFUrl(orgContext)
    }
  };
}
```

#### Why This Approach
- ✅ **Performance** - Pre-computed aggregations eliminate runtime calculations
- ✅ **Optimized Size** - Only includes data needed for visualization
- ✅ **Search Ready** - Includes pre-built search index
- ✅ **API Hints** - Provides URLs for fetching fresh data

#### Robustness
- **Cache Invalidation**: Source hash detects when MCF changes
- **Version Control**: Cache version allows migration strategies
- **Fallback**: Always links back to source MCF
- **Incremental Updates**: Only regenerate when source changes

#### Integration with Staging Server
```javascript
// Upload to staging server
const cachedData = mcfToCached(mcfContent, orgContext);
const stagingUrl = `https://staging.undatacommons.dev/cache/${orgContext.id}/${cachedData.metadata.datasetId}`;

await fetch(stagingUrl, {
  method: 'PUT',
  body: JSON.stringify(cachedData),
  headers: { 'Content-Type': 'application/json' }
});
```

---

### 6. MCF → Chart Visualization

**Purpose:** Generate interactive charts with full metadata for UI display

#### Transformation Approach
```javascript
function mcfToChartData(mcfContent) {
  const nodes = parseMCF(mcfContent);
  const statisticalVariables = extractStatisticalVariables(nodes);
  const observations = extractObservations(nodes);
  
  // Enhanced transformation with full metadata
  return observationsToChartData(observations, statisticalVariables)
    .map(chart => ({
      // Identification
      id: chart.dcid,
      dcid: chart.dcid,
      title: chart.title,
      
      // Rich metadata from StatisticalVariable
      description: chart.description,
      populationType: chart.populationType,
      measuredProperty: chart.measuredProperty,
      statType: chart.statType,
      measurementMethod: chart.measurementMethod,
      unit: chart.unit,
      
      // Data structure
      data: chart.data.map(point => ({
        name: point.date || point.entity,
        value: point.value,
        label: point.date || point.entity,
        entity: point.entity,
        date: point.date,
        unit: point.unit || chart.unit
      })),
      
      // Computed properties
      entities: chart.entities,
      dateRange: chart.dateRange,
      observationCount: chart.observationCount,
      
      // Visualization hints
      chartType: chart.chartType, // 'timeSeries', 'bar', 'table'
      hasMultipleEntities: chart.hasMultipleEntities,
      hasTimeSeries: chart.hasTimeSeries,
      
      // API links for live data comparison
      apiLinks: {
        datacommons: `https://datacommons.org/tools/visualization#v=${chart.dcid}`,
        stat: generateStatLink(chart),
        cached: generateCachedLink(chart)
      }
    }));
}
```

#### Why This Approach
- ✅ **Metadata Driven** - Chart properties derived from data, not hardcoded
- ✅ **Type Detection** - Automatically determines best chart type
- ✅ **Entity Aware** - Handles single or multiple entities gracefully
- ✅ **Time Series Support** - Detects and optimizes for temporal data
- ✅ **Unit Display** - Shows units on tooltips and axes

#### Robustness
- **Flexible Schema**: Works with any statistical variable structure
- **Missing Data**: Gracefully handles incomplete observations
- **Multi-Chart**: Automatically splits multiple variables into separate charts
- **Metadata Fallbacks**: Uses sensible defaults when metadata missing

---

## Robustness & Future-Proofing

### Design Principles for Robustness

#### 1. **Loose Coupling**
```
MCF Files → Parser → Normalized Model → Format Transformers → Output
```
- Each stage is independent
- Changes to output formats don't affect parser
- New formats can be added without modifying existing code

#### 2. **Metadata-Driven Processing**
```javascript
// Instead of hardcoded dimensions
const dimensions = ['TIME_PERIOD', 'REF_AREA', 'INDICATOR']; // ❌ Brittle

// Use metadata discovery
const dimensions = discoverDimensions(observations); // ✅ Robust
```

#### 3. **Schema Validation**
```javascript
function validateMCF(mcfContent) {
  const nodes = parseMCF(mcfContent);
  
  // Validate against Data Commons schema
  return nodes.map(node => ({
    node: node.dcid,
    valid: validateAgainstSchema(node),
    errors: getValidationErrors(node),
    warnings: getValidationWarnings(node)
  }));
}
```

### Handling Future Data

#### Scenario 1: New Organization Added
```javascript
// Current: ILO, WHO, UNICEF, SDG
// Future: FAO, UNESCO, etc.

// No code changes needed - just add MCF files
// System automatically:
// 1. Parses new MCF structure
// 2. Discovers dimensions and entities
// 3. Generates appropriate visualizations
// 4. Creates API queries
```

#### Scenario 2: New Data Types/Fields
```javascript
// MCF might add new fields in future
Node: dcid:NewIndicator
typeOf: dcs:StatisticalVariable
confidenceInterval: "±2.5%"  // New field
spatialResolution: "Admin Level 2"  // New field

// Parser handles gracefully:
const node = parseMCF(content); // Includes all fields
// Transformers use what they need, ignore rest
```

#### Scenario 3: Schema Evolution
```javascript
// Data Commons schema v2.0 might have new node types
// Solution: Generic parser + type-specific handlers

function handleNode(node) {
  const handler = nodeHandlers[node.typeOf] || genericHandler;
  return handler(node);
}

// Add new handler without breaking existing code
nodeHandlers['dcs:NewType'] = (node) => { /* ... */ };
```

### Backward Compatibility Strategy

#### Version Detection
```javascript
function detectMCFVersion(mcfContent) {
  // Check for version-specific syntax
  if (mcfContent.includes('schemaVersion:')) {
    return parseSemVer(extractVersion(mcfContent));
  }
  return { major: 1, minor: 0, patch: 0 }; // Default
}

function parseMCF(mcfContent) {
  const version = detectMCFVersion(mcfContent);
  const parser = getParserForVersion(version);
  return parser(mcfContent);
}
```

#### Migration Helpers
```javascript
function migrateMCFv1ToV2(oldContent) {
  // Automatic migration for breaking changes
  return oldContent
    .replace(/observationAbout:/g, 'entity:')
    .replace(/variableMeasured:/g, 'variable:');
}
```

---

## Implementation Guidelines

### Phase 1: Core Parser (✅ Complete)
- [x] MCF syntax parser
- [x] Statistical variable extraction
- [x] Observation extraction
- [x] Metadata aggregation
- [x] Chart data generation

### Phase 2: Format Transformers (🚧 In Progress)
- [x] Formatted/Raw view
- [x] YAML view
- [x] Chart visualization
- [ ] .STAT transformer
- [ ] DataCommons API formatter
- [ ] Cached version generator

### Phase 3: API Integration (📋 Planned)
- [ ] .STAT API client
- [ ] DataCommons API client
- [ ] Cached data uploader
- [ ] Live data comparison tool

### Phase 4: Validation & Testing (📋 Planned)
- [ ] Schema validator
- [ ] Transformation validators
- [ ] Round-trip tests (MCF → Format → MCF)
- [ ] Performance benchmarks

---

## Code Organization

### Recommended File Structure
```
src/
├── mcf-parser.js              # Core MCF parser
├── mcf-transformers/
│   ├── to-stat.js            # MCF → .STAT
│   ├── to-datacommons.js     # MCF → DataCommons
│   ├── to-cached.js          # MCF → Cached JSON
│   ├── to-yaml.js            # MCF → YAML
│   └── to-chart.js           # MCF → Chart data
├── api-clients/
│   ├── stat-client.js        # .STAT API integration
│   ├── datacommons-client.js # DC API integration
│   └── cache-client.js       # Staging cache API
├── validators/
│   ├── mcf-validator.js      # MCF schema validation
│   └── transform-validator.js # Output validation
└── utils/
    ├── dimension-discovery.js # Auto-discover dimensions
    ├── metadata-extractor.js  # Generic metadata tools
    └── chart-type-detector.js # Determine best chart type
```

---

## Performance Considerations

### Optimization Strategies

#### 1. **Lazy Parsing**
```javascript
// Don't parse entire file if only metadata needed
function getMetadataOnly(mcfContent) {
  // Only parse until first Observation node
  const lines = mcfContent.split('\n');
  const metadataNodes = [];
  
  for (const line of lines) {
    if (line.includes('StatVarObservation')) break;
    metadataNodes.push(line);
  }
  
  return parseMCF(metadataNodes.join('\n'));
}
```

#### 2. **Streaming for Large Files**
```javascript
async function* parseMCFStream(fileHandle) {
  let currentNode = '';
  
  for await (const line of fileHandle.readLines()) {
    if (line.startsWith('Node:')) {
      if (currentNode) yield parseNode(currentNode);
      currentNode = line;
    } else {
      currentNode += '\n' + line;
    }
  }
  
  if (currentNode) yield parseNode(currentNode);
}
```

#### 3. **Caching Strategy**
```javascript
const parserCache = new Map();

function parseMCFWithCache(mcfContent) {
  const hash = hashContent(mcfContent);
  
  if (parserCache.has(hash)) {
    return parserCache.get(hash);
  }
  
  const result = parseMCF(mcfContent);
  parserCache.set(hash, result);
  return result;
}
```

---

## Testing Strategy

### Unit Tests
```javascript
describe('MCF Parser', () => {
  it('should parse statistical variables', () => {
    const mcf = `Node: dcid:Test
typeOf: dcs:StatisticalVariable
name: "Test Variable"
unit: "Percentage"`;
    
    const result = parseMCF(mcf);
    expect(result[0].unit).toBe('Percentage');
  });
});
```

### Integration Tests
```javascript
describe('MCF to .STAT transformation', () => {
  it('should generate valid SDMX structure', async () => {
    const mcf = await loadTestMCF('ilo/employment.mcf');
    const stat = mcfToSTAT(mcf);
    
    expect(stat.dataStructure.dimensions).toBeDefined();
    expect(validateSDMX(stat)).toBe(true);
  });
});
```

### Round-Trip Tests
```javascript
describe('Format transformations', () => {
  it('should preserve data in round-trip', () => {
    const original = loadMCF('test.mcf');
    const yaml = mcfToYAML(original);
    const restored = yamlToMCF(yaml);
    
    expect(restored).toEqual(original);
  });
});
```

---

## Conclusion

### Key Takeaways

1. **MCF as Foundation**: Using MCF as the single source of truth provides:
   - Consistency across all output formats
   - Rich metadata for all transformations
   - Future-proof architecture
   - Version control and collaboration

2. **Metadata-Driven**: All transformations are driven by metadata, not hardcoded assumptions:
   - Dimensions discovered from data structure
   - Chart types detected automatically
   - API queries generated from metadata

3. **Extensible Design**: New formats and APIs can be added without modifying core parser:
   - Transformer pattern for flexibility
   - Validation at each stage
   - Caching for performance

4. **Production Ready**: This architecture aligns with your existing infrastructure:
   - .STAT API integration ready
   - DataCommons API compatible
   - Staging cache structure defined

### Next Steps

1. **Implement remaining transformers** (.STAT, DataCommons, Cached)
2. **Add API client integrations** for live data comparison
3. **Build validation suite** to ensure data quality
4. **Performance optimization** for large MCF files
5. **Documentation and examples** for each transformation

---

## Appendix: Example Transformations

### Example MCF Input
```
Node: dcid:SI_POV_DAY1
typeOf: dcs:StatisticalVariable
name: "Proportion of population below international poverty line"
description: "Percentage of population living on less than $2.15 per day"
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
unit: "Percentage"
measurementMethod: "HouseholdSurvey"

Node: dcid:SI_POV_DAY1_OBS_001
typeOf: dcs:StatVarObservation
variableMeasured: dcid:SI_POV_DAY1
observationAbout: dcid:Earth
observationDate: "2015"
value: 10.1
unit: "Percentage"

Node: dcid:SI_POV_DAY1_OBS_002
typeOf: dcs:StatVarObservation
variableMeasured: dcid:SI_POV_DAY1
observationAbout: dcid:Earth
observationDate: "2020"
value: 8.4
unit: "Percentage"
```

### Example .STAT Output
```json
{
  "dataStructure": {
    "dimensions": [
      {
        "id": "INDICATOR",
        "values": ["SI_POV_DAY1"]
      },
      {
        "id": "REF_AREA",
        "values": ["Earth"]
      },
      {
        "id": "TIME_PERIOD",
        "values": ["2015", "2020"]
      }
    ],
    "measures": [
      {
        "id": "OBS_VALUE",
        "unit": "Percentage"
      }
    ]
  },
  "dataSets": [
    {
      "series": {
        "0:0:0": [10.1],
        "0:0:1": [8.4]
      }
    }
  ]
}
```

### Example DataCommons Output
```json
{
  "variables": [
    {
      "dcid": "dcid:SI_POV_DAY1",
      "name": "Proportion of population below international poverty line",
      "description": "Percentage of population living on less than $2.15 per day",
      "populationType": "Person",
      "measuredProperty": "count",
      "statType": "measuredValue"
    }
  ],
  "observations": [
    {
      "variable": "dcid:SI_POV_DAY1",
      "entity": "dcid:Earth",
      "date": "2015",
      "value": 10.1,
      "unit": "Percentage"
    },
    {
      "variable": "dcid:SI_POV_DAY1",
      "entity": "dcid:Earth",
      "date": "2020",
      "value": 8.4,
      "unit": "Percentage"
    }
  ]
}
```

### Example Chart Output
```json
{
  "id": "dcid:SI_POV_DAY1",
  "title": "Proportion of population below international poverty line",
  "description": "Percentage of population living on less than $2.15 per day",
  "unit": "Percentage",
  "chartType": "timeSeries",
  "dateRange": {
    "start": "2015",
    "end": "2020"
  },
  "data": [
    {
      "name": "2015",
      "value": 10.1,
      "date": "2015",
      "entity": "dcid:Earth",
      "unit": "Percentage"
    },
    {
      "name": "2020",
      "value": 8.4,
      "date": "2020",
      "entity": "dcid:Earth",
      "unit": "Percentage"
    }
  ],
  "observationCount": 2
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-31  
**Author:** UN Data Commons Development Team  
**Status:** Living Document - Updates as system evolves

