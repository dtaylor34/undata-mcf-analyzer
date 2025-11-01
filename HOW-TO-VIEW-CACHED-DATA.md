# 🎯 How to View Cached Data & Thematic Areas

This guide shows you **exactly how to see the 1,000+ ILO charts** and understand the caching structure.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Select ILO File
1. Open: http://localhost:3000
2. Click: **Organization dropdown** → Select "🏆 ILO"
3. Click: **File dropdown** → Select "ilo.mcf"

### Step 2: Go to Cached Tab
1. Click the **"Cached"** tab (4th tab at the bottom)

### Step 3: Click Explorer
1. Click the **"🌍 Explorer"** button (first button in the view mode options)

**That's it!** You'll now see:
- ✅ All 7 thematic areas
- ✅ 1,264+ indicators
- ✅ 3,800+ chart references
- ✅ Live data from the staging API

---

## 📊 What You'll See

### The Interface:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 ILO Thematic Areas                                              │
│  7 areas • 1,264 indicators • 3,792 charts                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEFT SIDE: Thematic Areas          RIGHT SIDE: Indicators          │
│  ┌───────────────────────┐          ┌───────────────────────────┐  │
│  │ 👶 Children and Youth │  ────→   │ Share of employees with   │  │
│  │    52 indicators      │          │ access to parental leave  │  │
│  │    156 charts         │          │                           │  │
│  └───────────────────────┘          │ 📊 Map + Table            │  │
│                                      │ 📅 2005-2024              │  │
│  ┌───────────────────────┐          │ 🌍 45 countries           │  │
│  │ 📈 Economic Dev       │          │                           │  │
│  │    605 indicators     │          │ [View Live] [Download]    │  │
│  │    1,815 charts       │          └───────────────────────────┘  │
│  └───────────────────────┘                                          │
│                                                                      │
│  ... 5 more areas                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Interactive Features

### 1. View Thematic Areas
- **Click any area** on the left to see its indicators
- **Hover** to see the count of indicators and charts
- **Selected area** is highlighted with a blue border

### 2. View Indicators
- **See indicator details**: Name, description, chart type, date range, coverage
- **Click "View Live"**: Opens the actual chart on the staging website
- **Click "Download Cache"**: Downloads the cached JSON for that indicator

### 3. Understand Cache Structure
- **Click "📦 How Caching Works"** at the bottom to expand
- **See example JSON** showing the cache structure
- **Understand the flow** from MCF to cached data

---

## 🔍 Comparing with Live Website

### Your Tool (http://localhost:3000):
1. Select: ILO / ilo.mcf
2. Go to: Cached tab → 🌍 Explorer
3. Click: "Children and Youth"
4. See: 52 indicators

### Live Website (https://staging.undatacommons.dev):
1. Open: https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/RWFydGgmMCZJTE8m
2. Filter: "ILO" in the partner dropdown
3. Expand: "Children and Youth"
4. See: Same 52 indicators!

**They match perfectly!** The tool shows you the exact same data structure the website uses.

---

## 📥 Downloading Cache Data

### To download the cache for an indicator:

1. **Click "Download Cache"** on any indicator
2. **Browser opens**: `https://staging.undatacommons.dev/api/cache/{dcid}`
3. **JSON downloads** or displays in browser

### Example Cache Structure:

```json
{
  "dcid": "ILO_EMP_TEMP_SEX_AGE_NB",
  "name": "Share of employees with access to parental leave",
  "observations": [
    {
      "date": "2022",
      "location": "country/AGO",
      "locationName": "Angola",
      "value": 5.9,
      "unit": "%"
    }
  ],
  "chartConfig": {
    "type": "map",
    "colorScale": "sequential",
    "unit": "%"
  }
}
```

---

## 🌐 API Endpoints Being Used

The Explorer tries these API endpoints in order:

1. `https://staging.undatacommons.dev/api/thematic-areas?partner=ILO`
2. `https://staging.undatacommons.dev/api/areas?partner=ILO`
3. `https://staging.undatacommons.dev/api/catalog/ilo/areas`
4. `https://staging.undatacommons.dev/api/v1/catalog/ilo`

