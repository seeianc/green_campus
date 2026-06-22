# Green Campus Simulator — Rules & Parameters Reference
*Current as of June 2026. Use alongside the Playing Cards and Pivot Cards.*

---

## BUDGETS

| Scenario | Starting Budget |
|---|---|
| Standard | $10,000,000 |
| Failed Bond | $9,000,000 |
| Federal Green Grant | $12,000,000 |

> **Federal Green Grant** also unlocks the Emerging Technology section (Hydrogen Electrolyzer, V2G, SCADA). These units are unavailable under any other budget tier.

---

## GENERATION SOURCES

### 1. Solar PV
- **Peak Output:** 500 kW per array block
- **Installation Cost:** $1,000,000 per unit
- **Annual Generation:** ~700,000 kWh/unit (~16% capacity factor)
- **Annual Savings:** ~$154,000/unit at $0.22/kWh
- **Seasonal:** Highest May–September. Output drops 90% during Polar Vortex.
- **Siting:** Prohibited in forested areas if Migratory Bird Ordinance is active.
- **Storage Requirement:** Each solar unit requires 1,000 kWh of storage (any type) to satisfy the Night Owl campus constraint.

### 2. Wind Turbine
- **Peak Output:** 3,000 kW per turbine
- **Installation Cost:** $2,500,000 per unit
- **Annual Generation:** ~8,000,000 kWh/unit (~30% capacity factor)
- **Annual Savings:** ~$1,760,000/unit at $0.22/kWh
- **Seasonal:** Highest November–March; lowest in summer.
- **Buffer Rule:** Each turbine requires a 500 ft noise/safety radius. If that buffer touches a classroom or neighboring property, a **$200,000 mitigation fee** is added.
- **Siting:** Prohibited in forested areas if Migratory Bird Ordinance is active.
- **Workforce:** If Crane Operator Shortage is active, any wind installation adds a **$500,000 logistics fee**.

### 3. Geothermal (Deep-Bore)
- **Peak Output:** 2,000 kW per unit (runs 24/7)
- **Installation Cost:** $5,000,000 per unit (–20% with Hydropower Engineering Hub)
- **Annual Generation:** ~14,000,000 kWh/unit (~80% capacity factor)
- **Annual Savings:** ~$3,080,000/unit at $0.22/kWh
- **Siting:** Cannot be placed on water. Banned entirely if Vernal Pool Protection is active.

### 4. Hydro — Low Head
- **Peak Output:** 500 kW per unit (runs continuously)
- **Installation Cost:** $1,000,000 per unit (–20% with Hydropower Engineering Hub)
- **Annual Generation:** ~2,000,000 kWh/unit (~46% capacity factor)
- **Annual Savings:** ~$440,000/unit at $0.22/kWh
- **Siting:** Must be placed on the river/water line.

### 5. Hydro — High Head
- **Peak Output:** 2,000 kW per unit (runs continuously)
- **Installation Cost:** $4,000,000 per unit (–20% with Hydropower Engineering Hub)
- **Annual Generation:** ~7,500,000 kWh/unit (~43% capacity factor)
- **Annual Savings:** ~$1,650,000/unit at $0.22/kWh
- **Siting:** Must be placed at a high-gradient river crossing (3+ contour lines on the map).

### 6. Tidal — Standard
- **Peak Output:** 500 kW per unit (semidiurnal cycle — 2 peaks per day)
- **Installation Cost:** $1,500,000 per unit
- **Annual Generation:** ~2,190,000 kWh/unit (~50% capacity factor)
- **Annual Savings:** ~$482,000/unit at $0.22/kWh
- **Siting:** Must be placed in coastal or saltwater area.

### 7. Tidal — Pinch Point
- **Peak Output:** 600 kW per unit (20% bonus for narrow channel placement)
- **Installation Cost:** $1,500,000 per unit
- **Annual Generation:** ~2,628,000 kWh/unit (~50% capacity factor)
- **Annual Savings:** ~$578,000/unit at $0.22/kWh
- **Siting:** Must be placed in a narrow coastal channel for the bonus to apply.

