# 🗂️ MCF File Structure Guide: Multiple Files Working Together

## 🎯 Quick Answer

**Yes! It takes a COMBINATION of these files to create charts.**

Think of it like building a house:
- **schema.mcf** = Foundation (base types, enumerations)
- **sv.mcf** = Blueprints (what can be measured)
- **unit.mcf** = Materials list (units of measurement)
- **ilo_topics.mcf** = Room organization (thematic areas)
- **series.mcf** = Furniture (data series)
- **ilo_measurement_method.mcf** = Building codes (how data is collected)

**Together they create the complete structure for charts!**

---

## 📊 The 7 ILO Schema Files

### 1. **schema.mcf** - Foundation & Type Definitions
**Size**: ~3,300 lines  
**Purpose**: Defines base classes, enumerations, and properties

**Contains**:
- Age groups: `Y15T24`, `Y25T54`, `Y_GE65`
- Sex categories: `Male`, `Female`, `Total`
- Economic activity types
- Industry classifications
- Occupation codes

**Example**:
```mcf
Node: dcid:UNDATA_ILO_AgeEnum
typeOf: schema:Class
subClassOf: schema:Enumeration
name: "AgeEnum"

Node: dcid:UNDATA_ILO_AgeEnum_Y15T24
typeOf: dcs:UNDATA_ILO_AgeEnum
name: "15 to 24 years old"
```

**Role in Charts**: Provides the vocabulary that other files reference

---

### 2. **sv.mcf** - Statistical Variables (The Big One!)
**Size**: ~69,200 lines  
**Purpose**: Defines WHAT can be measured (the actual indicators)

**Contains**:
- 1,000+ unique statistical variables
- Each represents a specific indicator (e.g., "Labour force [Female, 15-24 years]")
- References properties from schema.mcf

**Example**:
```mcf
Node: dcid:undata/ilo/EAP_5EAP_NB.SEX--F__AGE--Y15T24
typeOf: dcs:StatisticalVariable
measuredProperty: dcs:value
name: "Labour force (current ILO definition) [Female, 15 to 24 years old]"
populationType: dcs:UNDATA_ILO_EAP_5EAP_NB
age: dcs:UNDATA_ILO_AgeEnum_Y15T24
undata_ilo_sex: dcs:UNDATA_ILO_SexEnum_F
```

**Role in Charts**: These ARE the charts! Each StatisticalVariable becomes a potential chart when combined with observation data.

---

### 3. **unit.mcf** - Units of Measurement
**Size**: ~30 lines  
**Purpose**: Defines HOW measurements are expressed

**Contains**:
- Currency units: USD, PPP-adjusted USD
- Count units: Persons, Cases, Days, Hours
- Rate units: Percentage

**Example**:
```mcf
Node: dcid:UNDATA_ILO_PT
typeOf: dcs:UNDATA_ILO_UnitOfMeasure
name: "Percentage"

Node: dcid:UNDATA_ILO_PS
typeOf: dcs:UNDATA_ILO_UnitOfMeasure
name: "Persons"
```

**Role in Charts**: Tells you what the Y-axis represents (%, people, dollars, etc.)

---

### 4. **ilo_topics.mcf** - Thematic Organization
**Size**: ~9,200 lines  
**Purpose**: Groups indicators into UN thematic areas

**Contains**:
- 12 UN Data Thematic Areas
- Topic hierarchy (themes → sub-themes)
- Links between topics and statistical variables

**Example**:
```mcf
Node: dcid:dc/topic/UN_THEME_3
name: "Children and youth"
typeOf: dcid:Topic
relevantVariable: dcid:dc/topic/UN_SUB_THEME_25, dcid:dc/topic/UN_SUB_THEME_27

Node: dcid:dc/topic/UN_SUB_THEME_25
name: "Child protection"
typeOf: dcid:Topic
relevantVariable: dcid:undata/ilo/CHL_DHAZ_NOC, dcid:undata/ilo/CHL_DWRK_NOC
specializationOf: dcid:dc/topic/UN_THEME_3
```

