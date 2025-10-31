# 📸 Visual Reference Guide

## What You'll See After Installation

### 1. Dashboard Header
```
╔══════════════════════════════════════════════════════════════════╗
║  UN Data Commons Dashboard                                       ║
║  Complete Data Pipeline Visualization:                          ║
║  RAW → MCF → .STAT → LIVE DC → Cached → Visualization          ║
╚══════════════════════════════════════════════════════════════════╝
```

### 2. Dataset Selector (Top Section)
```
┌─────────────────────────────────────────────────────────────────┐
│ Select Dataset                                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  🎯     │  │  👷     │  │  👶     │  │  🏥     │          │
│  │  SDG    │  │  ILO    │  │ UNICEF  │  │  WHO    │          │
│  │ 7 ind   │  │ 4 ind   │  │ 4 ind   │  │ 4 ind   │          │
│  │ Q4-Q2   │  │ Latest  │  │ Latest  │  │ Latest  │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. After Selecting SDG
```
┌─────────────────────────────────────────────────────────────────┐
│ Select Quarter                                                   │
│  [Q4-2024]  [Q1-2025]  [Q2-2025]                               │
│                                                                  │
│ Select Indicator                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ -- Select an indicator --                           ▼    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│          [📊 Load This Dataset]                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Indicator Preview with 7 Tabs
```
┌─────────────────────────────────────────────────────────────────┐
│ Proportion of population below international poverty line       │
│ Percentage of population living below $2.15 per day            │
│ Unit: Percentage • Source: UN Statistics • Indicator: dc/sdg... │
│                                                     [⚡ CACHED] │
├─────────────────────────────────────────────────────────────────┤
│ [📝 RAW] [📄 MCF] [🌐 .STAT] [🔴 LIVE] [💾 Cached] [📊 Chart] [📋 Table]
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 CHART VIEW                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │    50 ┤                                                │   │
│  │    45 ┤   ●───●───●                                    │   │
│  │    40 ┤             ●───●───●                          │   │
│  │    35 ┤                       ●───●───●                │   │
│  │    30 └──────────────────────────────────────────────  │   │
│  │       2015  2017  2019  2021  2023                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Latest Value: 42.35] [Time Period: 2015-2023] [Points: 9]   │
└─────────────────────────────────────────────────────────────────┘
```

### 5. RAW Tab View
```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 RAW Data Source                                              │
│ Original data before MCF transformation                         │
├─────────────────────────────────────────────────────────────────┤
│ Source Information                                               │
│ Data Provider:    UN Statistics Division                        │
│ Original Format:  CSV                                           │
│ Collection Date:  2024-Q2                                       │
│ Records:          9 observations                                │
├─────────────────────────────────────────────────────────────────┤
│ Raw CSV Data Sample                                             │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ SERIES,GEOGRAPHY,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE,...  │  │
│ │ dc/sdg_1_1_1,country/USA,2015,45.23,Percentage,...       │  │
│ │ dc/sdg_1_1_1,country/USA,2016,44.80,Percentage,...       │  │
│ │ dc/sdg_1_1_1,country/USA,2017,44.15,Percentage,...       │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 6. MCF Tab View
```
┌─────────────────────────────────────────────────────────────────┐
│ 📄 MCF (Meta Content Format)              [📋 Copy MCF]        │
│ Data Commons knowledge graph format                             │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ # Statistical Variable Definition                         │  │
│ │ Node: dcid:dc/sdg_1_1_1                                   │  │
│ │ typeOf: dcs:StatisticalVariable                           │  │
│ │ name: "Proportion of population below poverty line"       │  │
│ │ description: "Percentage of population living below..."   │  │
│ │ measuredProperty: dcs:count                               │  │
│ │ statType: dcs:measuredValue                               │  │
│ │ unit: Percentage                                          │  │
│ │                                                            │  │
│ │ # Observations                                            │  │
│ │ Node: dcid:dc/sdg_1_1_1_obs_0                             │  │
│ │ typeOf: dcs:StatVarObservation                            │  │
│ │ variableMeasured: dcid:dc/sdg_1_1_1                       │  │
│ │ observationAbout: dcid:country/USA                        │  │
│ │ observationDate: "2015"                                   │  │
│ │ value: 45.23                                              │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Table Tab View
```
┌─────────────────────────────────────────────────────────────────┐
│ Data Table                                                       │
├──────┬─────────────┬────────┬────────────┬────────────────────┤
│ Year │ Location    │  Value │ Unit       │ Source             │
├──────┼─────────────┼────────┼────────────┼────────────────────┤
│ 2015 │ USA         │  45.23 │ Percentage │ UN Statistics      │
│ 2016 │ USA         │  44.80 │ Percentage │ UN Statistics      │
│ 2017 │ USA         │  44.15 │ Percentage │ UN Statistics      │
│ 2018 │ USA         │  43.67 │ Percentage │ UN Statistics      │
│ 2019 │ USA         │  43.01 │ Percentage │ UN Statistics      │
│ 2020 │ USA         │  42.78 │ Percentage │ UN Statistics      │
│ 2021 │ USA         │  42.54 │ Percentage │ UN Statistics      │
│ 2022 │ USA         │  42.41 │ Percentage │ UN Statistics      │
│ 2023 │ USA         │  42.35 │ Percentage │ UN Statistics      │
└──────┴─────────────┴────────┴────────────┴────────────────────┘
Note: Data shown represents Proportion of population below...
Source: UNSD. Last updated: Recent.
```

