# Green Campus Simulator — Rules & Calculations Reference
*Updated June 2026. Values reflect the realism-rebalance branch. Use alongside Playing Cards and Pivot Cards.*

---

## BUDGETS

| Scenario Card | Starting Budget |
|---|---|
| Failed Bond | $9,000,000 |
| Standard *(default)* | $10,000,000 |
| Federal Green Grant | $12,000,000 |

**Federal Green Grant** also unlocks the Emerging Technology section (Hydrogen Electrolyzer, V2G, SCADA) and requires purchasing at least one of those three units. Under any other budget tier, emerging tech is unavailable and its cost is $0.

---

## GENERATION TECHNOLOGIES

### 1. Solar PV
| Stat | Value |
|---|---|
| Peak output | 500 kW/unit |
| Cost | $1,000,000/unit |
| Annual generation | ~700,000 kWh/unit (~16% capacity factor) |
| Annual savings | ~$154,000/unit at $0.22/kWh |
| Map footprint | 250 × 175 ft rectangle |
| Siting | Land only; any zone except water/ocean |

**24-hour profile:** Output is zero at night. Ramps from 0 at 06:00 to a peak of 500 kW at 11:00–14:00, then drops back to zero by 18:00. Specific hourly values (kW/unit): `0,0,0,0,0,0,50,150,250,350,450,500,500,500,500,400,250,100,0,0,0,0,0,0`

**Solar multiplier:** During Polar Vortex ×0.1; during Maintenance Crisis ×0.75; with Hydrogen Electrolyzer (Grant only) ×1.3. All stack multiplicatively.

---

### 2. Wind Turbine
| Stat | Value |
|---|---|
| Peak output | 3,000 kW/unit |
| Cost | $4,500,000/unit |
| Annual generation | ~8,000,000 kWh/unit (~30% capacity factor) |
| Annual savings | ~$1,760,000/unit at $0.22/kWh |
| Map footprint | Circular, 50 ft radius displayed; 250 ft safety buffer |
| Siting | Land or ocean; offshore (ocean zone) is permitted outside campus boundary |

**24-hour profile:** Highest at night and in winter. Hourly values (kW/unit) starting midnight: `3000,3000,3000,3000,3000,2800,2500,2200,1800,1500,1200,1200,1200,1200,1200,1200,1500,1800,2200,2500,2800,3000,3000,3000`

**Wind multiplier:** During Maintenance Crisis ×0.75; with Hydrogen Electrolyzer ×1.3. Stacks multiplicatively.

**Buffer fee:** If the 250 ft buffer radius overlaps a building or the property boundary line, a **$200,000 mitigation fee** is added to Total Spent.

**Crane fee:** If Crane Operator Shortage workforce card is active and at least one wind unit exists, a flat **$500,000 logistics fee** is added.

---

### 3. Geothermal
| Stat | Value |
|---|---|
| Peak output | 1,000 kW/unit |
| Cost | $8,000,000/unit (−20% with Hydropower Engineering Hub) |
| Annual generation | ~7,000,000 kWh/unit (~80% capacity factor) |
| Annual savings | ~$1,540,000/unit at $0.22/kWh |
| Map footprint | 100 × 50 ft rectangle + 400 × 325 ft construction zone |
| Siting | Land only; cannot be placed on water or in no-build zones |

**24-hour profile:** Flat 2,000 kW/unit every hour (baseload).
> *Note: the on-screen peak supply stat uses 1,000 kW/unit. The 24-hour chart uses 2,000 kW/unit. Annual kWh is based on 1,000 kW at 80% capacity factor.*

**Siting violation:** If Vernal Pool Protection is active, all geothermal is banned — any placed unit is a violation.

---

### 4. Hydro — Low Head
| Stat | Value |
|---|---|
| Peak output | 500 kW/unit |
| Cost | $1,000,000/unit (−20% with Hydropower Engineering Hub) |
| Annual generation | ~2,000,000 kWh/unit (~46% capacity factor) |
| Annual savings | ~$440,000/unit at $0.22/kWh |
| Siting | Must be placed on a water or ocean zone |

**24-hour profile:** Flat 500 kW/unit every hour (run-of-river, continuous).

---

