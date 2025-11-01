# Seamless 3-View Strategy
## Structured Approach for MCF, .STAT, DataCommons, and Cached Views

---

## 🎯 Design Goal

**Make it seamless** for users to view charts regardless of whether data is:
1. ✅ Already combined (sample-observations.mcf)
2. 🔗 Needs combining (sv.mcf + CSV files)
3. 📊 Coming from external API

---

## 🏗️ The 3 Data Scenarios

### Scenario A: Complete Files (Current - Works!)
```
User selects: sample-observations.mcf
    ↓
File has: Metadata + Observations
    ↓
All tabs: Charts show immediately ✅
```

**UI Behavior:**
- No additional selector needed
- Charts available in all tabs
- Filter shows "(2/2)"

---

### Scenario B: Schema Files (Current - No Charts)
```
User selects: sv.mcf (schema only)
    ↓
File has: Metadata only, NO observations
    ↓
All tabs: No charts, shows message ⚠️
```

**UI Behavior (Current):**
- Charts show "(0/0)"
- Message: "No observations found"

**UI Behavior (Proposed):**
- Show "Data Source" selector
- Offer CSV file options
- Allow combination

---

### Scenario C: External Data (Future)
```
User selects: sv.mcf + "Live API"
    ↓
Fetch from: DataCommons API / .STAT API
    ↓
All tabs: Charts show live data 🔄
```

---

## 🎨 Proposed UI Design

### File Selector Enhancement

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Organization: [🎯 SDG ▾]  File: [sv.mcf ▾]  Version: [...] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚠️ This file contains metadata only (no observations)        │
│                                                               │
│ 📊 Add Data Source:  [Select CSV File ▾]  [+ Add]           │
│                                                               │
│ Selected Data Sources:                                        │
│   ✓ WHO__Adult_curr_tob_use.csv (273 obs)       [✗ Remove]  │
│   ✓ WHO__MALARIA_EST_CASES.csv (189 obs)        [✗ Remove]  │
│                                                               │
│ 📈 Total: 2 variables × 462 observations = Charts available  │
└─────────────────────────────────────────────────────────────┘
```

### Smart Detection Badges

```
File Selector with Status Badges:

🎯 SDG
  ├─ 📄 sample-observations.mcf   [✅ Complete - 2 charts]
  ├─ 📋 sv.mcf                    [⚠️ Needs data]
  ├─ 📋 schema.mcf                [ℹ️ Schema only]
  └─ 📊 unit.mcf                  [ℹ️ Definitions]

🏥 WHO  
  ├─ 📄 sv.mcf                    [⚠️ Needs data → 522 CSV files available]
  └─ 📊 CSV Files (522)           [💾 Data available]
```

---

## 🔄 Seamless Flow for All Tabs

### Design Principle: **Same Logic, Different Display**

All 3 tabs (MCF, .STAT, DataCommons, Cached) follow this flow:

```javascript
// Universal data fetching
const getData = async (fileId, dataSources = []) => {
  // 1. Load primary file
  let content = await loadMCFFile(fileId);
  
  // 2. Check if needs combination
  const analysis = analyzeMCFContent(content);
  
  if (analysis.needsData && dataSources.length > 0) {
    // 3. Load and combine data sources
    for (const source of dataSources) {
      const observations = await loadDataSource(source);
      content = combineContent(content, observations);
    }
  }
  
  // 4. Parse combined content
  const nodes = parseMCF(content);
  const variables = extractStatisticalVariables(nodes);
  const observations = extractObservations(nodes);
  
  return { nodes, variables, observations, content };
};

// Then each tab transforms as needed:
// - MCF tab: Display content as-is
// - .STAT tab: Transform to SDMX JSON
// - DataCommons tab: Transform to DC JSON
// - Cached tab: Transform to optimized JSON

// But charts all use the same observations!
const chartData = observationsToChartData(observations, variables);
```

---

## 📊 Tab-Specific Behaviors

### MCF Tab
**Formatted View:**
```
Shows combined MCF:
  - Original schema nodes
  - + Added observation nodes from CSV
  - Clearly marked sections
