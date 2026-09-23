# Campus Energy Grid Simulator — Complete Rules & Calculations Reference

> **Purpose:** This document is a complete technical reference for the Energy Grid Simulator used in the Campus Energy Planning student activity. It is intended to help Claude or other AI assistants answer student questions, check team results, or generate supplementary resources for the activity.

---

## 1. Overview

The simulator is a browser-based tool (React/TypeScript) in which student teams design a renewable energy plan for a college campus. They select energy generation sources, storage technologies, and configure data cards representing real-world constraints. The simulator calculates a 24-hour supply/demand curve, budget status, ROI, CO₂ offset, workforce impact, and grid stability in real time.

The tool has two linked panels:
- **Campus Map Tool** — drag-and-drop placement of energy units on a satellite map; enforces physical siting rules
- **Energy Grid Simulator** — receives unit counts from the map automatically, runs all financial and grid calculations

---

## 2. Campus Maps

Five campus options, each with a different scale and character:

| Map | Full Name | Scale (ft/cell) | Notes |
|-----|-----------|-----------------|-------|
| EDS | Engineering & Design School | ~29 ft/cell | Default map |
| CES | College of Earth Sciences | ~29 ft/cell | |
| LCS | Liberal & Creative Studies | ~41 ft/cell | Larger campus |
| RLS | Research & Life Sciences | ~41 ft/cell | |
| STG | Science & Technology Gateway | ~41 ft/cell | |

Grid cell = 18 pixels. Buffer distances are converted from feet to pixels using `(bufferFt / ftPerCell) × 18`.

---

## 3. Data Cards (Required — unlock the full simulator)

Students must select all four data cards before the full simulator sidebar is revealed.

### 3a. Demand Pattern Card
Sets the hourly campus demand profile (kW, hours 0–23):

| Pattern | Description | Peak Hour(s) | Peak kW |
|---------|-------------|--------------|---------|
| **Standard** | Typical campus day; evening peak | 14–15 & 17 | ~3,000 kW |
| **Night Owl** | Arts/research school; peaks at night | 17–19 | 3,000 kW |
| **Morning Rush** | Commuter campus; peaks 6–8 am | 6–8 | 3,000 kW |

**Standard profile (kW per hour):**
`1500, 1440, 1380, 1350, 1380, 1680, 2100, 2400, 2640, 2700, 2760, 2790, 2820, 2820, 3000, 3000, 2820, 2940, 2880, 2880, 2640, 2280, 1920, 1620`

**Night Owl profile:**
`1500, 1440, 1380, 1350, 1380, 1500, 1560, 1680, 1800, 1920, 2040, 2160, 2280, 2400, 2520, 2700, 2880, 3000, 3000, 3000, 2880, 2880, 2700, 2100`

**Morning Rush profile:**
`1500, 1440, 1380, 1350, 2100, 2700, 3000, 3000, 3000, 2880, 2700, 2520, 2400, 2280, 2280, 2280, 2340, 2400, 2520, 2400, 2100, 1800, 1680, 1560`

### 3b. Budget Tier Card

| Card | Starting Budget |
|------|----------------|
| Standard | $10,000,000 |
| Federal Green Grant | $11,000,000 — unlocks Emerging Technologies; requires ≥1 emerging tech unit to be compliant |
| Failed Bond | $9,000,000 |

### 3c. Workforce Card
Affects costs and unlocks/restricts technology choices:

| Card | Effect |
|------|--------|
| **Standard Workforce** | No modifier |
| **Crane Operator Shortage** | +$500,000 crane logistics fee if ≥1 wind turbine is placed |
| **Hydropower Engineering Hub** | −20% discount on geothermal and hydro installation costs |

### 3d. Environmental Constraints Card

| Card | Restriction |
|------|-------------|
| **No Constraint** | No restriction |
| **Migratory Bird Ordinance** | Wind turbines prohibited in forested/sensitive zones on the map. Violation if `windSensitiveZoneCount > 0`. |
| **Vernal Pool Restriction** | Two restrictions: (1) Geothermal prohibited — violation if `geo > 0`. (2) No more than 25% of forested campus land may be cleared by equipment footprints. The map calculates `clearedPct` in real time; the Forest stat turns amber above 10% and red above 25%; a violation fires when `clearedPct > 25`. Students must calculate the percentage themselves when using the physical card and compare against what the map displays. |

---

## 4. Pivot Cards (Event Cards — one optional selection)

