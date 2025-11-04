# CSV Templates for Data Ingestion

## Overview

These templates provide the required column structure for uploading data from each UN agency/organization into the MCF Pipeline Viewer.

## Available Templates

- **`ilo-template.csv`** - International Labour Organization (Employment & Labour data)
- **`sdg-template.csv`** - Sustainable Development Goals (SDG indicators)
- **`unicef-template.csv`** - UNICEF (Child welfare & development data)
- **`who-template.csv`** - World Health Organization (Health indicators)

## How to Use

1. **Download the appropriate template** for your organization
2. **Open in Excel or Google Sheets**
3. **Fill in your data** following the column structure
4. **Save as CSV** (comma-separated values)
5. **Upload** to the Data Ingestion pipeline

## Required Columns by Organization

### ILO Template

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| Country | string | Yes | Full country name | Afghanistan |
| CountryCode | string | Yes | ISO 3166-1 alpha-3 code | AFG |
| Year | number | Yes | Year of observation | 2024 |
| IndicatorCode | string | Yes | ILO indicator code | EMP_RATE |
| IndicatorName | string | Yes | Human-readable indicator name | Employment Rate |
| Value | number | Yes | Numerical value | 45.2 |
| Unit | string | Yes | Unit of measurement | % |
| Source | string | No | Data source | ILO STAT |
| Methodology | string | No | Collection method | Labour Force Survey |

### SDG Template

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| Country | string | Yes | Full country name | Afghanistan |
| CountryCode | string | Yes | ISO 3166-1 alpha-3 code | AFG |
| Year | number | Yes | Year of observation | 2024 |
| Goal | number | Yes | SDG goal number (1-17) | 1 |
| Target | string | Yes | SDG target number | 1.1 |
| IndicatorCode | string | Yes | SDG indicator code | 1.1.1 |
| IndicatorName | string | Yes | Full indicator name | Proportion of population below poverty line |
| Value | number | Yes | Numerical value | 28.5 |
| Unit | string | Yes | Unit of measurement | % |
| Source | string | No | Data source | World Bank |

### UNICEF Template

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| Country | string | Yes | Full country name | Afghanistan |
| CountryCode | string | Yes | ISO 3166-1 alpha-3 code | AFG |
| Year | number | Yes | Year of observation | 2024 |
| IndicatorCode | string | Yes | UNICEF indicator code | U5MR |
| IndicatorName | string | Yes | Human-readable indicator name | Under-five mortality rate |
| Value | number | Yes | Numerical value | 62.3 |
| Unit | string | Yes | Unit of measurement | per 1000 live births |
| AgeGroup | string | No | Age group | 0-4 |
| Sex | string | No | Sex disaggregation | All, Male, Female |
| Source | string | No | Data source | UNICEF |

### WHO Template

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| Country | string | Yes | Full country name | Afghanistan |
| CountryCode | string | Yes | ISO 3166-1 alpha-3 code | AFG |
| Year | number | Yes | Year of observation | 2024 |
| IndicatorCode | string | Yes | WHO indicator code | LIFE_EXP |
| IndicatorName | string | Yes | Human-readable indicator name | Life expectancy at birth |
| Value | number | Yes | Numerical value | 64.8 |
| Unit | string | Yes | Unit of measurement | years |
| Sex | string | No | Sex disaggregation | All, Male, Female |
| AgeGroup | string | No | Age group | All, 0-4, 5-14, etc. |
| Source | string | No | Data source | WHO |

## Data Quality Guidelines

### ✅ Do's

- Use **ISO 3166-1 alpha-3** country codes (AFG, PAK, USA, etc.)
- Use **consistent date formats** (YYYY for years)
- Include **all required columns** even if some values are empty
- Use **standard units** (%, years, per 1000, etc.)
- Provide **source attribution** when available
- Use **consistent indicator codes** within your organization

### ❌ Don'ts

- Don't use country names with special characters in country code column
- Don't mix date formats (2024 vs 24 vs 2024-01-01)
- Don't leave required columns completely empty
- Don't use custom units without documentation
- Don't duplicate rows (same country/year/indicator combination)

## Validation Rules

The system will automatically validate your CSV for:

1. **Required columns** - All required columns must be present
2. **Data types** - Numeric columns must contain valid numbers
3. **Country codes** - Must be valid ISO 3166-1 alpha-3 codes
4. **Missing values** - Flags rows with missing required values
5. **Duplicates** - Detects duplicate combinations of country/year/indicator

## After Upload

Once uploaded, your data will:

1. **Appear in the Data Ingestion Queue** for review
2. **Undergo automatic validation** with warnings/errors displayed
3. **Be editable in the Data Grid Editor** for refinements
4. **Generate transformation blueprint** showing CSV → MCF mapping
5. **Export to versioned CSV** when ready (v1, v2, v3, etc.)
6. **Auto-generate MCF files** when approved
7. **Deploy to staging environment** for testing

## Need Help?

- View the **Transformation Blueprint** to see how your CSV maps to MCF
- Use the **Data Grid Editor** to refine data after upload
- Compare CSV versions using the **Version Comparison** tool
- Contact support for custom column requirements

---

**Last Updated**: November 3, 2025  
**Template Version**: 1.0