**If all fail**: Falls back to mock data structure (same format, but offline)

---

## 🔄 Offline Mode

### If the API is unavailable:
- ✅ Tool shows "Offline Mode" badge
- ✅ Uses mock data based on known ILO structure
- ✅ Shows correct thematic areas and indicator counts
- ❌ "View Live" and "Download Cache" won't work

### Why is this useful?
- You can still **understand the structure**
- You can still **see how caching works**
- You're not blocked if the API is down

---

## 📊 Other View Modes in Cached Tab

The Cached tab has 6 view modes:

### 1. 🌍 Explorer (NEW!)
- **Shows**: Live thematic areas from API
- **Use for**: Understanding the full cached structure
- **Best for**: Seeing all 1,000+ charts at once

### 2. Formatted
- **Shows**: Pretty-printed cached JSON
- **Use for**: Reading the cache structure
- **Best for**: Understanding JSON format

### 3. Raw
- **Shows**: Minified single-line JSON
- **Use for**: Seeing production format
- **Best for**: Copy-pasting cache data

### 4. YAML
- **Shows**: Cache data in YAML format
- **Use for**: Alternative format
- **Best for**: Easier reading than JSON

### 5. Chart
- **Shows**: Visual charts from cached observations
- **Use for**: Quick chart preview
- **Best for**: When MCF has observations

### 6. Edit
- **Shows**: Code editor for cache modifications
- **Use for**: Testing cache changes
- **Best for**: Experimenting with data

---

## 🎬 Full Workflow Example

### Goal: Understand how ILO "Children and Youth" data is cached

```
Step 1: Load the tool
→ http://localhost:3000

Step 2: Select ILO file
→ Organization: 🏆 ILO
→ File: ilo.mcf

Step 3: Explore cached structure
→ Click: "Cached" tab
→ Click: "🌍 Explorer" button

Step 4: View thematic area
→ Click: "👶 Children and Youth" in left panel
→ See: 52 indicators appear on right

Step 5: Inspect an indicator
→ Find: "Share of employees with access to parental leave"
→ See: Map + Table chart, 2005-2024, 45 countries

Step 6: Compare with live site
→ Click: "View Live" button
→ New tab opens: Staging website with actual chart
→ Confirm: Same data, same chart!

Step 7: Download cache
→ Click: "Download Cache" button
→ Browser opens: JSON API endpoint
→ See: Raw cached JSON structure

Step 8: Understand the flow
→ Scroll down to: "📦 How Caching Works"
→ Click to expand
→ Read: Complete explanation + example JSON
```

---

## ❓ Troubleshooting

### Problem: "No Charts Available"
**Solution**: This is normal! ILO MCF files are schema-only (no observations). Use the **🌍 Explorer** view to see the charts from the live API.

### Problem: "Loading thematic areas from live API..." never finishes
**Solution**: 
1. Check your internet connection
2. Check if `staging.undatacommons.dev` is accessible
3. Tool will fall back to offline mode after timeout

### Problem: "View Live" button doesn't open the chart
**Solution**: 
1. Ensure staging site is up: https://staging.undatacommons.dev
2. Check browser pop-up blocker
3. Try right-click → "Open in new tab"

### Problem: Explorer shows 0 indicators
**Solution**: 
1. Make sure you selected an ILO file
2. Try refreshing the page
3. Check browser console for API errors (F12 → Console)

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| http://localhost:3000/?org=ilo&file=schema%2Filo.mcf&tab=cached | Direct link to ILO Cached view |
| https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/RWFydGgmMCZJTE8m | Live ILO data on staging |
| `CACHING-ARCHITECTURE.md` | Detailed caching explanation |
| `src/components/ThematicAreasExplorer.jsx` | Source code for Explorer |

---

## 🎉 Success!

If you can:
- ✅ See 7 thematic areas for ILO
- ✅ Click an area and see indicators
- ✅ Click "View Live" and see charts on staging
- ✅ Download cache JSON for an indicator

**Then you understand how the caching works!** 🎊

The MCF files define the schema, but the cached JSON contains the full data structure with observations that powers the website's fast loading times.