### 8. Architecture Visualization
```
┌─────────────────────────────────────────────────────────────────┐
│ Data Pipeline Architecture                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📝        📄        🌐        🔴        💾        📊        📋  │
│ 1. RAW   2. MCF   3. .STAT  4. LIVE   5. Cached  6. Chart  7. Table
│ CSV      Knowledge SDMX-JSON API      Fast       Visual    Data │
│ Format   Graph              Query     Access     Chart     View │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9. Performance Statistics
```
┌─────────────────────────────────────────────────────────────────┐
│ Performance Statistics                                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┬────────────┬────────────┬────────────┐        │
│  │ 📊         │ ⚡         │ 🔍         │ 📈         │        │
│  │ Total      │ Cache      │ Cache      │ Hit        │        │
│  │ Queries    │ Hits       │ Misses     │ Rate       │        │
│  │     12     │     9      │     3      │   75%      │        │
│  └────────────┴────────────┴────────────┴────────────┘        │
│  ┌────────────┬────────────────────────────────────────┐      │
│  │ 💾         │ 🌐                                     │      │
│  │ Cached     │ API                                    │      │
│  │ Items      │ Requests                               │      │
│  │     3      │     12                                 │      │
│  └────────────┴────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 10. Available Datasets Grid
```
┌─────────────────────────────────────────────────────────────────┐
│ Available Datasets                                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   🎯     │  │   👷     │  │   👶     │  │   🏥     │      │
│  │          │  │          │  │          │  │          │      │
│  │ SDG      │  │ ILO      │  │ UNICEF   │  │ WHO      │      │
│  │ (UNSD)   │  │          │  │          │  │          │      │
│  │          │  │          │  │          │  │          │      │
│  │7 indic.  │  │4 indic.  │  │4 indic.  │  │4 indic.  │      │
│  │Q4-24,    │  │Latest    │  │Latest    │  │Latest    │      │
│  │Q1-25,Q2  │  │release   │  │release   │  │release   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Scheme

- **SDG (UNSD):** Blue (#1976d2)
- **ILO:** Orange (#f57c00)
- **UNICEF:** Cyan (#00bcd4)
- **WHO:** Green (#4caf50)
- **Cache Hit:** Green (#4caf50)
- **Cache Miss:** Orange (#ff9800)
- **Live API:** Red (#f44336)

---

## Interaction Flow

```
User arrives
    ↓
Sees Dataset Selector
    ↓
Clicks organization card (e.g., SDG)
    ↓
Selects quarter (Q4-2024, Q1-2025, Q2-2025)
    ↓
Chooses indicator from dropdown
    ↓
Clicks "Load This Dataset"
    ↓
Indicator Preview appears with Chart tab active
    ↓
User clicks through 7 tabs to explore data stages
    ↓
Chart tab: Sees line chart, can switch to bar
    ↓
MCF tab: Can copy MCF format to clipboard
    ↓
Table tab: Sees UN Data site-style table
    ↓
Performance stats update showing cache/API usage
```

---

## Key Visual Elements

### Badges
- **⚡ CACHED** (Green) - Data from localStorage cache
- **🌐 API** (Blue) - Data from API call

### Buttons
- **Load This Dataset** (Blue, large) - Primary action
- **Copy MCF** (Green) - In MCF tab
- **Change Dataset** (White with blue border) - Return to selector

### Cards
- **Organization cards** - Large, clickable, highlight when selected
- **Stat cards** - Small, centered, with icon and value
- **Info panels** - Light background with colored borders

---

This visual reference shows exactly what you'll see at each step!