### 5. Hydro — High Head
| Stat | Value |
|---|---|
| Peak output | 2,000 kW/unit |
| Cost | $4,000,000/unit (−20% with Hydropower Engineering Hub) |
| Annual generation | ~7,500,000 kWh/unit (~43% capacity factor) |
| Annual savings | ~$1,650,000/unit at $0.22/kWh |
| Siting | Must be placed on a water or ocean zone |

**24-hour profile:** Flat 2,000 kW/unit every hour (continuous).

---

### 6. Tidal
| Stat | Value |
|---|---|
| Peak output | 500 kW/unit |
| Cost | $1,500,000/unit |
| Annual generation | ~2,190,000 kWh/unit (~50% capacity factor) |
| Annual savings | ~$482,000/unit at $0.22/kWh |
| Siting | Must be placed on water, ocean, or tidal_zone |

**24-hour profile:** Semidiurnal Maine tide cycle — two highs and two lows per day (~6-hour cycle). Peak at hours 3, 9, 15, 21; near-zero at slack water (hours 0, 6, 12, 18). Hourly values (kW/unit): `0,125,375,500,375,125,0,125,375,500,375,125,0,125,375,500,375,125,0,125,375,500,375,125`

**Pinch point bonus:** Placing a tidal unit on a narrow-channel pinch point marker applies a **+20% output bonus** (600 kW peak instead of 500 kW).

---

### 7. Biomass
| Stat | Value |
|---|---|
| Peak output | 1,000 kW/unit |
| Cost | $3,500,000/unit |
| Annual generation | ~7,000,000 kWh/unit (~80% capacity factor) |
| Annual savings | ~$1,540,000/unit at $0.22/kWh |
| Map footprint | 150 × 100 ft rectangle |
| Siting | Must be adjacent to a road (fuel truck delivery); cannot be within 200 ft of a building |

**24-hour profile:** Flat 1,000 kW/unit every hour (baseload combustion).

---

## STORAGE TECHNOLOGIES

| Unit | Capacity | Peak Discharge | Cost | Notes |
|---|---|---|---|---|
| Lithium Ion | 1,000 kWh | 1,000 kW | $500,000 | Cost doubles to $1,000,000 during Supply Chain Crisis |
| Thermal Storage | 2,500 kWh | 2,500 kW | $1,000,000 | +$75,000/yr heating oil savings (if wind, hydro, or tidal present) |
| Flywheel | 1,000 kWh | 1,000 kW | $300,000 | Required to suppress flicker from wind or tidal |
| CAES (Compressed Air) | 5,000 kWh | 5,000 kW | $2,000,000 | +$30,000/yr seasonal savings (if any renewable source present) |

**Total storage kWh** = LiIon×1,000 + Thermal×2,500 + Flywheel×1,000 + CAES×5,000

**Grid-Down requirement:** Total storage ≥ 2,000 kWh to survive island mode.

**Lithium Ion discharge timing:** Players select which hours (default 17:00–20:00) the Li-Ion bank discharges. The full Li-Ion kWh capacity is divided evenly across selected hours and added to hourly supply during those hours.

---

## EMERGING TECHNOLOGY
*Federal Green Grant only. Grant also requires at least one of these three units to be purchased.*

| Unit | Cost | Effect |
|---|---|---|
| Green Hydrogen Electrolyzer | $2,000,000 | Solar and wind output multiplied by ×1.3 (+30%) |
| V2G Charging Hub | $100,000 | Caps peak campus demand at 2,700 kW *(inactive during Polar Vortex)* |
| AI-Grid Controller (SCADA) | $500,000 | Reduces total campus demand by ×0.85 (−15%) |

---

## DEMAND PROFILES

All three demand patterns share the same peak of **3,000 kW** and a low of **1,350 kW**. They differ in when the peak occurs.

| Pattern | Peak Hours | Description |
|---|---|---|
| Standard | 12:00–15:00 | Typical school day — gradual morning ramp, afternoon plateau |
| Night Owl | 17:00–19:00 | Extended evening activity, labs open late |
| Morning Rush | 06:00–09:00 | Heavy early start, heating systems, early commuters |

**Standard hourly profile (kW):**
`1500,1440,1380,1350,1380,1680,2100,2400,2640,2700,2760,2790,2820,2820,3000,3000,2820,2940,2880,2880,2640,2280,1920,1620`

**Night Owl hourly profile (kW):**
`1500,1440,1380,1350,1380,1500,1560,1680,1800,1920,2040,2160,2280,2400,2520,2700,2880,3000,3000,3000,2880,2880,2700,2100`