Pivot cards simulate real-world scenarios that challenge the energy plan mid-design.

| Card | Effect |
|------|--------|
| **None** | No effect |
| **Maintenance Crisis** | Solar and wind output reduced to 75%. +$500K repair fee if solar or wind placed. |
| **Polar Vortex** | Demand spikes to 4,500 kW peak. With thermal storage: 3,300 kW peak. Solar output reduced to 10% of normal. |
| **AI Learning Hub** | Demand increases by +900 kW every hour (flat addition to all 24 hours). |
| **Grid-Down Event** | Grid goes offline. Survival requires ≥2,000 kWh total storage. Status: "SURVIVED: Island Mode Active" if met; "FATAL CRISIS" if not. |
| **The Carbon Tax** | Annual penalty of $0.10/kWh × 365 days × daily kWh shortfall (hours where supply < demand). |
| **Supply Chain Crisis** | Li-Ion battery cost doubles: $500K → $1,000,000 per unit. |

---

## 5. Generation Technologies

### 5a. Specs

| Technology | Peak Output (kW/unit) | Install Cost/unit | Annual kWh/unit | Capacity Factor |
|------------|----------------------|-------------------|-----------------|-----------------|
| Solar PV | 500 kW | $1,000,000 | 700,000 kWh | ~16% |
| Wind Turbine | 3,000 kW | $4,500,000 | 8,000,000 kWh | ~30% |
| Geothermal | 2,000 kW | $8,000,000 | 7,000,000 kWh | ~40% |
| Hydro (Low Head) | 500 kW | $1,000,000 | 2,000,000 kWh | ~46% |
| Hydro (High Head) | 2,000 kW | $4,000,000 | 7,500,000 kWh | ~43% |
| Tidal Standard | 500 kW peak | $1,500,000 | 2,190,000 kWh | ~50% |
| Biomass | 1,000 kW | $3,500,000 | 7,000,000 kWh | ~80% |

### 5b. Hourly output profiles (kW per unit, hours 0–23)

**Solar PV:**
`0, 0, 0, 0, 0, 0, 50, 150, 250, 350, 450, 500, 500, 500, 500, 400, 250, 100, 0, 0, 0, 0, 0, 0`

**Wind Turbine:**
`3000, 3000, 3000, 3000, 3000, 2800, 2500, 2200, 1800, 1500, 1200, 1200, 1200, 1200, 1200, 1200, 1500, 1800, 2200, 2500, 2800, 3000, 3000, 3000`
(Wind is strongest overnight, lowest midday)

**Geothermal:**
Constant 2,000 kW all 24 hours (baseload)

**Hydro (both types):**
Constant output all 24 hours:
- Low Head: 500 kW/hr
- High Head: 2,000 kW/hr

**Tidal Standard** (semidiurnal tidal cycle):
`0, 125, 375, 500, 375, 125, 0, 125, 375, 500, 375, 125, 0, 125, 375, 500, 375, 125, 0, 125, 375, 500, 375, 125`

**Biomass:**
Constant 1,000 kW all 24 hours (dispatchable baseload)

### 5c. Map siting rules

| Technology | Siting Restriction |
|------------|-------------------|
| Solar | No forest zone; avoid buildings |
| Wind | 250ft noise/safety buffer from buildings and neighboring properties. In forested/sensitive zones: restricted by Migratory Bird Ordinance |
| Geothermal | Avoid vernal pool zones. Prohibited entirely when Vernal Pool Restriction card is active. |
| Biomass | (1) Must be ≤100ft from a road (fuel truck access). (2) Must be ≥200ft from any school building — enforced to prevent smoke/exhaust complaints near windows. Violation message: "Biomass too close to building — exhaust and smoke hazard near windows (200 ft buffer)". Both rules are simultaneously enforced. |
| Tidal | Must be placed in coastal/water zones or tidal zones. |

Wind buffer enforcement: if a turbine is placed within 250ft of a school building or neighboring property → $200,000 Wind Buffer Noise Mitigation Fee added to budget.

### 5d. Forest Clearing Calculation (Vernal Pool Protection)

The map tool tracks what percentage of total forested campus land is cleared by equipment footprints in real time.

