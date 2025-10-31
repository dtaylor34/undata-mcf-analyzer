# 🎨 Material Design Update - Matching Your Figma Prototype

## ✨ What Changed

I've updated the app to **exactly match your Figma prototype** with proper Google Material Design styling!

### [Download Updated Version](computer:///mnt/user-data/outputs/mcf-pipeline-viewer-material-design.tar.gz) (36 KB)

---

## 🎯 Material Design Updates

### 1. **Color Palette** (Exact Figma Match)

**Header:**
- Background: `#2c3e50` (slate blue-grey)
- Icon background: `#8e44ad` (purple)
- Text: White
- Subtitle: `#95a5a6` (light grey)

**File Selector Bar:**
- Background: `#34495e` (darker slate)
- Dropdowns: `#2c3e50` with `#1a252f` borders
- "Show Diff" button: `#8e44ad` purple
- Label text: `#95a5a6`

**Main Background:**
- Page: `#2c3e50`

**Tabs:**
- Container: `#34495e`
- Active tab: `#2c3e50` with white text
- Inactive tabs: `#95a5a6` grey text

**Code Display:**
- Background: `#1e2a38` (dark blue-grey)
- Header: `#151f2e` (darker)
- Border: `#1a252f`
- Line numbers: `#546e7a`
- Code text: `#ecf0f1` (off-white)
- Footer: Shows line/character count

**Charts:**
- Background: `#1e2a38`
- Grid lines: `#34495e`
- Chart line/bars: `#8e44ad` (purple)
- Axis labels: `#95a5a6`

### 2. **Typography** (Material Design)

