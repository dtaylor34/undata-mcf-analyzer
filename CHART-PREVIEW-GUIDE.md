# 📊 Chart Preview System - Complete Guide

## Overview

This update implements chart visualization that mirrors the **UN Data Thematic Areas** style from the staging site. The system shows how data flows from ingestion → MCF conversion → JSON caching → interactive charts.

---

## 🎯 What's New

### 1. **ChartPreview Component** (`src/components/ChartPreview.jsx`)

A new component that replicates the exact visualization style from `staging.undatacommons.dev`:

#### Features:
- **Two View Modes:**
  - 🗺️ **Overview (Map)**: World map visualization with country-level data
  - 📋 **Table**: Sortable data table with all countries
  
- **Interactive Timeline:**
  - Slider to navigate between years
  - Play/Pause animation to watch trends over time
  - Automatic coverage detection (shows most complete year)
  
- **Visual Design:**
  - Purple gradient color scheme (matching UN Data style)
  - Country-level hover tooltips with detailed info
  - Color legend showing value ranges
  - Clean, modern UI matching staging site
  
- **Search & Filter:**
  - Real-time location search
  - Filter by theme, partner, SDG goal (when available)
  
### 2. **Enhanced CachedDataViewer** (`src/components/CachedDataViewer.jsx`)

Updated to integrate the new chart system:

#### Features:
- **4 View Modes:**
  - 🌍 By Location (country-level)
  - 🎨 By Theme (thematic areas)
  - 🎯 By SDG Goal
  - 👥 By Data Partner
  
- **Card Grid Interface:**
  - Each cached file shown as a card
  - Shows indicator count, country coverage, data sources
  - Click any card to open full chart preview
  
- **Modal Chart View:**
  - Full-screen chart visualization
  - Matches UN Data staging site style
  - Interactive filtering and search

---

## 📈 Data Flow

```
1. USER UPLOADS CSV
   ↓
2. SYSTEM GENERATES MCF
   ↓
3. DEPLOY TO UN DATA (CACHED JSON)
   ↓ [cache-generator.js creates optimized files]
   ↓
4. VIEW CHARTS BUTTON
   ↓
5. INTERACTIVE VISUALIZATION
   (Matching UN Data staging site style)
```

---

## 🧪 Testing the Chart Preview

### Step 1: Deploy Data to Cache

1. Go to **Data Ingestion** (top-right button)
2. Upload or use the test ILO data
3. Click **"Generate MCF"** (if needed)
4. Click **"Approve & Deploy"** → **"Deploy to UN Data"**
5. Wait for deployment to complete (✅ Deployed)

### Step 2: View Charts

1. Click **"View Charts"** button (top navigation)
2. Select a view mode:
   - **By Location**: See all countries
   - **By Theme**: Browse thematic areas
   - **By SDG Goal**: Explore SDG indicators
   - **By Data Partner**: Filter by organization (ILO, WHO, etc.)

### Step 3: Explore Interactive Charts

1. Click any card to open full chart preview
2. Try the **Overview (Map)** view:
   - Hover over countries to see detailed values
   - Use the timeline slider to change years
   - Click Play ▶️ to animate through time
3. Switch to **Table** view:
   - See sortable data for all locations
   - Search for specific countries
   - Compare values across locations

---

## 🎨 Chart Style Matching

The charts replicate these key elements from the staging site:

### Visual Design:
- ✅ Purple gradient color scheme (`#8B5CF6` → `#6D28D9`)
- ✅ Country-level map visualization
- ✅ Interactive timeline with play controls
- ✅ Hover tooltips with detailed information
- ✅ "Most recent date with highest coverage" messaging
- ✅ Clean, modern card-based layout

### Functionality:
- ✅ Overview (Map) / Table toggle
- ✅ Year-by-year navigation
- ✅ Auto-detection of data years
- ✅ Animated timeline playback
- ✅ Search and filtering
- ✅ Download capability (placeholder)

---

## 💾 Data Structure

### Cached JSON Format

The cache generator creates JSON files with this structure:

```json
{
  "indicator": {
    "id": "unemployment_rate",
    "name": "Unemployment Rate",
    "unit": "%"
  },
  "source": "ILO",
  "locations": {
    "USA": {
      "name": "United States",
      "data": [
        {
          "year": "2019",
          "value": "3.7",
          "unit": "%",
          "indicator": "Unemployment Rate",
          "source": "ILO"
        }
      ]
    },
    "GBR": {
      "name": "United Kingdom",
      "data": [...]
    }
  }
}
```

### Cache File Organization

```
localStorage keys:
- cache_ilo_location_usa.json
- cache_ilo_location_gbr.json
- cache_ilo_theme_employment.json
- cache_ilo_sdg_goal-8.json
- cache_ilo_partner_ilo.json
```

---

## 🔧 Technical Implementation

### Key Files:

1. **ChartPreview.jsx**
   - Main visualization component
   - Map and table views
   - Timeline controls
   - Interactive tooltips

2. **CachedDataViewer.jsx**
   - Card grid interface
   - View mode selector
   - Modal chart viewer
   - Search and filtering

3. **cache-generator.js**
   - Generates optimized JSON files
   - Creates files for multiple dimensions
   - Stores in localStorage

### Dependencies:

- React hooks (useState, useEffect, useMemo)
- Lucide React icons
- SVG for map visualization

---

## 🚀 Next Steps

To make this production-ready:

1. **Replace localStorage with real API:**
   - Connect to DataCommons API endpoints
   - Implement server-side caching
   - Add CDN for static cache files

2. **Enhanced Map Visualization:**
   - Use real world map SVG or library (e.g., D3.js, Plotly)
   - Accurate country boundaries
   - Better geographic projections

3. **Chart Library Integration:**
   - Add line charts for trends
   - Bar charts for comparisons
   - Pie charts for distributions

4. **Advanced Filtering:**
   - Multi-select filters
   - Date range selection
   - Custom indicator combinations

---

## 📊 Example Use Cases

### Partner Workflow:

1. **ILO Partner uploads employment data**
   ```
   - Upload CSV with unemployment rates
   - System generates MCF
   - Deploy to UN Data cache
   ```

2. **Preview charts before approval**
   ```
   - Click "View Charts"
   - Select "By Location" to see country coverage
   - Select "By Theme" to see how it fits with other employment data
   ```

3. **Approve for production**
   ```
   - If charts look correct → Approve
   - If issues found → Request changes
   ```

### Admin Workflow:

1. **Review all deployed data**
   ```
   - View charts across all partners
   - Compare data quality
   - Identify gaps in coverage
   ```

2. **Preview production appearance**
   ```
   - Charts match staging site exactly
   - Verify styling consistency
   - Test interactive features
   ```

---

## 🎯 Success Metrics

✅ **Chart style matches UN Data staging site**
✅ **Interactive timeline with play controls**
✅ **Search and filtering work smoothly**
✅ **Map and table views toggle seamlessly**
✅ **Data loads from cached JSON files**
✅ **Modal view for detailed exploration**
✅ **4 view modes (Location, Theme, SDG, Partner)**
✅ **Hover tooltips show detailed info**

---

## 📝 Notes

- **Current map is simplified:** Uses rectangles for demonstration. Replace with real world map SVG for production.
- **Data is cached in localStorage:** For demo purposes. Use real database/CDN for production.
- **Chart library:** Currently custom SVG. Consider D3.js, Chart.js, or Plotly for advanced visualizations.
- **API integration:** Placeholder for DataCommons API calls. Implement real API endpoints for production.

---

## 🐛 Troubleshooting

### Charts not showing?
- Ensure data is deployed to UN Data cache
- Check browser localStorage for cache files
- Verify MCF content has observations

### Map colors not showing?
- Check that data values are numeric
- Verify year exists in dataset
- Ensure location codes are valid

### Timeline not working?
- Check that multiple years exist in data
- Verify year format is consistent
- Ensure data structure matches expected format

---

## 📚 References

- **Staging Site:** `https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/RWFydGgmJmFsbA==`
- **Data Flow:** `PHASE1-IMPLEMENTATION.md`
- **Cache System:** `CACHE-DEPLOYMENT-GUIDE.md`
- **Access Control:** `ADMIN-PARTNER-ACCESS.md`

---

*Last Updated: November 4, 2025*

