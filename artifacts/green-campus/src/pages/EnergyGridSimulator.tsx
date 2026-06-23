import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { sharedState, MAP_TECH_TO_SIM, emitSimUpdate } from "../shared";

Chart.register(...registerables);

export default function EnergyGridSimulator() {
  console.log("⚡ EnergyGridSimulator mounting");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const sourceChartRef = useRef<Chart | null>(null);
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
        --bg: #1e2228;
        --surface: #252c36;
        --border: #3a4149;
        --text: #cdd9e5;
        --text-muted: #8b949e;
        --accent: #3fb950;
        --accent-light: #1a3a22;
        --accent-muted: #2d4a3a;
        --warn: #e3b341;
        --warn-light: #3a2f1a;
        --danger: #f85149;
        --danger-light: #3a1f1f;
        --mono: 'DM Mono', monospace;
        --sans: 'DM Sans', sans-serif;
        font-family: var(--sans);
        background: var(--bg);
        color: var(--text);
        font-size: 14px;
        line-height: 1.5;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        container-type: inline-size;
        container-name: sim;
      }

      .energy-sim-header {
        background: #252c36;
        color: var(--text);
        padding: 18px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 100;
        flex-shrink: 0;
      }
      .energy-sim-header h1 {
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin: 0;
      }
      .energy-sim-header .sub { font-size: 12px; color: #aaa; margin-top: 2px; font-family: var(--mono); }

      .energy-logo-card {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .energy-logo-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

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
        width: 100%;
        box-sizing: border-box;
        padding: 28px 24px;
        display: grid;
        grid-template-columns: clamp(180px, 28%, 300px) 1fr;
        gap: 20px;
        align-items: start;
        flex-shrink: 0;
      }

      .energy-sidebar { display: flex; flex-direction: column; gap: 16px; min-width: 0; overflow: hidden; }
      .energy-content { display: flex; flex-direction: column; gap: 16px; min-width: 0; overflow: hidden; }

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
        border-bottom: 1px solid var(--border);
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
        background: #1a1f27;
        color: var(--text);
        transition: border-color 0.15s;
      }
      .e-qty-input:focus { outline: none; border-color: var(--accent); background: var(--surface); }

      .e-select-row { padding: 8px 0; border-bottom: 1px solid var(--border); }
      .e-select-row:last-child { border-bottom: none; }
      .e-select-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

      .e-select {
        width: 100%;
        font-family: var(--sans);
        font-size: 13px;
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 6px 10px;
        background: #1a1f27;
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
        background: #1a1f27;
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

      .e-metric-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
      .e-metric-toggle-arrow {
        display: inline-block;
        font-size: 12px;
        transition: transform 0.2s;
      }
      .e-metric-toggle-arrow.expanded { transform: rotate(90deg); }

      .e-expense-breakdown {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--border);
        font-size: 12px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      .e-expense-breakdown.expanded {
        max-height: 500px;
      }
      .e-expense-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        color: var(--text-muted);
        font-family: var(--mono);
      }
      .e-expense-item.category {
        font-weight: 600;
        color: var(--text);
        margin-top: 6px;
        margin-bottom: 2px;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 0.05em;
      }
      .e-expense-item.category:first-child { margin-top: 0; }
      .e-expense-item .label { flex: 1; }
      .e-expense-item .value { display: inline-block; text-align: right; min-width: 0; }

      .e-alert {
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 13px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .e-alert.ok { background: var(--accent-light); color: #7ee787; border: 1px solid #2d5a3e; }
      .e-alert.warn { background: var(--warn-light); color: #e3b341; border: 1px solid #6b531a; }
      .e-alert.danger { background: var(--danger-light); color: #f85149; border: 1px solid #6b2828; }
      .e-alert-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
      .e-alerts-stack { display: flex; flex-direction: column; gap: 8px; }

      .e-chart-wrap { padding: 20px; }

      .budget-bar-wrap { margin-top: 8px; }
      .budget-bar-track { height: 8px; background: #30363d; border-radius: 4px; overflow: hidden; margin: 4px 0; }
      .budget-bar-fill { height: 100%; border-radius: 4px; background: var(--accent); transition: width 0.3s ease; }
      .budget-bar-fill.over { background: var(--danger); }
      .budget-bar-labels { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; color: var(--text-muted); }

      .workforce-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .workforce-item { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; }
      .workforce-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
      .workforce-item input { width: 100%; font-family: var(--mono); font-size: 14px; border: 1px solid var(--border); border-radius: 4px; padding: 4px 6px; text-align: right; background: #1a1f27; color: var(--text); }
      .workforce-item input:focus { outline: none; border-color: var(--accent); }
      .workforce-item .salary { font-size: 10px; color: var(--text-muted); margin-top: 2px; font-family: var(--mono); }

      .e-ledger-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 0;
        border-bottom: 1px solid var(--border);
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
        border: 1px solid var(--border); background: var(--surface);
        cursor: pointer; transition: all 0.15s; color: var(--text);
      }
      .e-btn:hover { background: #1c2429; border-color: #484f58; }
      .e-btn.primary { background: var(--accent); color: #0d1117; border-color: var(--accent); }
      .e-btn.primary:hover { background: #3ac244; }
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

      .e-hour-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
        margin-top: 8px;
      }
      .e-hour-btn {
        padding: 6px 4px;
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 600;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: #1a1f27;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
        text-align: center;
      }
      .e-hour-btn:hover { border-color: var(--accent); }
      .e-hour-btn.active {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
        font-weight: 700;
      }

      @container sim (max-width: 820px) {
        .energy-sim-main { grid-template-columns: 1fr; }
      }
      @container sim (max-width: 480px) {
        .e-metrics-grid { grid-template-columns: 1fr; }
        .workforce-grid { grid-template-columns: 1fr 1fr; }
        .energy-sim-main { padding: 16px 12px; gap: 16px; }
      }

      @media print {
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          height: auto;
        }
        .energy-sim {
          background: white;
          height: auto;
          overflow: visible;
          display: block;
        }
        .energy-sim-header {
          position: relative;
          top: 0;
          background: #333;
          color: white;
          border-bottom: 2px solid #000;
          page-break-after: avoid;
          padding: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .energy-sim-main {
          display: block !important;
          padding: 0;
          max-width: 100%;
          margin: 0;
          min-height: auto;
          page-break-before: always;
        }
        .energy-sidebar {
          display: block !important;
          width: 100%;
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        .energy-content {
          display: block !important;
          width: 100%;
        }
        .e-card {
          page-break-inside: avoid;
          margin-bottom: 20px;
          break-inside: avoid;
          padding: 16px;
          border: 1px solid #ddd;
          page-break-after: auto;
        }
        .e-card-header {
          page-break-after: avoid;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .e-card-body {
          page-break-inside: avoid;
        }
        .e-expense-breakdown {
          max-height: none !important;
          overflow: visible !important;
          display: block !important;
        }
        .e-metric-toggle {
          color: #000;
          display: block;
        }
        .e-metric-toggle.expanded {
          display: block !important;
        }
        .e-metric-toggle-arrow {
          display: none;
        }
        #spentBreakdown,
        #budgetBreakdown {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
          page-break-inside: avoid;
          visibility: visible !important;
        }
        #adjustmentsBreakdown {
          display: block !important;
          max-height: none !important;
          overflow: visible !important;
          page-break-inside: avoid;
          padding: 8px 0 !important;
          border-left: 2px solid #ddd !important;
          margin-left: 12px !important;
        }
        #adjustmentsBreakdown > .e-expense-item {
          display: block !important;
          border: none !important;
          padding-left: 8px !important;
          font-size: 11px !important;
        }
        #adjWindItem,
        #adjTidalItem,
        #adjLiIonItem,
        #adjPivotItem,
        #adjUtilityItem,
        #adjCraneItem {
          display: block !important;
          border: none !important;
          padding-left: 8px !important;
          font-size: 11px !important;
        }
        .e-btn-row,
        #simPrintBtn {
          display: none !important;
        }
        canvas {
          max-width: 100%;
          height: auto;
          page-break-inside: avoid;
          margin: 20px 0;
        }
        .e-chart-wrap {
          page-break-inside: avoid;
          margin: 20px 0;
        }
      }

      /* ── Light theme overrides ──────────────────────────────────── */
      [data-theme="light"] .energy-sim {
        --bg: #f5f4f0;
        --surface: #ffffff;
        --border: #e2e0d8;
        --text: #1a1917;
        --text-muted: #6b6960;
        --accent: #2a6e4e;
        --accent-light: #e8f2ec;
        --accent-muted: #4a9e6e;
        --warn: #c45c1a;
        --warn-light: #fdf0e8;
        --danger: #b83232;
        --danger-light: #fdeaea;
      }
      [data-theme="light"] .energy-sim-header { background: #2a6e4e; color: #fff; }
      [data-theme="light"] .energy-sim-header .sub { color: #c0ddd0; }
      [data-theme="light"] .e-qty-input,
      [data-theme="light"] .e-select,
      [data-theme="light"] .e-hour-btn { background: #fafaf8; color: #1a1917; }
      [data-theme="light"] .e-qty-input:focus { background: #fff; }
      [data-theme="light"] .e-metric { background: #fafaf8; }
      [data-theme="light"] .budget-bar-track { background: #ede9e0; }
      [data-theme="light"] .workforce-item { background: #fafaf8; }
      [data-theme="light"] .workforce-item input { background: #fff; color: #1a1917; }
      [data-theme="light"] .e-btn { background: #fff; color: #1a1917; }
      [data-theme="light"] .e-btn:hover { background: #f5f3ed; border-color: #ccc; }
      [data-theme="light"] .e-btn.primary { background: #2a6e4e; color: #fff; border-color: #2a6e4e; }
      [data-theme="light"] .e-btn.primary:hover { background: #235f42; }
      [data-theme="light"] .e-alert.ok { color: #1a4a32; border-color: #b8dfc8; }
      [data-theme="light"] .e-alert.warn { color: #7a3010; border-color: #f0c0a0; }
      [data-theme="light"] .e-alert.danger { color: #7a1010; border-color: #f0b0b0; }
    `;
    document.head.appendChild(style);

    // Determine the correct base path for assets
    const isProduction = window.location.pathname.includes('/green_campus');
    const logoPath = isProduction ? '/green_campus/Square-color-REF-logo.png' : '/Square-color-REF-logo.png';

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
                  <div class="e-select-label" style="display:flex;align-items:center;justify-content:space-between">Demand Pattern <button class="gc-card-btn" onclick="(function(){var m={'Night Owl':'night-owl','Morning Rush':'morning-rush'};var v=document.getElementById('demandPattern').value;if(m[v])window.openCardModal(m[v]);})()" title="View selected Demand Pattern card">&#x1F3B4;</button></div>
                  <select class="e-select" id="demandPattern">
                    <option value=""></option>
                    <option value="Night Owl">Night Owl</option>
                    <option value="Morning Rush">Morning Rush</option>
                  </select>
                </div>
                <div class="e-select-row">
                  <div class="e-select-label" style="display:flex;align-items:center;justify-content:space-between">Budget Tier <button class="gc-card-btn" onclick="(function(){var m={'Failed Bond':'failed-bond','Federal Green Grant':'federal-grant'};var v=document.getElementById('budgetTier').value;if(m[v])window.openCardModal(m[v]);})()" title="View selected Budget Tier card">&#x1F3B4;</button></div>
                  <select class="e-select" id="budgetTier">
                    <option value=""></option>
                    <option value="Failed Bond">Failed Bond ($9M)</option>
                    <option value="Federal Green Grant">Federal Green Grant ($12M)</option>
                  </select>
                </div>
                <div class="e-select-row">
                  <div class="e-select-label" style="display:flex;align-items:center;justify-content:space-between">Workforce Availability <button class="gc-card-btn" onclick="(function(){var m={'Crane Operator Shortage':'crane-shortage','Hydropower Engineering Hub':'hydro-hub'};var v=document.getElementById('workforce').value;if(m[v])window.openCardModal(m[v]);})()" title="View selected Workforce card">&#x1F3B4;</button></div>
                  <select class="e-select" id="workforce">
                    <option value=""></option>
                    <option value="Crane Operator Shortage">Crane Operator Shortage</option>
                    <option value="Hydropower Engineering Hub">Hydropower Engineering Hub</option>
                  </select>
                </div>
                <div class="e-select-row" style="border-bottom:none">
                  <div class="e-select-label" style="display:flex;align-items:center;justify-content:space-between">Environmental Constraints <button class="gc-card-btn" onclick="(function(){var m={'Migratory Bird':'migratory-bird','Vernal Pool':'vernal-pool'};var v=document.getElementById('envConstraints').value;if(m[v])window.openCardModal(m[v]);})()" title="View selected Environmental Constraints card">&#x1F3B4;</button></div>
                  <select class="e-select" id="envConstraints">
                    <option value=""></option>
                    <option value="Migratory Bird">Migratory Bird Ordinance</option>
                    <option value="Vernal Pool">Vernal Pool Protection</option>
                  </select>
                </div>
              </div>
            </div>

            <div id="additionalSidebar" style="display:none;flex-direction:column;gap:16px">
            <!-- Hidden inputs for gen/storage — driven by map placements via gc:map-update -->
            <div style="display:none">
              <input type="number" id="solar"    value="0" min="0" max="50">
              <input type="number" id="wind"     value="0" min="0" max="20">
              <input type="number" id="geo"      value="0" min="0" max="10">
              <input type="number" id="hydroLow" value="0" min="0" max="20">
              <input type="number" id="hydroHigh" value="0" min="0" max="10">
              <input type="number" id="tidalStd" value="0" min="0" max="20">
              <input type="number" id="biomass"  value="0" min="0" max="10">
              <input type="number" id="liIon"    value="0" min="0" max="20">
              <input type="number" id="thermal"  value="0" min="0" max="10">
              <input type="number" id="flywheel" value="0" min="0" max="20">
              <input type="number" id="caes"     value="0" min="0" max="10">
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#3a8f5f"></div>Placed Units</div>
              <div class="e-card-body" id="placedUnitsList" style="padding:10px 16px">
                <div style="font-size:11px;color:var(--text-muted);font-family:var(--mono)">No units placed yet</div>
              </div>
            </div>

            <div class="e-card" id="emergingCard" style="display:none">
              <div class="e-card-header"><div class="dot" style="background:#bf5a8a"></div>Emerging Technology <span class="e-tag warn" style="margin-left:auto">Grant Required</span></div>
              <div class="e-card-body">
                <div id="emergingNote" class="e-alert warn" style="margin-bottom:10px">
                  <span class="e-alert-icon">ℹ️</span>
                  Select Federal Green Grant budget to unlock. Must purchase ≥1 to stay compliant.
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label" style="display:flex;align-items:center;gap:6px">Green Hydrogen Electrolyzer <button class="gc-card-btn" onclick="window.openCardModal('hydrogen')" title="View Hydrogen card">&#x1F3B4;</button></div><div class="e-input-sub">$2M each · +30% solar & wind output</div></div>
                  <input class="e-qty-input" type="number" id="hydrogen" value="0" min="0" max="5" disabled>
                </div>
                <div class="e-input-row">
                  <div><div class="e-input-label" style="display:flex;align-items:center;gap:6px">V2G Charging Hub <button class="gc-card-btn" onclick="window.openCardModal('v2g')" title="View V2G card">&#x1F3B4;</button></div><div class="e-input-sub">$100K fleet upgrade · caps peak at 4,750 kW</div></div>
                  <input class="e-qty-input" type="number" id="v2g" value="0" min="0" max="5" disabled>
                </div>
                <div class="e-input-row" style="border-bottom:none">
                  <div><div class="e-input-label" style="display:flex;align-items:center;gap:6px">AI-Grid Controller (SCADA) <button class="gc-card-btn" onclick="window.openCardModal('scada')" title="View SCADA card">&#x1F3B4;</button></div><div class="e-input-sub">$500K each · −15% demand</div></div>
                  <input class="e-qty-input" type="number" id="scada" value="0" min="0" max="5" disabled>
                </div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#8f6a3a"></div>Infrastructure & Fees</div>
              <div class="e-card-body">
                <div class="e-input-row">
                  <div><div class="e-input-label">Cabling Length (ft)</div><div class="e-input-sub">$500 per ft</div></div>
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
            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#7c6a3a"></div>Pivot Scenario Selection</div>
              <div class="e-card-body">
                <div class="e-select-row" style="border-bottom:none">
                  <div class="e-select-label" style="display:flex;align-items:center;justify-content:space-between">Pivot Card <button class="gc-card-btn" onclick="(function(){var m={'Supply Chain Crisis':'supply-chain','AI Learning Hub':'ai-learning-hub','Polar Vortex':'polar-vortex','Maintenance Crisis':'maintenance-crisis','Grid-Down Event':'grid-down','The Carbon Tax':'carbon-tax'};var v=document.getElementById('pivotCard').value;if(m[v])window.openCardModal(m[v]);})()" title="View selected Pivot Card">&#x1F3B4;</button></div>
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
            </div>

          </div>

          <div id="additionalContent" style="display:none">
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
                    <div class="e-metric-label">Actual Peak Supply</div>
                    <div class="e-metric-value" id="mTotalSupply">0 kW</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Total Storage</div>
                    <div class="e-metric-value" id="mTotalStorage">0 kWh</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Starting Budget</div>
                    <div class="e-metric-toggle" id="budgetToggle">
                      <span class="e-metric-toggle-arrow">▶</span>
                      <div class="e-metric-value" id="mBudget">$10M</div>
                    </div>
                    <div class="e-expense-breakdown" id="budgetBreakdown">
                      <div class="e-expense-item"><span class="label">Base Budget</span><span class="value" id="costBaseBudget">$10M</span></div>
                      <div class="e-expense-item"><span class="label">less: Total Costs</span><span class="value negative" id="costTotalSpent">$0</span><div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">(includes adjustments below)</div></div>
                      <div class="e-expense-item" style="cursor: pointer; opacity: 0.8;" onclick="document.getElementById('adjustmentsBreakdown').style.display = document.getElementById('adjustmentsBreakdown').style.display === 'none' ? 'block' : 'none'; document.getElementById('adjToggle').textContent = document.getElementById('adjustmentsBreakdown').style.display === 'none' ? '▶' : '▼';"><span class="label">Cost Adjustments Breakdown <span id="adjToggle" style="font-size: 10px; margin-left: 4px;">▶</span></span></div>
                      <div id="adjustmentsBreakdown" style="display: none; padding: 8px 0; border-left: 2px solid rgba(255,255,255,0.1); margin-left: 12px;">
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjWindItem">
                          <div><span class="label">Geothermal <span id="adjWindDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjWind" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjTidalItem">
                          <div><span class="label">Hydro <span id="adjTidalDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjTidal" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjLiIonItem">
                          <div><span class="label">Li-Ion <span id="adjLiIonDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjLiIon" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjPivotItem">
                          <div><span class="label">Pivot Penalty <span id="adjPivotDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjPivot" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjUtilityItem">
                          <div><span class="label">Utility Fee <span id="adjUtilityDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjUtility" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjCraneItem">
                          <div><span class="label">Crane Logistics <span id="adjCraneDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjCrane" style="font-size: 11px;">$0</span></div>
                        </div>
                        <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="adjCarbonTaxItem">
                          <div><span class="label">Carbon Tax <span id="adjCarbonTaxDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="adjCarbonTax" style="font-size: 11px;">$0</span></div>
                        </div>
                      </div>
                      <div class="e-expense-item"><span class="label">plus: Annual Grid Sell-Back Revenue</span><span class="value positive" id="costRenewableRevenue">$0</span></div>
                      <div class="e-expense-item" style="font-size:10px;padding-left:12px;color:var(--text-muted);display:none" id="sellBackDetail"><span id="sellBackKwText">—</span></div>
                      <div class="e-expense-item" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 8px;"><span class="label" style="font-weight: bold;">Remaining Budget</span><span class="value" id="costRemaining" style="font-weight: bold;">$10M</span></div>
                    </div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Total Spent</div>
                    <div class="e-metric-toggle" id="spentToggle">
                      <span class="e-metric-toggle-arrow">▶</span>
                      <div class="e-metric-value" id="mSpent">$0</div>
                    </div>
                    <div class="e-expense-breakdown" id="spentBreakdown">
                      <div class="e-expense-item category"><span class="label">GENERATION</span></div>
                      <div class="e-expense-item"><span class="label">Solar</span><span class="value" id="costSolar">$0</span></div>
                      <div class="e-expense-item"><span class="label">Wind</span><span class="value" id="costWind">$0</span></div>
                      <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="costWindAdjItem">
                        <div><span class="label">Geothermal Adjustment <span id="costWindAdjDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="costWindAdj" style="font-size: 11px;">$0</span></div>
                      </div>
                      <div class="e-expense-item"><span class="label">Geothermal</span><span class="value" id="costGeo">$0</span></div>
                      <div class="e-expense-item"><span class="label">Hydro</span><span class="value" id="costHydro">$0</span></div>
                      <div class="e-expense-item"><span class="label">Tidal</span><span class="value" id="costTidal">$0</span></div>
                      <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="costTidalAdjItem">
                        <div><span class="label">Hydro Adjustment <span id="costTidalAdjDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="costTidalAdj" style="font-size: 11px;">$0</span></div>
                      </div>
                      <div class="e-expense-item"><span class="label">Biomass</span><span class="value" id="costBiomass">$0</span></div>
                      
                      <div class="e-expense-item category"><span class="label">STORAGE</span></div>
                      <div class="e-expense-item"><span class="label">Li-Ion BESS</span><span class="value" id="costLiIon">$0</span></div>
                      <div class="e-expense-item" style="padding-left: 8px; font-size: 11px; border: none; display: none;" id="costLiIonAdjItem">
                        <div><span class="label">Li-Ion Adjustment <span id="costLiIonAdjDesc" style="font-size: 10px; color: var(--text-muted); font-weight: normal;"></span></span><span class="value" id="costLiIonAdj" style="font-size: 11px;">$0</span></div>
                      </div>
                      <div class="e-expense-item"><span class="label">Thermal</span><span class="value" id="costThermal">$0</span></div>
                      <div class="e-expense-item"><span class="label">Flywheel</span><span class="value" id="costFlywheel">$0</span></div>
                      <div class="e-expense-item"><span class="label">CAES</span><span class="value" id="costCAES">$0</span></div>
                      
                      <div class="e-expense-item category"><span class="label">EMERGING</span></div>
                      <div class="e-expense-item"><span class="label">Hydrogen</span><span class="value" id="costHydrogen">$0</span></div>
                      <div class="e-expense-item"><span class="label">V2G Hub</span><span class="value" id="costV2G">$0</span></div>
                      <div class="e-expense-item"><span class="label">SCADA</span><span class="value" id="costSCADA">$0</span></div>
                      
                      <div class="e-expense-item category"><span class="label">INFRASTRUCTURE</span></div>
                      <div class="e-expense-item"><span class="label">Cabling</span><span class="value" id="costCabling">$0</span></div>
                      <div class="e-expense-item"><span class="label">Crane Logistics</span><span class="value" id="costCraneLogistics">$0</span></div>
                      <div class="e-expense-item" style="padding-left: 8px; font-size: 12px; border: none; display: none;" id="costCraneLogisticsDesc">
                        <div><span class="label" style="color: var(--text-muted);">↳ Crane operator surcharge for wind turbine installation</span></div>
                      </div>
                      <div class="e-expense-item"><span class="label">Wind Buffer</span><span class="value" id="costWindBuffer">$0</span></div>
                      <div class="e-expense-item"><span class="label">Utility Fee</span><span class="value" id="costUtilityFee">$0</span></div>
                      <div class="e-expense-item"><span class="label">Pivot Penalty</span><span class="value" id="costPivotPenalty">$0</span></div>
                      <div class="e-expense-item"><span class="label">Carbon Tax (Annual)</span><span class="value" id="costCarbonTax">$0</span></div>
                    </div>
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
                  <div class="e-metric">
                    <div class="e-metric-label">Daily Renewable Energy Credits</div>
                    <div class="e-metric-value positive" id="mRenewableCredits">$0</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label"> Daily kW Sold Back</div>
                    <div class="e-metric-value positive" id="mKwSoldBack">0 kW</div>
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

            <div class="e-card" id="batteryDischargeCard" style="display:none">
              <div class="e-card-header">
                <div class="e-metric-toggle" id="batteryToggle" style="flex:1;cursor:pointer">
                  <span class="e-metric-toggle-arrow expanded">▼</span>
                  <span style="font-weight:600;text-transform:uppercase;letter-spacing:0.08em;flex:1">Battery Discharge Hours</span>
                </div>
              </div>
              <div class="e-card-body" id="batteryDropdownContent">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Select hours when battery should discharge to support peak demand:</div>
                <div class="e-hour-grid" id="hourGrid"></div>
              </div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#8f6a3a"></div>Energy Source Mix</div>
              <div class="e-chart-wrap" style="max-width:320px;margin:0 auto">
                <canvas id="sourceChart" height="240"></canvas>
              </div>
              <div id="sourceChartLegend" style="padding:0 20px 14px;font-size:11px;font-family:'DM Mono',monospace"></div>
            </div>

            <div class="e-card">
              <div class="e-card-header"><div class="dot" style="background:#6a3abf"></div>Finance Director: ROI Ledger</div>
              <div class="e-card-body">
                <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px;font-family:var(--mono)">Each technology produces a fixed amount of electricity per year. That production is valued at the grid rate ($0.22/kWh) — the cost of electricity you no longer need to purchase.</div>
                <div class="e-ledger-row">
                  <div><div>Solar PV</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lSolarKwh">—</div></div>
                  <span class="val pos" id="lSolar">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div><div>Wind Turbine</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lWindKwh">—</div></div>
                  <span class="val pos" id="lWind">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div><div>Geothermal</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lGeoKwh">—</div></div>
                  <span class="val pos" id="lGeo">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div><div>Small Hydro</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lHydroKwh">—</div></div>
                  <span class="val pos" id="lHydro">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div><div>Tidal</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lTidalKwh">—</div></div>
                  <span class="val pos" id="lTidal">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div><div>Biomass</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lBiomassKwh">—</div></div>
                  <span class="val pos" id="lBiomass">$0</span>
                </div>
                <div class="e-ledger-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:8px">
                  <div><div>Gross Annual Savings</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lTotalKwh">0 kWh/yr × $0.22</div></div>
                  <span class="val pos" id="lBaseTotal">$0</span>
                </div>
                <div class="e-ledger-row">
                  <div>
                    <div>Overproduction Diminishing Return</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lCapDesc">All production used on-site</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)">Campus annual demand: <span id="lDemandKwh">—</span></div>
                  </div>
                  <span class="val" id="lCapAdj">—</span>
                </div>
                <div class="e-ledger-row">
                  <div>
                    <div>Scenario Card Impact</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lPivotDesc">No active penalty or bonus</div>
                  </div>
                  <span class="val" id="lPivot">$0</span>
                </div>
                <div class="e-ledger-row" id="lThermalOilRow" style="display:none">
                  <div><div>Thermal — Heating Oil Offset</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lThermalOilDesc">—</div></div>
                  <span class="val pos" id="lThermalOil">$0</span>
                </div>
                <div class="e-ledger-row" id="lCaesSeasonalRow" style="display:none">
                  <div><div>CAES — Seasonal Peak Shaving</div><div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)" id="lCaesSeasonalDesc">—</div></div>
                  <span class="val pos" id="lCaesSeasonal">$0</span>
                </div>
                <div class="e-ledger-row" style="font-size:15px"><span>Net Annual Savings</span><span class="val pos" id="lFinal">$0</span></div>
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
              <div class="e-card-header"><div class="dot" style="background:#2a6e4e"></div>CO₂ Offset · ISO-NE Marginal Rate</div>
              <div class="e-card-body">
                <div class="e-metrics-grid">
                  <div class="e-metric full" style="grid-column:1/-1">
                    <div class="e-metric-label">Annual CO₂ Offset</div>
                    <div class="e-metric-value positive" id="co2TotalMt">—</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:2px">metric tons CO₂/yr</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Cars Off Road</div>
                    <div class="e-metric-value" id="co2Cars">—</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:2px">vehicles/yr equiv.</div>
                  </div>
                  <div class="e-metric">
                    <div class="e-metric-label">Trees Equivalent</div>
                    <div class="e-metric-value" id="co2Trees">—</div>
                    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:2px">mature trees × 1 yr</div>
                  </div>
                </div>
                <div id="co2Breakdown"></div>
                <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:10px;line-height:1.6">
                  ISO-NE marginal rate: 392 g CO₂/kWh (natural gas displacement) · Biomass treated as carbon-neutral
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

            <div style="width:160px;margin:4px auto 8px;border-radius:8px;overflow:hidden;flex-shrink:0">
              <img src="${logoPath}" alt="REF Logo" style="width:100%;height:100%;object-fit:cover;display:block" />
            </div>

          </div>
          </div>
        </div>
      </div>
    `;

    initSimulator();

    // Stamp an explicit pixel height on .energy-sim so overflow-y:auto works
    // regardless of flex/percentage height chain issues in the parent layout.
    const energySimEl = container.querySelector('.energy-sim') as HTMLElement | null;
    const syncHeight = () => {
      if (!energySimEl) return;
      const h = container.clientHeight;
      if (h > 0) {
        energySimEl.style.height = h + 'px';
        energySimEl.style.maxHeight = h + 'px';
      }
    };
    const heightRo = new ResizeObserver(syncHeight);
    heightRo.observe(container);
    syncHeight();

    return () => {
      style.remove();
      heightRo.disconnect();
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (sourceChartRef.current) {
        sourceChartRef.current.destroy();
        sourceChartRef.current = null;
      }
    };
  }, []);

  function initSimulator() {
    // Track whether content has been revealed
    let contentRevealed = false;

    const HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    const STANDARD  = [2500,2400,2300,2250,2300,2800,3500,4000,4400,4500,4600,4650,4700,4700,5000,5000,4700,4900,4800,4800,4400,3800,3200,2700];
    const NIGHT_OWL = [2500,2400,2300,2250,2300,2500,2600,2800,3000,3200,3400,3600,3800,4000,4200,4500,4800,5000,5000,5000,4800,4800,4500,3500];
    const MORN_RUSH = [2500,2400,2300,2250,3500,4500,5000,5000,5000,4800,4500,4200,4000,3800,3800,3800,3900,4000,4200,4000,3500,3000,2800,2600];
    const SOLAR_PER_UNIT = [0,0,0,0,0,0,50,150,250,350,450,500,500,500,500,400,250,100,0,0,0,0,0,0];
    const GEO_PER_UNIT = Array(24).fill(2000);
    const BASE_WIND = [3000,3000,3000,3000,3000,2800,2500,2200,1800,1500,1200,1200,1200,1200,1200,1200,1500,1800,2200,2500,2800,3000,3000,3000];
    const BIOMASS_PER_UNIT = Array(24).fill(1000);
    // Maine semidiurnal tides: 2 highs + 2 lows per day (~6hr cycle)
    // Peak generation at mid-tide (max flow); near-zero at slack water (high/low)
    // Profile: peaks at hrs 3,9,15,21 — zeros at hrs 0,6,12,18
    const TIDAL_STD_PER_UNIT = [0,125,375,500,375,125,0,125,375,500,375,125,0,125,375,500,375,125,0,125,375,500,375,125];

    // Grid electricity rate and annual kWh production per unit (basis for ROI)
    const GRID_RATE = 0.22;       // $/kWh — Maine commercial rate (own-use savings)
    const WHOLESALE_RATE = 0.06; // $/kWh — grid buyback rate for surplus (net metering cap)
    const ANNUAL_KWH_PER_UNIT: Record<string, number> = {
      solar:     700_000,  // 500 kW @ ~16% capacity factor
      wind:    8_000_000,  // 3,000 kW @ ~30% capacity factor
      geo:    14_000_000,  // 2,000 kW @ ~80% capacity factor
      hydroLow: 2_000_000, // 500 kW @ ~46% capacity factor
      hydroHigh:7_500_000, // 2,000 kW @ ~43% capacity factor
      tidalStd: 2_190_000, // 500 kW peak @ ~50% capacity factor (semidiurnal tide cycle)
      biomass:  7_000_000, // 1,000 kW @ ~80% capacity factor
    };

    function getEl<T extends HTMLElement>(id: string): T | null {
      return document.getElementById(id) as T | null;
    }

    function getVal(id: string): number {
      return +(getEl<HTMLInputElement>(id)?.value || 0);
    }

    function getSelectedHours(): number[] {
      const selected: number[] = [];
      for (let i = 0; i < 24; i++) {
        const btn = getEl<HTMLElement>(`hourBtn-${i}`);
        if (btn && btn.classList.contains('active')) {
          selected.push(i);
        }
      }
      return selected.length > 0 ? selected : [17, 18, 19, 20];
    }

    function getState() {
      return {
        solar: getVal('solar'), wind: getVal('wind'), geo: getVal('geo'),
        hydroLow: getVal('hydroLow'), hydroHigh: getVal('hydroHigh'),
        tidalStd: getVal('tidalStd'),
        biomass: getVal('biomass'), liIon: getVal('liIon'),
        thermal: getVal('thermal'), flywheel: getVal('flywheel'), caes: getVal('caes'),
        hydrogen: getVal('hydrogen'), v2g: getVal('v2g'), scada: getVal('scada'),
        cabling: (() => {
          const mapMin = Math.round(sharedState.totalMapCableFt);
          const el = getEl<HTMLInputElement>('cabling');
          const val = +(el?.value || 0);
          if (el && val < mapMin) { el.value = String(mapMin); return mapMin; }
          return val;
        })(),
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
      const isHydroHub = s.workforce === 'Hydropower Engineering Hub';
      const isMigratoryBird = s.envConstraints === 'Migratory Bird';
      const isVernalPool = s.envConstraints === 'Vernal Pool';

      const migratoryBirdViolation = isMigratoryBird && sharedState.windSensitiveZoneCount > 0;
      const vernalPoolViolation = isVernalPool && s.geo > 0;

      // Polar Vortex demand threshold — must be declared before infraCosts
      const polarDemandThreshold = isPolar ? (s.thermal > 0 ? 5500 : 7500) : null;

      const totalPeakSupply =
        s.solar*500 + s.wind*3000 + s.geo*2000 +
        s.hydroLow*500 + s.hydroHigh*2000 +
        s.tidalStd*500 + s.biomass*1000;

      const totalStorage =
        s.liIon*1000 + s.thermal*2500 + s.flywheel*1000 + s.caes*5000;

      const startBudget = s.budgetTier==='Failed Bond' ? 9000000 : isGrant ? 12000000 : 10000000;

      const genCosts = {
        solar: s.solar * 1000000,
        wind: s.wind * 2500000,
        geo: s.geo * 5000000 * (isHydroHub ? 0.8 : 1),
        hydro: s.hydroLow * 1000000 * (isHydroHub ? 0.8 : 1) + s.hydroHigh * 4000000 * (isHydroHub ? 0.8 : 1),
        tidal: s.tidalStd * 1500000,
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

      // Hydrogen electrolyzer boosts solar & wind output by 30%
      const hydrogenBoost = isGrant && s.hydrogen > 0 ? 1.3 : 1;
      const windMult = hydrogenBoost * (isMaint ? 0.75 : 1);
      const solarMult = hydrogenBoost * (isPolar ? 0.1 : 1) * (isMaint ? 0.75 : 1);
      const hasVarGen = s.solar > 0 || s.wind > 0;

      // Calculate renewable energy credits from overproduction
      const dischargingHours = getSelectedHours();
      const totalBessCapacity = s.liIon * 1000; // kWh
      const bessHourlyDischarge = dischargingHours.length > 0 ? Math.round(totalBessCapacity / dischargingHours.length) : 0;
      
      const supply24_temp = HOURS.map((_h, i) => {
        let supply = 0;
        supply += s.solar * SOLAR_PER_UNIT[i] * solarMult;
        supply += s.geo * GEO_PER_UNIT[i];
        supply += s.wind * BASE_WIND[i] * windMult;
        supply += s.biomass * BIOMASS_PER_UNIT[i];
        supply += s.hydroLow * 500;
        supply += s.hydroHigh * 2000;
        supply += s.tidalStd * TIDAL_STD_PER_UNIT[i];
        if (dischargingHours.includes(i) && hasVarGen) supply += bessHourlyDischarge;
        return Math.round(supply);
      });

      const demandProfile = s.demandPattern==='Night Owl' ? NIGHT_OWL :
                            s.demandPattern==='Morning Rush' ? MORN_RUSH : STANDARD;
      
      // Polar Vortex demand spike: peaks at 7,500 kW (or 5,500 kW with thermal storage)
      const demandProfileMax = Math.max(...demandProfile);
      const polarScaleFactor = isPolar && polarDemandThreshold ? polarDemandThreshold / demandProfileMax : 1;
      
      const demand24 = HOURS.map((_h, i) => {
        let d = demandProfile[i];
        if (isAIHub) d += 1500;
        // For Polar Vortex, scale entire demand profile to meet the threshold
        if (isPolar) {
          d = d * polarScaleFactor;
        }
        // SCADA reduces total demand by 15%
        if (isGrant && s.scada > 0) d = d * 0.85;
        // V2G caps peak demand at 4,750 kW
        if (isGrant && s.v2g > 0) d = Math.min(d, 4750);
        return Math.round(d);
      });

      const campusPeakDemand = Math.max(...demand24);

      const infraCosts = {
        cabling: s.cabling * 500,
        craneLogistics: s.wind > 0 && isCrane ? 500000 : 0,
        windBuffer: s.windBuffer === 'Yes' ? 200000 : 0,
        utilityFee: totalPeakSupply > campusPeakDemand ? 500000 : 0,
        pivotPenalty: (isMaint && (s.solar > 0 || s.wind > 0)) ? 500000 :
                      (isPolar && polarDemandThreshold && totalPeakSupply < polarDemandThreshold) ? 300000 : 0,
      };

      const kwSoldBack = supply24_temp.reduce((total, supply, i) => {
        const demand = demand24[i];
        const overproduction = Math.max(0, supply - demand);
        return total + overproduction;
      }, 0);

      const renewableCredits = supply24_temp.reduce((total, supply, i) => {
        const demand = demand24[i];
        const overproduction = Math.max(0, supply - demand);
        return total + overproduction * 0.11;
      }, 0);

      // Carbon tax: $0.10/kWh on annual shortfall (demand not met by renewables)
      const dailyShortfallKwh = supply24_temp.reduce((total, supply, i) => total + Math.max(0, demand24[i] - supply), 0);
      const annualCarbonTaxFee = isCarbonTax ? dailyShortfallKwh * 365 * 0.10 : 0;

      // Calculate cost adjustments from pivot cards and data selections
      const baseGeoCost = s.geo * 5000000;
      const adjustedGeoCost = s.geo * 5000000 * (isHydroHub ? 0.8 : 1);

      const geoCostAdjustment = adjustedGeoCost - baseGeoCost;

      const baseHydroCost = s.hydroLow * 1000000 + s.hydroHigh * 4000000;
      const adjustedHydroCost = baseHydroCost * (isHydroHub ? 0.8 : 1);
      const hydroCostAdjustment = adjustedHydroCost - baseHydroCost;

      const baseLiIonCost = s.liIon * 500000; // Base Li-Ion cost
      const adjustedLiIonCost = s.liIon * (isSupplyChain ? 1000000 : 500000);
      const liIonCostAdjustment = adjustedLiIonCost - baseLiIonCost;

      const pivotPenaltyAdjustment = infraCosts.pivotPenalty;
      const utilityFeeAdjustment = infraCosts.utilityFee;
      const craneLogisticsAdjustment = infraCosts.craneLogistics;

      const totalCostAdjustments = geoCostAdjustment + hydroCostAdjustment + liIonCostAdjustment + pivotPenaltyAdjustment + utilityFeeAdjustment + craneLogisticsAdjustment + annualCarbonTaxFee;

      // Hourly net metering: credit any hour where supply > demand at wholesale rate
      // kwSoldBack is already the sum of per-hour surplus kWh for one day
      const surplusKwh = kwSoldBack * 365;
      const annualRenewableRevenue = surplusKwh * WHOLESALE_RATE;

      const totalSpent = Object.values(genCosts).reduce((a,b)=>a+b,0)
        + Object.values(storageCosts).reduce((a,b)=>a+b,0)
        + Object.values(emergingCosts).reduce((a,b)=>a+b,0)
        + Object.values(infraCosts).reduce((a,b)=>a+b,0)
        + annualCarbonTaxFee
        - annualRenewableRevenue;

      const basePeakDemand = 5000;
      const islandTime = totalStorage / basePeakDemand;
      const grantCompliant = !isGrant || (s.hydrogen + s.v2g + s.scada >= 1);

      let gridStatus, gridClass;
      if (isGridDown) {
        if (totalStorage >= 2000) { gridStatus = '✅ SURVIVED: Island Mode Active'; gridClass = 'ok'; }
        else { gridStatus = '⚠️ FATAL CRISIS: Storage under 2,000 kWh!'; gridClass = 'danger'; }
      } else if ((s.wind > 0 || s.tidalStd > 0) && s.flywheel === 0) {
        gridStatus = '⚠️ WARNING: Flickering Power! Add Flywheels.'; gridClass = 'warn';
      } else {
        gridStatus = '✅ Grid Stable'; gridClass = 'ok';
      }

      const storageDischarge = totalStorage / 4;
      const supply24 = supply24_temp;
      const actualPeakSupply = Math.max(...supply24);

      const annualKwh = {
        solar:   s.solar    * ANNUAL_KWH_PER_UNIT.solar,
        wind:    s.wind     * ANNUAL_KWH_PER_UNIT.wind,
        geo:     s.geo      * ANNUAL_KWH_PER_UNIT.geo,
        hydro:   s.hydroLow * ANNUAL_KWH_PER_UNIT.hydroLow + s.hydroHigh * ANNUAL_KWH_PER_UNIT.hydroHigh,
        tidal:   s.tidalStd * ANNUAL_KWH_PER_UNIT.tidalStd,
        biomass: s.biomass  * ANNUAL_KWH_PER_UNIT.biomass,
      };
      const totalAnnualKwh = Object.values(annualKwh).reduce((a, b) => a + b, 0);

      const annualDemandKwh = demand24.reduce((a, b) => a + b, 0) * 365;
      const capAdjustment = -surplusKwh * (GRID_RATE - WHOLESALE_RATE);
      const renewableRevenueProjection = 0;

      const roiSavings = {
        solar:   annualKwh.solar   * GRID_RATE,
        wind:    annualKwh.wind    * GRID_RATE,
        geo:     annualKwh.geo     * GRID_RATE,
        hydro:   annualKwh.hydro   * GRID_RATE,
        tidal:   annualKwh.tidal   * GRID_RATE,
        biomass: annualKwh.biomass * GRID_RATE,
      };
      const baseAnnualSavings = Object.values(roiSavings).reduce((a,b)=>a+b,0) + capAdjustment;
      const pivotImpact = isCarbonTax ? -annualCarbonTaxFee :
                          (isAIHub && totalStorage === 0) ? -50000 : 0;

      // Thermal storage: eliminates heating oil costs when charged by excess wind/hydro/tidal
      const hasThermalSource = s.wind > 0 || s.hydroLow > 0 || s.hydroHigh > 0 || s.tidalStd > 0;
      const thermalHeatingOilSavings = (s.thermal > 0 && hasThermalSource) ? s.thermal * 75000 : 0;

      // CAES: stores seasonal spring surplus for winter peak demand reduction
      const hasCaesSource = s.wind > 0 || s.hydroLow > 0 || s.hydroHigh > 0 || s.tidalStd > 0 || s.solar > 0;
      const caesSeasonalSavings = (s.caes > 0 && hasCaesSource) ? s.caes * 30000 : 0;

      const finalSavings = baseAnnualSavings + pivotImpact + thermalHeatingOilSavings + caesSeasonalSavings;
      const roi = finalSavings > 0 ? (totalSpent / finalSavings).toFixed(2) : null;
      const remaining = startBudget - totalSpent;

      // Solar storage requirement: each 500 kW solar unit needs 1,000 kWh storage (any type)
      const requiredStorageForSolar = s.solar * 1000;
      const solarStorageViolation = s.solar > 0 && totalStorage < requiredStorageForSolar;

      // Night Owl: solar without at least 2 Li-Ion BESS units is a violation
      const isNightOwl = s.demandPattern === 'Night Owl';
      const nightOwlViolation = isNightOwl && s.solar > 0 && s.liIon < 2;

      // Morning Rush: solar+wind > 50% of total annual production with no storage is a violation
      const isMornRush = s.demandPattern === 'Morning Rush';
      const solarWindKwh = annualKwh.solar + annualKwh.wind;
      const solarWindFraction = totalAnnualKwh > 0 ? solarWindKwh / totalAnnualKwh : 0;
      const mornRushViolation = isMornRush && solarWindFraction > 0.50 && totalStorage === 0;

      const constructJobs = Math.floor((totalSpent / 2000000) * 10);
      const permRoles = Math.floor((totalSpent / 2000000) * 1);
      const rolesAssigned = s.wSolar + s.wElec + s.wEng;
      const rolesLeft = Math.max(0, permRoles - rolesAssigned);
      const payroll = s.wSolar*55000 + s.wElec*68000 + s.wEng*72000;

      return {
        totalPeakSupply, actualPeakSupply, totalStorage, startBudget, totalSpent, remaining, campusPeakDemand,
        islandTime, gridStatus, gridClass,
        demand24, supply24, renewableCredits, kwSoldBack,
        annualRenewableRevenue, renewableRevenueProjection,
        totalCostAdjustments, geoCostAdjustment, hydroCostAdjustment, liIonCostAdjustment, pivotPenaltyAdjustment, utilityFeeAdjustment, craneLogisticsAdjustment, annualCarbonTaxFee,
        annualKwh, totalAnnualKwh, annualDemandKwh, surplusKwh, capAdjustment,
        roiSavings, baseAnnualSavings, pivotImpact, thermalHeatingOilSavings, caesSeasonalSavings, finalSavings, roi,
        constructJobs, permRoles, rolesLeft, payroll,
        grantCompliant, isGrant, isPolar, polarDemandThreshold, isAIHub, isMaint, isSupplyChain, isCarbonTax, isHydroHub, infraCosts, genCosts, storageCosts, emergingCosts,
        migratoryBirdViolation, vernalPoolViolation,
        isMigratoryBird, isVernalPool,
        solarStorageViolation, requiredStorageForSolar,
        isNightOwl, nightOwlViolation, isMornRush, mornRushViolation, solarWindFraction,
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
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
          plugins: {
            legend: { position: 'top', labels: { font: { family: 'DM Sans', size: 12 }, boxWidth: 16 } },
            tooltip: { bodyFont: { family: 'DM Mono' }, titleFont: { family: 'DM Sans' } }
          },
          scales: {
            x: { grid: { color: '#f0ede6' }, ticks: { font: { family: 'DM Mono', size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
            y: { beginAtZero: true, min: 0, max: 8000, grid: { color: '#f0ede6' }, ticks: { font: { family: 'DM Mono', size: 10 }, padding: 12, callback: (v) => Number(v).toLocaleString() + ' kW' } }
          }
        }
      });
    }

    // Init donut chart for energy source mix
    const sourceCanvas = getEl<HTMLCanvasElement>('sourceChart');
    if (sourceCanvas) {
      sourceChartRef.current = new Chart(sourceCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Solar', 'Wind', 'Geo', 'Hydro', 'Tidal', 'Biomass'],
          datasets: [{
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: [
              '#f0b429',
              '#58a6ff',
              '#bc8cff',
              '#39c8e8',
              '#00c8aa',
              '#7ee787'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'DM Sans', size: 11 },
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              bodyFont: { family: 'DM Mono', size: 12 },
              titleFont: { family: 'DM Sans' },
              callbacks: {
                label: (context) => {
                  const value = context.parsed ?? 0;
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  return `${context.label}: ${Math.round(value)} kW (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    function render() {
      // Initialize hour grid if not already done
      const hourGrid = getEl('hourGrid');
      if (hourGrid && hourGrid.children.length === 0) {
        for (let i = 0; i < 24; i++) {
          const btn = document.createElement('button');
          btn.id = `hourBtn-${i}`;
          btn.className = 'e-hour-btn' + (i >= 17 && i <= 20 ? ' active' : '');
          btn.textContent = i.toString().padStart(2, '0');
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            render();
          });
          hourGrid.appendChild(btn);
        }
      }

      const s = getState();
      const r = calc(s);

      const isGrant = s.budgetTier === 'Federal Green Grant';
      ['hydrogen','v2g','scada'].forEach(id => {
        const el = getEl<HTMLInputElement>(id);
        if (el) el.disabled = !isGrant;
      });
      const emergingNote = getEl('emergingNote');
      if (emergingNote) emergingNote.style.display = isGrant ? 'none' : 'flex';
      const emergingCard = getEl('emergingCard');
      if (emergingCard) emergingCard.style.display = isGrant ? 'block' : 'none';

      const windInput = getEl<HTMLInputElement>('wind');
      const geoInput = getEl<HTMLInputElement>('geo');
      const solarInput = getEl<HTMLInputElement>('solar');
      const liIonInput = getEl<HTMLInputElement>('liIon');
      if (windInput) {
        windInput.style.borderColor = r.migratoryBirdViolation || r.mornRushViolation ? 'var(--danger)' : '';
        windInput.style.background = r.migratoryBirdViolation || r.mornRushViolation ? 'var(--danger-light)' : '';
      }
      if (geoInput) {
        geoInput.style.borderColor = r.vernalPoolViolation ? 'var(--danger)' : '';
        geoInput.style.background = r.vernalPoolViolation ? 'var(--danger-light)' : '';
      }
      if (solarInput) {
        const solarBad = r.nightOwlViolation || r.mornRushViolation || r.solarStorageViolation;
        solarInput.style.borderColor = solarBad ? 'var(--danger)' : '';
        solarInput.style.background = solarBad ? 'var(--danger-light)' : '';
      }
      if (liIonInput) {
        const liIonBad = r.nightOwlViolation || r.solarStorageViolation;
        liIonInput.style.borderColor = liIonBad ? 'var(--danger)' : '';
        liIonInput.style.background = liIonBad ? 'var(--danger-light)' : '';
      }
      ['thermal', 'flywheel', 'caes'].forEach(id => {
        const el = getEl<HTMLInputElement>(id);
        if (el) {
          el.style.borderColor = r.solarStorageViolation ? 'var(--danger)' : '';
          el.style.background = r.solarStorageViolation ? 'var(--danger-light)' : '';
        }
      });

      const hdr = getEl('headerStatus');
      if (hdr) {
        hdr.textContent = r.gridStatus.length > 40 ? r.gridStatus.substring(0,40)+'…' : r.gridStatus;
        hdr.className = 'grid-status-badge' + (r.gridClass==='warn' ? ' warn' : r.gridClass==='danger' ? ' danger' : '');
      }

      // Sync budget tier to shared state so map header shows correct budget
      if (sharedState.budgetLimit !== r.startBudget) {
        sharedState.budgetLimit = r.startBudget;
        emitSimUpdate();
      }
      if (sharedState.hydroHubActive !== r.isHydroHub) {
        sharedState.hydroHubActive = r.isHydroHub;
        emitSimUpdate();
      }

      const supplyEl = getEl('mTotalSupply'); if (supplyEl) supplyEl.textContent = fmtkW(r.actualPeakSupply);
      const storageEl = getEl('mTotalStorage'); if (storageEl) storageEl.textContent = fmtkWh(r.totalStorage);
      const budgetEl = getEl('mBudget'); if (budgetEl) budgetEl.textContent = fmt$(r.startBudget);
      const spentEl = getEl('mSpent'); if (spentEl) spentEl.textContent = fmt$(r.totalSpent);

      // Update budget breakdown with credits
      const setCost = (id: string, val: number) => { const el = getEl(id); if (el) el.textContent = fmt$(val); };
      setCost('costBaseBudget', r.startBudget);
      setCost('costTotalSpent', r.totalSpent);
      
      // Set cost adjustments with appropriate styling
      const adjEl = getEl('costAdjustments');
      if (adjEl) {
        adjEl.textContent = fmt$(r.totalCostAdjustments);
        adjEl.className = 'value ' + (r.totalCostAdjustments < 0 ? 'negative' : r.totalCostAdjustments > 0 ? 'positive' : '');
      }
      
      // Set individual adjustment breakdowns with descriptions
      const setAdjItem = (id: string, val: number, descId: string, desc: string) => { 
        const itemEl = getEl(id + 'Item');
        const valEl = getEl(id);
        const descEl = getEl(descId);
        if (itemEl && valEl && descEl) { 
          itemEl.style.display = val !== 0 ? 'block' : 'none';
          valEl.textContent = fmt$(val);
          valEl.className = val < 0 ? 'negative' : val > 0 ? 'positive' : '';
          descEl.textContent = desc;
        }
      };
      
      // Set adjustments in both breakdowns (budget and spent)
      setAdjItem('adjWind', r.geoCostAdjustment, 'adjWindDesc', r.geoCostAdjustment !== 0 ? '(Hydropower Hub -20%)' : '');
      setAdjItem('costWindAdj', r.geoCostAdjustment, 'costWindAdjDesc', r.geoCostAdjustment !== 0 ? '(Hydropower Hub -20%)' : '');

      setAdjItem('adjTidal', r.hydroCostAdjustment, 'adjTidalDesc', r.hydroCostAdjustment !== 0 ? '(Hydropower Hub -20%)' : '');
      setAdjItem('costTidalAdj', r.hydroCostAdjustment, 'costTidalAdjDesc', r.hydroCostAdjustment !== 0 ? '(Hydropower Hub -20%)' : '');
      
      setAdjItem('adjLiIon', r.liIonCostAdjustment, 'adjLiIonDesc', r.liIonCostAdjustment !== 0 ? '(Supply Chain +100%)' : '');
      setAdjItem('costLiIonAdj', r.liIonCostAdjustment, 'costLiIonAdjDesc', r.liIonCostAdjustment !== 0 ? '(Supply Chain +100%)' : '');
      
      setAdjItem('adjPivot', r.pivotPenaltyAdjustment, 'adjPivotDesc', r.pivotPenaltyAdjustment !== 0 ? '(Pivot Card Penalty)' : '');
      setAdjItem('adjUtility', r.utilityFeeAdjustment, 'adjUtilityDesc', r.utilityFeeAdjustment !== 0 ? '(Peak > 3,000 kW)' : '');
      setAdjItem('adjCrane', r.infraCosts.craneLogistics, 'adjCraneDesc', r.infraCosts.craneLogistics !== 0 ? '(Crane Operator Shortage)' : '');
      setAdjItem('adjCarbonTax', r.annualCarbonTaxFee, 'adjCarbonTaxDesc', r.annualCarbonTaxFee !== 0 ? '($0.10/kWh shortfall × 365 days)' : '');
      
      setCost('costRenewableRevenue', r.annualRenewableRevenue);
      const sellBackEl = getEl('sellBackDetail');
      const sellBackTextEl = getEl('sellBackKwText');
      if (sellBackEl && sellBackTextEl) {
        if (r.surplusKwh > 0) {
          sellBackEl.style.display = 'flex';
          sellBackTextEl.textContent = `${Math.round(r.kwSoldBack).toLocaleString()} kW daily surplus · ${Math.round(r.surplusKwh / 1000)}K kWh/yr × $0.06 = ${fmt$(r.annualRenewableRevenue)}/yr`;
        } else {
          sellBackEl.style.display = 'none';
        }
      }
      setCost('costRemaining', r.remaining);
      setCost('costSolar', r.genCosts.solar);
      setCost('costRemaining', r.remaining);
      setCost('costSolar', r.genCosts.solar);
      setCost('costWind', r.genCosts.wind);

      // Show/hide battery discharge card based on liIon
      const batteryCard = getEl('batteryDischargeCard');
      if (batteryCard) {
        batteryCard.style.display = s.liIon > 0 ? 'block' : 'none';
      }
      setCost('costGeo', r.genCosts.geo);
      setCost('costHydro', r.genCosts.hydro);
      setCost('costTidal', r.genCosts.tidal);
      setCost('costBiomass', r.genCosts.biomass);
      setCost('costLiIon', r.storageCosts.liIon);
      setCost('costThermal', r.storageCosts.thermal);
      setCost('costFlywheel', r.storageCosts.flywheel);
      setCost('costCAES', r.storageCosts.caes);
      setCost('costHydrogen', r.emergingCosts.hydrogen);
      setCost('costV2G', r.emergingCosts.v2g);
      setCost('costSCADA', r.emergingCosts.scada);
      setCost('costCabling', r.infraCosts.cabling);
      setCost('costCraneLogistics', r.infraCosts.craneLogistics);
      
      // Show crane logistics description only when charge is active
      const craneDescEl = getEl('costCraneLogisticsDesc');
      if (craneDescEl) {
        if (r.infraCosts.craneLogistics > 0) {
          craneDescEl.style.display = 'block';
        } else {
          craneDescEl.style.display = 'none';
        }
      }
      
      setCost('costWindBuffer', r.infraCosts.windBuffer);
      setCost('costUtilityFee', r.infraCosts.utilityFee);
      setCost('costPivotPenalty', r.infraCosts.pivotPenalty);
      setCost('costCarbonTax', r.annualCarbonTaxFee);

      const remEl = getEl('mRemaining');
      if (remEl) {
        remEl.textContent = fmt$(r.remaining);
        remEl.className = 'e-metric-value ' + (r.remaining < 0 ? 'negative' : 'positive');
      }

      const effectiveSpent = r.totalSpent;
      const pct = Math.min(100, Math.round((effectiveSpent / r.startBudget) * 100));
      const bar = getEl('budgetBar');
      if (bar) { bar.style.width = pct + '%'; bar.className = 'budget-bar-fill' + (r.remaining < 0 ? ' over' : ''); }
      const pctEl = getEl('budgetPct'); if (pctEl) pctEl.textContent = pct + '% spent';

      const islandEl = getEl('mIslandTime'); if (islandEl) islandEl.textContent = r.islandTime.toFixed(1) + ' hrs';
      const roiEl = getEl('mROI');
      if (roiEl) {
        roiEl.textContent = r.roi ? r.roi + ' yrs' : '— yrs';
        roiEl.className = 'e-metric-value ' + (r.roi && parseFloat(r.roi) < 10 ? 'positive' : r.roi ? 'warn' : '');
      }
      const creditsEl = getEl('mRenewableCredits');
      if (creditsEl) creditsEl.textContent = fmt$(r.renewableCredits);
      
      const kwSoldMetricEl = getEl('mKwSoldBack');
      if (kwSoldMetricEl) kwSoldMetricEl.textContent = Math.round(r.kwSoldBack).toLocaleString() + ' kW';

      const alerts: { cls: string; msg: string }[] = [];
      if (r.gridClass !== 'ok') alerts.push({ cls: r.gridClass, msg: r.gridStatus });
      if (r.remaining < 0) alerts.push({ cls: 'danger', msg: '⛔ Over budget by ' + fmt$(Math.abs(r.remaining)) });
      if (r.isGrant && !r.grantCompliant) alerts.push({ cls: 'warn', msg: '⚠️ Grant Violation: Must purchase at least 1 Emerging Tech!' });
      if (r.totalPeakSupply === 0) alerts.push({ cls: 'warn', msg: '⚠️ No generation tech selected — grid has no supply.' });
      if (r.infraCosts.utilityFee > 0) alerts.push({ cls: 'warn', msg: `⚠️ Utility Interconnection Fee: supply exceeds campus peak demand (${r.campusPeakDemand.toLocaleString()} kW) — grid export requires infrastructure upgrade (+$500K)` });
      if (r.isPolar) {
        const threshold = r.polarDemandThreshold ?? 7500;
        const met = r.totalPeakSupply >= threshold;
        alerts.push({ cls: met ? 'ok' : 'danger', msg: (met ? '✅' : '⛔') + ' Polar Vortex: Campus demand spiked to ' + threshold.toLocaleString() + ' kW — your supply is ' + (met ? 'sufficient.' : 'insufficient! Add more generation.') + (r.totalStorage === 0 || !r.infraCosts ? '' : ' (Tip: add Thermal Storage to reduce threshold to 5,500 kW)') });
      }
      if (r.isAIHub) alerts.push({ cls: 'warn', msg: '⚡ AI Learning Hub: Campus demand increased by 1,500 kW every hour — new peak demand is 6,500 kW.' });
      if (r.isMaint) alerts.push({ cls: 'warn', msg: '🔧 Maintenance Crisis: Solar and Wind output reduced to 75%.' + (r.infraCosts.pivotPenalty > 0 ? ' $500K repair fee applied.' : '') });
      if (r.isSupplyChain) alerts.push({ cls: 'warn', msg: '📦 Supply Chain Crisis: Li-Ion BESS cost doubled to $1M/unit.' });
      if (r.isCarbonTax && r.annualCarbonTaxFee > 0) alerts.push({ cls: 'warn', msg: '🌿 Carbon Tax: ' + fmt$(r.annualCarbonTaxFee) + '/yr fee on ' + Math.round(r.annualCarbonTaxFee / 0.10 / 365).toLocaleString() + ' kWh daily shortfall.' });
      if (r.isCarbonTax && r.annualCarbonTaxFee === 0) alerts.push({ cls: 'ok', msg: '✅ Carbon Tax: Grid is 100% renewable — no carbon tax fee applies.' });
      if (r.migratoryBirdViolation) alerts.push({ cls: 'danger', msg: '🐦 VIOLATION — Migratory Bird Ordinance: Wind turbines in forested areas disrupt migration corridors. Relocate to fields, parking lots, or open water.' });
      if (r.vernalPoolViolation) alerts.push({ cls: 'danger', msg: '🌿 VIOLATION — Vernal Pool Protection: No Geothermal permitted. Remove geothermal.' });
      if (r.isMigratoryBird && !r.migratoryBirdViolation && s.wind > 0) alerts.push({ cls: 'ok', msg: '🐦 Migratory Bird Ordinance: Wind turbine placement compliant — sited in permitted zones (fields, parking, open water).' });
      if (r.isMigratoryBird && !r.migratoryBirdViolation && s.wind === 0) alerts.push({ cls: 'warn', msg: '🐦 Migratory Bird Ordinance active: Wind turbines permitted in fields, parking lots, and open water — not in forested areas.' });
      if (r.isVernalPool && !r.vernalPoolViolation) alerts.push({ cls: 'warn', msg: '🌿 Vernal Pool Protection active: Geothermal is banned. Max 25% of forested land may be cleared.' });
      if (r.nightOwlViolation) alerts.push({ cls: 'danger', msg: '🌙 VIOLATION — Night Owl Campus: Solar requires at least 2 Li-Ion BESS units for evening storage. Add BESS.' });
      if (r.isNightOwl && !r.nightOwlViolation && s.solar > 0) alerts.push({ cls: 'ok', msg: '🌙 Night Owl Campus: Solar + BESS requirement met. ✅' });
      if (r.isNightOwl && s.solar === 0) alerts.push({ cls: 'warn', msg: '🌙 Night Owl Campus: No solar selected — BESS requirement does not apply.' });
      if (r.mornRushViolation) alerts.push({ cls: 'danger', msg: `⏰ VIOLATION — Morning Rush: Solar + Wind = ${Math.round(r.solarWindFraction * 100)}% of supply. Add storage or increase geo/hydro/biomass to resolve.` });
      if (r.isMornRush && !r.mornRushViolation && r.solarWindFraction > 0.50) alerts.push({ cls: 'ok', msg: `⏰ Morning Rush: Solar + Wind at ${Math.round(r.solarWindFraction * 100)}% — storage solution in place. ✅` });
      if (r.isMornRush && r.solarWindFraction <= 0.50) alerts.push({ cls: 'ok', msg: `⏰ Morning Rush: Solar + Wind at ${Math.round(r.solarWindFraction * 100)}% of supply — within the 50% threshold. ✅` });
      if (r.solarStorageViolation) alerts.push({ cls: 'danger', msg: `☀️ VIOLATION — Solar Storage Requirement: ${s.solar} solar unit(s) require ${r.requiredStorageForSolar.toLocaleString()} kWh of storage. Current total storage: ${r.totalStorage.toLocaleString()} kWh. Add storage to comply.` });
      if (s.solar > 0 && !r.solarStorageViolation) alerts.push({ cls: 'ok', msg: `☀️ Solar Storage Requirement met: ${r.totalStorage.toLocaleString()} kWh storage ≥ ${r.requiredStorageForSolar.toLocaleString()} kWh required. ✅` });

      // Unplaced units — simulator count exceeds map placement count
      const mc = sharedState.techCounts;
      const unplaced: string[] = [];
      ([
        [s.solar,     mc.solar    || 0, 'Solar PV'],
        [s.wind,      mc.wind     || 0, 'Wind Turbine'],
        [s.geo,       mc.geo      || 0, 'Geothermal'],
        [s.hydroLow,  mc.hydroL   || 0, 'Hydro (Low Head)'],
        [s.hydroHigh, mc.hydroH   || 0, 'Hydro (High Head)'],
        [s.tidalStd,  mc.tidal    || 0, 'Tidal'],
        [s.biomass,   mc.biomass  || 0, 'Biomass'],
        [s.liIon,     mc.bess     || 0, 'Li-Ion BESS'],
        [s.thermal,   mc.thermal  || 0, 'Thermal Storage'],
        [s.flywheel,  mc.flywheel || 0, 'Flywheel'],
        [s.caes,      mc.caes     || 0, 'CAES'],
      ] as [number, number, string][]).forEach(([simCount, mapCount, name]) => {
        const diff = simCount - mapCount;
        if (diff > 0) unplaced.push(`${name} (${diff} unplaced)`);
      });
      if (unplaced.length > 0) {
        alerts.push({ cls: 'warn', msg: `🗺 Map Placement needed: ${unplaced.join(' · ')} — switch to the Map tab to place these units.` });
      }

      // Map siting violations (from CampusMapTool)
      sharedState.mapViolations.forEach(v => {
        alerts.push({ cls: 'danger', msg: `🗺 Map Siting: ${v}` });
      });

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

      // Update donut chart with energy source mix
      if (sourceChartRef.current) {
        const sourceData = [
          s.solar * 500,
          s.wind * 3000,
          s.geo * 2000,
          (s.hydroLow * 500 + s.hydroHigh * 2000),
          (s.tidalStd * 500),
          s.biomass * 1000
        ];
        sourceChartRef.current.data.datasets[0].data = sourceData;
        sourceChartRef.current.update('none');

        // Live legend below donut
        const legendEl = getEl('sourceChartLegend');
        if (legendEl) {
          const totalKw = sourceData.reduce((a, b) => a + b, 0);
          const labels = ['Solar', 'Wind', 'Geo', 'Hydro', 'Tidal', 'Biomass'];
          const colors = ['#f0b429', '#58a6ff', '#bc8cff', '#39c8e8', '#00c8aa', '#7ee787'];
          if (totalKw === 0) {
            legendEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:4px 0">No generation selected</div>';
          } else {
            legendEl.innerHTML = labels.map((label, i) => {
              const kw = sourceData[i];
              if (kw === 0) return '';
              const pct = ((kw / totalKw) * 100).toFixed(1);
              return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f0ede6">
                <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[i]};margin-right:6px;vertical-align:middle"></span>${label}</span>
                <span style="color:${colors[i]};font-weight:600">${kw.toLocaleString()} kW · ${pct}%</span>
              </div>`;
            }).filter(Boolean).join('') +
            `<div style="display:flex;justify-content:space-between;padding:4px 0;font-weight:600;border-top:1px solid var(--border);margin-top:2px">
              <span>Total Peak</span><span>${totalKw.toLocaleString()} kW</span>
            </div>`;
          }
        }
      }

      const setLedger = (id: string, val: number) => { const el = getEl(id); if (el) el.textContent = fmt$(val); };
      const fmtKwh = (kwh: number) => kwh === 0 ? '—' : kwh >= 1_000_000 ? (kwh/1_000_000).toFixed(1)+'M kWh/yr' : Math.round(kwh/1000)+'K kWh/yr';
      const setKwh = (id: string, kwh: number) => { const el = getEl(id); if (el) el.textContent = fmtKwh(kwh); };

      setLedger('lSolar', r.roiSavings.solar);   setKwh('lSolarKwh',   r.annualKwh.solar);
      setLedger('lWind',  r.roiSavings.wind);    setKwh('lWindKwh',    r.annualKwh.wind);
      setLedger('lGeo',   r.roiSavings.geo);     setKwh('lGeoKwh',     r.annualKwh.geo);
      setLedger('lHydro', r.roiSavings.hydro);   setKwh('lHydroKwh',   r.annualKwh.hydro);
      setLedger('lTidal', r.roiSavings.tidal);   setKwh('lTidalKwh',   r.annualKwh.tidal);
      setLedger('lBiomass',r.roiSavings.biomass);setKwh('lBiomassKwh', r.annualKwh.biomass);
      setLedger('lBaseTotal', r.baseAnnualSavings);
      const totalKwhEl = getEl('lTotalKwh'); if (totalKwhEl) totalKwhEl.textContent = fmtKwh(r.totalAnnualKwh) + ' × $0.22';
      const demandKwhEl = getEl('lDemandKwh'); if (demandKwhEl) demandKwhEl.textContent = fmtKwh(r.annualDemandKwh);
      const capAdjEl = getEl('lCapAdj');
      const capDescEl = getEl('lCapDesc');
      if (r.surplusKwh > 0) {
        if (capAdjEl) { capAdjEl.textContent = fmt$(r.capAdjustment); capAdjEl.className = 'val neg'; }
        if (capDescEl) capDescEl.textContent = `${fmtKwh(r.surplusKwh)} beyond campus demand — unused credits worth only $0.06/kWh at true-up`;
      } else {
        if (capAdjEl) { capAdjEl.textContent = '—'; capAdjEl.className = 'val'; }
        if (capDescEl) capDescEl.textContent = 'All production used on-site — no diminishing return';
      }
      const pivotEl = getEl('lPivot');
      const pivotDescEl = getEl('lPivotDesc');
      if (pivotEl) { pivotEl.textContent = fmt$(r.pivotImpact); pivotEl.className = 'val ' + (r.pivotImpact >= 0 ? 'pos' : 'neg'); }
      if (pivotDescEl) {
        if (r.isCarbonTax) pivotDescEl.textContent = `Carbon Tax scenario: annual fee on fossil fuel baseline`;
        else if (r.isAIHub && r.totalStorage === 0) pivotDescEl.textContent = 'AI Hub scenario: storage required — $50K/yr reliability penalty';
        else pivotDescEl.textContent = 'No active scenario penalty or bonus';
      }
      const thermalOilRow = getEl('lThermalOilRow');
      if (thermalOilRow) thermalOilRow.style.display = r.thermalHeatingOilSavings > 0 ? '' : 'none';
      if (r.thermalHeatingOilSavings > 0) {
        setLedger('lThermalOil', r.thermalHeatingOilSavings);
        const d = getEl('lThermalOilDesc'); if (d) d.textContent = `Thermal units charged by wind/hydro/tidal — heating oil displaced`;
      }
      const caesRow = getEl('lCaesSeasonalRow');
      if (caesRow) caesRow.style.display = r.caesSeasonalSavings > 0 ? '' : 'none';
      if (r.caesSeasonalSavings > 0) {
        setLedger('lCaesSeasonal', r.caesSeasonalSavings);
        const d = getEl('lCaesSeasonalDesc'); if (d) d.textContent = `Spring surplus stored, discharged at winter demand peaks`;
      }
      setLedger('lFinal', r.finalSavings);

      const constJobs = getEl('wConstJobs'); if (constJobs) constJobs.textContent = r.constructJobs.toLocaleString();
      const permRolesEl = getEl('wPermRoles'); if (permRolesEl) permRolesEl.textContent = r.permRoles.toLocaleString();
      const rolesLeftEl = getEl('wRolesLeft'); if (rolesLeftEl) rolesLeftEl.textContent = String(r.rolesLeft);
      setLedger('wPayroll', r.payroll);

      // CO2 offset — ISO-NE marginal rate (natural gas displacement)
      const CO2_G_PER_KWH = 392;
      const co2Mt = (
        r.annualKwh.solar  * CO2_G_PER_KWH +
        r.annualKwh.wind   * CO2_G_PER_KWH +
        r.annualKwh.geo    * CO2_G_PER_KWH +
        r.annualKwh.hydro  * CO2_G_PER_KWH +
        r.annualKwh.tidal  * CO2_G_PER_KWH
        // biomass: carbon-neutral, 0 net offset
      ) / 1_000_000;

      const co2TotalEl = getEl('co2TotalMt');
      if (co2TotalEl) co2TotalEl.textContent = co2Mt > 0 ? Math.round(co2Mt).toLocaleString() : '—';
      const co2CarsEl = getEl('co2Cars');
      if (co2CarsEl) co2CarsEl.textContent = co2Mt > 0 ? Math.round(co2Mt / 4.6).toLocaleString() : '—';
      const co2TreesEl = getEl('co2Trees');
      if (co2TreesEl) co2TreesEl.textContent = co2Mt > 0 ? Math.round(co2Mt * 1000 / 22).toLocaleString() : '—';

      const co2BreakdownEl = getEl('co2Breakdown');
      if (co2BreakdownEl) {
        const techRows = [
          { label: 'Solar PV',    kwh: r.annualKwh.solar },
          { label: 'Wind',        kwh: r.annualKwh.wind  },
          { label: 'Geothermal',  kwh: r.annualKwh.geo   },
          { label: 'Hydro',       kwh: r.annualKwh.hydro },
          { label: 'Tidal',       kwh: r.annualKwh.tidal },
          { label: 'Biomass',     kwh: r.annualKwh.biomass, neutral: true },
        ].filter(t => t.kwh > 0);

        if (techRows.length === 0) {
          co2BreakdownEl.innerHTML = '';
        } else {
          const maxMt = Math.max(...techRows.map(t => t.neutral ? 0 : (t.kwh * CO2_G_PER_KWH / 1_000_000)), 0.001);
          co2BreakdownEl.innerHTML = `
            <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px">
              <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:8px">By Source</div>
              ${techRows.map(t => {
                const mt = t.neutral ? 0 : t.kwh * CO2_G_PER_KWH / 1_000_000;
                const pct = Math.round((mt / maxMt) * 100);
                return `<div style="margin-bottom:8px">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
                    <span>${t.label}${t.neutral ? ' <span style="font-size:10px;color:var(--text-muted)">(carbon-neutral)</span>' : ''}</span>
                    <span style="font-family:var(--mono);color:${t.neutral ? 'var(--text-muted)' : 'var(--accent)'}">
                      ${t.neutral ? '—' : Math.round(mt).toLocaleString()}
                    </span>
                  </div>
                  <div style="height:5px;background:#ede9e0;border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:3px;transition:width 0.3s"></div>
                  </div>
                </div>`;
              }).join('')}
            </div>`;
        }
      }
    }

    function exportCSV() {
      const s = getState();
      const r = calc(s);
      const CO2_G_PER_KWH = 392;
      const co2Mt = (r.annualKwh.solar + r.annualKwh.wind + r.annualKwh.geo + r.annualKwh.hydro + r.annualKwh.tidal) * CO2_G_PER_KWH / 1_000_000;
      const rows: (string | number)[][] = [
        // Scenario settings
        ['SCENARIO SETTINGS',''],
        ['Demand Pattern', s.demandPattern],
        ['Budget Tier', s.budgetTier],
        ['Starting Budget ($)', r.startBudget],
        ['Workforce Scenario', s.workforce],
        ['Environmental Constraint', s.envConstraints],
        ['Pivot Card', s.pivotCard],
        ['Wind Buffer Fee Applied', s.windBuffer],
        [],
        // Generation units
        ['GENERATION UNITS',''],
        ['Solar PV (units)', s.solar],
        ['Wind (units)', s.wind],
        ['Geothermal (units)', s.geo],
        ['Hydro Low Head (units)', s.hydroLow],
        ['Hydro High Head (units)', s.hydroHigh],
        ['Tidal (units)', s.tidalStd],
        ['Biomass (units)', s.biomass],
        [],
        // Storage & emerging tech
        ['STORAGE & EMERGING TECH',''],
        ['Li-Ion BESS (units)', s.liIon],
        ['Thermal Storage (units)', s.thermal],
        ['Mechanical Flywheel (units)', s.flywheel],
        ['CAES (units)', s.caes],
        ['Green Hydrogen Electrolyzer (units)', s.hydrogen],
        ['V2G (units)', s.v2g],
        ['SCADA (units)', s.scada],
        ['Cabling (ft)', s.cabling],
        [],
        // Grid performance
        ['GRID PERFORMANCE',''],
        ['Grid Status', r.gridStatus],
        ['Rated Peak Capacity (kW)', r.totalPeakSupply],
        ['Actual Peak Supply (kW)', r.actualPeakSupply],
        ['Total Storage (kWh)', r.totalStorage],
        ['Island Mode Duration (hrs)', r.islandTime.toFixed(2)],
        [],
        // Annual generation
        ['ANNUAL GENERATION',''],
        ['Solar Annual Generation (kWh)', r.annualKwh.solar],
        ['Wind Annual Generation (kWh)', r.annualKwh.wind],
        ['Geothermal Annual Generation (kWh)', r.annualKwh.geo],
        ['Hydro Annual Generation (kWh)', r.annualKwh.hydro],
        ['Tidal Annual Generation (kWh)', r.annualKwh.tidal],
        ['Biomass Annual Generation (kWh)', r.annualKwh.biomass],
        ['Total Annual Generation (kWh)', r.totalAnnualKwh],
        ['Campus Annual Demand (kWh)', r.annualDemandKwh],
        ['Surplus kWh Sold Back', r.surplusKwh],
        [],
        // Financial summary
        ['FINANCIAL SUMMARY',''],
        ['Total Spent ($)', r.totalSpent],
        ['Remaining Budget ($)', r.remaining],
        ['Solar Annual Savings ($)', r.roiSavings.solar],
        ['Wind Annual Savings ($)', r.roiSavings.wind],
        ['Geothermal Annual Savings ($)', r.roiSavings.geo],
        ['Hydro Annual Savings ($)', r.roiSavings.hydro],
        ['Tidal Annual Savings ($)', r.roiSavings.tidal],
        ['Biomass Annual Savings ($)', r.roiSavings.biomass],
        ['Base Annual Savings ($)', r.baseAnnualSavings],
        ['Renewable Sell-Back Revenue ($)', r.annualRenewableRevenue],
        ['Thermal Heating Oil Savings ($)', r.thermalHeatingOilSavings],
        ['CAES Seasonal Savings ($)', r.caesSeasonalSavings],
        ['Pivot Card Impact ($)', r.pivotImpact],
        ['Carbon Tax Fee ($)', r.annualCarbonTaxFee],
        ['Final Adjusted Savings ($)', r.finalSavings],
        ['ROI Break-Even (yrs)', r.roi || 'N/A'],
        [],
        // Workforce
        ['WORKFORCE',''],
        ['Construction Jobs', r.constructJobs],
        ['Permanent Roles', r.permRoles],
        ['Solar Techs Assigned', s.wSolar],
        ['Electricians Assigned', s.wElec],
        ['Wind/Marine/Hydro Engineers Assigned', s.wEng],
        ['Total Payroll Injection ($)', r.payroll],
        [],
        // CO2 offset
        ['CO2 OFFSET (ISO-NE 392 g/kWh marginal rate)',''],
        ['Annual CO2 Offset (metric tons)', Math.round(co2Mt)],
        ['Cars Removed Equivalent', Math.round(co2Mt / 4.6)],
        ['Trees Planted Equivalent', Math.round(co2Mt * 1000 / 22)],
        ['NE Homes Powered', Math.round(r.totalAnnualKwh / 7500)],
        [],
        // Hourly profile
        ['HOURLY DEMAND & SUPPLY',''],
        ['Hour','Demand (kW)','Supply (kW)'],
        ...HOURS.map((h, i) => [`${h}:00`, r.demand24[i], r.supply24[i]])
      ];
      const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'energy_grid_results.csv';
      a.click();
    }

    function resetAll() {
      if (!confirm('Reset all inputs to zero?')) return;
      ['solar','wind','geo','hydroLow','hydroHigh','tidalStd','biomass',
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
      // Hide content again on reset
      contentRevealed = false;
      const sidebar = getEl('additionalSidebar');
      const content = getEl('additionalContent');
      if (sidebar) sidebar.style.display = 'none';
      if (content) content.style.display = 'none';
      render();
    }

    document.querySelectorAll('.e-qty-input, .e-select, .workforce-item input').forEach(el => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });

    // Map placement reminder toast
    const MAP_TECH_LABELS: Record<string, string> = {
      solar: 'Solar PV', wind: 'Wind Turbine', geo: 'Geothermal',
      hydroLow: 'Hydro (Low Head)', hydroHigh: 'Hydro (High Head)',
      tidalStd: 'Tidal', biomass: 'Biomass',
      liIon: 'Li-Ion BESS', thermal: 'Thermal Storage',
      flywheel: 'Mechanical Flywheel', caes: 'CAES',
    };

    const toast = document.createElement('div');
    toast.id = 'mapReminderToast';
    toast.style.cssText = 'display:none;position:fixed;bottom:24px;right:24px;z-index:9999;background:#1a3a22;border:1px solid #3fb950;color:#7ee787;padding:12px 16px;border-radius:6px;font-size:13px;font-family:var(--sans);max-width:300px;box-shadow:0 4px 16px rgba(0,0,0,0.4);transition:opacity 0.3s';
    toast.innerHTML = '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🗺</span><span id="mapReminderText" style="flex:1;line-height:1.4"></span><button id="mapReminderClose" style="background:none;border:none;color:#7ee787;cursor:pointer;font-size:18px;padding:0;line-height:1;margin-left:4px">×</button></div>';
    document.body.appendChild(toast);

    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    let suppressToast = false;

    function showMapReminder(techName: string) {
      if (suppressToast) return;
      const textEl = document.getElementById('mapReminderText');
      if (textEl) textEl.textContent = `Don't forget to place ${techName} on the Map to keep both views in sync.`;
      toast.style.display = 'block';
      toast.style.opacity = '1';
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => { toast.style.display = 'none'; }, 300); }, 5000);
    }

    document.getElementById('mapReminderClose')?.addEventListener('click', () => {
      if (toastTimer) clearTimeout(toastTimer);
      toast.style.display = 'none';
    });

    const prevVals: Record<string, number> = {};
    Object.keys(MAP_TECH_LABELS).forEach(id => {
      prevVals[id] = +(getEl<HTMLInputElement>(id)?.value || 0);
    });

    Object.keys(MAP_TECH_LABELS).forEach(id => {
      getEl<HTMLInputElement>(id)?.addEventListener('input', () => {
        const newVal = +(getEl<HTMLInputElement>(id)?.value || 0);
        if (newVal > prevVals[id]) showMapReminder(MAP_TECH_LABELS[id]);
        prevVals[id] = newVal;
      });
    });

    // Suppress toast during map sync and plan restore
    window.addEventListener('gc:map-update', () => { suppressToast = true; setTimeout(() => { suppressToast = false; }, 500); });
    window.addEventListener('gc:restore-plan', () => { suppressToast = true; setTimeout(() => { suppressToast = false; }, 3500); });

    // Sync map placements → simulator inputs
    const PLACED_LABELS: Record<string, string> = {
      solar:'Solar PV', wind:'Wind', geo:'Geothermal', hydroLow:'Hydro Low',
      hydroHigh:'Hydro High', tidal:'Tidal', biomass:'Biomass',
      liIon:'BESS', thermal:'Thermal', flywheel:'Flywheel', caes:'CAES',
    };
    const PLACED_COLORS: Record<string, string> = {
      solar:'#f0b429', wind:'#58a6ff', geo:'#bc8cff', hydroLow:'#39c8e8',
      hydroHigh:'#0099cc', tidal:'#00c8aa', biomass:'#7ee787',
      liIon:'#ff8c8c', thermal:'#ffb347', flywheel:'#da8fff', caes:'#84fab0',
    };
    const PLACED_CARD_IDS: Record<string, string> = {
      solar:'solar', wind:'wind', geo:'geo', hydroLow:'hydroL',
      hydroHigh:'hydroH', tidal:'tidal', biomass:'biomass',
      liIon:'bess', thermal:'thermal', flywheel:'flywheel', caes:'caes',
    };
    function updatePlacedUnits() {
      const panel = getEl('placedUnitsList');
      if (!panel) return;
      const counts = sharedState.techCounts;
      const entries = Object.entries(PLACED_LABELS)
        .map(([k, label]) => ({ k, label, n: counts[k] || 0 }))
        .filter(e => e.n > 0);
      if (entries.length === 0) {
        panel.innerHTML = '<div style="font-size:11px;color:var(--text-muted);font-family:var(--mono)">No units placed yet</div>';
        return;
      }
      panel.innerHTML = entries.map(({ k, label, n }) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">
          <span style="display:flex;align-items:center;gap:6px;font-size:12px">
            <span style="width:7px;height:7px;border-radius:50%;background:${PLACED_COLORS[k]};flex-shrink:0;display:inline-block"></span>
            ${label}
            ${PLACED_CARD_IDS[k] ? `<button class="gc-card-btn" onclick="window.openCardModal('${PLACED_CARD_IDS[k]}')" title="View ${label} card">&#x1F3B4;</button>` : ''}
          </span>
          <span style="font-family:var(--mono);font-size:12px;font-weight:600;color:var(--text)">${n}</span>
        </div>`
      ).join('') + '<div style="border-bottom:none"></div>';
    }

    window.addEventListener('gc:map-update', () => {
      const counts = sharedState.techCounts;
      Object.entries(MAP_TECH_TO_SIM).forEach(([mapTech, simId]) => {
        const el = getEl<HTMLInputElement>(simId);
        if (el && el.type === 'number') {
          el.value = String(counts[mapTech] || 0);
        }
      });
      const cablingEl = getEl<HTMLInputElement>('cabling');
      if (cablingEl) {
        const mapMin = Math.round(sharedState.totalMapCableFt);
        cablingEl.min = String(mapMin);
        cablingEl.value = String(mapMin);
      }
      updatePlacedUnits();
      render();
    });

    // Show additional content only after all 4 data cards are filled
    const requiredDataCards = ['demandPattern', 'budgetTier', 'workforce', 'envConstraints'];
    
    const checkAllCardsFilled = () => {
      return requiredDataCards.every(id => {
        const el = getEl<HTMLSelectElement>(id);
        return el && el.value !== '';
      });
    };

    const hasAnyUnits = () =>
      ['solar','wind','geo','hydroLow','hydroHigh','tidalStd','biomass','liIon','thermal','flywheel','caes']
        .some(id => +(getEl<HTMLInputElement>(id)?.value || 0) > 0);

    const revealContent = () => {
      if (!contentRevealed && (checkAllCardsFilled() || hasAnyUnits())) {
        const sidebar = getEl('additionalSidebar');
        const content = getEl('additionalContent');
        if (sidebar) sidebar.style.display = 'flex';
        if (content) content.style.display = 'block';
        contentRevealed = true;
        render();
      }
    };

    requiredDataCards.forEach(id => {
      const el = getEl<HTMLSelectElement>(id);
      if (el) el.addEventListener('change', revealContent);
    });

    document.querySelectorAll<HTMLInputElement>('.e-qty-input').forEach(el => {
      el.addEventListener('input', revealContent);
    });

    getEl('simPrintBtn')?.addEventListener('click', () => window.print());
    getEl('simExportBtn')?.addEventListener('click', exportCSV);
    getEl('simResetBtn')?.addEventListener('click', resetAll);

    // Restore plan from shared URL
    window.addEventListener('gc:restore-plan', (e: Event) => {
      const { sim, bessHours } = (e as CustomEvent<{ sim?: Record<string, string | number>; bessHours?: number[] }>).detail;
      if (!sim) return;
      const numIds = ['solar','wind','geo','hydroLow','hydroHigh','tidalStd','biomass',
                      'liIon','thermal','flywheel','caes','hydrogen','v2g','scada','cabling','wSolar','wElec','wEng'];
      numIds.forEach(id => {
        const el = getEl<HTMLInputElement>(id);
        if (el && sim[id] !== undefined) el.value = String(sim[id]);
      });
      const selectIds = ['windBuffer','demandPattern','budgetTier','workforce','envConstraints','pivotCard'];
      selectIds.forEach(id => {
        const el = getEl<HTMLSelectElement>(id);
        if (el && sim[id] !== undefined) el.value = String(sim[id]);
      });
      if (bessHours) {
        for (let i = 0; i < 24; i++) {
          const btn = getEl<HTMLElement>(`hourBtn-${i}`);
          if (btn) btn.classList.toggle('active', bessHours.includes(i));
        }
      }
      revealContent();
      render();
    });

    // Toggle expense breakdown
    const spentToggle = getEl('spentToggle');
    const spentBreakdown = getEl('spentBreakdown');
    if (spentToggle && spentBreakdown) {
      spentToggle.addEventListener('click', () => {
        const arrow = spentToggle.querySelector('.e-metric-toggle-arrow');
        if (arrow) arrow.classList.toggle('expanded');
        spentBreakdown.classList.toggle('expanded');
      });
    }

    // Toggle budget breakdown
    const budgetToggle = getEl('budgetToggle');
    const budgetBreakdown = getEl('budgetBreakdown');
    if (budgetToggle && budgetBreakdown) {
      budgetToggle.addEventListener('click', () => {
        const arrow = budgetToggle.querySelector('.e-metric-toggle-arrow');
        if (arrow) arrow.classList.toggle('expanded');
        budgetBreakdown.classList.toggle('expanded');
      });
    }

    // Toggle battery discharge dropdown
    const batteryToggle = getEl('batteryToggle');
    const batteryDropdownContent = getEl('batteryDropdownContent');
    if (batteryToggle && batteryDropdownContent) {
      batteryToggle.addEventListener('click', () => {
        const arrow = batteryToggle.querySelector('.e-metric-toggle-arrow');
        if (arrow) arrow.classList.toggle('expanded');
        batteryDropdownContent.style.display = batteryDropdownContent.style.display === 'none' ? 'block' : 'none';
      });
    }

    render();
  }

  return <div ref={containerRef} style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }} />;
}