**Role in Charts**: This is how the website organizes charts into categories (like you saw in the Explorer view!)

---

### 5. **series.mcf** - Data Series Metadata
**Size**: Variable  
**Purpose**: Defines data collection series and their properties

**Contains**:
- Series identifiers
- Data source information
- Collection methodology

**Role in Charts**: Provides context about where the data comes from

---

### 6. **ilo_measurement_method.mcf** - Measurement Methods
**Size**: Variable  
**Purpose**: Documents HOW data is collected and calculated

**Contains**:
- Survey types (LFS, HIES, Census)
- Calculation methods
- Data quality indicators

**Role in Charts**: Explains the methodology (footnotes, data quality)

---

### 7. **ilo.mcf** - Master Reference (Optional)
**Size**: Variable  
**Purpose**: May contain imports or references to other files

**Role in Charts**: Ties everything together (if used)

---

## 🔗 How They Work Together

### The Complete Chain:

```
┌──────────────────────────────────────────────────────────────────┐
│                    SCHEMA FILES (Definitions)                     │
└──────────────────────────────────────────────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │    schema.mcf          │ ← Base types & enums
                    │  "What is an Age?"     │
                    └────────────────────────┘
                                 ↓
         ┌──────────────────────┼──────────────────────┐
         ↓                      ↓                       ↓
┌─────────────────┐  ┌─────────────────┐   ┌─────────────────┐
│   unit.mcf      │  │ ilo_topics.mcf  │   │ ilo_measurement │
│  "Percentage"   │  │ "Children/Youth"│   │   _method.mcf   │
└─────────────────┘  └─────────────────┘   └─────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │      sv.mcf            │ ← MAIN FILE!
                    │  "Labour force [F,15-24]" │  (References all above)
                    │  + 1,000 more variables │
                    └────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │   OBSERVATION DATA     │ ← CSV files/API
                    │  (Actual values)       │
                    │  Angola: 5.9%          │
                    │  Bangladesh: 10.2%     │
                    └────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │       CHART! 📊        │
                    └────────────────────────┘
```

---

## 🎯 Real Example: Creating a Chart

### Step 1: schema.mcf defines the building blocks
```mcf
Node: dcid:UNDATA_ILO_AgeEnum_Y15T24
typeOf: dcs:UNDATA_ILO_AgeEnum
name: "15 to 24 years old"

Node: dcid:UNDATA_ILO_SexEnum_F
typeOf: dcs:UNDATA_ILO_SexEnum
name: "Female"
```

### Step 2: unit.mcf defines measurement
```mcf
Node: dcid:UNDATA_ILO_PT
name: "Percentage"
```

### Step 3: sv.mcf combines them into a StatisticalVariable
```mcf
Node: dcid:undata/ilo/EAP_5EAP_NB.SEX--F__AGE--Y15T24
typeOf: dcs:StatisticalVariable
name: "Labour force (current ILO definition) [Female, 15 to 24 years old]"
age: dcs:UNDATA_ILO_AgeEnum_Y15T24     ← References schema.mcf
undata_ilo_sex: dcs:UNDATA_ILO_SexEnum_F  ← References schema.mcf
```

### Step 4: ilo_topics.mcf organizes it
```mcf
Node: dcid:dc/topic/UN_SUB_THEME_25
name: "Child protection"
relevantVariable: dcid:undata/ilo/EAP_5EAP_NB.SEX--F__AGE--Y15T24  ← Links the SV
```

### Step 5: Observation data provides values
```csv
dcid:undata/ilo/EAP_5EAP_NB.SEX--F__AGE--Y15T24, 2022, country/AGO, 5.9
dcid:undata/ilo/EAP_5EAP_NB.SEX--F__AGE--Y15T24, 2022, country/BGD, 10.2
```