```
campusArea      = area of campus boundary polygon (px²)
totalForestArea = sum of all forest zone polygon areas (px²)
forestPct       = (totalForestArea / campusArea) × 100   → "X% of campus is forested"

For each placed unit overlapping a forest zone:
  clearW, clearH = construction footprint dimensions (ft → px)
  Sample 9 points across the footprint; count how many fall in forest
  unitForestArea = footprintArea × (forestHits / 9)
  clearedAreaPx² += unitForestArea

clearedPct = (clearedAreaPx² / totalForestArea) × 100
```

**Displayed in:** the Forest stat in the map sidebar — e.g. "12.4% cleared (38% of campus)"

**Color coding:** normal below 10% | amber 10–25% | red above 25%

**Violation fires when:** `clearedPct > 25` AND Vernal Pool Restriction card is active
Message: "[Campus name]: X% of forest cleared — max 25% permitted (Vernal Pool Protection)"

---

## 6. Storage Technologies

| Technology | Storage Capacity/unit | Cost/unit | Notes |
|------------|----------------------|-----------|-------|
| Li-Ion BESS | 1,000 kWh | $500,000 (or $1M with Supply Chain Crisis) | Required for Solar storage compliance. BESS discharges during selected peak hours. |
| Thermal Storage | 2,500 kWh | $1,000,000 | Eliminates heating oil cost (+$75,000/unit annual savings) when charged by wind, hydro, or tidal |
| Flywheel | 1,000 kWh | $300,000 | **Required** when wind or tidal are in the mix — prevents grid flicker |
| CAES (Compressed Air) | 5,000 kWh | $2,000,000 | Seasonal storage; +$30,000/unit annual savings when charged by wind, hydro, tidal, or solar |

**Total Storage formula:**
`totalStorage = (liIon × 1,000) + (thermal × 2,500) + (flywheel × 1,000) + (caes × 5,000)` kWh

**Grid Flicker Rule:** If wind > 0 OR tidal > 0 AND flywheel = 0 → Grid Status = "⚠️ WARNING: Flickering Power! Add Flywheels."

**Island Mode survival:** Requires totalStorage ≥ 2,000 kWh when Grid-Down Event pivot card is active.

**Island Time:** `totalStorage ÷ campusPeakDemand` (hours the campus can run independently)

---

## 7. Emerging Technologies (Federal Green Grant only)

Only available when Budget Tier = Federal Green Grant. At least one emerging tech unit is required to maintain grant compliance.

| Technology | Cost/unit | Effect |
|------------|-----------|--------|
| Hydrogen Electrolyzer | $2,000,000 | Boosts solar AND wind output by ×1.3 (30%) in all hourly calculations and annual kWh |
| V2G Hub | $100,000 | Caps campus peak demand at 2,700 kW (ineffective during Polar Vortex — heating demand is inelastic) |
| SCADA System | $500,000 | Reduces campus demand by 15% every hour |

Grant compliance check: `hydrogen + v2g + scada ≥ 1`

---

## 8. Infrastructure Costs

Automatically calculated — not manually entered by students.

| Cost Item | Trigger | Amount |
|-----------|---------|--------|
| Cabling | Per cable-foot laid on the map | $500/ft |
| Crane Logistics Fee | Workforce = Crane Operator Shortage AND wind > 0 | +$500,000 |
| Wind Buffer Noise Penalty | Any turbine placed within 250ft of a building or property | +$200,000 |
| Utility Interconnection Fee | Peak supply exceeds campus peak demand | +$500,000 |
| Pivot Penalty | Maintenance Crisis with solar/wind placed | +$500,000 |
| | Polar Vortex AND peak supply < polar demand threshold | +$300,000 |

---

## 9. Budget Calculations

```
startBudget  = $9M (Failed Bond) | $10M (Standard) | $11M (Federal Green Grant)

totalSpent   = sum(genCosts) + sum(storageCosts) + sum(emergingCosts)
             + sum(infraCosts) + annualCarbonTaxFee

remaining    = startBudget − totalSpent
```

**Generation costs** (with applicable modifiers):
- `geo cost = geo × $8M × (0.8 if Hydropower Hub, else 1)`
- `hydro cost = (hydroLow × $1M + hydroHigh × $4M) × (0.8 if Hydropower Hub, else 1)`
- `liIon cost = liIon × ($1M if Supply Chain Crisis, else $500K)`

