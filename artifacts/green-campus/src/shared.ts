export interface SharedState {
  budgetLimit: number;
  budgetTier: string;
  techCounts: Record<string, number>;
  totalMapCost: number;
  totalMapKw: number;
  totalMapCableCm: number;
  placements: Record<string, Array<{ tech: string; cx: number; cy: number }>>;
  cables: Record<string, Array<{ x1: number; y1: number; x2: number; y2: number }>>;
  windSensitiveZoneCount: number;
}

export const sharedState: SharedState = {
  budgetLimit: 10_000_000,
  budgetTier: 'None',
  techCounts: {},
  totalMapCost: 0,
  totalMapKw: 0,
  totalMapCableCm: 0,
  placements: {},
  cables: {},
  windSensitiveZoneCount: 0,
};

export function emitMapUpdate() {
  window.dispatchEvent(new CustomEvent('gc:map-update'));
}

export function emitSimUpdate() {
  window.dispatchEvent(new CustomEvent('gc:sim-update'));
}

// Map tech IDs → Simulator input element IDs
export const MAP_TECH_TO_SIM: Record<string, string> = {
  solar:    'solar',
  wind:     'wind',
  geo:      'geo',
  hydroL:   'hydroLow',
  hydroH:   'hydroHigh',
  tidal:    'tidalStd',
  biomass:  'biomass',
  bess:     'liIon',
  thermal:  'thermal',
  flywheel: 'flywheel',
  caes:     'caes',
};
