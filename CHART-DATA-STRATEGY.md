# Chart Data Strategy: From MCF to Charts Across All Variations

## Current State Analysis

### What You Have:
```
public/datacommons/
├── sdg/
│   ├── q1-2025/schema/
│   │   ├── sv.mcf (41,572 StatisticalVariables - METADATA only)
│   │   └── sdg.tmcf (Template for CSV conversion)
│   └── sample-observations.mcf (2 vars + 23 observations - ✅ HAS DATA)
├── who/
│   ├── schema/
│   │   └── sv.mcf (Metadata only)
│   └── csv/ (522 CSV files with observations - ✅ HAS DATA)
├── ilo/schema/sv.mcf (Metadata only)
└── unicef/schema/sv.mcf (Metadata only)
```

###

 Problem:
- **Schema files** have StatisticalVariables (metadata) but NO observations
- **Observations** are in separate CSV files
- **Charts need observations** to render

---

## Solution: 3 Approaches to Get Charts

### Approach 1: Use Sample Data (✅ IMPLEMENTED)
**Status:** Working now

**File:** `public/datacommons/sdg/sample-observations.mcf`
- Contains both metadata AND observations
- Shows 2 charts immediately
- Good for testing/demo

**How to use:**
1. Select: SDG → Sample Data (With Charts) → sample-observations.mcf
2. Click "Chart" in any tab
3. See 2 charts rendered

---

### Approach 2: Convert CSV → MCF Observations (🚧 READY TO IMPLEMENT)
**Status:** Converter created, needs integration

**Process:**
```
Schema MCF (metadata) + CSV File (data) 
    ↓
CSV-to-MCF Converter
    ↓
Combined MCF (metadata + observations)
    ↓
Charts!
```

**Implementation:**
1. **Parser created:** `src/csv-to-mcf-converter.js` ✅
2. **Need to integrate** into file loading:
   - Detect when file has no observations
   - Auto-load corresponding CSV
   - Combine and render charts

**Example for WHO:**
```javascript
// When user selects: WHO → sv.mcf
// App detects: No observations in sv.mcf
// App auto-loads: WHO__Adult_curr_tob_use.csv
// Converts: CSV → Observations
// Result: Charts rendered!
```

---

### Approach 3: Use Pre-Generated MCF Files (📋 FUTURE)
**Status:** Requires ETL pipeline

**Process:**
```
CSV Files + TMCF Templates
    ↓
ETL Pipeline (batch conversion)
    ↓
Complete MCF Files (metadata + observations)
    ↓
Store in public/datacommons/
    ↓
Charts work immediately!
```

**Advantages:**
- No runtime conversion needed
- Faster loading
- Pre-validated data

**How to implement:**
- Run batch conversion script
- Generate complete MCF files from CSV
- Replace schema-only files with complete files

---

## Chart Alignment Across 3 Variations

### The 3 Variations:
1. **.STAT Tab** - SDMX format with dimensions
2. **DataCommons Tab** - DC JSON format
3. **Cached Tab** - Optimized format with pre-computed stats

### Current Implementation: ✅ Aligned!

All 3 variations use the **SAME chart generation logic**:

```javascript
// ALL tabs follow this flow:
const nodes = parseMCF(mcfContent);
const statisticalVariables = extractStatisticalVariables(nodes);
const observations = extractObservations(nodes);
const chartData = observationsToChartData(observations, statisticalVariables);

// Then display with ChartPreview component
<ChartPreview data={chart} isDarkMode={isDarkMode} />
```

### Why This Works:

```
MCF File (Source)
    ↓
Parse → Extract Variables & Observations
    ↓
    ├→ .STAT View: Transform to SDMX JSON → Generate charts from same observations
    ├→ DataCommons View: Transform to DC JSON → Generate charts from same observations
    └→ Cached View: Transform to optimized JSON → Generate charts from same observations
```

**Key Insight:** The transformations only change the **display format** (SDMX vs DC JSON vs Cached), but charts are generated from the **same parsed observations**.

---

## Implementation Roadmap

### Phase 1: Sample Data (✅ COMPLETE)
- [x] Created `sample-observations.mcf` with real data
- [x] Placed in `public/datacommons/sdg/`
- [x] Charts work in all 3 tabs
- [x] Filter shows "(2/2)" with both charts selected

### Phase 2: CSV Integration (🚧 IN PROGRESS)
- [x] Create CSV parser (`csv-to-mcf-converter.js`)
- [ ] Update `loadMCFFile()` to detect schema-only files
- [ ] Auto-load corresponding CSV when needed
- [ ] Add UI indicator showing "Loading CSV data..."
- [ ] Cache converted observations for performance

### Phase 3: Multi-File Support (📋 PLANNED)
- [ ] Allow users to select multiple CSV files
- [ ] Combine observations from multiple sources
- [ ] Add CSV file picker in UI
- [ ] Show loading progress for large datasets

### Phase 4: ETL Pipeline (📋 FUTURE)
- [ ] Create batch conversion script
- [ ] Generate complete MCF files from CSV
- [ ] Set up automated pipeline
- [ ] Version control for generated files

---

## Code Examples

### Example 1: Load WHO Data with CSV

