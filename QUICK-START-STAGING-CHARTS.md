# 🚀 Quick Start: View Live Staging Charts

## See Your MCF Data on the Live UN Data Website (1 Minute)

### Step 1: Select ILO Sample Data

1. Open http://localhost:3000
2. In the file selector (left sidebar), find **"ILO"**
3. Expand the **"📊 Sample Data (With Charts)"** option
4. Click on it

### Step 2: Look for the Green Banner

Scroll down to the charts section. You'll see:

```
┌─────────────────────────────────────────────────────────────┐
│ 🌍 Live Chart Available on UN Data Staging                  │
│ Children and Youth › Child protection                        │
│                                          [View Live Chart →] │
└─────────────────────────────────────────────────────────────┘
```

**What This Means:**
- ✅ This exact chart exists on the staging website
- ✅ You can view the REAL production visualization
- ✅ One click takes you directly to it

### Step 3: Click "View Live Chart →"

A new tab will open showing:

**https://staging.undatacommons.dev/...**

You'll see the actual UN Data website with:
- 📊 Interactive map visualization
- 📈 Time slider (2005-2024)
- 🌍 22+ countries with data
- 📥 Download button
- 🔍 Filter by location

**Example Chart:**
"Share of Employees With Access to Parental Leave in the World (2022)"

### Step 4: Explore the Live Chart

On the staging site, you can:
- **Drag the year slider** to see data over time
- **Click on countries** in the map
- **Filter by location** using the search box
- **Download the data** as CSV/Excel
- **View the data table** with exact values

## What Charts Have Live Staging URLs?

### ✅ Currently Available (ILO)

1. **Share of Employees With Access to Parental Leave**
   - Category: Child protection
   - Variable: `EES_XPLV_RT.00135.001`

2. **Share of Employees With Access to Parental Leave, by Sex**
   - Category: Child protection
   - Variable: `EES_XPLV_RT.00136.001`

3. **Employment by Sex and Age**
   - Category: Work and employment
   - Variable: `EMP_TEMP_SEX_AGE_NB`

4. **Unemployment Rate by Sex and Age**
   - Category: Work and employment
   - Variable: `UNE_DEAP_SEX_AGE_RT`

### ❌ Not Yet Available

Charts without the green banner don't have staging URLs yet. We're adding more mappings!

## Troubleshooting

### "The staging site asks me to log in"

**Solution:** You need to be authenticated to the staging site first.
1. Open https://staging.undatacommons.dev in a new tab
2. Log in with your credentials
3. Come back to the MCF Pipeline Viewer
4. Click "View Live Chart →" again

### "I don't see the green banner"

**Possible reasons:**
1. **No observations** - The MCF file only has schemas, no actual data
2. **No mapping** - This indicator doesn't have a staging URL mapping yet
3. **Different organization** - Currently only ILO indicators are mapped

**Try this:**
- Select "ILO Sample Data (With Charts)" (this definitely has mappings)
- Make sure you're looking at the charts section (not the MCF code view)

### "The staging URL doesn't work"

**Check:**
1. Are you logged into the staging site?
2. Does the URL open a chart page?
3. Is the staging site working? (Try: https://staging.undatacommons.dev)

## Visual Guide

```
MCF Pipeline Viewer                    Staging Website
─────────────────────────────────────────────────────────

┌─────────────────────┐              ┌──────────────────┐
│ File: ILO Sample    │              │  UN Data Website │
│ Data (With Charts)  │              │                  │
└─────────────────────┘              │  🌍 World Map    │
                                     │                  │
┌─────────────────────┐              │  [Timeline]      │
│ 📊 Chart Info       │              │  2005 ━━●━━ 2024 │
│                     │              │                  │
│ - Observations: 22  │              │  [Data Table]    │
│ - Date Range: 2022  │    ════►     │  Angola     5.9  │
└─────────────────────┘              │  Bangladesh 10.2 │
                                     │  Chile      73.7 │
┌─────────────────────┐              │  ...             │
│ 🌍 View Live Chart  │              │                  │
│     [Click here]    │              │  [Download]      │
└─────────────────────┘              └──────────────────┘

    LOCAL ANALYSIS                    LIVE PRODUCTION
```

## Benefits

### 🎯 For Analysts
- **Validate your MCF data** against production
- **See how charts will look** on the website
- **Test different indicators** quickly

### 🎯 For Data Partners
- **Preview submissions** before final upload
- **Compare your data** with live site
- **Share exact chart URLs** with stakeholders

### 🎯 For Developers
- **Debug MCF structure** by comparing outputs
- **Verify transformations** work correctly
- **Test new indicators** end-to-end

## What's Next?

### More Charts Coming Soon

We're adding staging URLs for:
- 🔜 **7,100+ more ILO indicators**
- 🔜 **WHO health indicators**
- 🔜 **UNICEF child welfare indicators**
- 🔜 **SDG sustainability goals**

### Want to Add a Chart?

If you have a specific chart you want to link:

1. Find the indicator on staging
2. Note the category ID and theme ID from the URL
3. Add it to `src/utils/staging-chart-urls.js`

Or open an issue and we'll add it for you!

## Support

- **Documentation**: See `STAGING-CHARTS-INTEGRATION.md`
- **Issues**: Report bugs on GitHub
- **Questions**: Ask in the project Slack/Discord

---

**Ready to try it?**

1. Open http://localhost:3000
2. Select "ILO Sample Data (With Charts)"
3. Look for the green 🌍 banner
4. Click "View Live Chart →"

**It's that easy!** 🎉

