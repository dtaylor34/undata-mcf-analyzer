# 🌍 Environment Selector - Documentation

## Overview

The MCF Pipeline Viewer now supports **multiple environments**, allowing you to view charts on **Staging**, **Test**, or **Production** instances of the UN Data website!

## ✨ New Feature

### Environment Selector Dropdown

Located in the top-right header, next to the dark mode toggle:

```
┌────────────────────────────────────────────┐
│ MCF Pipeline Viewer               🔶 [⌄]  ☀ ☽ │
│                                  Staging       │
└────────────────────────────────────────────┘
```

**Click the dropdown to see:**
- 🔶 **Staging** - Preview environment with latest changes
- 🧪 **Test** - Testing environment for validation
- 🌍 **Production** - Live production environment

## 🎯 Features

### 1. **Visual Environment Indicators**

Each environment has a unique color and icon:

| Environment | Icon | Color | Description |
|-------------|------|-------|-------------|
| **Staging** | 🔶 | Orange | Latest changes, frequent updates |
| **Test** | 🧪 | Blue | Validation and testing |
| **Production** | 🌍 | Green | Live public website |

### 2. **Dynamic Chart URLs**

Charts automatically open on the **selected environment**:

```javascript
// Staging selected
"View Live Chart" → https://staging.undatacommons.dev/...

// Test selected
"View Live Chart" → https://test.undatacommons.dev/...

// Production selected
"View Live Chart" → https://data.un.org/...
```

### 3. **Persistent Selection**

Your environment choice is **saved to localStorage** and persists across sessions!

### 4. **Color-Coded Banner**

The "View Live Chart" banner changes color based on environment:

**Staging (Orange):**
```
┌────────────────────────────────────────────────┐
│ 🔶 Live Chart Available on UN Data Staging    │
│    Children and Youth › Child protection       │
│                        [View Live Chart →]     │
└────────────────────────────────────────────────┘
```

**Test (Blue):**
```
┌────────────────────────────────────────────────┐
│ 🧪 Live Chart Available on UN Data Test       │
│    Children and Youth › Child protection       │
│                        [View Live Chart →]     │
└────────────────────────────────────────────────┘
```

**Production (Green):**
```
┌────────────────────────────────────────────────┐
│ 🌍 Live Chart Available on UN Data Production │
│    Children and Youth › Child protection       │
│                        [View Live Chart →]     │
└────────────────────────────────────────────────┘
```

## 📖 How to Use

### Step 1: Select Your Environment

1. Open http://localhost:3000
2. Click the environment dropdown in the top-right (next to theme toggle)
3. Choose your target environment:
   - **Staging** for latest/preview
   - **Test** for validation
   - **Production** for live data

### Step 2: View Charts

1. Select a file (e.g., "ILO Sample Data (With Charts)")
2. Scroll to the charts section
3. Look for the color-coded banner
4. Click "View Live Chart →"

### Step 3: Chart Opens on Selected Environment

The chart will open on the environment you selected!

## 🎨 Visual Guide

### Dropdown Menu

```
┌──────────────────────────────────────────────┐
│ Select Environment                           │
├──────────────────────────────────────────────┤
│  🔶  Staging                    ✓ Active     │
│      Preview environment with latest changes │
│      staging.undatacommons.dev               │
├──────────────────────────────────────────────┤
│  🧪  Test                                    │
│      Testing environment for validation      │
│      test.undatacommons.dev                  │
├──────────────────────────────────────────────┤
│  🌍  Production                              │
│      Live production environment             │
│      data.un.org                             │
├──────────────────────────────────────────────┤
│  💡 Changing environment will reload the page│
└──────────────────────────────────────────────┘
```

### Environment States

**Active Environment:**
- ✅ Checkmark icon
- Colored background
- "Active" badge

**Inactive Environments:**
- No checkmark
- Gray/transparent background
- Hover effect

## 🔧 Technical Details

### Configuration

Environments are defined in `src/utils/environment-config.js`:

```javascript
export const ENVIRONMENTS = {
  STAGING: {
    id: 'staging',
    name: 'Staging',
    baseUrl: 'https://staging.undatacommons.dev/UNSDWebsite/undatacommons',
    color: 'orange',
    icon: '🔶'
  },
  TEST: {
    id: 'test',
    name: 'Test',
    baseUrl: 'https://test.undatacommons.dev/UNSDWebsite/undatacommons',
    color: 'blue',
    icon: '🧪'
  },
  PRODUCTION: {
    id: 'production',
    name: 'Production',
    baseUrl: 'https://data.un.org/UNSDWebsite/undatacommons',
    color: 'green',
    icon: '🌍'
  }
};
```