**totalCostAdjustments** (shown in the Cost Adjustments Breakdown panel):
```
= geoCostAdjustment        (Hub discount on geo)
+ hydroCostAdjustment      (Hub discount on hydro)
+ liIonCostAdjustment      (Supply Chain markup on batteries)
+ pivotPenaltyAdjustment
+ utilityFeeAdjustment
+ craneLogisticsAdjustment
+ infraCosts.windBuffer
+ annualCarbonTaxFee
```

The Cost Adjustments Breakdown panel **auto-expands** whenever `totalCostAdjustments ≠ 0`.

---

## 10. ROI & Annual Savings

```
GRID_RATE      = $0.22/kWh  (Maine commercial electricity rate — own-use savings)
WHOLESALE_RATE = $0.06/kWh  (net metering grid sell-back rate for surplus)
```

**Annual kWh savings by source:**
Each source's `annualKwh × GRID_RATE` = gross savings (avoided utility bill).

**Surplus penalty (cap adjustment):**
Hours where supply > demand → surplus is sold back at $0.06/kWh, not $0.22.
`capAdjustment = −surplusKwh × ($0.22 − $0.06)`
This penalizes over-building — excess capacity earns much less than own-use kWh.

**Additional annual savings:**
- Thermal storage + wind/hydro/tidal active: +$75,000/unit (heating oil savings)
- CAES + renewable source active: +$30,000/unit (seasonal demand shifting)

**Final annual savings:**
```
finalSavings = baseAnnualSavings + pivotImpact + thermalHeatingOilSavings + caesSeasonalSavings
```

**ROI (Simple Payback Period):**
```
roi = totalSpent ÷ finalSavings  (years)
```

**Annual grid sell-back revenue:**
```
surplusKwh             = daily surplus kWh × 365
annualRenewableRevenue = surplusKwh × $0.06/kWh
```

---

## 11. CO₂ Offset

```
ISO-NE marginal emissions rate = 392 g CO₂/kWh
```

Solar, Wind, Geothermal, Hydro, and Tidal kWh all count toward CO₂ offset. Biomass is treated as carbon-neutral and excluded.

**Equivalency conversions (EPA-style):**
- Cars removed from road: `totalMetricTons ÷ 4.6`
- Trees equivalent: `(totalMetricTons × 1,000 kg) ÷ 22`

---

## 12. Workforce & Economic Impact

```
constructionJobs = floor((totalSpent ÷ $2,000,000) × 10)
permanentRoles   = floor((totalSpent ÷ $2,000,000) × 1)
```

Students can allocate permanent roles across three types:
- Solar Technicians (wSolar)
- Electricians (wElec)
- Wind / Marine / Hydro Engineers (wEng)

Role assignments are clamped so total assigned never exceeds `permanentRoles`.

**Payroll estimate:**
```
payroll = wSolar × $55,000 + wElec × $68,000 + wEng × $72,000  (annual)
```

---

## 13. Demand Modifiers Summary

These stack on top of the base demand profile:

| Modifier | Effect |
|----------|--------|
| AI Learning Hub pivot | +900 kW added every hour (flat) |
| Polar Vortex pivot | Entire profile scaled so peak = 4,500 kW (or 3,300 kW with thermal storage) |
| V2G Hub (Grant) | Caps each hour at 2,700 kW (not applied during Polar Vortex) |
| SCADA (Grant) | Multiplies each hour by ×0.85 (−15%) |
| Hydrogen Electrolyzer (Grant) | Multiplies solar AND wind supply by ×1.3 (not demand) |

`campusPeakDemand = max(demand24[0..23])`

---

## 14. Supply Modifiers Summary

| Modifier | Effect |
|----------|--------|
| Maintenance Crisis pivot | Solar × 0.75, Wind × 0.75 |
| Polar Vortex pivot | Solar × 0.10 (near-zero output — cloudy/ice) |
| Hydrogen Electrolyzer (Grant) | Solar × 1.3, Wind × 1.3 |
| BESS discharge | During selected peak hours, adds `totalBESSCapacity ÷ selectedHours` kW |

---

## 15. Constraint Violations & Alerts

The following trigger warning alerts in the simulator sidebar:

| Condition | Alert |
|-----------|-------|
| `remaining < 0` | Over budget |
| Federal Green Grant + no emerging tech | Grant compliance violation |
| Wind or tidal placed + flywheel = 0 | Grid flicker warning |
| Peak supply > campusPeakDemand | Utility interconnection fee triggered (+$500K) |
| Migratory Bird + turbine in sensitive zone | Environmental violation |
| Vernal Pool + geo > 0 | Environmental violation |
| Solar placed + totalStorage < solar × 1,000 kWh | Insufficient storage for solar |
| Night Owl + solar > 0 + liIon < 2 | Battery storage insufficient for night demand |
| Morning Rush + solar+wind > 50% of annual production + no storage | Intermittent over-reliance warning |