```

**Chart View:**
```
Uses: Combined observations
Shows: All charts from combined data
```

### .STAT Tab
**Formatted View:**
```json
{
  "dataStructureDefinition": {
    "dimensions": ["INDICATOR", "REF_AREA", "TIME_PERIOD"],
    "measures": [{"id": "OBS_VALUE", "unit": "..."}]
  },
  "observations": [
    // From schema metadata + CSV data combined
  ]
}
```

**Chart View:**
```
Uses: Same observations as MCF tab
Shows: Same charts (data is identical)
Note: "These charts match .STAT API structure"
```

### DataCommons Tab
**Formatted View:**
```json
{
  "variables": [/* from schema */],
  "observations": [/* from CSV */],
  "metadata": {"source": "Combined from sv.mcf + CSV"}
}
```

**Chart View:**
```
Uses: Same observations
Shows: Same charts
Note: "These charts match DataCommons API format"
```

### Cached Tab
**Formatted View:**
```json
{
  "metadata": {"cacheVersion": "1.0", ...},
  "charts": [
    {
      "id": "...",
      "stats": {"min": X, "max": Y, "avg": Z},
      "data": [/* observations */]
    }
  ]
}
```

**Chart View:**
```
Uses: Pre-computed from cached format
Shows: Same charts (optimized display)
Note: "Pre-computed for fast loading"
```

---

## 🎯 Implementation Strategy

### Phase 1: Smart Detection (5 mins)
```javascript
// Auto-detect file status
function analyzeFile(mcfContent) {
  const nodes = parseMCF(mcfContent);
  const vars = extractStatisticalVariables(nodes);
  const obs = extractObservations(nodes);
  
  return {
    status: obs.length > 0 ? 'COMPLETE' : 'NEEDS_DATA',
    variableCount: vars.length,
    observationCount: obs.length,
    canGenerateCharts: obs.length > 0
  };
}
```

### Phase 2: Data Source Selector (15 mins)
```javascript
// Show selector when needed
{fileAnalysis.status === 'NEEDS_DATA' && (
  <DataSourceSelector 
    orgId={selectedOrg}
    availableSources={getAvailableCSVFiles(selectedOrg)}
    selectedSources={selectedDataSources}
    onSourcesChange={setSelectedDataSources}
  />
)}
```

### Phase 3: Combination Engine (10 mins)
```javascript
// Combine schema + data sources
async function combineFiles(schemaFileId, dataSources) {
  const schema = await loadMCFFile(schemaFileId);
  let combinedObservations = [];
  
  for (const source of dataSources) {
    const obs = await loadCSVAndConvert(source.csvFile);
    combinedObservations = [...combinedObservations, ...obs];
  }
  
  return combineSchemaAndObservations(schema, combinedObservations);
}
```

### Phase 4: Unified Rendering (Already done!)
All tabs already use the same chart generation:
```javascript
const chartData = observationsToChartData(observations, variables);
```

---

## 🎨 UI Components Needed

### 1. File Status Badge
```javascript
function FileStatusBadge({ fileAnalysis }) {
  if (fileAnalysis.canGenerateCharts) {
    return (
      <span className="text-green-500 text-xs">
        ✅ {fileAnalysis.observationCount} obs, {fileAnalysis.variableCount} vars
      </span>
    );
  }
  
  return (
    <span className="text-yellow-500 text-xs">
      ⚠️ Needs data ({fileAnalysis.variableCount} vars defined)
    </span>
  );
}
```

### 2. Data Source Selector
```javascript
function DataSourceSelector({ orgId, selectedSources, onSourcesChange }) {
  const availableSources = getAvailableCSVFiles(orgId);
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
      <p className="text-sm mb-2">
        ⚠️ This file needs data sources to generate charts
      </p>
      
      <Select onValueChange={(csv) => addSource(csv)}>
        <SelectTrigger>
          <SelectValue placeholder="Select CSV file..." />
        </SelectTrigger>
        <SelectContent>
          {availableSources.map(csv => (
            <SelectItem key={csv} value={csv}>
              📊 {csv}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedSources.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium mb-1">Selected:</p>
          {selectedSources.map(source => (
            <div key={source.id} className="flex items-center justify-between">
              <span className="text-xs">✓ {source.name}</span>
              <button onClick={() => removeSource(source.id)}>✗</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Combination Indicator
```javascript
function CombinationIndicator({ sources }) {
  if (sources.length === 0) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
      🔗 Combined view: Schema + {sources.length} data source(s)
    </div>
  );
}
```

---

## 🚀 User Experience Flow

### Example 1: Complete File (Current Behavior)
```
1. Select: SDG → sample-observations.mcf
2. See: Status badge "✅ 23 obs, 2 vars"
3. Go to: Any tab
4. Click: "Chart" button
5. See: 2 charts immediately
```

### Example 2: Schema File (Enhanced Behavior)
```
1. Select: WHO → sv.mcf
2. See: Status badge "⚠️ Needs data (50 vars defined)"
3. See: Data source selector appears
4. Select: WHO__Adult_curr_tob_use.csv
5. Click: [+ Add]
6. See: "🔗 Combined view: Schema + 1 data source"
7. Status updates to: "✅ 273 obs, 1 var"
8. Go to: Any tab
9. Click: "Chart" button
10. See: Charts from combined data!
```

### Example 3: Multiple Data Sources
```
1. Select: WHO → sv.mcf
2. Add: WHO__Adult_curr_tob_use.csv (273 obs)
3. Add: WHO__MALARIA_EST_CASES.csv (189 obs)
4. See: "✅ 462 obs, 2 vars → 2 charts available"
5. All tabs: Show combined data
6. Charts: Display both tobacco use + malaria data
```

---

## 🔄 State Management

### App State Structure
```javascript
const [selectedFileId, setSelectedFileId] = useState('');
const [selectedDataSources, setSelectedDataSources] = useState([]);
const [combinedContent, setCombinedContent] = useState('');
const [fileAnalysis, setFileAnalysis] = useState(null);

// When file or sources change, recombine
useEffect(() => {
  async function combine() {
    if (selectedFileId) {
      const content = await combineFiles(selectedFileId, selectedDataSources);
      setCombinedContent(content);
      
      const analysis = analyzeFile(content);
      setFileAnalysis(analysis);
    }
  }
  combine();
}, [selectedFileId, selectedDataSources]);
```

---

## 📋 Consistency Guarantees

### Principle: Same Data, Different Format

**All tabs use the exact same observations:**
```javascript
// Single source of truth
const { nodes, variables, observations } = parseAndAnalyzeMCF(combinedContent);

// MCF tab uses: combinedContent (raw)
// .STAT tab uses: transformToSTAT(observations, variables)
// DataCommons tab uses: transformToDC(observations, variables)
// Cached tab uses: transformToCached(observations, variables)

// But charts ALL use:
const chartData = observationsToChartData(observations, variables);
```

**Result:** Charts are **identical** across all tabs because they're derived from the same parsed observations.

---

## 🎯 Advantages of This Approach

### 1. **Explicit & Clear**
✅ Users see what's being combined
✅ Can add/remove data sources
✅ Status is always visible

### 2. **Flexible**
✅ Works with complete files (no UI change)
✅ Works with schema files (shows selector)
✅ Supports multiple data sources

### 3. **Consistent**
✅ All tabs show same charts
✅ Transformations are transparent
✅ Data lineage is clear

### 4. **Scalable**
✅ Easy to add more data sources
✅ Works with any organization
✅ Future-proof for API integration

---

## 🔍 Testing Strategy

### Test Case 1: Complete File
```
Input: sample-observations.mcf
Expected: No data selector shown, charts work immediately
Verify: All tabs show 2 charts
```

### Test Case 2: Schema + 1 CSV
```
Input: sv.mcf + WHO__Adult_curr_tob_use.csv
Expected: Data selector works, charts show after combination
Verify: All tabs show combined data, same charts
```

### Test Case 3: Schema + Multiple CSV
```
Input: sv.mcf + 2 CSV files
Expected: Multiple sources combine, charts aggregate
Verify: Chart count matches combined variables
```

### Test Case 4: Format Consistency
```
For each test case:
  MCF tab → Extract observations
  .STAT tab → Extract observations
  DataCommons tab → Extract observations
  Cached tab → Extract observations
  
Verify: All extract the SAME observations
Verify: All generate the SAME charts
```

---

## 🚀 Implementation Checklist

### Phase 1: Detection (30 mins)
- [ ] Add `analyzeFile()` function
- [ ] Show status badges in file selector
- [ ] Display observation/variable counts

### Phase 2: UI Components (1 hour)
- [ ] Create `DataSourceSelector` component
- [ ] Add CSV file listing for WHO
- [ ] Implement add/remove data source UI

### Phase 3: Combination (30 mins)
- [ ] Implement file combination logic
- [ ] Update state management
- [ ] Handle multiple data sources

### Phase 4: Testing (30 mins)
- [ ] Test complete files (no change)
- [ ] Test schema + CSV combination
- [ ] Verify consistency across all tabs

**Total Time: ~2.5 hours**

---

## 📊 Success Metrics

After implementation, users should be able to:
1. ✅ See which files have charts immediately
2. ✅ Combine schema files with CSV data
3. ✅ View charts in all tabs consistently
4. ✅ Understand where data comes from
5. ✅ Add/remove data sources easily

---

## 🎯 Next Steps

**Want me to implement this?**

I can start with Phase 1 (Detection + Status Badges) in the next 30 minutes, then progressively add the data source selector and combination logic.

This approach keeps everything seamless while giving users explicit control over data combinations!

