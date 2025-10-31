# 🚀 UN Data Commons - COMPLETE Setup Guide

## ✨ What You're Getting

A complete UN Data Commons dashboard with **7 tabbed views** showing the entire data pipeline:

1. **📝 RAW** - Original CSV source data
2. **📄 MCF** - Meta Content Format (Data Commons knowledge graph)
3. **🌐 .STAT** - SDMX-JSON format (statistical data exchange)
4. **🔴 LIVE DC** - Live Data Commons API response
5. **💾 Cached** - Cached catalog data (localStorage)
6. **📊 Chart** - Interactive visualizations (recharts)
7. **📋 Table** - UN Data site-style table view

### Features Included:
- ✅ **Dataset Selector** - Choose from 4 organizations (SDG, ILO, UNICEF, WHO)
- ✅ **Quarterly Releases** - SDG data with Q4-2024, Q1-2025, Q2-2025
- ✅ **19 Indicators** - Across all partner organizations
- ✅ **Architecture Visualization** - See the complete data pipeline
- ✅ **Performance Stats** - Cache hit rates, API requests, etc.
- ✅ **Copy-to-Clipboard** - For MCF and other formats
- ✅ **Chart Type Switching** - Line and bar charts
- ✅ **Mock Data** - Works immediately without API keys

---

## 📥 Files to Install (4 files)

### 1. **IndicatorPreview-COMPLETE.jsx**
**Destination:** `src/components/IndicatorPreview.jsx`  
**Purpose:** Main component with 7 tabbed views

### 2. **DatasetSelector-COMPLETE.jsx**
**Destination:** `src/components/DatasetSelector.jsx`  
**Purpose:** Select organization, quarter, and indicator

### 3. **data-layer-COMPLETE.js**
**Destination:** `src/undata-integration/data-layer.js`  
**Purpose:** Data access layer with mock data

### 4. **App-COMPLETE.jsx**
**Destination:** `src/App.jsx`  
**Purpose:** Main app integrating all components

### 5. **config.dev-COMPLETE.js**
**Destination:** `src/undata-integration/config.dev.js`  
**Purpose:** Configuration settings

---

## ⚡ Installation (5 minutes)

### Step 1: Create Directory Structure

```bash
cd /Users/dt/undata/undata-mcf-analyzer

# Create component directory if it doesn't exist
mkdir -p src/components
mkdir -p src/undata-integration
```

### Step 2: Copy Files

**Download all 5 files above, then:**

```bash
# Copy components
cp ~/Downloads/IndicatorPreview-COMPLETE.jsx src/components/IndicatorPreview.jsx
cp ~/Downloads/DatasetSelector-COMPLETE.jsx src/components/DatasetSelector.jsx

# Copy integration layer
cp ~/Downloads/data-layer-COMPLETE.js src/undata-integration/data-layer.js
cp ~/Downloads/config.dev-COMPLETE.js src/undata-integration/config.dev.js

# Copy main app
cp ~/Downloads/App-COMPLETE.jsx src/App.jsx
```

### Step 3: Install Dependencies

```bash
# Install required packages
npm install axios recharts

# Verify installation
npm list axios recharts
```

### Step 4: Start the App

```bash
npm start
```

**The app will open at:** `http://localhost:3000`

---

## ✅ What You Should See

### On First Load:

1. **Header:** "UN Data Commons Dashboard" with data pipeline description
2. **Dataset Selector:** 4 organization cards (SDG, ILO, UNICEF, WHO)
3. **Architecture Diagram:** Visual representation of 7 data stages
4. **Empty State:** "Select a Dataset to Begin" message
5. **Performance Stats:** All zeros (no queries yet)
6. **Available Datasets:** Grid showing all 4 organizations

### After Selecting a Dataset:

1. **Organization card** highlights in its theme color
2. **Quarter selection** (SDG only) - Choose Q4-2024, Q1-2025, or Q2-2025
3. **Indicator dropdown** - Shows available indicators
4. **"Load This Dataset" button** - Click to load

### After Loading Data:

1. **7 Tabs** at the top of the indicator preview
2. **Default view:** Chart tab (interactive line chart)
3. **Click tabs** to explore: RAW → MCF → .STAT → LIVE → Cached → Chart → Table
4. **Metadata header** - Shows indicator name, description, source
5. **Source badge** - "API" on first load, "CACHED" on reload
6. **Performance stats** update showing cache hits/misses

---

## 🎯 How to Use

### Select a Dataset

1. **Click an organization card:** SDG, ILO, UNICEF, or WHO
2. **For SDG only:** Choose a quarter (Q4-2024, Q1-2025, Q2-2025)
3. **Select an indicator:** Use dropdown menu
4. **Click "Load This Dataset"**

### Explore the Data Pipeline

Click through the 7 tabs to see how data transforms:

1. **📝 RAW** - See the original CSV format with sample records
2. **📄 MCF** - View Data Commons knowledge graph format (with copy button!)
3. **🌐 .STAT** - Explore SDMX-JSON structure with dataflows
4. **🔴 LIVE DC** - See live API request/response from Data Commons
5. **💾 Cached** - View cached catalog entry and localStorage info
6. **📊 Chart** - Interactive visualization (toggle between line/bar)
7. **📋 Table** - UN Data site-style table with all observations

### Test Caching

