# Chart Debugging Guide

## How to Check if Charts Are Working

### Step 1: Open Browser Console
1. Open the app in your browser (`http://localhost:3000`)
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Console** tab

### Step 2: Select Sample Data
1. In the app, select: **SDG** → **sample-observations.mcf** → **Sample Data (With Charts)**
2. Watch the console for these logs:

```
📊 Processing MCF content for charts...
MCF Content length: [number]
✅ Parsed nodes: [should be 25 - 2 variables + 23 observations]
✅ Statistical Variables: 2 ['dcid:undata/sdg/SI_POV_DAY1', 'dcid:undata/sdg/SI_POV_NAHC']
✅ Observations: 23
Sample observation: {dcid: "...", typeOf: "...", variableMeasured: "...", ...}
✅ Chart Data Array: 2
Sample chart: {id: "...", title: "...", dataPoints: 14, unit: "Percentage"}
✅ Auto-selected 2 charts: ['chart-0', 'chart-1']
```

### Step 3: Check for Errors

**If you see:**
```
⚠️ No charts generated - no observations found in MCF
```
**Problem:** The MCF file has no observations (only metadata)

**If you see:**
```
❌ Error processing MCF for charts: [error]
```
**Problem:** There's a parsing or processing error

### Step 4: Verify Chart Display

1. Go to any tab (MCF, .STAT, DataCommons, or Cached)
2. Click the **"Chart"** button in the view mode switcher
3. You should see:
   - **"Filter Charts (2/2)"** button
   - **2 line charts** displayed below

### Step 5: Test Chart Filter

1. Click the **"Filter Charts (2/2)"** button
2. Dropdown should show:
   - ☑ **All Charts** (checked)
   - ☑ **Proportion of population below international poverty line**
   - ☑ **Proportion of population living below the national poverty line**
3. Uncheck one chart → it should disappear
4. Check it again → it should reappear

---

## Common Issues & Solutions

### Issue 1: Filter Shows "(0/0)"

**Symptoms:**
- Filter Charts button shows "(0/0)"
- No charts display
- Console shows: "No observations found"

**Cause:** MCF file only has StatisticalVariables (metadata), no observations

**Solution:**
- Use `sample-observations.mcf` which has observations
- OR implement CSV loading for WHO/SDG/ILO files

### Issue 2: Charts Display But Are Empty

**Symptoms:**
- Charts render but show no data
- Axes are visible but no lines/bars

**Cause:** Data format mismatch

**Check Console:**
```javascript
// Should see data points like:
{name: "2020", value: 26.2, label: "2020", entity: "dcid:Earth", unit: "Percentage"}
```

**Solution:**
- Verify `observationsToChartData()` is returning correct format
- Check that `chart.data` is an array of objects with `name` and `value` properties

### Issue 3: Server Not Running

**Symptoms:**
- App doesn't load
- "Can't connect" error

**Solution:**
```bash
cd /Users/dt/undata/undata-mcf-analyzer
npm start
```

### Issue 4: File Not Loading

**Symptoms:**
- Console shows: "Error loading MCF file"
- No content displayed

**Check:**
1. File exists in `public/datacommons/` directory
2. File path in `mcf-file-index.js` is correct
3. Browser Network tab shows 200 OK response

---

## Data Flow Diagram

```
User selects file
    ↓
loadMCFFile(fileId)
    ↓
fetch('/datacommons/sdg/sample-observations.mcf')
    ↓
setCurrentMCFContent(content)
    ↓
useEffect triggers (currentMCFContent changed)
    ↓
parseMCF(currentMCFContent) → nodes[]
    ↓
extractStatisticalVariables(nodes) → variables[]
    ↓
extractObservations(nodes) → observations[]
    ↓
observationsToChartData(observations, variables) → chartData[]
    ↓
setSelectedCharts([all chart IDs])
    ↓
User clicks "Chart" view mode
    ↓
ChartPreview renders each chart with data
```

---

## Expected Console Output (Success Case)