---

## 16. Grid Status Logic

```
if Grid-Down Event active:
  if totalStorage ≥ 2,000 kWh → "✅ SURVIVED: Island Mode Active"
  else                         → "⚠️ FATAL CRISIS: Storage under 2,000 kWh!"
else if (wind > 0 OR tidal > 0) AND flywheel = 0:
  → "⚠️ WARNING: Flickering Power! Add Flywheels."
else:
  → "✅ Grid Stable"
```

---

## 17. Map ↔ Simulator Integration

The map and simulator communicate via a shared state object and browser custom events.

**Shared state fields synced from map to simulator:**

| Field | Description |
|-------|-------------|
| `techCounts` | Unit count per technology (auto-populates simulator number inputs) |
| `totalMapCableFt` | Total cable footage → populates `cabling` input |
| `windBufferPenalty` | Boolean → sets `windBuffer` hidden input to "Yes"/"No" |
| `windSensitiveZoneCount` | Number of turbines in sensitive zones |
| `craneShortageActive` | Boolean — set by simulator after computing `isCrane && wind > 0`; used by map budget display |
| `campusPeakDemand` | Synced back from simulator to map for Island Time display |
| `hydroHubActive` | Synced from simulator |

**Events:**
- `gc:map-update` — fired by map when placements change; simulator updates all inputs and re-renders
- `gc:sim-update` — fired by simulator when card selections change; map updates its budget display

**Technology ID mapping (map → simulator):**

| Map ID | Simulator input ID |
|--------|--------------------|
| solar | solar |
| wind | wind |
| geo | geo |
| hydroL | hydroLow |
| hydroH | hydroHigh |
| tidal | tidalStd |
| biomass | biomass |
| bess | liIon |
| thermal | thermal |
| flywheel | flywheel |
| caes | caes |

---

## 18. Key Formulas Quick Reference

```
Peak Supply (kW)     = Σ(units × hourly output for each hour)
Total Storage (kWh)  = liIon×1000 + thermal×2500 + flywheel×1000 + caes×5000
Island Time (hrs)    = totalStorage ÷ campusPeakDemand
Construction Jobs    = floor((totalSpent ÷ 2,000,000) × 10)
Permanent Roles      = floor((totalSpent ÷ 2,000,000) × 1)
ROI Payback (yrs)    = totalSpent ÷ finalAnnualSavings
Carbon Tax           = dailyShortfallKwh × 365 × $0.10
Sell-Back Revenue    = surplusKwh × 365 × $0.06
CO₂ Offset (MT)      = totalRenewableKwh × 0.000392
```

---

## 19. Recent Changes (as of September 2026)

- **Wind buffer reverted to 250ft** (was briefly changed to 500ft)
- **Geothermal updated to 2,000 kW** peak output and $8M install cost (was 1,000 kW)
- **AI Learning Hub**: +900 kW demand increase (not a percentage — flat kW addition)
- **Polar Vortex**: 4,500 kW peak demand; 3,300 kW with thermal storage; solar at 10%
- **V2G Hub**: caps peak demand at 2,700 kW
- **Federal Green Grant**: $11M budget (up from $10M)
- **Crane Operator Shortage**: $500K logistics fee now correctly applied in both map budget and simulator Cost Adjustments Breakdown
- **Wind Buffer Noise Penalty**: $200K fee now shown in Cost Adjustments Breakdown (was only in Total Spent)
- **Cost Adjustments Breakdown**: now auto-expands when any fee or discount is active
- **Biomass road proximity**: standardized to exactly 100ft real-world distance across all campus maps
- **Map images**: optimized from ~13–17MB PNG to ~1.2–2.3MB JPEG (1800px wide, 2× retina)
- **Simulator print**: replaced `window.print()` with a clean new-window approach that reads live DOM values
- **Reference doc**: corrected two previously undocumented rules — biomass 200ft building setback and vernal pool 25% forest clearing limit

---

*Last updated: September 2026. Source files: `artifacts/green-campus/src/pages/EnergyGridSimulator.tsx`, `CampusMapTool.tsx`, `cardData.ts`, `shared.ts`*