**Morning Rush hourly profile (kW):**
`1500,1440,1380,1350,2100,2700,3000,3000,3000,2880,2700,2520,2400,2280,2280,2280,2340,2400,2520,2400,2100,1800,1680,1560`

---

## KEY CALCULATIONS

### Peak Supply (kW)
Used for the "Actual Peak Supply" stat and utility fee threshold check.

```
Peak Supply = (Solar × 500) + (Wind × 3,000) + (Geo × 1,000)
            + (Hydro Low × 500) + (Hydro High × 2,000)
            + (Tidal × 500) + (Biomass × 1,000)
```

*Storage units contribute kW via discharge but are not counted in Peak Supply. Multipliers (Maintenance, Hydrogen) are NOT applied here — only to the 24-hour supply chart.*

---

### 24-Hour Supply (per hour)
The supply chart and surplus/shortfall calculations are based on hourly output:

```
Supply[h] = Solar × SOLAR_PER_UNIT[h] × solarMult
          + Wind  × BASE_WIND[h]       × windMult
          + Geo   × 2,000
          + Hydro Low  × 500
          + Hydro High × 2,000
          + Tidal × TIDAL_STD_PER_UNIT[h]
          + Biomass × 1,000
          + LiIon discharge (during selected hours only, if variable gen present)
```

Where:
- `solarMult = hydrogenBoost × (0.1 if Polar Vortex else 1) × (0.75 if Maintenance else 1)`
- `windMult  = hydrogenBoost × (0.75 if Maintenance else 1)`
- `hydrogenBoost = 1.3 if Grant + Hydrogen > 0, else 1`
- `LiIon hourly discharge = (liIon × 1,000 kWh) ÷ number of selected discharge hours`

---

### 24-Hour Demand (per hour)

```
Demand[h] = demandProfile[h]
          × (polarScaleFactor if Polar Vortex else 1)
          + (900 if AI Learning Hub else 0)
          × (0.85 if SCADA active else 1)
          capped at min(d, 2,700) if V2G active AND not Polar Vortex
```

Where `polarScaleFactor = polarDemandThreshold ÷ max(demandProfile)` to scale the entire profile so its peak hits the threshold.

---

### Polar Vortex Demand Threshold

```
Threshold = 4,500 kW   (no Thermal Storage)
Threshold = 3,300 kW   (if ≥1 Thermal Storage unit is installed)
```

If `Peak Supply < Threshold`, a **$300,000 emergency surcharge** is added to Total Spent.

---

### Total Spent (Capital Budget)

```
Total Spent = genCosts + storageCosts + emergingCosts + infraCosts + annualCarbonTaxFee
```

Where:

**genCosts:**
- Solar:   units × $1,000,000
- Wind:    units × $4,500,000
- Geo:     units × $8,000,000 × (0.8 if Hydropower Hub else 1)
- Hydro L: units × $1,000,000 × (0.8 if Hydropower Hub else 1)
- Hydro H: units × $4,000,000 × (0.8 if Hydropower Hub else 1)
- Tidal:   units × $1,500,000
- Biomass: units × $3,500,000

**storageCosts:**
- LiIon:    units × $500,000 (×$1,000,000 during Supply Chain Crisis)
- Thermal:  units × $1,000,000
- Flywheel: units × $300,000
- CAES:     units × $2,000,000

**emergingCosts (Grant only):**
- Hydrogen: units × $2,000,000
- V2G:      units × $100,000
- SCADA:    units × $500,000

**infraCosts:**
- Cabling:          cable_ft × $500/ft
- Wind buffer fee:  $200,000 if buffer touches building or boundary
- Utility upgrade:  $500,000 if Peak Supply > campus peak demand
- Crane logistics:  $500,000 if wind units > 0 AND Crane Operator Shortage
- Pivot penalty:    $500,000 (Maintenance with solar/wind) OR $300,000 (Polar Vortex shortfall)

**annualCarbonTaxFee** (Carbon Tax pivot only):
```
Daily shortfall kWh = Σ max(0, Demand[h] − Supply[h])  for h = 0..23
Annual fee = dailyShortfall × 365 × $0.10/kWh
```

**Remaining Budget** = Starting Budget − Total Spent

---

### Annual kWh Production (ROI Ledger)

Each technology has a fixed annual production figure based on capacity factor:

| Tech | kWh/unit/year | Basis |
|---|---|---|
| Solar | 700,000 | 500 kW @ 16% CF |
| Wind | 8,000,000 | 3,000 kW @ 30% CF |
| Geothermal | 7,000,000 | 1,000 kW @ 80% CF |
| Hydro Low | 2,000,000 | 500 kW @ 46% CF |
| Hydro High | 7,500,000 | 2,000 kW @ 43% CF |
| Tidal | 2,190,000 | 500 kW @ 50% CF |
| Biomass | 7,000,000 | 1,000 kW @ 80% CF |

**Annual savings per tech** = annual kWh × $0.22/kWh

---

### Capacity Adjustment (Surplus Penalty)

When annual production exceeds campus demand, the surplus can only be sold back at $0.06/kWh, not saved at $0.22/kWh. The ledger deducts the gap:

```
Surplus kWh/yr = Σ max(0, Supply[h] − Demand[h])  × 365
Cap adjustment = −Surplus × ($0.22 − $0.06) = −Surplus × $0.16
```

This appears as a negative value in the ROI Ledger under "Capacity Adjustment." The $0.06 sell-back revenue is shown separately.

---

### Final Annual Savings & ROI

```
Base Annual Savings  = Σ(roiSavings per tech) + capAdjustment
Thermal Oil Savings  = thermal_units × $75,000/yr  (only if wind, hydro, or tidal also present)
CAES Seasonal Savings = caes_units × $30,000/yr    (only if any renewable source present)
Pivot Impact         = −annualCarbonTaxFee  (Carbon Tax)
                     OR −$50,000/yr          (AI Hub with zero storage)
                     OR 0 (others)

Final Annual Savings = Base + Thermal Oil + CAES Seasonal + Pivot Impact
ROI Break-Even (yrs) = Total Spent ÷ Final Annual Savings
```

---

### Island Time

```
Island Time (hours) = Total Storage kWh ÷ 3,000 kW
```

Represents how long the campus can run entirely on stored energy at the 3,000 kW baseline demand.

---

## GRID STATUS RULES

| Condition | Status |
|---|---|
| Wind or Tidal units present AND zero Flywheels | ⚠️ Flickering Power — add Flywheel |
| Grid-Down Event + total storage ≥ 2,000 kWh | ✅ SURVIVED: Island Mode Active |
| Grid-Down Event + total storage < 2,000 kWh | ⚠️ FATAL CRISIS |
| Otherwise | ✅ Grid Stable |

---

## VIOLATION RULES

### Simulator Violations

| Rule | Condition | Effect |
|---|---|---|
| Solar Storage | Solar units present AND total storage < (solar units × 1,000 kWh) | Violation alert |
| Night Owl | Night Owl demand pattern AND solar present AND Li-Ion < 2 | Violation alert |
| Morning Rush | Morning Rush AND solar+wind > 50% of annual supply AND zero storage | Violation alert |
| Migratory Bird | Migratory Bird Ordinance active AND any wind unit in forest zone | Violation alert |
| Vernal Pool | Vernal Pool Protection active AND any geo unit placed | Violation alert |
| Grant Compliance | Federal Green Grant AND zero emerging tech units | Violation alert |
| Utility Fee | Peak Supply > campus peak demand | +$500,000 added to Total Spent |

### Map Siting Violations (stored per unit)

| Rule | Condition |
|---|---|
| Out of bounds | Unit placed outside campus boundary polygon (except hydro, tidal, offshore wind) |
| Hydro on land | Hydro Low or High placed outside water/ocean zone |
| Tidal on land | Tidal placed outside water/ocean/tidal_zone |
| Geo on water | Geothermal placed on water or ocean zone |
| Geo in no-build | Geothermal placed in a no-build zone |
| Biomass: no road | Biomass placed more than 5 grid cells from any road |
| Biomass: near building | Biomass placed within 200 ft of a building |
| Wind buffer: building | Wind turbine's 250 ft buffer overlaps a building → +$200K fee |
| Wind buffer: boundary | Wind turbine's 250 ft buffer reaches the property line → +$200K fee |
| Migratory Bird: wind | Wind placed in forest zone AND Migratory Bird card active |
| Unit overlap | New unit footprint overlaps an existing unit's footprint (hard block — placement refused) |

---

## MAP SITING — OVERLAP PREVENTION

Units cannot be placed so their visual footprints overlap. The check is shape-accurate:

- **Circle vs Circle:** blocked if center-to-center distance < r₁ + r₂
- **Rectangle vs Rectangle:** blocked if `|Δx| < hw₁ + hw₂` AND `|Δy| < hh₁ + hh₂` (axis-aligned after swapping w↔h for 90°/270° rotations)
- **Rectangle vs Circle:** blocked if the closest point on the rectangle to the circle center is within the circle's radius

Construction zones and buffer areas are drawn separately and do not participate in the overlap check — two wind turbines' 250 ft buffers may overlap; only their structural footprints cannot.

---

## INFRASTRUCTURE FEES SUMMARY

| Fee | Trigger | Amount |
|---|---|---|
| Electrical cabling | Always; scales with cable run distance | $500/ft |
| Wind noise/safety buffer | Turbine buffer touches building or boundary | $200,000 flat |
| Utility interconnection upgrade | Peak supply exceeds campus peak demand | $500,000 flat |
| Crane logistics | Any wind unit + Crane Operator Shortage | $500,000 flat |
| Polar Vortex surcharge | Peak supply < polar demand threshold | $300,000 flat |
| Maintenance repair | Solar or wind present + Maintenance Crisis | $500,000 flat |
| Carbon tax | Annual unmet demand × $0.10/kWh × 365 | Variable |

---

## RATES

| Rate | Value |
|---|---|
| Campus electricity rate (avoided cost, own-use) | $0.22/kWh — Maine commercial rate |
| Net metering / grid sell-back (surplus) | $0.06/kWh |
| Carbon tax (unmet demand penalty) | $0.10/kWh × annual shortfall kWh |

---

## WORKFORCE CARDS

| Card | Effect |
|---|---|
| None | Standard costs |
| Crane Operator Shortage | +$500,000 if any wind turbines installed |
| Hydropower Engineering Hub | −20% cost on Geothermal, Hydro Low, Hydro High |

---

## ENVIRONMENTAL CONSTRAINT CARDS

| Card | Rule |
|---|---|
| Migratory Bird Ordinance | Wind turbines in forest zones = siting violation. Permitted: fields, parking, open water, ocean. |
| Vernal Pool Protection | Geothermal entirely banned. Any geo unit = violation. Max 25% of forested land may be cleared. |

---

## PIVOT CARDS

### AI Learning Hub
Campus demand increases by **+900 kW every hour** — new peak is **3,900 kW**.
- If zero storage capacity is installed, a **−$50,000/yr reliability penalty** applies to annual savings.

### Polar Vortex
Two-week cold snap, −20°F.
- Peak demand rises to **4,500 kW** (or **3,300 kW** if Thermal Storage is installed).
- Solar output drops to **10% of normal** (50 kW per unit instead of 500 kW).
- If peak supply < threshold, a **$300,000 emergency surcharge** is added to Total Spent.
- **V2G is ineffective** during Polar Vortex — extreme heating demand cannot be capped by bus batteries.

### Supply Chain Crisis
Global lithium shortage doubles Lithium Ion cost to **$1,000,000/unit**.

### Grid-Down Event
Coastal storm severs grid connection.
- **Requirement:** Total storage ≥ 2,000 kWh for island mode.
- Below 2,000 kWh = Fatal Crisis.

### The Carbon Tax
State levies a carbon tax on any unmet demand:
- **$0.10/kWh × annual shortfall kWh** added to Total Spent.
- If renewables cover 100% of demand every hour, fee = $0.

### Maintenance Crisis
Weather and workforce gaps take a generation unit offline.
- Solar and Wind output reduced to **75% of normal**.
- A **$500,000 repair fee** is added if solar or wind units exist.

---

## CO₂ OFFSET CALCULATOR

- **Emission factor:** 392 g CO₂/kWh — ISO New England marginal rate (natural gas displacement).
  *Source: iso-ne.com — 0.00654 MT CO₂/MW/min × 60 min/hr × 1,000 kW/MW*
- **Biomass:** Carbon-neutral — combustion emissions balanced by biomass regrowth. Net offset = 0.
- **Hydrogen boost:** If active, the ×1.3 output multiplier on solar/wind is reflected in offset calculations.

**Equivalency benchmarks:**
- Cars removed: 4.6 MT CO₂/vehicle/year (EPA)
- Trees planted: 22 kg CO₂ absorbed/tree/year (EPA)
- NE homes powered: 7,500 kWh/home/year (EIA regional average)