### API Functions

```javascript
// Get current environment
const env = getCurrentEnvironment(); // Returns 'staging', 'test', or 'production'

// Set environment
setEnvironment('production'); // Changes to production

// Get environment config
const config = getEnvironmentConfig('staging');
// Returns: { id, name, baseUrl, color, icon, description }

// Build chart URL for specific environment
const url = buildEnvironmentChartUrl(params, 'production');
```

### localStorage Persistence

Your selection is saved to:
```javascript
localStorage.getItem('undata_mcf_environment') // 'staging', 'test', or 'production'
```

### Page Reload on Change

When you switch environments, the page **automatically reloads** to ensure all charts update to the new environment.

## 🚀 Use Cases

### For Analysts
- **Staging**: Preview latest indicators before they go live
- **Test**: Validate data transformations
- **Production**: Compare with live public data

### For Data Partners
- **Staging**: Preview your submissions
- **Test**: Validate before production deployment
- **Production**: Verify live data

### For Developers
- **Staging**: Test new features
- **Test**: Integration testing
- **Production**: Production debugging

## 🎯 Examples

### Example 1: Preview in Staging

```
1. Select "🔶 Staging" from dropdown
2. Open "ILO Sample Data (With Charts)"
3. Click "View Live Chart →"
4. Opens: https://staging.undatacommons.dev/...
```

### Example 2: Validate in Test

```
1. Select "🧪 Test" from dropdown
2. Open your data file
3. Verify charts match expectations
4. Opens: https://test.undatacommons.dev/...
```

### Example 3: Compare with Production

```
1. Select "🌍 Production" from dropdown
2. Open existing indicator
3. Compare local vs. live
4. Opens: https://data.un.org/...
```

## ⚠️ Important Notes

### Authentication Requirements

Each environment may require separate authentication:
- **Staging**: Requires staging login
- **Test**: Requires test environment access
- **Production**: Publicly accessible (some features may require login)

**Tip:** Log into each environment in separate browser tabs before using the MCF Pipeline Viewer.

### Environment Availability

- **Staging**: ✅ Always available (confirmed working)
- **Test**: ⚠️ May not always be accessible
- **Production**: ✅ Public access

### Chart Mappings

All environments use the **same chart mappings**. If a chart has a mapping, it will work on all three environments (assuming the data exists there).

## 🔍 Troubleshooting

### "The page won't load"

**Solution:** Ensure you're logged into that environment first.

1. Open the environment URL directly:
   - Staging: https://staging.undatacommons.dev
   - Test: https://test.undatacommons.dev
   - Production: https://data.un.org
2. Log in if prompted
3. Return to MCF Pipeline Viewer
4. Try again

### "Chart not found on this environment"

**Possible reasons:**
1. **Data not deployed yet** - Chart exists on staging but not production
2. **Different indicator IDs** - Environments may use different naming
3. **Access restrictions** - Some charts may be private

**Solution:** Try a different environment or check if the indicator exists on that environment first.

### "Environment doesn't change"

**Solution:** The page should reload automatically when you change environments. If not:
1. Manually refresh the page (Cmd+R / Ctrl+R)
2. Check browser console for errors
3. Clear localStorage: `localStorage.clear()`

## 📊 Environment Status Badge

In the header, you'll always see which environment is active:

```
🔶 Staging    ← Orange, currently active
🧪 Test       ← Blue
🌍 Production ← Green
```

## 🎓 Best Practices

1. **Use Staging for Preview** - Always check staging first before production
2. **Use Test for Validation** - Validate your data transformations in test
3. **Use Production for Verification** - Confirm live data matches expectations
4. **Switch Environments Often** - Compare across environments to catch issues

## 📁 Files Added/Modified

**New Files:**
- ✅ `src/utils/environment-config.js` (Environment configuration)
- ✅ `src/components/EnvironmentSelector.jsx` (Dropdown component)
- ✅ `ENVIRONMENT-SELECTOR.md` (This documentation)

**Modified Files:**
- ✅ `src/utils/staging-chart-urls.js` (Environment-aware URL generation)
- ✅ `src/components/ChartPreview.jsx` (Dynamic banner colors)
- ✅ `src/App.js` (Integrated selector in header)

## 🚀 Quick Start

**Try it now:**

1. Open http://localhost:3000
2. Look for 🔶 **Staging** in top-right
3. Click it to see dropdown
4. Select **🧪 Test** or **🌍 Production**
5. Page reloads
6. Charts now open on selected environment!

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

