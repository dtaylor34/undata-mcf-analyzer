# Versioning Setup Guide

## Current Status

### ✅ What Works Now:

**1. Dual Chart Preview Added!**

- Click **"📊 Dual Chart Preview"** button in the header
- Shows DataCommons and .STAT charts **side-by-side**
- Works for any MCF file with observations

**2. SDG Version Comparison**

- ✅ SDG has **3 versions**: Q4 2024, Q1 2025, Q2 2025
- ✅ You can select different versions and compare them
- ✅ Diff viewer shows changes between quarters

---

### ❌ What's Missing:

**WHO, UNICEF, ILO have NO versions!**

Currently these partners only have a single "Default" version:

- **WHO**: Only `/datacommons/who/schema/` (no quarterly versions)
- **UNICEF**: Only `/datacommons/unicef/schema/` (no versions)
- **ILO**: Only `/datacommons/ilo/schema/` (no versions)

**Why?** The actual data files in your `datacommons/` folder don't have versioned directories for these partners.

---

## How to Add Versioning for Other Partners

To enable version comparison for WHO, UNICEF, or ILO, you need to:

### Step 1: Organize Files by Version

Create quarterly folders like SDG has:

```
datacommons/
├── who/
│   ├── q4-2024/           # ← Create this
│   │   └── schema/
│   │       ├── schema.mcf
│   │       ├── sv.mcf
│   │       └── ...
│   ├── q1-2025/           # ← Create this
│   │   └── schema/
│   │       └── ...
│   └── q2-2025/           # ← Create this
│       └── schema/
│           └── ...
│
├── unicef/
│   ├── q4-2024/           # ← Create this
│   │   └── schema/
│   └── ...
│
├── ilo/
│   ├── q4-2024/           # ← Create this
│   │   └── schema/
│   └── ...
```

### Step 2: Update `mcf-file-index.js`

Add versioning structure like SDG has:

```javascript
who: {
  name: 'WHO',
  emoji: '🏥',
  versions: {    // ← Change from `files` to `versions`
    'q4-2024': {
      name: 'Q4 2024',
      files: [
        { id: 'who/q4-2024/schema/schema.mcf', path: '...', name: 'schema.mcf' },
        { id: 'who/q4-2024/schema/sv.mcf', path: '...', name: 'sv.mcf' },
        // ... more files
      ]
    },
    'q1-2025': {
      name: 'Q1 2025',
      files: [
        { id: 'who/q1-2025/schema/schema.mcf', path: '...', name: 'schema.mcf' },
        // ...
      ]
    }
  }
}
```

### Step 3: That's It!

The `FileSelector` component will automatically:

- ✅ Show version dropdown for WHO
- ✅ Enable "Compare with" version selector
- ✅ Allow diff comparison between versions

---

## Example: Adding Q4 2024 and Q1 2025 for WHO

**Current WHO structure:**

```
datacommons/who/schema/
├── schema.mcf
├── sv.mcf
├── series.mcf
├── topics.mcf
└── who.mcf
```

**New WHO structure with versions:**

```
datacommons/who/
├── q4-2024/
│   └── schema/
│       ├── schema.mcf
│       ├── sv.mcf
│       ├── series.mcf
│       ├── topics.mcf
│       └── who.mcf
│
└── q1-2025/
    └── schema/
        ├── schema.mcf     # ← Updated version
        ├── sv.mcf         # ← Updated version
        ├── series.mcf
        ├── topics.mcf
        └── who.mcf
```

**Then update `src/mcf-file-index.js`:**

```javascript
who: {
  name: 'WHO',
  emoji: '🏥',
  versions: {
    'q4-2024': {
      name: 'Q4 2024',
      files: [
        { id: 'who/q4-2024/schema/schema.mcf', path: '../datacommons/who/q4-2024/schema/schema.mcf', name: 'schema.mcf' },
        { id: 'who/q4-2024/schema/sv.mcf', path: '../datacommons/who/q4-2024/schema/sv.mcf', name: 'sv.mcf' },
        { id: 'who/q4-2024/schema/series.mcf', path: '../datacommons/who/q4-2024/schema/series.mcf', name: 'series.mcf' },
        { id: 'who/q4-2024/schema/topics.mcf', path: '../datacommons/who/q4-2024/schema/topics.mcf', name: 'topics.mcf' },
        { id: 'who/q4-2024/schema/who.mcf', path: '../datacommons/who/q4-2024/schema/who.mcf', name: 'who.mcf' },
      ]
    },
    'q1-2025': {
      name: 'Q1 2025',
      files: [
        { id: 'who/q1-2025/schema/schema.mcf', path: '../datacommons/who/q1-2025/schema/schema.mcf', name: 'schema.mcf' },
        { id: 'who/q1-2025/schema/sv.mcf', path: '../datacommons/who/q1-2025/schema/sv.mcf', name: 'sv.mcf' },
        { id: 'who/q1-2025/schema/series.mcf', path: '../datacommons/who/q1-2025/schema/series.mcf', name: 'series.mcf' },
        { id: 'who/q1-2025/schema/topics.mcf', path: '../datacommons/who/q1-2025/schema/topics.mcf', name: 'topics.mcf' },
        { id: 'who/q1-2025/schema/who.mcf', path: '../datacommons/who/q1-2025/schema/who.mcf', name: 'who.mcf' },
      ]
    }
  },
  // Keep CSV files separate
  sampleCSVFiles: [
    'WHO__Adult_curr_tob_use.csv',
    'WHO__MALARIA_EST_CASES.csv',
    // ...
  ]
}
```

---

## Testing the Setup

After organizing files and updating the index:

1. **Restart server**: `npm start`
2. **Select WHO** in organization dropdown
3. **You should now see**: "Version" dropdown with Q4 2024 and Q1 2025
4. **Enable "Compare with"** toggle
5. **Select different versions** to compare
6. **View diff** showing changes between quarters

---

## Quick Summary

### To Enable Versioning:

| Partner    | Current                                     | Needed                                |
| ---------- | ------------------------------------------- | ------------------------------------- |
| **SDG**    | ✅ Has versions (Q4 2024, Q1 2025, Q2 2025) | Nothing!                              |
| **WHO**    | ❌ Only Default                             | Create `q4-2024/`, `q1-2025/` folders |
| **UNICEF** | ❌ Only Default                             | Create `q4-2024/`, `q1-2025/` folders |
| **ILO**    | ❌ Only Default                             | Create `q4-2024/`, `q1-2025/` folders |

### To View Dual Chart Preview:

✅ **Already working!** Just click the **"📊 Dual Chart Preview"** button in the header (top-right, next to Share button)

---

## Questions?

**Q: Do we have the actual WHO/UNICEF/ILO versioned data?**
A: Check your `datacommons/` folder. If you have quarterly snapshots, just organize them into version folders.

**Q: Can I add versions retroactively?**
A: Yes! Just create the folder structure and copy the files for each snapshot.

**Q: Does this work with CSV files too?**
A: Yes! Once you set up versioning, you can compare schema changes AND data changes (CSV → MCF converted on the fly).

---

**Ready to set up versioning?** Follow the steps above for any partner you want to enable version comparison for!
