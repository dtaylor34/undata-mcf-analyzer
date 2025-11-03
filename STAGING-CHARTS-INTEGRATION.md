# 🌍 Staging Charts Integration

## Overview

The MCF Pipeline Viewer now integrates with the live UN Data staging environment, allowing users to view actual production charts directly from their MCF analysis workflow.

## Features

### ✅ What's Working

1. **Direct Chart Links** - "View Live Chart" button appears when a chart has a known staging URL
2. **Automatic URL Generation** - Staging URLs are generated from MCF statistical variable IDs
3. **Organization Support** - Works with ILO, WHO, UNICEF, and SDG data
4. **Metadata Display** - Shows thematic area and category information
5. **Seamless Navigation** - Opens staging charts in a new tab

### 🎯 Supported Charts

Currently mapped ILO indicators:

#### Parental Leave (Child Protection)
- **EES_XPLV_RT.00135.001** - Share of Employees With Access to Parental Leave
- **EES_XPLV_RT.00136.001** - Share of Employees With Access to Parental Leave, by Sex

#### Employment (Work and Employment)
- **EMP_TEMP_SEX_AGE_NB** - Employment by Sex and Age
- **UNE_DEAP_SEX_AGE_RT** - Unemployment Rate by Sex and Age

## How It Works

### URL Structure

Staging URLs follow this pattern:

```
https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/
{base64_path}#{mode}+{categoryId}+dc/svpg/{variableId}_dc/topic/{themeId}
```

**Example:**
```
https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/
RWFydGgmMCZJTE8m#carousel+422725642+
dc/svpg/undata/ilo/EES_XPLV_RT.00135.001_dc/topic/UN_SUB_THEME_25
```

### Components

1. **Base64 Path**: Encodes "Earth&0&{ORG}&" (e.g., "Earth&0&ILO&")
2. **Mode**: `carousel` (chart view) or `explore` (list view)
3. **Category ID**: Numeric ID for the indicator category (e.g., 422725642 for "Child protection")
4. **Variable ID**: Statistical variable identifier from MCF
5. **Theme ID**: UN theme code (e.g., UN_SUB_THEME_25)

## Usage

### For End Users

1. **Select a File** - Choose an MCF file with observations (e.g., ILO Sample Data)
2. **View Charts** - Navigate to the "Charts" section
3. **Look for the Green Banner** - If a chart has a live staging URL, you'll see:
   - 🌍 Live Chart Available on UN Data Staging
   - Thematic Area › Category
   - "View Live Chart →" button
4. **Click to View** - Opens the live staging chart in a new tab

### For Developers

#### Add New Chart Mappings

Edit `src/utils/staging-chart-urls.js`:

```javascript
export const ILO_CHART_MAPPINGS = {
  'undata/ilo/YOUR_INDICATOR_CODE': {
    title: 'Chart Title',
    themeId: 'UN_SUB_THEME_XX',
    categoryId: '123456789',
    category: 'Category Name',
    thematicArea: 'Thematic Area Name'
  }
};
```

#### Generate URL Programmatically

```javascript
import { generateStagingUrlAuto, hasStagingChart } from './utils/staging-chart-urls';

const variableId = 'dcid:undata/ilo/EES_XPLV_RT.00135.001';

// Check if mapping exists
if (hasStagingChart(variableId)) {
  // Generate URL
  const url = generateStagingUrlAuto(variableId);
  console.log(url); // Opens to exact chart
}
```

## Finding Theme and Category IDs

### Method 1: Browser Inspection

1. Navigate to staging site
2. Search for your indicator
3. Click on the chart
4. Inspect the URL hash:
   ```
   #carousel+{categoryId}+{variableId}+dc/topic/{themeId}
   ```

### Method 2: API Exploration

The staging site has an API that can be queried (requires authentication):

```bash
# Get thematic areas for ILO
GET https://staging.undatacommons.dev/api/thematic-areas?partner=ILO

# Get indicators for a specific area
GET https://staging.undatacommons.dev/api/indicators?area=children-and-youth&partner=ILO
```

## Known Limitations

1. **Mapping Required** - Only charts with explicit mappings will show the "View Live" button
2. **Authentication** - Staging site requires login (handled by browser session)
3. **Organization Support** - Currently focused on ILO; WHO, UNICEF, SDG mappings can be added
4. **CORS Restrictions** - Cannot embed staging charts in iframes due to CORS policy

## Roadmap

### Phase 1: Core Integration ✅
- [x] URL generation utility
- [x] "View Live Chart" button in ChartPreview
- [x] ILO chart mappings (4 indicators)
- [x] Documentation

### Phase 2: Expanded Coverage (Next)
- [ ] Add all 7,121 ILO indicators
- [ ] WHO indicator mappings
- [ ] UNICEF indicator mappings
- [ ] SDG indicator mappings
- [ ] Automated mapping discovery

### Phase 3: Advanced Features (Future)
- [ ] Iframe preview (if CORS allows)
- [ ] Side-by-side comparison (local vs. staging)
- [ ] Chart sync (highlight same data point)
- [ ] API integration for dynamic mapping

## Testing

### Test Cases

1. **ILO Parental Leave Chart**
   ```
   File: ILO Sample Data (With Charts)
   Variable: dcid:undata/ilo/EES_XPLV_RT.00135.001
   Expected: Green banner with "View Live Chart" button
   ```

2. **Chart Without Mapping**
   ```
   File: SDG Q4 2024
   Variable: Any schema-only variable
   Expected: No green banner (no live chart available)
   ```

3. **URL Validation**
   ```javascript
   const url = generateStagingUrlAuto('dcid:undata/ilo/EES_XPLV_RT.00135.001');
   // Should match: https://staging.undatacommons.dev/UNSDWebsite/undatacommons/areas/...
   ```

## FAQs

**Q: Why don't all charts show the "View Live" button?**  
A: Only charts with explicit mappings (theme ID + category ID) can generate staging URLs. These mappings must be added manually for each indicator.

**Q: Can I add my own chart mappings?**  
A: Yes! Edit `src/utils/staging-chart-urls.js` and add your indicator to the appropriate mappings object (ILO_CHART_MAPPINGS, WHO_CHART_MAPPINGS, etc.).

**Q: What if the staging URL doesn't work?**  
A: Ensure you're logged into the staging site. The URL requires authentication to access.

**Q: How do I find the category ID and theme ID for my chart?**  
A: Navigate to the chart on staging, then inspect the URL hash. The IDs are embedded in the format: `#carousel+{categoryId}+...+dc/topic/{themeId}`

## Technical Notes

### Base64 Encoding

The path component uses base64 encoding:
```javascript
const pathComponent = btoa(`Earth&0&${org}&`);
// ILO: "RWFydGgmMCZJTE8m" = base64("Earth&0&ILO&")
```

### Variable ID Extraction

MCF variable IDs come in various formats:
- `dcid:undata/ilo/EES_XPLV_RT.00135.001`
- `undata/ilo/EES_XPLV_RT.00135.001`
- `EES_XPLV_RT.00135.001`

The utility normalizes these to the format expected by staging URLs.

## Contact & Support

- **Issues**: Report integration issues in GitHub
- **Mappings**: Request new chart mappings via issue or PR
- **Documentation**: This file is in `/STAGING-CHARTS-INTEGRATION.md`

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