### 8. Biomass
- **Peak Output:** 1,000 kW per unit (runs 24/7)
- **Installation Cost:** $3,500,000 per unit
- **Annual Generation:** ~7,000,000 kWh/unit (~80% capacity factor)
- **Annual Savings:** ~$1,540,000/unit at $0.22/kWh
- **Siting:** Must be placed near a road (fuel truck access). Cannot be adjacent to a building (exhaust hazard).
- **CO₂:** Treated as carbon-neutral — combustion emissions are balanced by biomass regrowth.

---

## STORAGE

| Unit | Capacity | Cost | Notes |
|---|---|---|---|
| Li-Ion BESS | 1,000 kWh | $500,000 | Doubles to $1M during Supply Chain Crisis |
| Thermal Storage | 2,500 kWh | $1,000,000 | Adds $75K/yr heating oil savings when charged by excess wind, hydro, or tidal |
| Mechanical Flywheel | 1,000 kWh | $300,000 | Smooths voltage flicker from intermittent sources |
| CAES | 5,000 kWh | $2,000,000 | Adds $30K/yr seasonal savings when charged by a surplus source |

> **Grid-Down Requirement:** Total storage across all types must reach **2,000 kWh** to sustain island mode. Falling below this triggers a Fatal Crisis warning.

---

## EMERGING TECHNOLOGY
*Only available when Federal Green Grant budget is selected.*

| Unit | Cost | Effect |
|---|---|---|
| Green Hydrogen Electrolyzer | $2,000,000 | Boosts solar and wind annual output by 30% |
| V2G (Vehicle-to-Grid) | $100,000 | Caps peak campus demand at 4,750 kW |
| SCADA System | $500,000 | Reduces total campus demand by 15% |

---

## INFRASTRUCTURE FEES

| Item | Cost | Trigger |
|---|---|---|
| Electrical Cabling | $500/ft | Scales with cable run length set in the simulator |
| Wind Noise Buffer | $200,000 flat | Elected if turbine buffer encroaches on classroom or property |
| Utility Upgrade Fee | $500,000 flat | Automatically applied when total peak supply exceeds 3,000 kW |
| Crane Logistics | $500,000 flat | Any wind installation + Crane Operator Shortage workforce card |

---

## RATES

| Rate | Value |
|---|---|
| Campus electricity rate (own-use savings) | $0.22/kWh — Maine commercial rate |
| Net metering / grid sell-back | $0.06/kWh (surplus only) |
| Carbon tax (shortfall penalty) | $0.10/kWh × annual unmet kWh demand |

---

## DEMAND PATTERNS

| Pattern | Description | Peak |
|---|---|---|
| Standard | Typical school day — gradual ramp, afternoon peak | 5,000 kW |
| Night Owl | Extended evening activity — peak at 17:00–20:00 | 5,000 kW |
| Morning Rush | Heavy early start — peak at 05:00–09:00 | 5,000 kW |

> **Morning Rush Constraint:** If solar + wind together supply more than 50% of total annual generation with no storage, that is a siting violation. Add BESS, CAES, or flywheel storage to resolve.

---

## PIVOT CARDS (Scenario Events)
*Dealt at the 60-minute mark. Select one in the Simulator to apply its effects.*

### Card 1 — AI Learning Hub (Demand Spike)
Campus hosts a regional AI server farm. Base demand increases by **+1,500 kW every hour** — new peak demand is **6,500 kW**. Add generation or accept the higher utility cost.
- **No storage penalty:** If zero storage capacity is installed (any type), a **−$50,000/yr reliability penalty** is applied to annual savings. Adding any storage unit (BESS, Flywheel, Thermal, or CAES) avoids this penalty.

