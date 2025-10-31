# Next Steps for MCF Pipeline Viewer

## ✅ COMPLETED

### 1. **Material Design Styling**
- Implemented Figma-exact layout
- Material Design dark/light themes (Purple #bb86fc / Teal #03dac6)
- Roboto font
- Semantic color system
- Working theme toggle

### 2. **Real Data Integration**
- Created `real-catalog.js` with 36,511 real indicators
- Loaded from actual MCF files: ILO (7,121), SDG (5,470), UNICEF (2,389), WHO (21,531)
- Data loads on app startup (check console logs)

### 3. **File System Mapping**
- Created `mcf-file-index.js` mapping all MCF files
- Organized by: ILO, SDG (with quarterly versions), UNICEF, WHO
- 100+ MCF files indexed

### 4. **MCF Parser**
- Created `mcf-parser.js` to parse MCF content
- Extracts observations for charting
- Supports multiple time series
- Auto-detects chart types

## 🚧 TODO - CRITICAL

### Phase 1: File Selection (NEXT)
1. **Update FileSelector Component**
   - Replace dropdown with real file browser
   - Show: `🎯 SDG Q1 2025 / schema.mcf`
   - Enable version selection (e.g., Q1 2025 vs Q2 2025)

2. **Load Real MCF Content**
   ```javascript
   import mcfFile from './datacommons/sdg/q1-2025/schema/schema.mcf?raw'
   ```
   - Use Vite/Webpack raw loader
   - Or create a dynamic import system

### Phase 2: Display Real Data
3. **Parse & Display Selected MCF**
   - Use `parseMCF()` to parse content
   - Show in all tabs (Raw, Formatted, STAT, DataCommons, Cached)

4. **Version Comparison**
   - When user selects SDG file + version
   - Load both versions (e.g., Q1 vs Q2)
   - Show diff in DiffViewer

### Phase 3: Dynamic Charts
5. **Chart Generation**
   - Use `extractObservations()` to get data
   - Use `observationsToChartData()` to format
   - Create Recharts components
   - **Stack multiple charts** if multiple series detected

6. **Chart Types**
   - Line charts for time series
   - Bar charts for categories
   - Multiple stacked charts for complex data

## 📁 FILES TO UPDATE

### `src/App.js`
- Import `getAllFiles()` from `mcf-file-index.js`
- Replace `mockMCFData` with actual file loading
- Add MCF parsing on file selection
- Generate dynamic charts

### `src/components/FileSelector.jsx`
- Update to show real files from index
- Add version selector for SDG files
- Enable diff toggle when versions available

### `src/components/ChartPreview.jsx`
- Make dynamic based on data
- Support multiple stacked charts
- Auto-detect chart type

## 🔧 TECHNICAL APPROACH

### Loading MCF Files
**Option A: Import at build time**
```javascript
import iloSchema from './datacommons/ilo/schema/schema.mcf?raw'
```

**Option B: Fetch dynamically**
```javascript
const response = await fetch('/datacommons/ilo/schema/schema.mcf')
const content = await response.text()
```

### Example Flow
1. User selects: `🎯 SDG Q1 2025 / sv.mcf`
2. App loads MCF content
3. Parser extracts 4,269 indicators
4. Tabs show: Raw, Formatted, STAT, JSON, Cached formats
5. Chart tab auto-generates visualizations
6. User can compare with Q2 2025 → shows diff

## 🎯 USER EXPERIENCE

**Current:** Mock data, 4 fake files
**Target:** 
- Browse 100+ real MCF files
- See actual 36,511 indicators
- Compare SDG quarters (Q4 2024, Q1 2025, Q2 2025)
- Auto-generated charts from observations
- Full diff viewing between versions

## 🚀 DEPLOYMENT

Once complete:
1. Test with all organizations
2. Verify all file types (MCF, TMCF)
3. Ensure charts render correctly
4. Push to V01 branch
5. Merge to main when ready

---

**Status:** Foundation complete, ready for file loading integration
**Est. Work:** 2-3 hours for full integration
**Priority:** Phase 1 (File Selection) is critical next step