### Result: Chart appears in "Children and Youth" → "Child Protection"
```
📊 Labour force [Female, 15-24 years]
┌───────────────────────────────────────┐
│ Angola:      ████ 5.9%                │
│ Bangladesh:  ██████ 10.2%             │
│ Chile:       ████████████ 23.4%       │
└───────────────────────────────────────┘
```

---

## 📦 Why This Modular Approach?

### ✅ Advantages:

1. **Maintainability**: Update age ranges in one place (schema.mcf), affects all 1,000+ variables
2. **Reusability**: Same age enum used across different indicators
3. **Clarity**: Each file has a clear purpose
4. **Collaboration**: Different teams can work on different files
5. **Version Control**: Easier to track changes in smaller files
6. **Performance**: Can load only needed files for specific queries

### 🎯 Production Process:

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Schema Team defines base types (schema.mcf)         │
│         "What age groups do we support?"                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Subject Experts define variables (sv.mcf)           │
│         "We need labor force by sex and age"                 │
│         (References schema.mcf types)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Content Team organizes topics (ilo_topics.mcf)      │
│         "This goes under 'Children and Youth'"               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Data Team provides observations (CSV)               │
│         "Here are the actual values"                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Build System combines all → Cached JSON             │
│         "Pre-computed charts ready for website"              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 In Your MCF Analyzer Tool

### When you view different files:

| File | What You See | Impact on Charts |
|------|-------------|------------------|
| **schema.mcf** | Base definitions | No charts (just building blocks) |
| **sv.mcf** | Variable definitions | Potential charts (needs data) |
| **unit.mcf** | Units | Y-axis labels |
| **ilo_topics.mcf** | Organization | Where charts appear on website |
| **series.mcf** | Data series | Chart metadata |
| **ilo_measurement_method.mcf** | Methods | Chart footnotes |

### Why "No Charts Available" appears:

- ❌ **schema.mcf**: No observations (just definitions)
- ❌ **sv.mcf**: Has StatVars but no observation data
- ❌ **unit.mcf**: No observations (just units)
- ✅ **With CSV data**: Charts will appear!

---

## 💡 Practical Example

### Imagine you want to add a NEW indicator:

**"Unemployment rate for youth aged 18-22 in tech sector"**

#### You would update:

1. **schema.mcf**: Add `Y18T22` age enum (if doesn't exist)
2. **schema.mcf**: Add `TechSector` industry enum
3. **sv.mcf**: Create new StatisticalVariable combining them
4. **unit.mcf**: Use existing `Percentage` unit
5. **ilo_topics.mcf**: Link to "Economic Development" theme
6. **ilo_measurement_method.mcf**: Document survey methodology
7. **Provide CSV data**: Actual unemployment values by country

#### Result:
✅ New chart appears in "Economic Development" section  
✅ Can be filtered by age 18-22  
✅ Can be filtered by tech sector  
✅ Displayed as percentage  
✅ Includes methodology footnote  

---

## 🎬 Summary

### Do you need ALL files?

**For charts**: Yes and No
- ✅ **Minimum for charts**: `sv.mcf` + observation data (CSV)
- ✅ **Production quality**: All 7 files working together
- ✅ **Best practice**: Complete modular structure

### The Magic Formula:

```
schema.mcf (types) 
  + unit.mcf (units) 
  + sv.mcf (variables) 
  + ilo_topics.mcf (organization)
  + observation data (CSV/API)
  = 📊 1,000+ BEAUTIFUL CHARTS!
```

---

## 🔗 See It In Action

1. **Open your tool**: http://localhost:3000
2. **Go to**: Cached tab → 🌍 Explorer
3. **Click**: "Children and Youth"
4. **See**: All the indicators defined across these 7 files, organized and ready!

The **52 indicators** in "Children and Youth" come from:
- Variables in `sv.mcf`
- Organized by `ilo_topics.mcf`
- Using types from `schema.mcf`
- Displayed in units from `unit.mcf`
- With methods from `ilo_measurement_method.mcf`

**That's the power of modular MCF architecture!** 🚀

