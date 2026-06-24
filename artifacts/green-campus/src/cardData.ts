export interface CardRow { label: string; value: string }
export interface CardData {
  id: string;
  title: string;
  color: string;
  italic?: string;
  rows: CardRow[];
  image?: string;
}

const CARD_IMG_BASE = (() => {
  const prod = window.location.pathname.includes('/green_campus');
  return prod ? '/green_campus/cards/' : '/cards/';
})();

function img(filename: string): string { return CARD_IMG_BASE + filename; }

export const CARDS: Record<string, CardData> = {
  // ── Generation ──────────────────────────────────────────────────────────
  solar: {
    id: 'solar', title: 'Solar PV', color: '#2e7d52',
    image: img('Solar PV.png'),
    rows: [
      { label: 'Unit Power', value: '500 kW per array block' },
      { label: 'Installation Cost', value: '$1,000,000 per unit' },
      { label: 'Annual Savings', value: '~$154,000/unit at $0.22/kWh' },
      { label: 'Space Needed', value: '50,000 sq. ft. (1.1 acres) of flat land or rooftop' },
      { label: 'Constraints', value: 'Prohibited in forested areas if Migratory Bird Ordinance is active. Output drops to 10% during Polar Vortex. Night Owl profile requires 1,000 kWh storage per solar unit.' },
    ],
  },
  wind: {
    id: 'wind', title: 'Wind Turbine', color: '#2e7d52',
    image: img('Wind_Turbine.png'),
    rows: [
      { label: 'Unit Power', value: '3,000 kW per turbine' },
      { label: 'Installation Cost', value: '$4,500,000 per unit' },
      { label: 'Annual Savings', value: '~$1,760,000 (avoided utility costs)' },
      { label: 'Space Needed', value: 'Requires 500 ft noise/safety radius. Encroaching on a classroom or property adds a $200,000 mitigation fee.' },
      { label: 'Constraints', value: 'Crane Operator Shortage adds $500,000 logistics fee. Prohibited in forested areas if Migratory Bird Ordinance is active.' },
    ],
  },
  geo: {
    id: 'geo', title: 'Geothermal', color: '#2e7d52',
    image: img('Geothermal.png'),
    rows: [
      { label: 'Unit Power', value: '1,000 kW (runs 24/7)' },
      { label: 'Cost', value: '$8,000,000 per site (−20% with Hydropower Engineering Hub = $6,400,000)' },
      { label: 'Annual Savings', value: '~$1,540,000/unit' },
      { label: 'Space Needed', value: 'Construction: 3–5 acres. Permanent footprint: 5,000 sq. ft.' },
      { label: 'Constraints', value: 'Cannot be placed on water. Banned entirely if Vernal Pool Protection is active.' },
    ],
  },
  hydroL: {
    id: 'hydroL', title: 'Hydro — Low Head', color: '#2e7d52',
    image: img('Small_Hydro.png'),
    rows: [
      { label: 'Unit Power', value: '500 kW (runs continuously)' },
      { label: 'Installation Cost', value: '$1,000,000 per unit (−20% with Hydropower Engineering Hub)' },
      { label: 'Annual Savings', value: '~$440,000/unit' },
      { label: 'Siting', value: 'Must be placed on a flat section of the river (0–2 contour lines).' },
    ],
  },
  hydroH: {
    id: 'hydroH', title: 'Hydro — High Head', color: '#2e7d52',
    image: img('Small_Hydro.png'),
    rows: [
      { label: 'Unit Power', value: '2,000 kW (runs continuously)' },
      { label: 'Installation Cost', value: '$4,000,000 per unit (−20% with Hydropower Engineering Hub)' },
      { label: 'Annual Savings', value: '~$1,650,000/unit' },
      { label: 'Siting', value: 'Must be placed where the river crosses 3+ contour lines (high-gradient crossing).' },
    ],
  },
  tidal: {
    id: 'tidal', title: 'Tidal', color: '#2e7d52',
    image: img('Tidal.png'),
    rows: [
      { label: 'Unit Power', value: '500 kW (semidiurnal — 2 peaks per day)' },
      { label: 'Installation Cost', value: '$1,500,000 per unit' },
      { label: 'Annual Savings', value: '~$482,000/unit at $0.22/kWh' },
      { label: 'Space Needed', value: 'Any coastal or salt-water area; small underwater footprint.' },
      { label: 'Timing', value: 'Predictable output twice daily during tidal cycles.' },
    ],
  },
  biomass: {
    id: 'biomass', title: 'Biomass', color: '#2e7d52',
    image: img('Biomass.png'),
    rows: [
      { label: 'Unit Power', value: '1,000 kW (runs 24/7)' },
      { label: 'Cost', value: '$3,500,000 per unit' },
      { label: 'Annual Savings', value: '~$1,540,000/unit' },
      { label: 'Space Needed', value: '3 acres (fuel silos, wood-chip storage, processing plant)' },
      { label: 'Constraints', value: 'Must be adjacent to a road for fuel delivery. Avoid placement within 200 ft of school windows (exhaust hazard).' },
    ],
  },

  // ── Infrastructure ───────────────────────────────────────────────────────
  cabling: {
    id: 'cabling', title: 'Electrical Cabling', color: '#4a7a8e',
    image: img('Cabling.png'),
    rows: [
      { label: 'Cost', value: '$500 per foot' },
      { label: 'Purpose', value: 'Connects each generation and storage unit to the campus substation. Distance is measured on the map in feet.' },
      { label: 'Strategy', value: 'Place units close to the substation and each other to minimize total cable run. Units placed far from the substation or in remote corners of the map will significantly increase costs.' },
      { label: 'Tip', value: 'The map tool calculates the minimum cable length automatically based on your placements — you can increase the value manually if you want to model a longer route.' },
    ],
  },

  // ── Storage ──────────────────────────────────────────────────────────────
  bess: {
    id: 'bess', title: 'Lithium-Ion BESS', color: '#7b2d8b',
    image: img('BESS.png'),
    rows: [
      { label: 'Capacity', value: '1,000 kWh per unit' },
      { label: 'Cost', value: '$500,000 per unit (doubles to $1M during Supply Chain Crisis)' },
      { label: 'Best Use', value: 'Pairing with Solar to provide electricity for selected hours after sunset. Satisfies Night Owl storage requirement.' },
    ],
  },
  thermal: {
    id: 'thermal', title: 'Thermal Storage', color: '#7b2d8b',
    image: img('Thermal.png'),
    rows: [
      { label: 'Capacity', value: '2,500 kWh per unit' },
      { label: 'Cost', value: '$1,000,000 per unit' },
      { label: 'Best Use', value: 'Adds $75,000/yr in heating oil savings when charged by excess wind, hydro, or tidal. Reduces Polar Vortex peak demand from 4,500 kW to 3,300 kW.' },
    ],
  },
  flywheel: {
    id: 'flywheel', title: 'Mechanical Flywheel', color: '#7b2d8b',
    image: img('Mechanical Flywheel.png'),
    rows: [
      { label: 'Capacity', value: '1,000 kWh per unit' },
      { label: 'Cost', value: '$300,000 per unit' },
      { label: 'Best Use', value: 'Smoothing out "flickering" power from Wind or Tidal turbines.' },
    ],
  },
  caes: {
    id: 'caes', title: 'Compressed Air Storage', color: '#7b2d8b',
    image: img('Compressed_air.png'),
    rows: [
      { label: 'Capacity', value: '5,000 kWh long-term storage' },
      { label: 'Cost', value: '$2,000,000 per unit' },
      { label: 'Best Use', value: 'Earns extra $30,000/yr by storing surplus spring/summer energy and releasing it during winter peak demand — requires at least one active generation source.' },
    ],
  },

  // ── Emerging Tech ─────────────────────────────────────────────────────────
  hydrogen: {
    id: 'hydrogen', title: 'Green Hydrogen Electrolyzer', color: '#e87722',
    image: img('Green_hydrogen_electrolizer.png'),
    rows: [
      { label: 'Cost', value: '$2,000,000' },
      { label: 'Benefit', value: 'Converts excess summer solar/wind into stored gas for winter heating. Increases solar and wind annual output by 30%.' },
    ],
  },
  v2g: {
    id: 'v2g', title: 'Vehicle-to-Grid Charging Hub', color: '#e87722',
    image: img('v2g_hub.png'),
    rows: [
      { label: 'Cost', value: '$100,000' },
      { label: 'Benefit', value: "Allows the school's electric buses to act as a battery bank, feeding power back to reduce overall peak energy need to ~2,700 kW." },
    ],
  },
  scada: {
    id: 'scada', title: 'AI-Grid Controller (SCADA)', color: '#e87722',
    image: img('AI_grid_controller.png'),
    rows: [
      { label: 'Cost', value: '$500,000' },
      { label: 'Benefit', value: 'Smart software that predicts weather and student schedules. Reduces total campus energy demand by 15% automatically.' },
    ],
  },

  // ── Demand Pattern ────────────────────────────────────────────────────────
  'night-owl': {
    id: 'night-owl', title: 'Night Owl Campus', color: '#2d5a8e',
    image: img('Night_owl.png'),
    italic: 'Your school is a community hub hosting night classes, indoor sports leagues, and theater rehearsals until 10 PM every night.',
    rows: [
      { label: 'Challenge', value: '40% of your energy use happens after the sun goes down.' },
      { label: 'Task', value: 'If you are using Solar, you must purchase at least 2 Lithium Ion storage units.' },
    ],
  },
  'morning-rush': {
    id: 'morning-rush', title: 'Morning Rush Campus', color: '#2d5a8e',
    image: img('Morning_rush.png'),
    italic: "The school's HVAC and kitchen systems start at 5:00 AM to prepare for students.",
    rows: [
      { label: 'Challenge', value: 'Your highest energy spike is during the early morning.' },
      { label: 'Task', value: 'If more than 50% of your energy comes from Solar or Wind, you must increase non-solar/wind sources to be greater than 50% or find an energy storage solution.' },
    ],
  },

  // ── Budget Cards ──────────────────────────────────────────────────────────
  'failed-bond': {
    id: 'failed-bond', title: 'The "Failed Bond" Crisis', color: '#4a7a8e',
    image: img('Failed Bond.png'),
    italic: 'A local vote to increase the school budget failed by a narrow margin.',
    rows: [
      { label: 'Challenge', value: 'Your total budget is $9,000,000.' },
      { label: 'Task', value: 'You must find the highest ROI possible with the energy sources you select.' },
    ],
  },
  'federal-grant': {
    id: 'federal-grant', title: 'The "Federal Green Grant"', color: '#4a7a8e',
    image: img('Federal Green Grant.png'),
    italic: 'Your school won a national award for sustainability innovation.',
    rows: [
      { label: 'Benefit', value: 'You have a total budget of $12,000,000.' },
      { label: 'Task', value: 'You must purchase at least one Emerging Tech (Hydrogen, V2G, or AI-Controller) for your final plan.' },
    ],
  },

  // ── Environmental Constraints ─────────────────────────────────────────────
  'migratory-bird': {
    id: 'migratory-bird', title: 'The "Migratory Bird" Ordinance', color: '#c8a820',
    image: img('Migratory Bird.png'),
    italic: 'Ecologists have designated the undeveloped areas of the school as a critically protected migratory bird corridor.',
    rows: [
      { label: 'Challenge', value: 'Wind turbines permitted in fields, parking lots, and open water — not in forested areas.' },
      { label: 'Task', value: 'Place wind turbines only in developed areas.' },
    ],
  },
  'vernal-pool': {
    id: 'vernal-pool', title: 'The "Vernal Pool Protection" Ordinance', color: '#c8a820',
    image: img('Vernal Pool.png'),
    italic: 'Valuable vernal pools have been identified on your school property.',
    rows: [
      { label: 'Challenge', value: 'Cannot clear more than 25% of forested land, and no heavy drilling (Geothermal) is allowed.' },
      { label: 'Task', value: 'Clear little forested land and choose an energy source other than Geothermal.' },
    ],
  },

  // ── Workforce ─────────────────────────────────────────────────────────────
  'hydro-hub': {
    id: 'hydro-hub', title: 'Hydropower Engineering Hub', color: '#8b3a6b',
    image: img('Hyrdropower Hub.png'),
    italic: 'Your school is located near a regional hub of civil and geotechnical engineers with deep expertise in waterway management, dam construction, and subsurface drilling.',
    rows: [
      { label: 'Benefit', value: 'Geothermal and hydro installation costs are reduced by 20% due to access to a local skilled workforce.' },
      { label: 'Task', value: 'Take advantage of this cost reduction by incorporating Geothermal or Small Hydro. Consider whether the savings change your break-even timeline enough to justify prioritizing these over alternatives.' },
    ],
  },
  'crane-shortage': {
    id: 'crane-shortage', title: 'The "Crane Operator Shortage"', color: '#8b3a6b',
    image: img('Crane Op Shortage.png'),
    italic: 'A massive project in a nearby city has hired every heavy-crane operator for the next two years.',
    rows: [
      { label: 'Challenge', value: 'Building Wind Turbines will cost an extra $500,000 in Specialized Logistics Fees.' },
      { label: 'Task', value: 'Consider a non-wind based energy source alternative.' },
    ],
  },

  // ── Pivot Cards ───────────────────────────────────────────────────────────
  'ai-learning-hub': {
    id: 'ai-learning-hub', title: 'The AI Learning Hub', color: '#c42b2b',
    image: img('AI Learning Hub.png'),
    italic: 'Your school district has just been selected to host a regional "Sovereign AI" server farm inside your building.',
    rows: [
      { label: 'The Impact', value: 'Base energy demand increased by 30% (+900 kW). New peak: 3,900 kW.' },
      { label: 'The Task', value: 'Add more generation units to your map or otherwise offset the energy demand increase.' },
      { label: 'The Tradeoff', value: 'If you have no Storage (BESS), peak-hour energy costs increase by $50,000/yr.' },
    ],
  },
  'polar-vortex': {
    id: 'polar-vortex', title: 'The Polar Vortex', color: '#c42b2b',
    image: img('Polar Vortex.png'),
    italic: 'A record-breaking Polar Vortex has dropped temperatures to −20°F for two straight weeks.',
    rows: [
      { label: 'The Impact', value: 'Peak demand spikes to 4,500 kW. Solar PV output drops by 90% (50 kW per block).' },
      { label: 'The Task', value: "If your system can't meet 4,500 kW, pay a $300,000 emergency utility surcharge." },
      { label: 'The Bonus', value: 'Thermal Storage reduces peak demand from 4,500 kW to 3,300 kW.' },
    ],
  },
  'supply-chain': {
    id: 'supply-chain', title: 'The Supply Chain Crisis', color: '#c42b2b',
    image: img('Supply Chain Crisis.png'),
    italic: 'Global trade delays have caused a critical shortage of lithium-ion batteries and specialized microchips.',
    rows: [
      { label: 'The Impact', value: 'Cost of all Lithium Ion units doubled to $1,000,000 per unit.' },
      { label: 'The Task', value: 'If over budget, sell back a unit or switch to Flywheels or Thermal Storage.' },
      { label: 'The Tradeoff', value: 'Budget vs. Grid Stability.' },
    ],
  },
  'grid-down': {
    id: 'grid-down', title: 'The "Grid-Down" Event', color: '#c42b2b',
    image: img('Grid Down Event.png'),
    italic: 'A severe storm has severed the transmission cable to your school community.',
    rows: [
      { label: 'The Impact', value: 'The school is disconnected from the main grid.' },
      { label: 'The Task', value: 'Demonstrate that your school can function as an "Island" (run independently).' },
      { label: 'The Requirement', value: 'Must have ≥2,000 kWh total storage capacity. Failing this check = school "closes" and reliability points are lost.' },
    ],
  },
  'carbon-tax': {
    id: 'carbon-tax', title: 'The Carbon Tax', color: '#c42b2b',
    image: img('Carbon Tax.png'),
    italic: 'The state has passed a strict new Carbon Tax on any public building still utilizing fossil fuels for heating.',
    rows: [
      { label: 'The Impact', value: 'Every kWh your campus cannot supply from renewables is taxed at $0.10/kWh × 365 days/yr.' },
      { label: 'The Task', value: 'Add generation capacity to reduce your daily shortfall — the closer to 100% renewable, the lower your tax.' },
      { label: 'The Tradeoff', value: 'A grid-reliant campus could see its ROI extend by years.' },
    ],
  },
  'maintenance-crisis': {
    id: 'maintenance-crisis', title: 'The Maintenance Crisis', color: '#c42b2b',
    image: img('Maintenance Crisis.png'),
    italic: 'Poor weather and workforce gaps have led to widespread failure across variable generation units.',
    rows: [
      { label: 'The Impact', value: 'Solar and Wind output are each reduced by 25%.' },
      { label: 'The Task', value: 'Add a $500,000 Repair Fee to your Total Costs.' },
      { label: 'The Tradeoff', value: 'Pay the fee and absorb the production loss, or pivot to reliable baseload sources (Geothermal, Biomass) unaffected by this crisis.' },
    ],
  },
};
