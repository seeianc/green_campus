import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function EnergyGridSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const style = document.createElement("style");
    style.id = "energy-sim-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

      .energy-sim {
        --bg: #f5f4f0;
        --surface: #ffffff;
        --border: #e2e0d8;
        --text: #1a1917;
        --text-muted: #6b6960;
        --accent: #2a6e4e;
        --accent-light: #e8f2ec;
        --warn: #c45c1a;
        --warn-light: #fdf0e8;
        --danger: #b83232;
        --danger-light: #fdeaea;
        --mono: 'DM Mono', monospace;
        --sans: 'DM Sans', sans-serif;
        font-family: var(--sans);
        background: var(--bg);
        color: var(--text);
        font-size: 14px;
        line-height: 1.5;
        height: 100%;
        overflow-y: auto;
      }

      .energy-sim-header {
        background: var(--text);
        color: white;
        padding: 18px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .energy-sim-header h1 {
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin: 0;
      }
      .energy-sim-header .sub { font-size: 12px; color: #aaa; margin-top: 2px; font-family: var(--mono); }

      .grid-status-badge {
        font-family: var(--mono);
        font-size: 12px;
        padding: 6px 14px;
        border-radius: 4px;
        background: #2d3a32;
        color: #7ec49a;
        white-space: nowrap;
      }
      .grid-status-badge.warn { background: #3a2d1f; color: #e8a06a; }
      .grid-status-badge.danger { background: #3a1f1f; color: #e87070; }

      .energy-sim-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 28px 24px;
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 24px;
        align-items: start;
      }

      .energy-sidebar { display: flex; flex-direction: column; gap: 16px; }
      .energy-content { display: flex; flex-direction: column; gap: 16px; }

      .e-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
      }

      .e-card-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .e-card-header .dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--accent);
        flex-shrink: 0;
      }
      .e-card-body { padding: 14px 16px; }

      .e-input-row {
        display: grid;
        grid-template-columns: 1fr 72px;
        gap: 8px;
        align-items: center;
        padding: 7px 0;
        border-bottom: 1px solid #f0ede6;
      }
      .e-input-row:last-child { border-bottom: none; }
      .e-input-label { font-size: 13px; color: var(--text); }
      .e-input-sub { font-size: 11px; color: var(--text-muted); font-family: var(--mono); }

      .e-qty-input {
        font-family: var(--mono);
        font-size: 14px;
        font-weight: 500;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 5px 8px;
        width: 100%;
        text-align: right;
        background: #fafaf8;
        color: var(--text);
        transition: border-color 0.15s;
      }
      .e-qty-input:focus { outline: none; border-color: var(--accent); background: white; }

      .e-select-row { padding: 8px 0; border-bottom: 1px solid #f0ede6; }
      .e-select-row:last-child { border-bottom: none; }
      .e-select-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

      .e-select {
        width: 100%;
        font-family: var(--sans);
        font-size: 13px;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 6px 10px;
        background: #fafaf8;
        color: var(--text);
        cursor: pointer;
        transition: border-color 0.15s;
      }
      .e-select:focus { outline: none; border-color: var(--accent); }

      .e-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .e-metric {
        padding: 12px;
        background: #fafaf8;
        border-radius: 6px;
        border: 1px solid var(--border);
      }
      .e-metric.full { grid-column: 1 / -1; }
      .e-metric-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--text-muted);
        margin-bottom: 4px;
      }
      .e-metric-value {
        font-family: var(--mono);
        font-size: 18px;
        font-weight: 500;
        color: var(--text);
      }
      .e-metric-value.positive { color: var(--accent); }
      .e-metric-value.negative { color: var(--danger); }
      .e-metric-value.warn { color: var(--warn); }

      .e-alert {
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 13px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .e-alert.ok { background: var(--accent-light); color: #1a4a32; border: 1px solid #b8dfc8; }
      .e-alert.warn { background: var(--warn-light); color: #7a3010; border: 1px solid #f0c0a0; }
      .e-alert.danger { background: var(--danger-light); color: #7a1010; border: 1px solid #f0b0b0; }
      .e-alert-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
      .e-alerts-stack { display: flex; flex-direction: column; gap: 8px; }

      .e-chart-wrap { padding: 16px; }

      .budget-bar-wrap { margin-top: 8px; }
      .budget-bar-track { height: 8px; background: #ede9e0; border-radius: 4px; overflow: hidden; margin: 4px 0; }
      .budget-bar-fill { height: 100%; border-radius: 4px; background: var(--accent); transition: width 0.3s ease; }
      .budget-bar-fill.over { background: var(--danger); }
      .budget-bar-labels { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

      .workforce-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .workforce-item { background: #fafaf8; border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; }
      .workforce-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
      .workforce-item input { width: 100%; font-family: var(--mono); font-size: 14px; border: 1px solid var(--border); border-radius: 4px; padding: 4px 6px; text-align: right; background: white; }
      .workforce-item input:focus { outline: none; border-color: var(--accent); }
      .workforce-item .salary { font-size: 10px; color: var(--text-muted); margin-top: 2px; font-family: var(--mono); }

      .e-ledger-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 0;
        border-bottom: 1px solid #f0ede6;
        font-size: 13px;
      }
      .e-ledger-row:last-child { border-bottom: none; font-weight: 600; }
      .e-ledger-row .val { font-family: var(--mono); }
      .e-ledger-row .val.pos { color: var(--accent); }
      .e-ledger-row .val.neg { color: var(--danger); }

      .e-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border-radius: 5px;
        font-family: var(--sans); font-size: 13px; font-weight: 500;
        border: 1px solid var(--border); background: white;
        cursor: pointer; transition: all 0.15s; color: var(--text);
      }
      .e-btn:hover { background: #f5f3ed; border-color: #ccc; }
      .e-btn.primary { background: var(--accent); color: white; border-color: var(--accent); }
      .e-btn.primary:hover { background: #235f42; }
      .e-btn-row { display: flex; gap: 8px; padding: 14px 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }

      .e-section-divider {
        font-size: 10px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.1em; color: var(--text-muted);
        padding: 8px 0 4px; border-bottom: 1px solid var(--border); margin-bottom: 4px;
      }

      .e-tag {
        display: inline-block; font-family: var(--mono); font-size: 10px;
        padding: 2px 7px; border-radius: 3px;
        background: var(--accent-light); color: var(--accent); font-weight: 500;
      }
      .e-tag.warn { background: var(--warn-light); color: var(--warn); }

      @media (max-width: 900px) {
        .energy-sim-main { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
      <div class="energy-sim" id="energySim">
        <div class="energy-sim-header">
          <div>
            <h1>Renewable Energy Grid Simulator</h1>
            <div class="sub">Student Planning Tool — Changes are local to your browser</div>
          </div>
          <div id="headerStatus" class="grid-status-badge">⚡ Grid Stable</div>
        </div>

        <div class="energy-sim-main">
          <div class="energy-sidebar">

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#7c6a3a"></div>Data Cards</div>
              <div class="e-card-body">
                <div class="e-select-row">
                  <div class="e-select-label">Demand Pattern</div>
                  <select class="e-select" id="demandPattern">
                    <option value="None">None (Standard)</option>
                    <option value="Night Owl">Night Owl</option>
                    <option value="Morning Rush">Morning Rush</option>
                  </select>
                </div>
                <div class="e-select-row">
                  <div class="e-select-label">Budget Tier</div>
                  <select class="e-select" id="budgetTier">
                    <option value="None">Standard ($10M)</option>
                    <option value="Failed Bond">Failed Bond ($8M)</option>
                    <option value="Federal Green Grant">Federal Green Grant ($12M)</option>
                  </select>
                </div>
                <div class="e-select-row">
                  <div class="e-select-label">Workforce Availability</div>
                  <select class="e-select" id="workforce">
                    <option value="None">Standard</option>
                    <option value="Crane Operator Shortage">Crane Operator Shortage</option>
                    <option value="Marine Industry Hub">Marine Industry Hub</option>
                  </select>
                </div>
                <div class="e-select-row">
                  <div class="e-select-label">Environmental Constraints</div>
                  <select class="e-select" id="envConstraints">
                    <option value="None">None</option>
                    <option value="Migratory Bird">Migratory Bird Ordinance</option>
                    <option value="Vernal Pool">Vernal Pool Protection</option>
                  </select>
                </div>
                <div class="e-select-row" style="border-bottom:none">
                  <div class="e-select-label">Pivot Card</div>
                  <select class="e-select" id="pivotCard">
                    <option value="None">None</option>
                    <option value="Supply Chain Crisis">Supply Chain Crisis</option>
                    <option value="AI Learning Hub">AI Learning Hub</option>
                    <option value="Polar Vortex">Polar Vortex</option>
                    <option value="Maintenance Crisis">Maintenance Crisis</option>
                    <option value="Grid-Down Event">Grid-Down Event</option>
                    <option value="The Carbon Tax">The Carbon Tax</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#3a8f5f"></div>Generation Technology</div>
              <div class="e-card-body">
                <div class="e-section-divider">Renewable Sources</div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Solar PV Blocks</div><div class="e-input-sub">500 kW/unit · $1M each</div></div>
                  <input class="e-qty-input" type="number" id="solar" value="0" min="0" max="50">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">On/Offshore Wind</div><div class="e-input-sub">3,000 kW/unit · $2.5M each</div></div>
                  <input class="e-qty-input" type="number" id="wind" value="0" min="0" max="20">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Geothermal Site</div><div class="e-input-sub">2,000 kW/unit · $5M each</div></div>
                  <input class="e-qty-input" type="number" id="geo" value="0" min="0" max="10">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Small Hydro (Low)</div><div class="e-input-sub">500 kW/unit · $4M combined</div></div>
                  <input class="e-qty-input" type="number" id="hydroLow" value="0" min="0" max="20">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Small Hydro (High)</div><div class="e-input-sub">2,000 kW/unit · $4M combined</div></div>
                  <input class="e-qty-input" type="number" id="hydroHigh" value="0" min="0" max="10">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Tidal (Standard)</div><div class="e-input-sub">500 kW/unit · $1.5M combined</div></div>
                  <input class="e-qty-input" type="number" id="tidalStd" value="0" min="0" max="20">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Tidal (Pinch Point)</div><div class="e-input-sub">600 kW/unit · $1.5M combined</div></div>
                  <input class="e-qty-input" type="number" id="tidalPP" value="0" min="0" max="20">
                </div>
                <div class="e-input-row" style="border-bottom:none">
                  <div><div class="e-input-label">Biomass</div><div class="e-input-sub">1,000 kW/unit · $3.5M each</div></div>
                  <input class="e-qty-input" type="number" id="biomass" value="0" min="0" max="10">
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#5a7abf"></div>Storage Technology</div>
              <div class="e-card-body">
                <div class="e-input-row">
                  <div><div class="e-input-label">Lithium-Ion BESS</div><div class="e-input-sub">1,000 kWh/unit · $500K each</div></div>
                  <input class="e-qty-input" type="number" id="liIon" value="0" min="0" max="20">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Thermal Storage</div><div class="e-input-sub">2,500 kWh/unit · $1M each</div></div>
                  <input class="e-qty-input" type="number" id="thermal" value="0" min="0" max="10">
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Mechanical Flywheels</div><div class="e-input-sub">1,000 kWh/unit · $300K each</div></div>
                  <input class="e-qty-input" type="number" id="flywheel" value="0" min="0" max="20">
                </div>
                <div class="e-input-row" style="border-bottom:none">
                  <div><div class="e-input-label">CAES</div><div class="e-input-sub">5,000 kWh/unit · $2M each</div></div>
                  <input class="e-qty-input" type="number" id="caes" value="0" min="0" max="10">
                </div>
              </div>
            </div>

            <div class="e-card" id="emergingCard">
              <div class="e-card-header"><div class="dot" style="background:#bf5a8a"></div>Emerging Technology <span class="e-tag warn" style="margin-left:auto">Grant Required</span></div>
              <div class="e-card-body">
                <div id="emergingNote" class="e-alert warn" style="margin-bottom:10px">
                  <span class="e-alert-icon">ℹ️</span>
                  Select Federal Green Grant budget to unlock. Must purchase ≥1 to stay compliant.
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">Green Hydrogen Electrolyzer</div><div class="e-input-sub">$2M each · +30% solar & wind output</div></div>
                  <input class="e-qty-input" type="number" id="hydrogen" value="0" min="0" max="5" disabled>
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label">V2G Charging Hub</div><div class="e-input-sub">$100K fleet upgrade · caps peak at 4,750 kW</div></div>
                  <input class="e-qty-input" type="number" id="v2g" value="0" min="0" max="5" disabled>
                </div>
                <div class="e-input-row" style="border-bottom:none">
                  <div><div class="e-input-label">AI-Grid Controller (SCADA)</div><div class="e-input-sub">$500K each · −15% demand</div></div>
                  <input class="e-qty-input" type="number" id="scada" value="0" min="0" max="5" disabled>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#8f6a3a"></div>Infrastructure & Fees</div>
              <div class="e-card-body">
                <div class="e-input-row">
                  <div><div class="e-input-label">Cabling Length (cm)</div><div class="e-input-sub">$500K per cm</div></div>
                  <input class="e-qty-input" type="number" id="cabling" value="0" min="0">
                </div>
                <div class="e-input-row" style="border-bottom:none">
                  <div><div class="e-input-label">Wind Buffer Penalty?</div><div class="e-input-sub">$200K if touching boundary</div></div>
                  <select class="e-select" id="windBuffer" style="width:100%;font-size:13px">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div class="energy-content">

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#bf3a3a"></div>Status & Alerts</div>
              <div class="e-card-body">
                <div class="e-alerts-stack" id="alertsStack">
                  <div class="e-alert ok"><span class="e-alert-icon">✅</span> Grid Stable — set your inputs to begin.</div>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot"></div>Key Metrics</div>
              <div class="e-card-body">
                <div class="e-metrics-grid">
                  <div class="e-metric">
                    <div class="e-metric-label">Total Peak Supply</div>
                    <div class="e-metric-value" id="mTotalSupply">0 kW</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Total Storage</div>
                    <div class="e-metric-value" id="mTotalStorage">0 kWh</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Starting Budget</div>
                    <div class="e-metric-value" id="mBudget">$10M</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Total Spent</div>
                    <div class="e-metric-value" id="mSpent">$0</div>
                  </div>
                  <div class="e-metric full">
                    <div class="e-metric-label">Remaining Budget</div>
                    <div class="e-metric-value positive" id="mRemaining">$10,000,000</div>
                    <div class="budget-bar-wrap">
                      <div class="budget-bar-track"><div class="budget-bar-fill" id="budgetBar" style="width:0%"></div></div>
                      <div class="budget-bar-labels"><span>0%</span><span id="budgetPct">0% spent</span><span>100%</span></div>
                    </div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Island Time</div>
                    <div class="e-metric-value" id="mIslandTime">0.0 hrs</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">ROI Break-Even</div>
                    <div class="e-metric-value" id="mROI">— Years</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#3a6ebf"></div>24-Hour Grid: Supply vs Demand</div>
              <div class="e-chart-wrap">
                <canvas id="gridChart" height="220"></canvas>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#6a3abf"></div>Finance Director: ROI Ledger</div>
              <div class="e-card-body">
                <div class="e-ledger-row"><span>Solar PV Annual Savings</span><span class="val pos" id="lSolar">$0</span></div>
                <div class="e-ledger-row"><span>Onshore Wind Annual Savings</span><span class="val pos" id="lWind">$0</span></div>
                <div class="e-ledger-row"><span>Geothermal Annual Savings</span><span class="val pos" id="lGeo">$0</span></div>
                <div class="e-ledger-row"><span>Small Hydro Annual Savings</span><span class="val pos" id="lHydro">$0</span></div>
                <div class="e-ledger-row"><span>Tidal Annual Savings</span><span class="val pos" id="lTidal">$0</span></div>
                <div class="e-ledger-row"><span>Biomass Annual Savings</span><span class="val pos" id="lBiomass">$0</span></div>
                <div class="e-ledger-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:8px"><span>Base Annual Savings</span><span class="val pos" id="lBaseTotal">$0</span></div>
                <div class="e-ledger-row"><span>Pivot Card Impact</span><span class="val" id="lPivot">$0</span></div>
                <div class="e-ledger-row" style="font-size:15px"><span>Final Adjusted Savings</span><span class="val pos" id="lFinal">$0</span></div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#7a5abf"></div>Workforce & Economic Impact</div>
              <div class="e-card-body">
                <div class="e-metrics-grid" style="margin-bottom:12px">
                  <div class="e-metric">
                    <div class="e-metric-label">Construction Jobs</div>
                    <div class="e-metric-value" id="wConstJobs">0</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Permanent Roles</div>
                    <div class="e-metric-value" id="wPermRoles">0</div>
                  </div>
                </div>
                <div class="e-section-divider">Assign Permanent Roles</div>
                <div style="margin-top:8px">
                  <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Roles remaining to assign: <strong id="wRolesLeft" style="font-family:var(--mono)">0</strong></div>
                  <div class="workforce-grid">
                    <div class="workforce-item">
                      <label>Solar Techs</label>
                      <input type="number" id="wSolar" value="0" min="0">
                      <div class="salary">$55,000/yr</div>
                    </div>
                    <div class="workforce-item">
                      <label>Electricians</label>
                      <input type="number" id="wElec" value="0" min="0">
                      <div class="salary">$68,000/yr</div>
                    </div>
                    <div class="workforce-item">
                      <label>Wind/Marine/Hydro</label>
                      <input type="number" id="wEng" value="0" min="0">
                      <div class="salary">$72,000/yr</div>
                    </div>
                  </div>
                </div>
                <div class="e-ledger-row" style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border)">
                  <span>Total Payroll Injection</span>
                  <span class="val pos" id="wPayroll">$0</span>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#6a6a6a"></div>Export Results</div>
              <div class="e-btn-row">
                <button class="e-btn primary" id="simPrintBtn">🖨️ Print / Save as PDF</button>
                <button class="e-btn" id="simExportBtn">⬇ Export CSV</button>
                <button class="e-btn" id="simResetBtn">↺ Reset All</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    initSimulator();

    return () => {
      style.remove();
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  function initSimulator() {
    const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    const STANDARD  = [2500,2400,2300,2250,2300,2800,3500,4000,4400,4500,4600,4650,4700,4700,5000,5000,4700,4900,4800,4800,4400,3800,3200,2700];
    const NIGHT_OWL = [2500,2400,2300,2250,2300,2500,2600,2800,3000,3200,3400,3600,3800,4000,4200,4500,4800,5000,5000,5000,4800,4800,4500,3500];
    const MORN_RUSH = [2500,2400,2300,2250,3500,4500,5000,5000,5000,4800,4500,4200,4000,3800,3800,3800,3900,4000,4200,4000,3500,3000,2800,2600];
    const SOLAR_PER_UNIT = [0,0,0,0,0,0,50,150,250,350,450,500,500,500,500,400,250,100,0,0,0,0,0,0];
    const GEO_PER_UNIT = Array(24).fill(2000);
    const BASE_WIND = [3000,3000,3000,3000,3000,2800,2500,2200,1800,1500,1200,1200,1200,1200,1200,1200,1500,1800,2200,2500,2800,3000,3000,3000];
    const BIOMASS_PER_UNIT = Array(24).fill(1000);

    function getEl<T extends HTMLElement>(id: string): T | null {
      return document.getElementById(id) as T | null;
    }

    function getVal(id: string): number {
      return +(getEl<HTMLInputElement>(id)?.value || 0);
    }

    function getState() {
      return {
        solar: getVal('solar'), wind: getVal('wind'), geo: getVal('geo'),
        hydroLow: getVal('hydroLow'), hydroHigh: getVal('hydroHigh'),
        tidalStd: getVal('tidalStd'), tidalPP: getVal('tidalPP'),
        biomass: getVal('biomass'), liIon: getVal('liIon'),
        thermal: getVal('thermal'), flywheel: getVal('flywheel'), caes: getVal('caes'),
        hydrogen: getVal('hydrogen'), v2g: getVal('v2g'), scada: getVal('scada'),
        cabling: getVal('cabling'),
        windBuffer: (getEl<HTMLSelectElement>('windBuffer')?.value || 'No'),
        demandPattern: (getEl<HTMLSelectElement>('demandPattern')?.value || 'None'),
        budgetTier: (getEl<HTMLSelectElement>('budgetTier')?.value || 'None'),
        workforce: (getEl<HTMLSelectElement>('workforce')?.value || 'None'),
        envConstraints: (getEl<HTMLSelectElement>('envConstraints')?.value || 'None'),
        pivotCard: (getEl<HTMLSelectElement>('pivotCard')?.value || 'None'),
        wSolar: getVal('wSolar'), wElec: getVal('wElec'), wEng: getVal('wEng'),
      };
    }

    function calc(s: ReturnType<typeof getState>) {
      const isGrant = s.budgetTier === 'Federal Green Grant';
      const isMaint = s.pivotCard === 'Maintenance Crisis';
      const isPolar = s.pivotCard === 'Polar Vortex';
      const isAIHub = s.pivotCard === 'AI Learning Hub';
      const isGridDown = s.pivotCard === 'Grid-Down Event';
      const isCarbonTax = s.pivotCard === 'The Carbon Tax';
      const isSupplyChain = s.pivotCard === 'Supply Chain Crisis';
      const isCrane = s.workforce === 'Crane Operator Shortage';
      const isMarine = s.workforce === 'Marine Industry Hub';
      const isMigratoryBird = s.envConstraints === 'Migratory Bird';
      const isVernalPool = s.envConstraints === 'Vernal Pool';

      const migratoryBirdViolation = isMigratoryBird && s.wind > 0;
      const vernalPoolViolation = isVernalPool && s.geo > 0;

      const totalPeakSupply =
        s.solar*500 + s.wind*3000 + s.geo*2000 +
        s.hydroLow*500 + s.hydroHigh*2000 +
        s.tidalStd*500 + s.tidalPP*600 + s.biomass*1000;

      const totalStorage =
        s.liIon*1000 + s.thermal*2500 + s.flywheel*1000 + s.caes*5000;

      const startBudget = s.budgetTier==='Failed Bond' ? 8000000 : isGrant ? 12000000 : 10000000;

      const genCosts = {
        solar: s.solar * 1000000,
        wind: s.wind * (isCrane ? 3000000 : 2500000),
        geo: s.geo * 5000000,
        hydro: (s.hydroLow + s.hydroHigh) * 4000000,
        tidal: (s.tidalStd + s.tidalPP) * (isMarine ? 1200000 : 1500000),
        biomass: s.biomass * 3500000,
      };
      const storageCosts = {
        liIon: s.liIon * (isSupplyChain ? 1000000 : 500000),
        thermal: s.thermal * 1000000,
        flywheel: s.flywheel * 300000,
        caes: s.caes * 2000000,
      };
      const emergingCosts = isGrant ? {
        hydrogen: s.hydrogen * 2000000,
        v2g: s.v2g * 100000,
        scada: s.scada * 500000,
      } : { hydrogen: 0, v2g: 0, scada: 0 };

      const infraCosts = {
        cabling: s.cabling * 500000,
        windBuffer: s.windBuffer === 'Yes' ? 200000 : 0,
        utilityFee: totalPeakSupply > 3000 ? 500000 : 0,
        pivotPenalty: s.pivotCard==='Maintenance Crisis' ? 500000 :
                      (s.pivotCard==='Polar Vortex' && s.biomass*1000 < 7500) ? 300000 : 0,
      };

      const totalSpent = Object.values(genCosts).reduce((a,b)=>a+b,0)
        + Object.values(storageCosts).reduce((a,b)=>a+b,0)
        + Object.values(emergingCosts).reduce((a,b)=>a+b,0)
        + Object.values(infraCosts).reduce((a,b)=>a+b,0);

      const remaining = startBudget - totalSpent;
      const basePeakDemand = 5000;
      const islandTime = totalStorage / basePeakDemand;
      const grantCompliant = !isGrant || (s.hydrogen + s.v2g + s.scada >= 1);

      let gridStatus, gridClass;
      if (isGridDown) {
        if (totalStorage >= 2000) { gridStatus = '✅ SURVIVED: Island Mode Active'; gridClass = 'ok'; }
        else { gridStatus = '⚠️ FATAL CRISIS: Storage under 2,000 kWh!'; gridClass = 'danger'; }
      } else if ((s.wind > 0 || s.tidalStd > 0 || s.tidalPP > 0) && s.flywheel === 0) {
        gridStatus = '⚠️ WARNING: Flickering Power! Add Flywheels.'; gridClass = 'warn';
      } else {
        gridStatus = '✅ Grid Stable'; gridClass = 'ok';
      }

      const demandProfile = s.demandPattern==='Night Owl' ? NIGHT_OWL :
                            s.demandPattern==='Morning Rush' ? MORN_RUSH : STANDARD;
      const demand24 = HOURS.map((_h, i) => {
        let d = demandProfile[i];
        if (isAIHub) d += 1500;
        if (isPolar) d += s.thermal > 0 ? 500 : 2500;
        // SCADA reduces total demand by 15%
        if (isGrant && s.scada > 0) d = d * 0.85;
        // V2G caps peak demand at 4,750 kW
        if (isGrant && s.v2g > 0) d = Math.min(d, 4750);
        return Math.round(d);
      });

      // Hydrogen electrolyzer boosts solar & wind output by 30%
      const hydrogenBoost = isGrant && s.hydrogen > 0 ? 1.3 : 1;
      const windMult = hydrogenBoost * (isMaint ? 0.75 : 1);
      const solarMult = hydrogenBoost * (isPolar ? 0.1 : 1) * (isMaint ? 0.75 : 1);
      const hasVarGen = s.solar > 0 || s.wind > 0;
      const storageDischarge = totalStorage / 4;

      const supply24 = HOURS.map((_h, i) => {
        let supply = 0;
        supply += s.solar * SOLAR_PER_UNIT[i] * solarMult;
        supply += s.geo * GEO_PER_UNIT[i];
        supply += s.wind * BASE_WIND[i] * windMult;
        supply += s.biomass * BIOMASS_PER_UNIT[i];
        supply += s.hydroLow * 500;
        supply += s.hydroHigh * 2000;
        supply += s.tidalStd * 500;
        supply += s.tidalPP * 600;
        if (i >= 17 && i <= 20 && hasVarGen) supply += storageDischarge;
        return Math.round(supply);
      });

      const roiSavings = {
        solar: s.solar * 165000,
        wind: s.wind * 1760000,
        geo: s.geo * 3500000,
        hydro: (s.hydroLow + s.hydroHigh) * 3500000,
        tidal: (s.tidalStd + s.tidalPP) * 330000,
        biomass: s.biomass * 1800000,
      };
      const baseAnnualSavings = Object.values(roiSavings).reduce((a,b)=>a+b,0);
      const pivotImpact = isCarbonTax ? baseAnnualSavings * 0.2 :
                          (isAIHub && s.liIon === 0) ? -50000 : 0;
      const finalSavings = baseAnnualSavings + pivotImpact;
      const roi = finalSavings > 0 ? (totalSpent / finalSavings).toFixed(2) : null;

      const constructJobs = Math.floor((totalSpent / 2000000) * 10);
      const permRoles = Math.floor((totalSpent / 2000000) * 1);
      const rolesAssigned = s.wSolar + s.wElec + s.wEng;
      const rolesLeft = permRoles - rolesAssigned;
      const payroll = s.wSolar*55000 + s.wElec*68000 + s.wEng*72000;

      return {
        totalPeakSupply, totalStorage, startBudget, totalSpent, remaining,
        islandTime, gridStatus, gridClass,
        demand24, supply24,
        roiSavings, baseAnnualSavings, pivotImpact, finalSavings, roi,
        constructJobs, permRoles, rolesLeft, payroll,
        grantCompliant, isGrant, infraCosts,
        migratoryBirdViolation, vernalPoolViolation,
        isMigratoryBird, isVernalPool,
      };
    }

    function fmt$(n: number) { return '$' + Math.round(n).toLocaleString(); }
    function fmtkW(n: number) { return Math.round(n).toLocaleString() + ' kW'; }
    function fmtkWh(n: number) { return Math.round(n).toLocaleString() + ' kWh'; }

    // Init chart
    const chartCanvas = getEl<HTMLCanvasElement>('gridChart');
    if (chartCanvas) {
      chartRef.current = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: HOURS.map(h => h + ':00'),
          datasets: [
            {
              label: 'Demand (kW)',
              data: STANDARD,
              borderColor: '#b83232',
              backgroundColor: 'rgba(184,50,50,0.07)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
            },
            {
              label: 'Grid Supply (kW)',
              data: Array(24).fill(0),
              borderColor: '#2a6e4e',
              backgroundColor: 'rgba(42,110,78,0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'DM Sans', size: 12 }, boxWidth: 16 } },
            tooltip: { bodyFont: { family: 'DM Mono' }, titleFont: { family: 'DM Sans' } }
          },
          scales: {
            x: { grid: { color: '#f0ede6' }, ticks: { font: { family: 'DM Mono', size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
            y: { grid: { color: '#f0ede6' }, ticks: { font: { family: 'DM Mono', size: 10 }, callback: (v) => Number(v).toLocaleString() + ' kW' } }
          }
        }
      });
    }

    function render() {
      const s = getState();
      const r = calc(s);

      const isGrant = s.budgetTier === 'Federal Green Grant';
      ['hydrogen','v2g','scada'].forEach(id => {
        const el = getEl<HTMLInputElement>(id);
        if (el) el.disabled = !isGrant;
      });
      const emergingNote = getEl('emergingNote');
      if (emergingNote) emergingNote.style.display = isGrant ? 'none' : 'flex';

      const windInput = getEl<HTMLInputElement>('wind');
      const geoInput = getEl<HTMLInputElement>('geo');
      if (windInput) {
        windInput.style.borderColor = r.migratoryBirdViolation ? 'var(--danger)' : '';
        windInput.style.background = r.migratoryBirdViolation ? 'var(--danger-light)' : '';
      }
      if (geoInput) {
        geoInput.style.borderColor = r.vernalPoolViolation ? 'var(--danger)' : '';
        geoInput.style.background = r.vernalPoolViolation ? 'var(--danger-light)' : '';
      }

      const hdr = getEl('headerStatus');
      if (hdr) {
        hdr.textContent = r.gridStatus.length > 40 ? r.gridStatus.substring(0,40)+'…' : r.gridStatus;
        hdr.className = 'grid-status-badge' + (r.gridClass==='warn' ? ' warn' : r.gridClass==='danger' ? ' danger' : '');
      }

      const supplyEl = getEl('mTotalSupply'); if (supplyEl) supplyEl.textContent = fmtkW(r.totalPeakSupply);
      const storageEl = getEl('mTotalStorage'); if (storageEl) storageEl.textContent = fmtkWh(r.totalStorage);
      const budgetEl = getEl('mBudget'); if (budgetEl) budgetEl.textContent = fmt$(r.startBudget);
      const spentEl = getEl('mSpent'); if (spentEl) spentEl.textContent = fmt$(r.totalSpent);

      const remEl = getEl('mRemaining');
      if (remEl) {
        remEl.textContent = fmt$(r.remaining);
        remEl.className = 'e-metric-value ' + (r.remaining < 0 ? 'negative' : 'positive');
      }

      const pct = Math.min(100, Math.round((r.totalSpent / r.startBudget) * 100));
      const bar = getEl('budgetBar');
      if (bar) { bar.style.width = pct + '%'; bar.className = 'budget-bar-fill' + (r.remaining < 0 ? ' over' : ''); }
      const pctEl = getEl('budgetPct'); if (pctEl) pctEl.textContent = pct + '% spent';

      const islandEl = getEl('mIslandTime'); if (islandEl) islandEl.textContent = r.islandTime.toFixed(1) + ' hrs';
      const roiEl = getEl('mROI');
      if (roiEl) {
        roiEl.textContent = r.roi ? r.roi + ' yrs' : '— yrs';
        roiEl.className = 'e-metric-value ' + (r.roi && parseFloat(r.roi) < 10 ? 'positive' : r.roi ? 'warn' : '');
      }

      const alerts: { cls: string; msg: string }[] = [];
      if (r.gridClass !== 'ok') alerts.push({ cls: r.gridClass, msg: r.gridStatus });
      if (r.remaining < 0) alerts.push({ cls: 'danger', msg: '⛔ Over budget by ' + fmt$(Math.abs(r.remaining)) });
      if (r.isGrant && !r.grantCompliant) alerts.push({ cls: 'warn', msg: '⚠️ Grant Violation: Must purchase at least 1 Emerging Tech!' });
      if (r.totalPeakSupply === 0) alerts.push({ cls: 'warn', msg: '⚠️ No generation tech selected — grid has no supply.' });
      if (r.infraCosts.utilityFee > 0) alerts.push({ cls: 'warn', msg: '⚠️ Utility Upgrade Fee triggered: supply exceeds 3,000 kW (+$500K)' });
      if (r.infraCosts.pivotPenalty > 0) alerts.push({ cls: 'warn', msg: '⚠️ Pivot Card Penalty applied: +' + fmt$(r.infraCosts.pivotPenalty) });
      if (r.migratoryBirdViolation) alerts.push({ cls: 'danger', msg: '🐦 VIOLATION — Migratory Bird Ordinance: Wind turbines are prohibited. Remove wind turbines.' });
      if (r.vernalPoolViolation) alerts.push({ cls: 'danger', msg: '🌿 VIOLATION — Vernal Pool Protection: No Geothermal permitted. Remove geothermal.' });
      if (r.isMigratoryBird && !r.migratoryBirdViolation) alerts.push({ cls: 'warn', msg: '🐦 Migratory Bird Ordinance active: Wind turbines may only be placed in developed areas.' });
      if (r.isVernalPool && !r.vernalPoolViolation) alerts.push({ cls: 'warn', msg: '🌿 Vernal Pool Protection active: Geothermal is banned. Max 25% of forested land may be cleared.' });

      const stack = getEl('alertsStack');
      if (stack) {
        stack.innerHTML = alerts.length === 0
          ? '<div class="e-alert ok"><span class="e-alert-icon">✅</span> All systems green.</div>'
          : alerts.map(a => `<div class="e-alert ${a.cls}"><span class="e-alert-icon"></span>${a.msg}</div>`).join('');
      }

      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = r.demand24;
        chartRef.current.data.datasets[1].data = r.supply24;
        chartRef.current.update('none');
      }

      const setLedger = (id: string, val: number) => { const el = getEl(id); if (el) el.textContent = fmt$(val); };
      setLedger('lSolar', r.roiSavings.solar);
      setLedger('lWind', r.roiSavings.wind);
      setLedger('lGeo', r.roiSavings.geo);
      setLedger('lHydro', r.roiSavings.hydro);
      setLedger('lTidal', r.roiSavings.tidal);
      setLedger('lBiomass', r.roiSavings.biomass);
      setLedger('lBaseTotal', r.baseAnnualSavings);
      const pivotEl = getEl('lPivot');
      if (pivotEl) { pivotEl.textContent = fmt$(r.pivotImpact); pivotEl.className = 'val ' + (r.pivotImpact >= 0 ? 'pos' : 'neg'); }
      setLedger('lFinal', r.finalSavings);

      const constJobs = getEl('wConstJobs'); if (constJobs) constJobs.textContent = r.constructJobs.toLocaleString();
      const permRolesEl = getEl('wPermRoles'); if (permRolesEl) permRolesEl.textContent = r.permRoles.toLocaleString();
      const rolesLeftEl = getEl('wRolesLeft'); if (rolesLeftEl) rolesLeftEl.textContent = String(r.rolesLeft);
      setLedger('wPayroll', r.payroll);
    }

    function exportCSV() {
      const s = getState();
      const r = calc(s);
      const rows = [
        ['Field','Value'],
        ['Total Peak Supply (kW)', r.totalPeakSupply],
        ['Total Storage (kWh)', r.totalStorage],
        ['Starting Budget', r.startBudget],
        ['Total Spent', r.totalSpent],
        ['Remaining Budget', r.remaining],
        ['Island Time (hrs)', r.islandTime.toFixed(2)],
        ['Base Annual Savings', r.baseAnnualSavings],
        ['Final Adjusted Savings', r.finalSavings],
        ['ROI Break-Even (yrs)', r.roi || 'N/A'],
        ['Construction Jobs', r.constructJobs],
        ['Permanent Roles', r.permRoles],
        ['Grid Status', r.gridStatus],
        [],
        ['Hour','Demand (kW)','Supply (kW)'],
        ...HOURS.map((h, i) => [h+':00', r.demand24[i], r.supply24[i]])
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'energy_grid_results.csv';
      a.click();
    }

    function resetAll() {
      if (!confirm('Reset all inputs to zero?')) return;
      ['solar','wind','geo','hydroLow','hydroHigh','tidalStd','tidalPP','biomass',
       'liIon','thermal','flywheel','caes','hydrogen','v2g','scada','cabling',
       'wSolar','wElec','wEng'].forEach(id => {
        const el = getEl<HTMLInputElement>(id);
        if (el) el.value = '0';
      });
      ['demandPattern','budgetTier','workforce','envConstraints','pivotCard'].forEach(id => {
        const el = getEl<HTMLSelectElement>(id);
        if (el) el.selectedIndex = 0;
      });
      const wb = getEl<HTMLSelectElement>('windBuffer');
      if (wb) wb.value = 'No';
      render();
    }

    document.querySelectorAll('.e-qty-input, .e-select, .workforce-item input').forEach(el => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });

    getEl('simPrintBtn')?.addEventListener('click', () => window.print());
    getEl('simExportBtn')?.addEventListener('click', exportCSV);
    getEl('simResetBtn')?.addEventListener('click', resetAll);

    render();
  }

  return <div ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column" }} />;
}
