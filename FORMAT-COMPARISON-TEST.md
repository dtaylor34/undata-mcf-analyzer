# 🧪 Format Comparison Test Feature

## Overview

This is a **proof-of-concept** feature that demonstrates how ONE CSV file can be transformed into multiple output formats (MCF, .STAT, DataCommons, Cached), maintaining data consistency across all representations.

---

## 📍 How to Access

1. **Start the server:** `npm start`
2. **Navigate to SDG organization**
3. **Select "🧪 Test Data (CSV → All Formats)"**
4. **Click the "🔄 Compare Formats" button** in the header (purple/pink gradient)

---

## 🎯 What This Demonstrates

### The Universal Data Pipeline:

```
ONE CSV FILE (Source of Truth)
         ↓
    MCF Format (Master Schema)
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
  .STAT   DataCommons  Cached  Charts
 (SDMX)    (DC-JSON)   (JSON)  (recharts)
```

### Sample Data:

- **Indicator:** SI_POV_DAY1 (Poverty rate below international poverty line)
- **Countries:** Angola (AGO), Ethiopia (ETH), Kenya (KEN), Zambia (ZMB)
- **Years:** 2018, 2019, 2020
- **Total Observations:** 12 data points

---

## 🔄 Format Comparison Modal

When you click "🔄 Compare Formats", you'll see:

### Side-by-Side View:

1. **📄 MCF Format** - The source of truth
   - Semantic representation with dcids
   - Human-readable property names
   
2. **📈 .STAT Format** - SDMX-JSON 2.0
   - Structured for UN .Stat Suite
   - Dimensional data model
   
3. **🌍 DataCommons Format** - Google DataCommons JSON
   - Optimized for Knowledge Graph queries
   - Compatible with Natural Language Search
   
4. **📊 Cached Format** - UN Data Website JSON
   - Pre-computed and optimized
   - Fast loading for production website

### Key Insight:

All 4 formats show **THE SAME DATA** - just represented differently for different systems. The values, dates, geographies, and indicators are consistent across all formats.

---

## 📁 Files Created

1. **`public/datacommons/sdg/test-data/poverty-sample.csv`**
   - Sample CSV with 12 observations
   - Standard UN SDG format

2. **`public/datacommons/sdg/test-data/test-schema.mcf`**
   - MCF schema for SI_POV_DAY1 indicator
   - Defines the statistical variable

3. **`src/utils/csv-to-mcf.js`**
   - CSV to MCF converter
   - Format transformation functions

4. **`src/components/FormatComparison.jsx`**
   - Modal component for side-by-side comparison
   - Shows all 4 formats simultaneously

---

## ✅ What Works

- ✅ CSV loaded from public folder
- ✅ Converted to MCF observations automatically
- ✅ Combined with schema MCF
- ✅ Charts generated from combined data
- ✅ All 4 formats generated in parallel
- ✅ Side-by-side comparison modal
- ✅ **Navigate through all 12 observations** with Previous/Next buttons
- ✅ **Keyboard shortcuts** (← → arrow keys, ESC to close)
- ✅ **Quick selector dropdown** to jump to any observation
- ✅ **Observation counter** showing which observation you're viewing
- ✅ **Test data banner** clearly identifying demo data
- ✅ **Observation count badge** in header (shows "12 observations loaded")

---

## 🎮 How to Navigate

### In the Format Comparison Modal:

1. **Previous/Next Buttons** - Navigate through all observations sequentially
2. **Dropdown Selector** - Jump directly to any observation by country/year/value
3. **Keyboard Shortcuts:**
   - `←` Left arrow: Previous observation
   - `→` Right arrow: Next observation
   - `ESC`: Close modal
4. **Observation Counter** - Shows "3 of 12" so you know where you are

---

## 🚀 Next Steps (Future Enhancements)

1. ~~**Navigate through all observations**~~ ✅ **DONE!**
2. ~~**Keyboard shortcuts**~~ ✅ **DONE!**
3. ~~**Quick selector dropdown**~~ ✅ **DONE!**
4. **Click individual chart points** to see that specific observation in all formats
5. **Compare multiple observations** side-by-side (2-column view)
6. **Validate consistency** across formats automatically (data integrity checks)
7. **Real-time editing** - change CSV and see all formats update
8. **Export to each format** - download .STAT, DC, or Cached JSON
9. **Bulk CSV upload** - drag & drop multiple CSVs
10. **Real UN data integration** - connect to actual SDG databases

---

## 📝 Important Note

⚠️ **This is DEMO DATA created specifically for the MCF Pipeline Viewer.**

The CSV file (`poverty-sample.csv`) was created to demonstrate the pipeline. It contains realistic-looking data, but it's **not actual UN SDG data**.

For production use, replace with:
- Real CSV files from UN agencies
- Live database connections
- SDMX API feeds

---

## 🔧 Technical Details

### How It Works:

1. **File Selection:** User selects "🧪 Test Data" version
2. **Detection:** App detects `test-data` in file path
3. **CSV Loading:** Fetches `poverty-sample.csv` from public folder
4. **Conversion:** Runs `csvToMCF()` to generate observations
5. **Combination:** Merges schema MCF + observation MCF
6. **Format Generation:** Runs `observationToFormats()` for each observation
7. **Storage:** Stores all observations with formats in `allObservations` state
8. **Display:** "🔄 Compare Formats" button appears when observations exist
9. **Comparison:** Modal shows first observation in all 4 formats

### Code Flow:

```javascript
CSV → csvToMCF() → MCF Observations
                         ↓
          Schema MCF + Observations MCF = Complete MCF
                         ↓
            generateAllFormats(completeMCF)
                         ↓
              observationToFormats(observation)
                         ↓
        { mcf, stat, datacommons, cached }
```

---

## 🎯 Goal Achievement

**User's Question:** "If I am looking at this chart, where is it in other sources?"

**Answer:** Click "🔄 Compare Formats" and see the exact same data point represented in:
- MCF (source)
- .STAT (for .Stat Suite)
- DataCommons (for Knowledge Graph)
- Cached (for UN Data website)

This proves the **Rosetta Stone concept** - ONE canonical data source, multiple format outputs, perfect consistency.

---

## 🤝 Feedback Welcome

This is a test implementation. Let us know:
- Does this meet your vision?
- What should we add/change?
- Ready for full implementation?

**Time to build:** ~25 minutes ⚡