### Card 2 — Polar Vortex (Climate Extreme)
Two-week cold snap drops temperatures to −20°F.
- Peak demand rises to **7,500 kW** (or **5,500 kW** if Thermal Storage is installed).
- Solar output drops to **10% of normal** (50 kW per block instead of 500 kW).
- If your system cannot meet the demand threshold, a **$300,000 emergency surcharge** is added.

### Card 3 — Supply Chain Crisis (Inflation)
Global lithium shortage doubles Li-Ion BESS cost to **$1,000,000/unit**. If over budget, sell back a unit or switch to Flywheels or Thermal Storage.

### Card 4 — Grid-Down Event (Resilience Check)
A coastal storm severs the grid connection. Your system must operate as an island.
- **Requirement:** ≥ 2,000 kWh total storage capacity.
- Failing this check triggers a Fatal Crisis warning and a loss of reliability points.

### Card 5 — The Carbon Tax (Regulatory Penalty)
The state levies a carbon tax on any remaining fossil fuel use.
- **Fee:** $0.10/kWh × every kWh of unmet campus demand × 365 days/yr.
- If your system is 100% renewable, the fee is $0 — full grid coverage is the only way to avoid it.

### Card 6 — Maintenance Crisis (Equipment Failure)
Poor weather and workforce gaps take a primary generation unit offline.
- Solar and Wind output both reduced to **75% of normal**.
- A **$500,000 repair fee** is added if solar or wind units are present.

---

## WORKFORCE SCENARIOS

| Scenario | Effect |
|---|---|
| None | Standard cost and performance |
| Crane Operator Shortage | +$500,000 logistics fee for any wind installation |
| Hydropower Engineering Hub | –20% installation cost for Geothermal, Hydro (Low and High Head) |

---

## ENVIRONMENTAL CONSTRAINTS

| Constraint | Rule |
|---|---|
| Migratory Bird Ordinance | Wind turbines placed in forested map zones = siting violation. Permitted zones: fields, parking lots, open water. |
| Vernal Pool Protection | Geothermal is entirely banned. Any geo unit placed = violation. Maximum 25% of forested land may be cleared. |

---

## MAP SITING RULES (always enforced)

- **Hydro:** Must be placed on a river or water body.
- **Tidal:** Must be placed in a coastal or saltwater zone.
- **Geothermal:** Cannot be placed on water. Cannot be placed in no-build zones.
- **Biomass:** Must be adjacent to a road (fuel delivery access). Cannot be placed immediately beside a building.
- **Wind buffer:** A 500 ft radius around each turbine must not overlap with classrooms or neighboring property.

---

## CO₂ OFFSET CALCULATOR
*Displayed at the bottom of the Simulator page.*

- **Emission factor:** 392 g CO₂/kWh — ISO New England marginal rate (natural gas displacement).  
  *Source: iso-ne.com/isoexpress — 0.00654 MT CO₂/MW/min × 60 min/hr × 1,000 kW/MW.*
- **Biomass:** Carbon-neutral. Net offset = 0.
- **Hydrogen boost:** If Federal Green Grant is active and an electrolyzer is installed, the 30% solar/wind output boost is reflected in offset calculations.

**Equivalency benchmarks used:**
- Cars removed: 4.6 MT CO₂/vehicle/year (EPA)
- Trees planted: 22 kg CO₂ absorbed/tree/year (EPA)
- NE homes powered: 7,500 kWh/home/year (EIA regional average)

---

## FINANCIAL SUMMARY (how ROI is calculated)

1. **Base Annual Savings** = total annual kWh across all sources × $0.22/kWh
2. **Surplus Revenue** = kWh sold back to grid above campus demand × $0.06/kWh  
   *(Surplus is capped at the net metering rate — this reduces base savings since overproduction is worth less)*
3. **Pivot/Scenario Adjustments** = carbon tax fees, Polar Vortex surcharges, Thermal/CAES bonuses
4. **Final Annual Savings** = Base + Adjustments + Heating Oil Savings (Thermal) + Seasonal Savings (CAES)
5. **ROI Break-Even** = Total Spent ÷ Final Annual Savings (years)