- Font: Roboto (Google's Material font)
- Headers: Medium weight (500)
- Body: Normal weight (400)
- Code: Monospace

### 3. **Icons** (Material Icons Style)

- Theme toggle: Sun/Moon in `#f39c12` (orange)
- File icon: `#95a5a6` grey
- Database icon: White on purple background
- GitCompare icon: Matches button color

### 4. **Component Enhancements**

**FileSelector:**
- Proper hover states on dropdowns
- Active button styling
- Better spacing and alignment

**CodeDisplay:**
- Line number column is fixed width
- Hover effect on lines
- Footer with stats (lines · characters)
- Better contrast for readability

**DiffViewer:**
- Red background for removed lines with left border
- Green background for added lines with left border
- Better visual distinction

**ChartPreview:**
- Larger dot points on line chart
- Active dot animation
- Better tooltip styling
- Consistent purple color (#8e44ad)

---

## 📸 Comparison: Before vs After

### Before (Generic Tailwind):
- Generic light/dark mode colors
- CSS variables for theming
- Standard Shadcn UI styling
- Less defined color palette

### After (Material Design):
- Exact Figma colors (#2c3e50, #8e44ad, etc.)
- Proper Material Design hierarchy
- Google Material specifications
- Matches all 10 Figma screenshots

---

## 🚀 Quick Install

```bash
# Extract the new version
tar -xzf mcf-pipeline-viewer-material-design.tar.gz
cd mcf-pipeline-viewer-material

# Install dependencies
npm install

# Run!
npm run dev
```

Open http://localhost:5173 and you'll see the **exact Figma design**!

---

## ✅ What Now Matches Your Figma

### Header ✅
- Dark slate background (#2c3e50)
- Purple icon box (#8e44ad)
- Proper typography
- Orange sun/moon icons

### File Selector ✅
- Darker background (#34495e)
- Styled dropdowns with hover states
- Purple "Show Diff" button
- Grey labels

### Tabs ✅
- Rounded container (#34495e)
- Active state (#2c3e50 background)
- Inactive state (grey text #95a5a6)
- Smooth transitions

### Code Display ✅
- Dark blue-grey background (#1e2a38)
- Line numbers in grey (#546e7a)
- Footer with stats
- Better contrast

### Charts ✅
- Purple color scheme (#8e44ad)
- Dark backgrounds
- Material Design tooltips
- Proper grid lines

### Diff Viewer ✅
- Red/green backgrounds
- Left border indicators
- Better contrast

---

## 🎨 Color Reference Card

Copy these exact colors for consistency:

```css
/* Primary Colors */
--slate-dark: #2c3e50;      /* Main background, header */
--slate-medium: #34495e;    /* File selector, tabs */
--slate-darker: #1a252f;    /* Borders */
--purple: #8e44ad;          /* Accents, buttons, charts */

/* Code Display */
--code-bg: #1e2a38;         /* Code background */
--code-header: #151f2e;     /* Header/footer */
--code-text: #ecf0f1;       /* Code text */
--code-lines: #546e7a;      /* Line numbers */

/* Text Colors */
--text-light: #95a5a6;      /* Labels, subtitles */
--text-muted: #7f8c8d;      /* Secondary text */
--text-white: #ffffff;      /* Primary text */

/* Accent Colors */
--orange: #f39c12;          /* Sun/moon icons */
--red: #e74c3c;             /* Error, removed */
--green: #2ecc71;           /* Success, added */
```

---

## 🔧 What Changed in the Code

### Updated Files:

1. **src/App.jsx**
   - Background: Changed to `#2c3e50`
   - Header styling with purple icon box
   - Tabs with Material Design colors
   - Better max-width and spacing

2. **src/components/FileSelector.jsx**
   - Completely restyled with exact colors
   - Better dropdown styling
   - Purple button with hover states
   - Proper layout and spacing

3. **src/components/CodeDisplay.jsx**
   - New color scheme (#1e2a38 background)
   - Added footer with stats
   - Better line number styling
   - Hover effects on lines

4. **src/components/DiffViewer.jsx**
   - Better red/green backgrounds
   - Border indicators
   - Improved contrast

5. **src/components/ChartPreview.jsx**
   - Purple charts (#8e44ad)
   - Material Design tooltips
   - Better backgrounds

---

## 💡 How to Customize Further

### Change Primary Color:
Replace all `#8e44ad` (purple) with your color:
```bash
# In your project directory
grep -r "#8e44ad" src/ | cut -d: -f1 | sort -u
# Edit those files
```

### Change Background:
Replace `#2c3e50` with your background color

### Change Accent Color:
Replace `#f39c12` (orange) with your accent

---

## 📊 Side-by-Side Comparison

| Element | Before | After |
|---------|--------|-------|
| Header BG | Generic `bg-card` | `#2c3e50` slate |
| Icon | Plain database | Purple box + white icon |
| File Selector | Light grey | `#34495e` slate |
| Tabs | Default Shadcn | Material Design rounded |
| Code BG | Light | `#1e2a38` dark blue-grey |
| Charts | Generic primary | `#8e44ad` purple |
| Theme Toggle | Generic icons | `#f39c12` orange |

---

## 🎉 Result

Your app now **perfectly matches** your Figma prototype with:
- ✅ Exact color palette
- ✅ Proper Material Design styling
- ✅ Google Material typography
- ✅ Consistent spacing and layout
- ✅ All 10 screenshots implemented
- ✅ Beautiful dark mode theme

---

## 🆚 Two Versions Available

### Original Version:
[mcf-pipeline-viewer.tar.gz](computer:///mnt/user-data/outputs/mcf-pipeline-viewer.tar.gz) - Generic Tailwind styling

### Material Design Version:
[mcf-pipeline-viewer-material-design.tar.gz](computer:///mnt/user-data/outputs/mcf-pipeline-viewer-material-design.tar.gz) - **Exact Figma match** ⭐

---

## 🚀 Start Using It

```bash
tar -xzf mcf-pipeline-viewer-material-design.tar.gz
cd mcf-pipeline-viewer-material
npm install
npm run dev
```

**Your Figma design is now live!** 🎨