```javascript
// In App.js - Enhanced loadMCFFile function
async function loadMCFFile(fileId) {
  // 1. Load schema MCF
  const schemaContent = await fetch(`/datacommons/${fileId}`).then(r => r.text());
  
  // 2. Parse to check for observations
  const nodes = parseMCF(schemaContent);
  const observations = extractObservations(nodes);
  
  // 3. If no observations, load CSV
  if (observations.length === 0 && fileId.includes('who')) {
    console.log('📊 No observations found, loading CSV data...');
    
    // Load sample CSV
    const csvObs = await loadCSVAndConvert('WHO__Adult_curr_tob_use.csv');
    
    // Combine schema + observations
    const completeMCF = combineSchemaAndObservations(schemaContent, csvObs);
    return completeMCF;
  }
  
  return schemaContent;
}
```

### Example 2: Multi-Variable Charts

```javascript
// When MCF has multiple StatisticalVariables:
Node: dcid:SI_POV_DAY1 (Variable 1)
Node: dcid:SI_POV_NAHC (Variable 2)

// observationsToChartData automatically creates 2 charts:
const chartData = observationsToChartData(observations, statisticalVariables);
// Returns: [
//   { id: 'SI_POV_DAY1', title: '...', data: [...] },
//   { id: 'SI_POV_NAHC', title: '...', data: [...] }
// ]

// ChartFilter allows selecting which to display:
<ChartFilter 
  charts={chartData} 
  selectedCharts={selectedCharts}
  onSelectionChange={setSelectedCharts}
/>
```

### Example 3: Ensure Alignment Across Tabs

```javascript
// In each tab's Chart view:
const chartDataArray = useMemo(() => {
  const nodes = parseMCF(currentMCFContent);
  const vars = extractStatisticalVariables(nodes);
  const obs = extractObservations(nodes);
  return observationsToChartData(obs, vars);
}, [currentMCFContent]);

// This ensures ALL tabs use the SAME chart data
// Regardless of format transformation (.STAT, DC, Cached)
```

---

## Performance Considerations

### Caching Strategy

```javascript
// Cache converted CSV data
const csvCache = new Map();

async function loadCSVWithCache(csvFileName) {
  if (csvCache.has(csvFileName)) {
    console.log('✅ Using cached CSV data');
    return csvCache.get(csvFileName);
  }
  
  const observations = await loadCSVAndConvert(csvFileName);
  csvCache.set(csvFileName, observations);
  return observations;
}
```

### Lazy Loading

```javascript
// Only load CSV when Chart view is requested
{chartViewMode === 'chart' && (
  <AsyncChartLoader fileId={selectedFileId} />
)}
```

### Progress Indicators

```javascript
const [csvLoadingProgress, setCSVLoadingProgress] = useState(0);

// Show progress when loading large CSV files
{csvLoadingProgress > 0 && csvLoadingProgress < 100 && (
  <div className="text-sm text-muted-foreground">
    Loading CSV data: {csvLoadingProgress}%
  </div>
)}
```

---

## Validation & Testing

### How to Verify Charts Are Aligned

1. **Load same file in all 3 tabs**
2. **Switch to Chart view in each**
3. **Verify:**
   - Same number of charts in all tabs
   - Same chart titles
   - Same data points
   - Same metadata (units, date ranges, etc.)

### Test Cases

```javascript
// Test 1: Sample data
Load: SDG → Sample Data → sample-observations.mcf
Expected: 2 charts in ALL tabs (MCF, .STAT, DataCommons, Cached)

// Test 2: WHO with CSV
Load: WHO → sv.mcf
Expected: Charts from CSV file(s)

// Test 3: Multiple variables
Load: File with 5+ StatisticalVariables
Expected: 5+ charts available in filter
```

---

## Next Steps: What to Implement Now

### Immediate (Phase 2A):
1. **Update `loadMCFFile()` in App.js**
   - Detect schema-only files
   - Auto-load sample CSV for WHO
   - Display charts

### Short Term (Phase 2B):
2. **Add CSV Selector to UI**
   - Dropdown to select CSV file
   - Show available CSV files for org
   - Load selected CSV data

### Medium Term (Phase 3):
3. **Multi-CSV Support**
   - Combine observations from multiple CSV files
   - Show aggregate charts
   - Filter by source CSV

---

## FAQ

**Q: Why don't I see charts for SDG/ILO/UNICEF?**
A: Their MCF files only have metadata (StatisticalVariables), no observations. You need to either:
- Add observations to the MCF files
- Link CSV files with observations
- Create sample-observations.mcf files like SDG

**Q: How do I ensure charts are the same across .STAT, DataCommons, and Cached?**
A: All three tabs use the same `observationsToChartData()` function. They only differ in how they **display the format** (SDMX JSON vs DC JSON vs Cached JSON), but the charts are generated from the **same parsed observations**.

**Q: Can I have different charts in different tabs?**
A: No - by design, all tabs should show the same charts because they're derived from the same MCF source. This ensures consistency and validates that transformations are correct.

**Q: How many charts will I see?**
A: One chart per unique StatisticalVariable that has observations. The filter lets you select which ones to display.

**Q: What if I have 1000+ observations?**
A: The chart will aggregate and display them. You can:
- Use the filter to focus on specific variables
- Implement pagination/grouping
- Pre-aggregate in the Cached format

---

## Conclusion

**Current Status:**
- ✅ Sample data works perfectly (2 charts)
- ✅ Charts are aligned across all 3 tabs
- ✅ Architecture is sound (MCF as source of truth)
- 🚧 CSV integration ready, needs final connection
- 📋 Full WHO/SDG/ILO/UNICEF data pending CSV integration

**Next Action:**
Implement Phase 2A to enable CSV loading for WHO data, then extend to other organizations.

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-01  
**Status:** Living Document