```
🔍 Loading MCF file: /datacommons/sdg/sample-observations.mcf
✅ Loaded file successfully: /datacommons/sdg/sample-observations.mcf (6543 chars)
📄 Loaded file: sdg/sample-observations.mcf

📊 Processing MCF content for charts...
MCF Content length: 6543
✅ Parsed nodes: 25
✅ Statistical Variables: 2 [
  'dcid:undata/sdg/SI_POV_DAY1', 
  'dcid:undata/sdg/SI_POV_NAHC'
]
✅ Observations: 23
Sample observation: {
  dcid: "dcid:obs_SI_POV_DAY1_2010_World",
  typeOf: "dcs:StatVarObservation",
  variableMeasured: "dcid:undata/sdg/SI_POV_DAY1",
  observationAbout: "dcid:Earth",
  observationDate: "2010",
  value: 15.7,
  unit: "Percentage"
}
✅ Chart Data Array: 2
Sample chart: {
  id: "dcid:undata/sdg/SI_POV_DAY1",
  title: "Proportion of population below international poverty line",
  dataPoints: 14,
  unit: "Percentage"
}
✅ Auto-selected 2 charts: ['chart-0', 'chart-1']
```

---

## Verifying Chart Data Structure

### In Console, type:
```javascript
// Get the current MCF content
const content = document.querySelector('[data-mcf-content]')?.textContent;

// Or check React state (if you have React DevTools)
// Look for: currentMCFContent, selectedCharts, chartDataArray
```

### Expected Chart Object Structure:
```javascript
{
  id: "dcid:undata/sdg/SI_POV_DAY1",
  dcid: "dcid:undata/sdg/SI_POV_DAY1",
  title: "Proportion of population below international poverty line",
  description: "Percentage of population living on less than $2.15 per day (2017 PPP)",
  
  // Metadata
  unit: "Percentage",
  populationType: "dcs:Person",
  statType: "dcs:measuredValue",
  measuredProperty: "dcs:count",
  measurementMethod: "HouseholdSurvey",
  
  // Data for charting
  data: [
    {name: "2010", value: 15.7, label: "2010", entity: "dcid:Earth", unit: "Percentage", date: "2010"},
    {name: "2011", value: 14.8, label: "2011", entity: "dcid:Earth", unit: "Percentage", date: "2011"},
    // ... more data points
  ],
  
  // Analysis
  dateRange: {start: "2010", end: "2023"},
  entities: ["dcid:Earth"],
  observationCount: 14,
  chartType: "timeSeries",
  hasTimeSeries: true,
  hasMultipleEntities: false
}
```

---

## Quick Test Script

Paste this in the browser console to test chart generation:

```javascript
// Test MCF parsing and chart generation
const testMCF = `
Node: dcid:test/var1
typeOf: dcs:StatisticalVariable
name: "Test Variable"
unit: "Count"

Node: dcid:obs1
typeOf: dcs:StatVarObservation
variableMeasured: dcid:test/var1
observationAbout: dcid:Earth
observationDate: "2020"
value: 100
`;

// This should work if your functions are accessible
try {
  const nodes = parseMCF(testMCF);
  const vars = extractStatisticalVariables(nodes);
  const obs = extractObservations(nodes);
  const charts = observationsToChartData(obs, vars);
  
  console.log('✅ Test passed!');
  console.log('Charts generated:', charts.length);
  console.log('Chart data:', charts[0]);
} catch (error) {
  console.error('❌ Test failed:', error);
}
```

---

## Next Steps if Charts Still Don't Show

1. **Check the sample file is in the right place:**
   ```bash
   ls -la public/datacommons/sdg/sample-observations.mcf
   ```

2. **Verify file content:**
   ```bash
   head -50 public/datacommons/sdg/sample-observations.mcf
   ```

3. **Check browser Network tab:**
   - Look for request to `/datacommons/sdg/sample-observations.mcf`
   - Should return 200 OK with MCF content

4. **Verify Recharts is installed:**
   ```bash
   npm list recharts
   ```
   Should show: `recharts@2.x.x`

5. **Check for React errors:**
   - Look for red error messages in browser
   - Check React DevTools for component errors

---

## Contact Points

If you're still stuck:
1. Share the console logs
2. Share the Network tab (filter: "mcf")
3. Share any error messages from browser console
4. Note which file you're trying to view

This will help diagnose the exact issue!

