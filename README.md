# MCF Pipeline Viewer - Fixed Version

This is the **corrected version** that matches your Figma design exactly!

## 🔧 What Was Fixed

### 1. **Initial State Issue**
- ✅ App now loads with `unemployment_rate.mcf` and `v1.1.0` pre-selected
- ✅ Content appears immediately (no "Select an Indicator to Begin" screen)
- ✅ Tabs show content right away

### 2. **Diff Viewer**
- ✅ Side-by-side comparison working properly
- ✅ Shows line numbers on both sides
- ✅ Highlights additions (green) and removals (red)
- ✅ Toggle button works correctly

### 3. **Layout & Design**
- ✅ Matches Figma color scheme exactly
- ✅ Purple accent color (#8e44ad) for active tabs
- ✅ Proper spacing and padding
- ✅ Tab names match Figma (including ".STAT")

### 4. **All Tabs Working**
- ✅ **Raw** - Shows unformatted MCF
- ✅ **Formatted** - Shows indented MCF
- ✅ **.STAT** - Shows STAT format conversion
- ✅ **DataCommons** - Shows JSON representation
- ✅ **Cached** - Shows cached version with headers
- ✅ **Chart** - Shows interactive line/bar charts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📂 Project Structure

```
mcf-viewer-fixed/
├── src/
│   ├── App.jsx                 ← Fixed main component
│   ├── main.jsx               ← Entry point
│   ├── index.css              ← Global styles
│   └── components/
│       ├── FileSelector.jsx    ← Dropdown selectors
│       ├── DiffViewer.jsx     ← Side-by-side diff
│       ├── CodeDisplay.jsx    ← Code viewer with copy
│       ├── ChartPreview.jsx   ← Chart visualization
│       └── ui/                ← Shadcn/ui components
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Key Features

### File Selector Bar
- **Source MCF dropdown** - Select from 4 MCF files
- **Version dropdown** - Choose version to view
- **Show Diff button** - Toggle side-by-side comparison
- **Compare version dropdown** - Appears when diff is enabled

### Diff Viewer
- Shows changes between two versions
- Line-by-line comparison
- Color-coded additions/removals
- Scrollable with line numbers

### Code Display
- Syntax highlighting
- Line numbers
- Copy button
- Line/character count
- Scrollable area

### Chart Preview
- Interactive charts (Line/Bar)
- Toggle between chart types
- Responsive design
- Custom purple theme

## 🔄 How to Add Your Real Data

Replace the `mockMCFData` object in `App.jsx` (lines 12-94):

```javascript
const mockMCFData = {
  'your_file.mcf': {
    'v1.0.0': `Your MCF content here...`,
    'v2.0.0': `Updated MCF content...`,
  },
};
```

Or connect to your actual data source:
```javascript
// Example: Load from API
const [mcfData, setMCFData] = useState({});

useEffect(() => {
  fetch('/api/mcf-files')
    .then(res => res.json())
    .then(data => setMCFData(data));
}, []);
```

## 🎯 What's Different from the Original?

| Feature | Original | Fixed Version |
|---------|----------|---------------|
| Initial state | "Select Indicator" screen | Pre-loaded with data |
| Diff viewer | Not working | ✅ Working side-by-side |
| Tab styling | Generic | Purple accent (#8e44ad) |
| Layout | Didn't match Figma | ✅ Matches exactly |
| Tab names | "Stat" | ".STAT" (matches Figma) |

## 🐛 Troubleshooting

### If tabs don't switch:
Check browser console for errors and ensure all Radix UI deps are installed

### If diff viewer shows incorrectly:
Verify that both versions have data in `mockMCFData`

### If styles look wrong:
Run `npm install` to ensure Tailwind and dependencies are installed

## 📸 Screenshots Match

Your Figma design:
- ✅ Header with logo and theme toggle
- ✅ File selector bar
- ✅ Optional diff viewer (toggleable)
- ✅ 6 tabs in a row
- ✅ Content area with code or chart
- ✅ Footer

## 💡 Next Steps

1. **Replace mock data** with your real MCF files
2. **Add more files** to the dropdown
3. **Customize colors** in `App.jsx` and `tailwind.config.js`
4. **Add authentication** if needed
5. **Deploy** to Vercel/Netlify

## 🎨 Color Palette (Figma Match)

```
Background:  #2c3e50
Secondary:   #34495e  
Border:      #1a252f
Text:        #ecf0f1
Muted:       #95a5a6, #7f8c8d
Accent:      #8e44ad (Purple)
Sun:         #f39c12
Moon:        #3498db
```

## 📦 Dependencies

All dependencies from your original project are preserved:
- React 18.3
- Vite 5.4
- Recharts 2.12
- Radix UI components
- Tailwind CSS 3.4
- Lucide React icons

---

**Ready to use!** Just run `npm install` and `npm run dev` 🚀