1. **Load a dataset** - Check badge shows "API"
2. **Reload the page** (Cmd+R or Ctrl+R)
3. **Load same dataset** - Badge should show "CACHED"
4. **Check performance stats** - See cache hit rate increase

---

## 📊 Understanding the Views

### RAW Data View
Shows original CSV format from UN partners:
- Source information (provider, format, collection date)
- Sample CSV records with columns: SERIES, GEOGRAPHY, TIME_PERIOD, OBS_VALUE, UNIT_MEASURE, DATA_SOURCE

### MCF View
Data Commons knowledge graph format:
- Statistical variable definition (Node, typeOf, name, description)
- Measurement method and properties
- Observations (each data point as a node)
- **Copy button** to clipboard

### .STAT View
SDMX-JSON format for statistical data exchange:
- Dataflow information (ID, agency, version)
- Structure (dimensions, attributes, measures)
- Datasets with series and observations
- Industry standard format

### LIVE Data Commons View
Real-time API query simulation:
- Endpoint and request details
- Response time (mocked at ~145ms)
- Full response JSON with byVariable structure
- Facets with provenance and metadata

### Cached Catalog View
Browser localStorage caching:
- Cache status (CACHED or UNCACHED)
- Cache key and data size
- TTL (Time To Live) - 7 days default
- Full catalog entry JSON

### Chart View
Interactive visualizations:
- Toggle between line and bar charts
- Summary cards (latest value, time period, data points)
- Responsive design with recharts

### Table View
UN Data site-style presentation:
- Sortable columns (Year, Location, Value, Unit, Source)
- Alternating row colors for readability
- Data footnotes and source attribution

---

## 🔧 Customization

### Add More Indicators

Edit `DatasetSelector-COMPLETE.jsx`, add to the `organizations` object:

```javascript
sdg: {
  indicators: {
    'Q2-2025': [
      { id: 'dc/sdg_8_1_1', name: 'SDG 8.1.1 - GDP Growth', goal: 8 },
      // Add more here...
    ]
  }
}
```

### Change Chart Colors

Edit `IndicatorPreview-COMPLETE.jsx`, modify the chart rendering:

```javascript
<Line 
  dataKey="value" 
  stroke="#YOUR_COLOR" 
  fill="#YOUR_COLOR"
/>
```

### Adjust Cache TTL

Edit `config.dev-COMPLETE.js`:

```javascript
cache: {
  ttl: 7 * 24 * 60 * 60 * 1000, // Change to 30 days: 30 * 24 * 60 * 60 * 1000
}
```

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'recharts'"
**Solution:** Install dependencies
```bash
npm install recharts axios
```

### Issue: "export 'default' (imported as 'DataLayer') was not found"
**Solution:** Check data-layer.js has `export default DataLayer` at the end

### Issue: Charts not displaying
**Solution:** Verify recharts is installed and IndicatorPreview imports it correctly

### Issue: Cache not persisting
**Solution:** Check browser allows localStorage (not in incognito mode)

### Issue: Tabs not switching
**Solution:** Check console for React errors, verify state management in IndicatorPreview

### Issue: Dataset selector not showing indicators
**Solution:** Verify you selected both organization AND quarter (for SDG)

---

## 📚 File Structure

```
src/
├── components/
│   ├── IndicatorPreview.jsx    ← 7 tabs, all views
│   └── DatasetSelector.jsx      ← Organization/indicator selection
├── undata-integration/
│   ├── data-layer.js            ← Data access with mock data
│   └── config.dev.js            ← Configuration
├── App.jsx                       ← Main app integration
└── App.css                       ← Styles (create if needed)
```

---

## 🎨 Styling

The components use inline styles, but you can add to `App.css`:

```css
.App {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #fafafa;
  min-height: 100vh;
}

/* Add more custom styles here */
```

---

## 🚀 Next Steps

### Phase 2: Connect Real APIs

1. Add Anthropic API key for NL Search
2. Connect to real .STAT API
3. Connect to live Data Commons API
4. Replace mock data with real data

### Phase 3: Advanced Features

1. Multi-indicator comparison
2. Data export (CSV, Excel, PDF)
3. Custom date range selection
4. Disaggregation support (by age, sex, etc.)
5. Location filtering
6. Share/bookmark functionality

---

## 💡 Pro Tips

1. **First load is slow** - That's normal, caching will speed up subsequent loads
2. **Try different organizations** - Each has different data structures
3. **Use copy button in MCF tab** - Great for learning Data Commons format
4. **Check performance stats** - See how caching improves speed
5. **Reload page** - See caching in action with "CACHED" badge

---

## 📞 Getting Help

### In This Chat
Ask me to:
- Explain any component
- Help customize features
- Debug errors
- Add new functionality

### New Chat
Start with: "Continue UN Data Commons from [specific task]" and attach this guide

---

## ✅ Success Checklist

- [ ] All 5 files copied to correct locations
- [ ] Dependencies installed (recharts, axios)
- [ ] `npm start` runs without errors
- [ ] Browser shows dashboard at localhost:3000
- [ ] Can select organization and indicator
- [ ] Can load dataset successfully
- [ ] All 7 tabs are clickable and show content
- [ ] Chart displays with data
- [ ] Can switch between line and bar charts
- [ ] Performance stats update after loading data
- [ ] Reload page shows "CACHED" badge
- [ ] MCF copy button works

---

**Ready to begin? Download the 5 files and follow Step 1!** 🎉
