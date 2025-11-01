# 🔗 URL Sharing Guide - Format Comparison

## Overview

The Format Comparison feature now supports **URL-based sharing**, allowing users to share direct links to specific observations with colleagues and stakeholders.

---

## 🎯 What's Shareable

You can share URLs that include:
- ✅ **Specific observation** (e.g., Angola 2018 poverty rate)
- ✅ **Auto-open comparison modal**
- ✅ **All other app state** (file selected, tab, theme, etc.)

---

## 📋 How to Share

### Method 1: Copy URL Button (Easiest!)

1. **Open Format Comparison** - Click "🔄 Compare Formats"
2. **Navigate to desired observation** - Use arrows, dropdown, or keyboard
3. **Click "🔗 Copy URL"** button (bottom right of modal)
4. **Share the link** - Paste in email, Slack, Teams, etc.

### Method 2: Copy from Browser

1. **Open Format Comparison**
2. **Navigate to observation**
3. **Copy URL from browser address bar**
4. **Share the link**

---

## 🌐 URL Structure

### Example URLs:

**Basic comparison (first observation):**
```
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=0
```

**Specific observation (Angola 2020):**
```
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=2&theme=dark
```

**Full state with all parameters:**
```
http://localhost:3000/?org=sdg&file=test-data&tab=cached&theme=dark&compare-formats=true&obs=5
```

### URL Parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `compare-formats` | boolean | Opens Format Comparison modal | `true` |
| `obs` | number | Index of observation to display (0-based) | `0`, `5`, `11` |
| `org` | string | Organization (sdg, ilo, who, unicef) | `sdg` |
| `file` | string | File/version selected | `test-data` |
| `tab` | string | Active tab (mcf, stat, datacommons, cached) | `cached` |
| `theme` | string | Dark/light mode | `dark` |

---

## 🔄 Real-Time URL Updates

The URL automatically updates when you:
- ✅ **Open/close** the Format Comparison modal
- ✅ **Navigate** to a different observation (arrows, dropdown)
- ✅ **Change any app state** (file, tab, theme)

**No need to manually copy** - the URL in your browser always reflects your current view!

---

## 📊 Use Cases

### 1. **Team Collaboration**
Share a specific observation with your colleague:
```
"Hey John, check out this data inconsistency in observation 7:
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=7"
```

### 2. **Data Review**
Send stakeholders a link to review specific data points:
```
"Please review Kenya 2020 poverty data across all formats:
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=8"
```

### 3. **Bug Reports**
Report issues with specific observations:
```
"SDMX format showing incorrect value for observation 3:
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=3"
```

### 4. **Documentation**
Link to specific examples in documentation:
```
"See Format Comparison documentation with live example:
http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=0"
```

---

## 🎬 What Happens When Link is Opened

1. **App loads** with all state from URL
2. **File auto-selects** (e.g., SDG Test Data)
3. **Data loads** (12 observations processed)
4. **Modal auto-opens** showing Format Comparison
5. **Observation jumps** to specified index (e.g., #7)
6. **User sees** the exact same view you shared!

---

## 🔐 Security & Permissions

### Current Implementation:
- ✅ URLs work for **test data** (no authentication required)
- ✅ State is validated before applying

### Future Enhancement (When Real Data Added):
- 🔒 **Token-based access** for restricted datasets
- 🔒 **Permission validation** before opening shared links
- 🔒 **Organization-level access control**

URL example with permissions:
```
http://localhost:3000/?org=ilo&file=v01&compare-formats=true&obs=42&token=abc123
```

---

## 💡 Tips & Best Practices

### ✅ DO:
- **Copy URL after navigating** to the exact observation you want
- **Test the link** before sharing (open in incognito/private window)
- **Add context** when sharing ("See observation 5 for the data issue")
- **Use "Copy URL" button** for guaranteed accuracy

### ❌ DON'T:
- **Edit URLs manually** (parameters are case-sensitive and validated)
- **Share URLs with sensitive data** without permission checks
- **Assume URLs work offline** (requires running server)

---

## 🧪 Testing URL Sharing

### Quick Test:

1. **Load Test Data:**
   - Go to SDG
   - Select "🧪 Test Data (CSV → All Formats)"

2. **Open Comparison:**
   - Click "🔄 Compare Formats"

3. **Navigate:**
   - Press → arrow key 3 times (now at observation #3)

4. **Copy URL:**
   - Click "🔗 Copy URL" button
   - You should get something like:
   ```
   http://localhost:3000/?org=sdg&file=test-data&compare-formats=true&obs=3&theme=dark
   ```

5. **Test in New Tab:**
   - Open new browser tab
   - Paste the URL
   - Should auto-open to observation #3!

---

## 🔧 Technical Details

### How It Works:

1. **State Management:**
   - `useUrlState` custom hook manages URL parameters
   - React state syncs with URL parameters

2. **URL Updates:**
   - `useEffect` watches `showFormatComparison` and `selectedObsIndex`
   - Calls `updateUrl()` whenever these change
   - Uses `window.history.replaceState()` (no page reload)

3. **URL Reading:**
   - On mount, `readUrlParams()` extracts parameters
   - If `compare-formats=true`, auto-opens modal
   - If `obs=N`, jumps to that observation

4. **Navigation Sync:**
   - Arrow buttons → update index → URL updates
   - Dropdown → update index → URL updates
   - Keyboard shortcuts → update index → URL updates

### Code References:

**URL State Hook:**
```javascript
// src/hooks/useUrlState.js
showComparison: params.get('compare-formats') === 'true',
obsIndex: params.get('obs') ? parseInt(params.get('obs'), 10) : null,
```

**App State Sync:**
```javascript
// src/App.js
const state = {
  showComparison: showFormatComparison,
  obsIndex: showFormatComparison ? selectedObsIndex : null,
};
updateUrl(state);
```

**Format Comparison Component:**
```javascript
// src/components/FormatComparison.jsx
const handleNext = () => {
  const newIndex = currentIndex < allObservations.length - 1 ? currentIndex + 1 : 0;
  setCurrentIndex(newIndex);
  if (onIndexChange) onIndexChange(newIndex); // Triggers URL update
};
```

---

## 🚀 Future Enhancements

### Planned Features:

1. **QR Code Generation** - Generate QR codes for mobile sharing
2. **Short URLs** - Create shortened URLs for easier sharing
3. **Embed Mode** - Share embeddable iframe links
4. **Social Sharing** - One-click share to Slack, Teams, Email
5. **URL History** - Save frequently shared observations
6. **Collaborative Annotations** - Add comments to shared observations

---

## 📞 Support

If you encounter issues with URL sharing:

1. **Check Browser Console** - Look for URL validation warnings
2. **Verify Parameters** - Ensure `obs` index is within range (0-11 for test data)
3. **Test Locally First** - Open URL in new tab before sharing
4. **Check Permissions** - Ensure recipient has access to the dataset

---

## 🎉 Summary

**URL sharing makes Format Comparison collaborative!**

- ✅ **Share specific observations** with precision
- ✅ **No screenshots needed** - live, interactive links
- ✅ **Always in sync** - URL updates automatically
- ✅ **Professional workflow** - perfect for team review

**Try it now:** Open Format Comparison, navigate to any observation, and click "🔗 Copy URL"! 🚀

