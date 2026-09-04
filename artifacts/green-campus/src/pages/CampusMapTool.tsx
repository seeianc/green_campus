import { useEffect, useRef } from "react";
import { sharedState, emitMapUpdate, MAP_TECH_TO_SIM } from "../shared";

const BASE_URL = import.meta.env.BASE_URL;

export default function CampusMapTool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      .map-tool-root {
        --bg: #0d1117;
        --surface: #161b22;
        --surface2: #1c2330;
        --border: #30363d;
        --text: #e6edf3;
        --muted: #7d8590;
        --accent: #3fb950;
        --accent2: #58a6ff;
        --warn: #d29922;
        --danger: #f85149;
        --solar: #f0b429;
        --wind: #58a6ff;
        --geo: #bc8cff;
        --hydro: #39c8e8;
        --tidal: #00c8aa;
        --biomass: #7ee787;
        --bess: #ff8c8c;
        --cable: #ff6e40;
        --substation: #ffd700;
        font-family: 'Space Grotesk', sans-serif;
        background: var(--bg);
        color: var(--text);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .map-tool-header {
        height: 52px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 16px;
        flex-shrink: 0;
        z-index: 100;
      }
      .map-tool-header h1 { font-size: 14px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--accent); margin: 0; }
      .map-tabs { display: flex; gap: 4px; margin-left: 8px; }
      .map-tab {
        padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;
        cursor: pointer; border: 1px solid var(--border); background: transparent;
        color: var(--muted); transition: all .15s;
      }
      .map-tab:hover { color: var(--text); border-color: var(--muted); }
      .map-tab.active { background: var(--accent); color: #000; border-color: var(--accent); }
      .map-header-stats { margin-left: auto; display: flex; gap: 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
      .map-stat { color: var(--muted); }
      .map-stat span { color: var(--text); font-weight: 500; }
      .map-stat.warn span { color: var(--warn); }
      .map-stat.ok span { color: var(--accent); }
      .map-stat.err span { color: var(--danger); }
      .map-clear-btn {
        padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600;
        cursor: pointer; border: 1px solid var(--danger); background: transparent;
        color: var(--danger); transition: all .15s; font-family: 'Space Grotesk',sans-serif;
      }
      .map-clear-btn:hover { background: var(--danger); color: #fff; }

      .map-main { display: flex; flex: 1; overflow: hidden; min-height: 0; }

      .map-sidebar {
        width: 220px;
        flex-shrink: 0;
        background: var(--surface);
        border-right: 1px solid var(--border);
        overflow-y: auto;
        padding: 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .map-sidebar-section { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--accent); padding: 6px 4px 4px; border-bottom: 1px solid var(--border); margin-top: 4px; }
      .map-tech-wrap { display: flex; align-items: center; gap: 4px; }
      .map-tech-btn {
        display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 5px;
        cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
        color: var(--text); font-family: 'Space Grotesk',sans-serif; font-size: 12px;
        font-weight: 500; transition: all .15s; text-align: left; flex: 1; min-width: 0;
      }
      .map-card-float { flex-shrink: 0; }
      .map-tech-btn:hover { border-color: var(--accent2); background: #1f2a38; }
      .map-tech-btn.active { border-color: currentColor; }
      .map-tech-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
      .map-tech-meta { font-size: 10px; color: var(--muted); margin-top: 2px; font-family: 'JetBrains Mono',monospace; }
      .map-tech-btn.active .map-tech-meta { color: inherit; }

      .map-mode-row { display: flex; gap: 6px; }
      .map-mode-btn {
        flex: 1; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
        cursor: pointer; border: 1px solid var(--border); background: transparent;
        color: var(--muted); transition: all .15s; font-family: 'Space Grotesk',sans-serif;
        text-align: center;
      }
      .map-mode-btn.active { background: var(--accent2); color: #000; border-color: var(--accent2); }

      .map-counts { padding: 8px; background: var(--surface2); border-radius: 5px; border: 1px solid var(--border); }
      .map-count-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; }
      .map-count-label { color: var(--muted); }
      .map-count-val { font-family: 'JetBrains Mono',monospace; font-weight: 600; color: var(--accent); }


      .map-area {
        position: relative;
        flex: 1;
        overflow: hidden;
        min-height: 0;
      }
      .map-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        background: #0a1628;
      }
      .map-pin {
        position: absolute;
        z-index: 20;
        pointer-events: auto;
      }
      .map-pin.bottom-left  { bottom: 12px; left: 12px; }
      .map-pin.bottom-right { bottom: 12px; right: 12px; }
      .map-canvas-wrap {
        position: relative;
        display: inline-block;
        cursor: crosshair;
      }
      .map-canvas-wrap canvas { display: block; }
      .map-canvas-wrap.erase-mode { cursor: pointer; }

      .map-tooltip {
        position: fixed; background: var(--surface); border: 1px solid var(--border);
        padding: 6px 10px; border-radius: 5px; font-size: 11px; pointer-events: none;
        z-index: 999; max-width: 220px; line-height: 1.5;
        font-family: 'JetBrains Mono',monospace;
      }
      .map-tooltip.hidden { display: none; }

      .map-info-panel {
        background: rgba(22,27,34,.95); border: 1px solid var(--border);
        padding: 10px 12px; border-radius: 6px; font-size: 10px;
        font-family: 'JetBrains Mono',monospace; pointer-events: none; min-width: 160px;
      }
      .map-info-row { display: flex; justify-content: space-between; gap: 12px; padding: 1px 0; }
      .map-info-key { color: var(--muted); }
      .map-info-val { color: var(--text); }
      .map-info-val.ok { color: var(--accent); }
      .map-info-val.err { color: var(--danger); }

      .map-legend { padding: 6px; background: var(--surface2); border-radius: 5px; border: 1px solid var(--border); }
      .map-legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--muted); padding: 1px 0; }
      .map-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

      .map-help-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
        background: var(--surface2); border: 1px solid var(--muted); color: var(--muted);
        font-size: 9px; font-weight: 700; cursor: help; line-height: 1; padding: 0;
        font-family: 'JetBrains Mono', monospace; margin-left: 4px; pointer-events: auto;
      }
      .map-help-btn:hover, .map-help-btn.active { background: var(--accent2); border-color: var(--accent2); color: #000; }

      .map-help-popover {
        position: fixed; z-index: 1000; max-width: 260px;
        background: var(--surface); border: 1px solid var(--accent2); border-radius: 6px;
        padding: 10px 26px 10px 12px; font-size: 11px; line-height: 1.5; color: var(--text);
        box-shadow: 0 8px 24px rgba(0,0,0,.5); font-family: 'Space Grotesk', sans-serif;
      }
      .map-help-popover.hidden { display: none; }
      .map-help-popover h4 { margin: 0 0 6px; font-size: 11px; color: var(--accent2); text-transform: uppercase; letter-spacing: .04em; font-weight: 700; }
      .map-help-popover p { margin: 0 0 6px; }
      .map-help-popover p:last-child { margin-bottom: 0; }
      .map-help-close {
        position: absolute; top: 6px; right: 8px; cursor: pointer; color: var(--muted);
        font-size: 12px; line-height: 1;
      }
      .map-help-close:hover { color: var(--text); }

      /* Map Selection Screen */
      .map-sel-screen { height: 100%; display: flex; flex-direction: column; overflow-y: auto; background: var(--bg); }
      .map-sel-header { padding: 36px 40px 24px; border-bottom: 1px solid var(--border); background: var(--surface); }
      .map-sel-header h2 { font-size: 18px; font-weight: 600; color: var(--accent); margin: 0 0 6px; letter-spacing: 0.06em; text-transform: uppercase; }
      .map-sel-header p { font-size: 13px; color: var(--muted); margin: 0; }
      .map-sel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 32px 40px; }
      .map-sel-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.15s; }
      .map-sel-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
      .map-sel-card img { width: 100%; height: 170px; object-fit: cover; object-position: center; display: block; border-bottom: 1px solid var(--border); }
      .map-sel-card-info { padding: 14px 16px; }
      .map-sel-card-name { font-size: 13px; font-weight: 600; color: var(--text); margin: 0 0 4px; }
      .map-sel-card-desc { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; margin: 0 0 10px; }
      .map-sel-card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
      .map-sel-tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; border: 1px solid; font-weight: 600; }
      .map-back-btn { padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted); transition: all .15s; font-family: 'Space Grotesk',sans-serif; }
      .map-back-btn:hover { color: var(--text); border-color: var(--muted); }

      /* ── Light theme overrides ──────────────────────────────────── */
      [data-theme="light"] .map-tool-root {
        --bg: #f5f4f0;
        --surface: #ffffff;
        --surface2: #ede9e0;
        --border: #d0cdc4;
        --text: #1a1917;
        --muted: #6b6960;
        --accent: #2a6e4e;
        --accent2: #1a5fb4;
        --warn: #c45c1a;
        --danger: #b83232;
      }
      [data-theme="light"] .map-tool-header { background: #ffffff; }
      [data-theme="light"] .map-container { background: #c8d8e8; }
      [data-theme="light"] .map-tech-btn:hover { background: #e8f2ec !important; }
      [data-theme="light"] .map-info-panel { background: rgba(245,244,240,.95); }
      [data-theme="light"] .map-tab.active { color: #fff; }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
      <div class="map-tool-root" id="mapToolRoot">

        <!-- Map Selection Screen -->
        <div class="map-sel-screen" id="mapSelScreen">
          <div class="map-sel-header">
            <h2>Select a Campus</h2>
            <p>Choose a school site to begin placing your renewable energy infrastructure</p>
          </div>
          <div class="map-sel-grid" id="mapSelGrid"></div>
        </div>

        <!-- Tool Screen (shown after map selection) -->
        <div id="mapToolScreen" style="display:none;flex-direction:column;height:100%;min-height:0;">
        <div class="map-tool-header">
          <button class="map-back-btn" id="mapBackBtn">← Maps</button>
          <h1 id="mapToolTitle" style="margin-left:8px">⚡ Map Placer</h1>
          <div class="map-header-stats">
            <div class="map-stat" id="statPower">Power<button type="button" class="map-help-btn" data-help="power">?</button>: <span id="valPower">0 kW</span></div>
            <div class="map-stat" id="statStorage">Storage<button type="button" class="map-help-btn" data-help="storage">?</button>: <span id="valStorage">0 kWh</span></div>
            <div class="map-stat" id="statCable">Cable<button type="button" class="map-help-btn" data-help="cable">?</button>: <span id="valCable">0 ft</span></div>
            <div class="map-stat" id="statBudget">Budget<button type="button" class="map-help-btn" data-help="budget">?</button>: <span id="valBudget">$0</span></div>
            <div class="map-stat" id="statIsland">Island<button type="button" class="map-help-btn" data-help="island">?</button>: <span id="valIsland">0 h</span></div>
            <div class="map-stat" id="statForest">Forest<button type="button" class="map-help-btn" data-help="forest">?</button>: <span id="valForest">—</span></div>
          </div>
          <button class="map-clear-btn" id="mapClearBtn">✕ Clear Map</button>
        </div>

        <div class="map-main">
          <div class="map-sidebar">
            <div class="map-sidebar-section">Mode</div>
            <div class="map-mode-row">
              <button class="map-mode-btn active" id="modPlace">Place</button>
              <button class="map-mode-btn" id="modErase">Erase</button>
              <button class="map-mode-btn" id="modMove">Move</button>
              <button class="map-mode-btn" id="modPan">Pan</button>
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;line-height:1.4">
              Shift+click to rotate buildings &amp; panels. Move mode: drag any unit to reposition it.
            </div>

            <div class="map-sidebar-section">Generation</div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-solar" style="color:#f0b429">
              <span class="map-tech-dot" style="background:#f0b429"></span>
              <div><div>Solar PV</div><div class="map-tech-meta">500kW · $1M</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('solar')" title="View Solar PV card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-wind" style="color:#58a6ff">
              <span class="map-tech-dot" style="background:#58a6ff"></span>
              <div><div>Wind</div><div class="map-tech-meta">3000kW · $4.5M · 250ft buffer</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('wind')" title="View Wind Turbine card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-geo" style="color:#bc8cff">
              <span class="map-tech-dot" style="background:#bc8cff"></span>
              <div><div>Geothermal</div><div class="map-tech-meta">2000kW · $8M</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('geo')" title="View Geothermal card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-hydroL" style="color:#39c8e8">
              <span class="map-tech-dot" style="background:#39c8e8"></span>
              <div><div>Hydro (Low)</div><div class="map-tech-meta">500kW · $1M · water</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('hydroL')" title="View Hydro Low Head card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-hydroH" style="color:#0099cc">
              <span class="map-tech-dot" style="background:#0099cc"></span>
              <div><div>Hydro (High)</div><div class="map-tech-meta">2000kW · $4M · water</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('hydroH')" title="View Hydro High Head card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-tidal" style="color:#00c8aa">
              <span class="map-tech-dot" style="background:#00c8aa"></span>
              <div><div>Tidal</div><div class="map-tech-meta">500kW · $1.5M · coast</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('tidal')" title="View Tidal card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-biomass" style="color:#7ee787">
              <span class="map-tech-dot" style="background:#7ee787"></span>
              <div><div>Biomass</div><div class="map-tech-meta">1000kW · $3.5M</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('biomass')" title="View Biomass card">&#x1F3B4;</button></div>

            <div class="map-sidebar-section">Storage</div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-bess" style="color:#ff8c8c">
              <span class="map-tech-dot" style="background:#ff8c8c"></span>
              <div><div>Lithium Ion</div><div class="map-tech-meta">1000kWh · $500K</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('bess')" title="View Lithium Ion card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-thermal" style="color:#ffb347">
              <span class="map-tech-dot" style="background:#ffb347"></span>
              <div><div>Thermal</div><div class="map-tech-meta">2500kWh · $1M</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('thermal')" title="View Thermal Storage card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-flywheel" style="color:#da8fff">
              <span class="map-tech-dot" style="background:#da8fff"></span>
              <div><div>Flywheel</div><div class="map-tech-meta">1000kWh · $300K</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('flywheel')" title="View Mechanical Flywheel card">&#x1F3B4;</button></div>
            <div class="map-tech-wrap"><button class="map-tech-btn" id="btn-caes" style="color:#84fab0">
              <span class="map-tech-dot" style="background:#84fab0"></span>
              <div><div>CAES</div><div class="map-tech-meta">5000kWh · $2M</div></div>
            </button><button class="gc-card-btn map-card-float" onclick="window.openCardModal('caes')" title="View CAES card">&#x1F3B4;</button></div>

            <div class="map-sidebar-section">Placements<button type="button" class="map-help-btn" data-help="placements">?</button></div>
            <div class="map-counts" id="countsPanel">
              <div style="font-size:10px;color:var(--muted);text-align:center;padding:4px">No placements yet</div>
            </div>

            <div class="map-sidebar-section">Legend</div>
            <div class="map-legend">
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#ff6e4080;border:1px solid #ff6e40"></div>Cable line</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#ffd70060;border:1px solid #ffd700"></div>Substation</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#2ea04330;border:1px dashed #7ee787"></div>Forest zone</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#00c8aa25;border:1px solid #00c8aa99"></div>Tidal zone</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#d2992215;border:1px dashed #d2992250"></div>Steep terrain</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#dca85020;border:1px solid #dca85099"></div>Building</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#a0a0c025;border:1px solid #a0a0c060"></div>Parking</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#a0dc5015;border:1px dashed #a0dc5050"></div>Open field</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#f8514940;border:1px dashed #f85149"></div>No-Build zone</div>
              <div class="map-legend-item"><div class="map-legend-dot" style="background:#58a6ff30;border:1px dashed #58a6ff"></div>Wind buffer</div>
            </div>

          </div>

          <div class="map-area">
            <div class="map-container" id="mapContainer">
              <div class="map-canvas-wrap" id="canvasWrap">
                <canvas id="bgCanvas"></canvas>
                <canvas id="overlayCanvas" style="position:absolute;top:0;left:0"></canvas>
              </div>
            </div>
            <div class="map-pin bottom-left" style="display:flex;gap:4px">
              <button id="zoomIn" style="width:28px;height:28px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#e6edf3;font-size:16px;font-weight:700;cursor:pointer;line-height:1;padding:0">+</button>
              <button id="zoomReset" style="height:28px;padding:0 8px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#7d8590;font-size:10px;font-weight:600;cursor:pointer;font-family:'Space Grotesk',sans-serif">100%</button>
              <button id="zoomOut" style="width:28px;height:28px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#e6edf3;font-size:16px;font-weight:700;cursor:pointer;line-height:1;padding:0">−</button>
            </div>
            <div class="map-pin bottom-right map-info-panel">
              <div class="map-info-row"><span class="map-info-key">Cursor<button type="button" class="map-help-btn" data-help="infoCursor">?</button></span><span class="map-info-val" id="infoCursor">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Zone<button type="button" class="map-help-btn" data-help="infoZone">?</button></span><span class="map-info-val" id="infoZone">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Distance to sub<button type="button" class="map-help-btn" data-help="infoDist">?</button></span><span class="map-info-val" id="infoDist">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Cable cost<button type="button" class="map-help-btn" data-help="infoCableCost">?</button></span><span class="map-info-val" id="infoCableCost">–</span></div>
            </div>
          </div>
        </div>

        <div class="map-tooltip hidden" id="mapTooltip"></div>
        <div class="map-help-popover hidden" id="mapHelpPopover"></div>
        </div><!-- /mapToolScreen -->
      </div>
    `;

    // Initialize the map tool logic
    try {
      initMapTool();
    } catch (e) {
      console.error('❌ initMapTool crashed:', e);
    }

    return () => {
      style.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }} />;
}

function initMapTool() {
  const TECHS: Record<string, { name: string; color: string; kw: number; cost: number; storage: number; storageKwh: number; symbol: string; size: number; rule: string; bufferFt: number; squareFootprint: number; placedRadiusFt: number; placedWidthFt?: number; placedHeightFt?: number; constructionWidthFt?: number; constructionHeightFt?: number }> = {
    solar:    { name:'Solar PV',     color:'#f0b429', kw:500,  cost:1000000,  storage:0, storageKwh:0,    symbol:'☀', size:2.25, rule:'land',  bufferFt:0,   squareFootprint:50000,  placedRadiusFt:75,  placedWidthFt:250, placedHeightFt:175 },
    wind:     { name:'Wind',         color:'#58a6ff', kw:3000, cost:4500000,  storage:0, storageKwh:0,    symbol:'🌬', size:1,    rule:'any',   bufferFt:250, squareFootprint:1000,   placedRadiusFt:50  },
    geo:      { name:'Geothermal',   color:'#bc8cff', kw:2000, cost:8000000,  storage:0, storageKwh:0,    symbol:'⬡', size:3.6,  rule:'land',  bufferFt:0,   squareFootprint:5000,   placedRadiusFt:40,  placedWidthFt:100, placedHeightFt:50, constructionWidthFt:400, constructionHeightFt:325 },
    hydroL:   { name:'Hydro Low',    color:'#39c8e8', kw:500,  cost:1000000,  storage:0, storageKwh:0,    symbol:'〜', size:1,    rule:'water', bufferFt:0,   squareFootprint:10000,  placedRadiusFt:25  },
    hydroH:   { name:'Hydro High',   color:'#0099cc', kw:2000, cost:4000000,  storage:0, storageKwh:0,    symbol:'〜', size:1,    rule:'water', bufferFt:0,   squareFootprint:10000,  placedRadiusFt:40  },
    tidal:    { name:'Tidal',        color:'#00c8aa', kw:500,  cost:1500000,  storage:0, storageKwh:0,    symbol:'⊕', size:1,    rule:'coast', bufferFt:0,   squareFootprint:10000,  placedRadiusFt:20  },
    biomass:  { name:'Biomass',      color:'#7ee787', kw:1000, cost:3500000,  storage:0, storageKwh:0,    symbol:'🌿', size:3.6,  rule:'road',  bufferFt:0,   squareFootprint:130000, placedRadiusFt:75,  placedWidthFt:150, placedHeightFt:100 },
    bess:     { name:'Lithium Ion',   color:'#ff8c8c', kw:0,    cost:500000,   storage:1, storageKwh:1000, symbol:'▣', size:0.5,  rule:'land',  bufferFt:0,   squareFootprint:5000,   placedRadiusFt:25  },
    thermal:  { name:'Thermal',      color:'#ffb347', kw:0,    cost:1000000,  storage:1, storageKwh:2500, symbol:'◈', size:1,    rule:'land',  bufferFt:0,   squareFootprint:10000,  placedRadiusFt:25  },
    flywheel: { name:'Flywheel',     color:'#da8fff', kw:0,    cost:300000,   storage:1, storageKwh:1000, symbol:'⊙', size:1,    rule:'land',  bufferFt:0,   squareFootprint:10000,  placedRadiusFt:25  },
    caes:     { name:'CAES',         color:'#84fab0', kw:0,    cost:2000000,  storage:1, storageKwh:5000, symbol:'◎', size:2,    rule:'land',  bufferFt:0,   squareFootprint:20000,  placedRadiusFt:25  },
  };

  type Feature = {
    type: string;
    rect?: number[];
    points?: number[][];
    label?: string;
    density?: string;
    cx?: number;
    cy?: number;
    r?: number;
  };

  type MapDef = {
    name: string;
    desc: string;
    width: number;
    height: number;
    scale: number; // map scale denominator (e.g. 3048 means 1:3048, so 1 cm = 100 ft)
    substationPx: [number, number];
    features: Feature[];
  };

  const MAPS: Record<string, MapDef> = {
    RLS: {
      name: 'RLS — Inland School',
      desc: 'Inland campus, forested hillside, no water access',
      width: 900, height: 1274, scale: 893,
      substationPx: [353, 525],
      features: [
        { type:'forest', points:[[653,533],[559,508],[457,519],[501,594],[432,612],[409,686],[339,684],[275,790],[333,1243],[778,1183],[773,1003],[749,1006],[697,677],[559,690],[543,590],[668,578]] },
        { type:'building', points:[[362,355],[402,352],[409,329],[433,329],[447,350],[513,358],[519,410],[490,404],[435,409],[460,500],[324,539],[323,488],[350,478],[344,425],[360,419]] },
        { type:'field', points:[[198,322],[570,304],[559,159],[159,187]] },
        { type:'field', points:[[520,334],[586,513],[653,494],[586,320]] },        
        { type:'parking', points:[[215,347],[444,316],[390,338],[293,351],[316,536],[274,546],[235,466]] },
        { type:'parking', points:[[326,596],[399,615],[396,675],[329,672]] },
        { type:'road', points:[[263,737],[269,764],[318,708],[305,581],[377,575],[432,585],[472,561],[435,513],[306,548],[272,554],[294,705]] },
        { type:'boundary', points:[[147,187],[612,126],[671,573],[549,588],[558,686],[704,678],[749,1003],[776,1003],[779,1181],[339,1238]] },
      ]
    },
    EDS: {
      name: 'EDS — On Penobscot Bay',
      desc: 'Coastal campus on Penobscot Bay',
      width: 950, height: 671, scale: 1274,
      substationPx: [440, 500],
      features: [
        { type:'ocean', points:[[0,0],[600,0],[400,50],[300,90],[260,175],[245,280],[240,381],[0,381]] },
        { type:'water', points:[[245,208],[260,285],[245,381],[252,381],[267,302],[256,218]] },
        { type:'forest', points:[[451,621],[537,566],[546,533],[517,490],[507,465],[513,449],[260,381],[267,238],[300,133],[353,70],[680,358],[598,643]] },
        { type:'building', points:[[334,432],[449,449],[440,492],[357,479],[350,494],[324,483]] },
        { type:'field', points:[[462,446],[503,453],[501,482],[541,531],[532,561],[444,617],[394,608],[410,502],[449,503]] },
        { type:'parking', points:[[313,496],[388,513],[383,607],[293,595]] },
        { type:'road', points:[[7,548],[641,663],[588,668],[4,564]] },
        { type:'boundary', points:[[272,225],[264,223],[220,375],[304,399],[250,593],[601,650],[683,356],[354,70],[296,126]] },
      ]
    },
    CES: {
      name: 'CES — River / Tidal',
      desc: 'Tidal River nearby = high hydro potential',
      width: 950, height: 671, scale: 1677,
      substationPx: [196, 363],
      features: [
        { type:'forest', points:[[707,263],[765,251],[804,300],[780,317],[784,343],[702,363],[685,326],[522,377],[682,320]] },
        { type:'field', points:[[228,416],[217,307],[265,320],[344,293],[358,255],[416,240],[502,281],[527,300],[699,274],[677,318],[425,401],[411,376],[347,393],[339,408],[265,430]] },
        { type:'field', points:[[479,217],[526,259],[609,242],[649,273],[762,250],[690,159]] },
        { type:'building', points:[[139,335],[160,341],[158,360],[195,367],[192,383],[127,375],[129,378]] },
        { type:'parking', points:[[132,379],[192,386],[184,409],[124,402]] },
        { type:'road', points:[[86,404],[170,419],[247,436],[291,454],[349,476],[607,403],[610,413],[360,482],[344,486],[200,434],[86,416]] },
        { type:'road', points:[[669,0],[679,1],[682,89],[707,164],[827,300],[862,406],[869,497],[840,616],[833,611],[862,449],[822,302],[693,162]] },
        { type:'tidal_zone', points:[[877,344],[894,352],[949,401],[932,434],[934,470],[949,670],[906,667],[906,595],[864,645],[863,665],[844,668],[868,601],[893,571],[885,531]] },
        { type:'water', points:[[887,342],[943,369],[936,313],[893,246],[790,189],[748,85],[749,2],[693,2],[700,117],[714,158]] },
        { type:'boundary', points:[[97,332],[117,404],[201,416],[277,443],[363,423],[352,398],[410,382],[425,449],[434,442],[422,405],[691,339],[698,376],[788,347],[783,320],[787,313],[808,301],[690,155],[315,254],[317,263]] },
      ]
    },
    LCS: {
      name: 'LCS — Lakeside Forest',
      desc: 'Heavily forested campus with field and nearby pond',
      width: 950, height: 671, scale: 2201,
      substationPx: [660, 145],
      features: [
        { type:'forest', points:[[171,300],[316,213],[339,259],[396,268],[426,255],[402,192],[499,169],[491,114],[546,99],[556,136],[524,149],[537,180],[570,173],[593,237],[581,316],[612,322],[637,375],[750,349],[775,429],[660,445],[506,490],[414,534],[403,576],[275,621],[254,617]] },
        { type:'field', points:[[585,170],[687,141],[714,240],[731,248],[742,338],[641,367],[612,313],[592,286]] },
        { type:'building', points:[[585,122],[602,162],[682,135],[674,119],[649,112]] },
        { type:'parking', points:[[695,88],[672,48],[643,60],[656,94]] },
        { type:'parking', points:[[562,124],[579,125],[596,158],[569,163]] },
        { type:'road', points:[[551,92],[558,91],[563,89],[570,105],[647,81],[649,97],[570,118],[556,114]] },
        { type:'boundary', points:[[170,298],[253,617],[267,613],[274,621],[389,586],[387,576],[399,574],[414,533],[480,519],[475,506],[508,498],[507,488],[655,451],[658,445],[774,427],[693,33],[418,143]] },
      ]
    },
  
    STG: {
      name: 'STG — Lakeside Coastal Campus',
      desc: 'Hillside campus beside a marsh and tidal zone',
      width: 900, height: 1274, scale: 1240,
      substationPx: [565, 870],
      features: [
        { type:'road', points:[[505,948],[534,952],[523,1011],[550,1087],[544,1163],[525,1154]] },
        { type:'tidal_zone', points:[[297,1060],[462,1216],[466,1270],[366,1270]] },
        { type:'parking', points:[[451,780],[508,759],[550,913],[532,945],[499,927]] },
        { type:'building', points:[[534,734],[612,725],[671,859],[665,940],[583,922]] },
        { type:'field', points:[[508,440],[517,512],[679,515],[694,410]] },
        { type:'field', points:[[472,657],[567,639],[595,657],[594,705],[481,734],[451,699]] },
        { type:'forest', points:[[469,734],[418,798],[132,277],[164,234],[354,286],[408,376],[435,349],[411,255],[400,118],[460,61],[760,373],[701,401],[511,430],[484,460],[517,518],[685,524],[703,421],[767,385],[841,463],[609,674],[582,632],[481,644],[447,686]] },
        { type:'water', points:[[296,987],[342,951],[321,862],[159,648],[138,484],[2,301],[2,454],[68,654],[162,713]] },
        { type:'water', points:[[10,247],[47,252],[170,196],[327,222],[382,189],[353,85],[388,43],[393,4],[68,3],[-1,84]] },
        { type:'boundary', points:[[115,268],[152,246],[149,228],[182,208],[246,234],[275,223],[317,234],[326,268],[372,281],[406,368],[423,344],[405,266],[390,129],[362,76],[394,55],[426,91],[454,51],[469,46],[850,464],[613,675],[683,855],[683,951],[704,969],[700,1002],[650,1014],[634,990],[538,1019],[574,1114],[558,1166],[495,1147],[520,1106],[481,1017],[480,919]] },
      ]
    },
  };

  // Calculate bounding box (rect) for all features from their points
  Object.values(MAPS).forEach(map => {
    map.features.forEach(feature => {
      if (feature.points && feature.points.length > 0 && !feature.rect) {
        const xs = feature.points.map(p => p[0]);
        const ys = feature.points.map(p => p[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        feature.rect = [minX, minY, maxX - minX, maxY - minY];
      }
    });
  });

  const HELP: Record<string, { title: string; body: string[] }> = {
    power: {
      title: 'Power (Actual Peak Supply)',
      body: [
        'Sum of output (kW) for every generation unit placed across all campus maps, compared against the campus peak-demand target.',
        'Placing more than the campus peak demand (default 3,000 kW, or the value set by an active pivot card) triggers a $500K utility interconnection upgrade fee — shown on the Budget stat.',
      ],
    },
    storage: {
      title: 'Storage',
      body: ["Total energy storage capacity (kWh) from every placed Lithium Ion, Thermal, Flywheel, and CAES unit. Storage doesn't add generation — it feeds directly into the Island stat's grid-down resilience calculation."],
    },
    cable: {
      title: 'Cable Length & Cost',
      body: [
        "Total length of the cable routes connecting your placements to the substation, costed at $500/ft ($50K per 100 ft).",
      ],
    },
    budget: {
      title: 'Budget',
      body: [
        'Equipment cost plus cable cost, plus a $500K utility upgrade fee once total power exceeds the campus peak-demand threshold.',
        'Turns red once spending exceeds the budget set by your selected Budget Tier data card.',
      ],
    },
    island: {
      title: 'Island Time (Grid-Down Resilience)',
      body: ["Hours the campus could run on stored energy alone if cut off from the grid: Storage (kWh) ÷ the campus's actual peak hourly demand (from the Simulator's 24-hour demand curve — defaults to 3,000 kW, but rises or falls with the Demand Pattern data card and any active pivot card like AI Learning Hub or SCADA).", 'This mirrors how real campuses and hospitals size backup power to survive a storm outage or grid failure.'],
    },
    forest: {
      title: 'Forest',
      body: [
        "Percent of the campus site that's forested, and — once you start placing equipment — what percent of that forest your placements' footprints actually clear.",
        'Clearing more than 25% of forested land is a violation once the Vernal Pool Protection environmental card is active (turns red past 25%, amber past 10%), mirroring a real habitat-clearing permit limit.',
      ],
    },
    placements: {
      title: 'Placements',
      body: ["Running tally of every unit placed on the currently-selected campus map, plus the combined cost across map."],
    },
    infoCursor: {
      title: 'Cursor Position',
      body: ["Your mouse position converted to real-world feet, using this specific campus map's calibrated scale (each map is scaled independently from its source survey, so the same pixel distance means a different number of feet on different maps)."],
    },
    infoZone: {
      title: 'Zone',
      body: ["The map feature under your cursor — water, forest, road, no-build, etc. Hover any area to see a tooltip explaining what can (or can't) be built there."],
    },
    infoDist: {
      title: 'Distance to Substation',
      body: ['Straight-line distance from the cursor (or the tech about to be placed) to the substation marker, in real feet — the same distance used to estimate cable cost below.'],
    },
    infoCableCost: {
      title: 'Cable Cost (Live Estimate)',
      body: ['What connecting a unit placed here would cost, at $500/ft of straight-line distance to the substation. Updates live as you move the cursor — actual routed cable cost may differ slightly since real routing follows a minimum-spanning tree across all your placements, not a straight line to each one.'],
    },
  };

  let activeHelpBtn: HTMLElement | null = null;

  function positionPopover(pop: HTMLElement, anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + popRect.width > window.innerWidth - 8) left = window.innerWidth - popRect.width - 8;
    if (left < 8) left = 8;
    if (top + popRect.height > window.innerHeight - 8) top = rect.top - popRect.height - 6;
    if (top < 8) top = 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function showHelp(key: string, anchor: HTMLElement) {
    const pop = getEl('mapHelpPopover');
    const info = HELP[key];
    if (!pop || !info) return;
    pop.innerHTML = `<span class="map-help-close">✕</span><h4>${info.title}</h4>` + info.body.map(p => `<p>${p}</p>`).join('');
    pop.classList.remove('hidden');
    positionPopover(pop, anchor);
    activeHelpBtn?.classList.remove('active');
    anchor.classList.add('active');
    activeHelpBtn = anchor;
  }

  function hideHelp() {
    getEl('mapHelpPopover')?.classList.add('hidden');
    activeHelpBtn?.classList.remove('active');
    activeHelpBtn = null;
  }

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const closeBtn = target.closest('.map-help-close');
    if (closeBtn) { e.stopPropagation(); hideHelp(); return; }
    const helpBtn = target.closest('.map-help-btn') as HTMLElement | null;
    const pop = getEl('mapHelpPopover');
    if (helpBtn) {
      e.stopPropagation();
      const key = helpBtn.dataset.help;
      if (!key) return;
      if (activeHelpBtn === helpBtn) hideHelp();
      else showHelp(key, helpBtn);
      return;
    }
    if (pop && !pop.classList.contains('hidden') && !pop.contains(target)) hideHelp();
  }, true);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideHelp();
  });

  const GRID = 18;
  let currentMap = 'EDS';
  let selectedTech = 'solar';
  let pendingRotation = 0;
  let mode = 'place';
  let mapScale = 1;
  let zoomLevel = 1.0;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5.0;
  type Placement = { tech: string; cx: number; cy: number; id: number; violations: string[]; rotation?: number };
  type Cable = { x1: number; y1: number; x2: number; y2: number };
  const placements: Record<string, Placement[]> = {};
  const cables: Record<string, Cable[]> = {};
  let cableStart: { x: number; y: number } | null = null;
  let mousePos = { x: 0, y: 0 };

  Object.keys(MAPS).forEach(id => { placements[id] = []; cables[id] = []; });

  // Preload satellite map images
  const mapImages: Record<string, HTMLImageElement> = {};
  Object.keys(MAPS).forEach(id => {
    const img = new Image();
    img.onload = () => { if (id === currentMap) drawAll(); };
    img.src = `${BASE_URL}maps/${id}.png`;
    mapImages[id] = img;
  });

  function getEl<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }

  // Cell offsets for techs with non-rectangular square footprints.
  const FOOTPRINT_CELLS: Record<string, [number, number][]> = {
    solar: [
      [0, 0], [1, 0], [2, 0],
      [0, 1], [1, 1],
    ],
    geo: [
      [1, 0],
      [0, 1], [1, 1], [2, 1],
      [0, 2], [1, 2], [2, 2], [3, 2],
      [0, 3], [1, 3], [2, 3],
      [1, 4], [2, 4],
    ],
    biomass: [
      [1, 0],
      [0, 1], [1, 1], [2, 1],
      [0, 2], [1, 2], [2, 2], [3, 2],
      [0, 3], [1, 3], [2, 3],
      [1, 4], [2, 4],
    ],
  };

  function getTechCellSpans(tech: string) {
    if (tech === 'wind') return { widthCells: 0, heightCells: 0 };
    if (tech in FOOTPRINT_CELLS) {
      const cells = FOOTPRINT_CELLS[tech];
      const maxX = Math.max(...cells.map(([x]) => x));
      const maxY = Math.max(...cells.map(([, y]) => y));
      return { widthCells: maxX + 1, heightCells: maxY + 1 };
    }
    const t = TECHS[tech];
    const widthCells = Math.max(1, Math.round(t.size));
    return { widthCells, heightCells: widthCells };
  }

  function snapToGridCell(x: number, y: number, tech: string) {
    const { widthCells, heightCells } = getTechCellSpans(tech);
    if (widthCells === 0 || heightCells === 0) {
      return {
        x: Math.round(x / GRID) * GRID,
        y: Math.round(y / GRID) * GRID,
      };
    }
    const gx = Math.floor(x / GRID);
    const gy = Math.floor(y / GRID);
    return {
      x: gx * GRID + (widthCells * GRID) / 2,
      y: gy * GRID + (heightCells * GRID) / 2,
    };
  }

  // Map selection screen — build cards
  const MAP_TAGS: Record<string, { label: string; color: string }[]> = {
    RLS: [{ label: 'Inland', color: '#7ee787' }, { label: 'Forest', color: '#2ea043' }, { label: 'Wind', color: '#58a6ff' }],
    EDS: [{ label: 'Coastal', color: '#39c8e8' }, { label: 'Tidal', color: '#00c8aa' }, { label: 'High Contour', color: '#d29922' }],
    CES: [{ label: 'River', color: '#39c8e8' }, { label: 'Hydro', color: '#0099cc' }, { label: 'Open Fields', color: '#7ee787' }],
    LCS: [{ label: 'Lakeside', color: '#58a6ff' }, { label: 'Forest', color: '#2ea043' }, { label: 'High Contour', color: '#d29922' }],
    STG: [{ label: 'Lakeside', color: '#58a6ff' }, { label: 'Hillside', color: '#d29922' }, { label: 'Hydro', color: '#0099cc' }],
  };
  const selGrid = getEl('mapSelGrid');
  if (selGrid) {
    Object.entries(MAPS).forEach(([id, m]) => {
      const card = document.createElement('div');
      card.className = 'map-sel-card';
      const tags = (MAP_TAGS[id] || []).map(t =>
        `<span class="map-sel-tag" style="color:${t.color};border-color:${t.color}40;background:${t.color}15">${t.label}</span>`
      ).join('');
      card.innerHTML = `
        <img src="${BASE_URL}maps/${id}.png" alt="${m.name}" />
        <div class="map-sel-card-info">
          <div class="map-sel-card-name">${m.name}</div>
          <div class="map-sel-card-desc">${m.desc}</div>
          <div class="map-sel-card-tags">${tags}</div>
        </div>`;
      card.addEventListener('click', () => {
        const selScreen = getEl('mapSelScreen');
        const toolScreen = getEl('mapToolScreen');
        if (selScreen) selScreen.style.display = 'none';
        if (toolScreen) toolScreen.style.display = 'flex';
        switchMap(id);
      });
      selGrid.appendChild(card);
    });
  }

  // Back to selection button
  getEl('mapBackBtn')?.addEventListener('click', () => {
    const selScreen = getEl('mapSelScreen');
    const toolScreen = getEl('mapToolScreen');
    if (selScreen) selScreen.style.display = 'flex';
    if (toolScreen) toolScreen.style.display = 'none';
  });

  // Mode buttons
  getEl('modPlace')?.addEventListener('click', () => setMode('place'));
  getEl('modErase')?.addEventListener('click', () => setMode('erase'));
  getEl('modMove')?.addEventListener('click',  () => setMode('move'));
  getEl('modPan')?.addEventListener('click',   () => setMode('pan'));
  getEl('mapClearBtn')?.addEventListener('click', clearAll);

  // Tech buttons
  Object.keys(TECHS).forEach(tech => {
    getEl(`btn-${tech}`)?.addEventListener('click', () => selectTech(tech));
  });

  function resizeCanvases() {
    const m = MAPS[currentMap];
    const container = getEl('mapContainer');
    const bg = getEl<HTMLCanvasElement>('bgCanvas');
    const ov = getEl<HTMLCanvasElement>('overlayCanvas');
    if (!bg || !ov) return;
    const cw = container ? container.clientWidth : m.width;
    const ch = container ? container.clientHeight : m.height;
    const aspect = m.width / m.height;
    let fitW = cw, fitH = Math.round(cw / aspect);
    if (fitH > ch) { fitH = ch; fitW = Math.round(fitH * aspect); }
    const w = Math.round(fitW * zoomLevel);
    const h = Math.round(fitH * zoomLevel);
    mapScale = w / m.width;
    bg.width = ov.width = w;
    bg.height = ov.height = h;
  }

  function switchMap(id: string) {
    currentMap = id;
    const titleEl = getEl('mapToolTitle');
    if (titleEl) titleEl.textContent = `⚡ ${MAPS[id].name}`;
    resizeCanvases();
    drawAll();
    updateUI();
  }

  function drawAll() {
    drawBackground();
    drawOverlay();
  }

  function drawBackground() {
    const canvas = getEl<HTMLCanvasElement>('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const m = MAPS[currentMap];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = mapImages[currentMap];
    const imgLoaded = img && img.complete && img.naturalWidth > 0;

    if (imgLoaded) {
      // Draw satellite image scaled to fill the canvas (no scale transform — image fills canvas directly)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      // Fallback: programmatic schematic map while image loads
      ctx.save();
      ctx.scale(mapScale, mapScale);
      ctx.fillStyle = '#1a2810';
      ctx.fillRect(0, 0, m.width, m.height);
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < m.width; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, m.height); ctx.stroke(); }
      for (let y = 0; y < m.height; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(m.width, y); ctx.stroke(); }
      m.features.forEach(f => drawFeature(ctx, f));
      ctx.restore();
    }

    // Everything from here uses map coordinates — apply scale
    ctx.save();
    ctx.scale(mapScale, mapScale);

    // Grid scale ruler
    ctx.font = 'bold 10px JetBrains Mono,monospace';
    ctx.fillStyle = imgLoaded ? 'rgba(255,255,255,0.7)' : '#ffffff30';
    ctx.strokeStyle = imgLoaded ? 'rgba(0,0,0,0.5)' : 'transparent';
    ctx.lineWidth = 2;
    for (let x = 0; x < m.width; x += GRID * 5) {
      const label = Math.round((x / GRID) * m.scale / 30.48) + 'ft';
      if (imgLoaded) ctx.strokeText(label, x + 2, 12);
      ctx.fillText(label, x + 2, 12);
    }

    // Zone overlays on top of satellite image
    if (imgLoaded) {
      // Water bodies — blue tint
      m.features.filter(f => f.type === 'water' || f.type === 'ocean').forEach(f => {
        ctx.fillStyle = f.type === 'ocean' ? 'rgba(20,70,140,0.08)' : 'rgba(30,100,160,0.10)';
        ctx.strokeStyle = f.type === 'ocean' ? 'rgba(30,100,200,0.3)' : 'rgba(58,150,200,0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(100,180,255,0.75)';
          ctx.font = 'italic 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f.label || (f.type === 'ocean' ? '🌊 OCEAN' : '💧 WATER'), cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
          if (f.label) {
            ctx.fillStyle = 'rgba(120,200,255,0.9)';
            ctx.font = 'italic 11px Space Grotesk,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(f.label, rx + rw / 2, ry + rh / 2);
            ctx.textAlign = 'left';
          }
        }
        ctx.setLineDash([]);
      });

      // Forest zones (supports both rect and polygon points)
      m.features.filter(f => f.type === 'forest').forEach(f => {
        ctx.fillStyle = 'rgba(46,160,67,0.18)';
        ctx.strokeStyle = 'rgba(126,231,135,0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(126,231,135,0.7)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌲 FOREST', cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(126,231,135,0.7)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌲 FOREST', rx + rw / 2, ry + rh / 2);
          ctx.textAlign = 'left';
        }
        ctx.setLineDash([]);
      });

      // Tidal zones
      m.features.filter(f => f.type === 'tidal_zone').forEach(f => {
        ctx.fillStyle = 'rgba(0,200,170,0.15)';
        ctx.strokeStyle = 'rgba(0,200,170,0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(0,200,170,0.85)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌊 TIDAL', cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(0,200,170,0.85)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌊 TIDAL ZONE', rx + rw / 2, ry + rh / 2);
          ctx.textAlign = 'left';
        }
        ctx.setLineDash([]);
      });

      // Contour zones — steep terrain
      m.features.filter(f => f.type === 'contour_zone').forEach(f => {
        ctx.fillStyle = 'rgba(210,153,34,0.07)';
        ctx.strokeStyle = 'rgba(210,153,34,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(210,153,34,0.6)';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⛰ STEEP TERRAIN', cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect!;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(210,153,34,0.6)';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⛰ STEEP TERRAIN', rx + rw / 2, ry + 14);
          ctx.textAlign = 'left';
        }
        ctx.setLineDash([]);
      });

      // Buildings
      m.features.filter(f => f.type === 'building').forEach(f => {
        ctx.fillStyle = 'rgba(200,160,80,0.12)';
        ctx.strokeStyle = 'rgba(220,180,100,0.7)';
        ctx.lineWidth = 1.5;
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.fillStyle = 'rgba(220,180,100,0.9)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏫 ' + (f.label || 'BUILDING'), cx, cy + 4);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.fillStyle = 'rgba(220,180,100,0.9)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏫 ' + (f.label || 'BUILDING'), rx + rw / 2, ry + rh / 2 + 4);
          ctx.textAlign = 'left';
        }
      });

      // Parking
      m.features.filter(f => f.type === 'parking').forEach(f => {
        ctx.fillStyle = 'rgba(130,130,160,0.15)';
        ctx.strokeStyle = 'rgba(160,160,200,0.6)';
        ctx.lineWidth = 1;
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.fillStyle = 'rgba(160,160,200,0.85)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🅿 PARKING', cx, cy + 4);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect!;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.fillStyle = 'rgba(160,160,200,0.85)';
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🅿 PARKING', rx + rw / 2, ry + rh / 2 + 4);
          ctx.textAlign = 'left';
        }
      });

      // Open fields
      m.features.filter(f => f.type === 'field').forEach(f => {
        ctx.fillStyle = 'rgba(160,220,80,0.08)';
        ctx.strokeStyle = 'rgba(160,220,80,0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(180,230,100,0.75)';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌾 ' + (f.label || 'OPEN FIELD'), cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(180,230,100,0.75)';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌾 ' + (f.label || 'OPEN FIELD'), rx + rw / 2, ry + rh / 2);
          ctx.textAlign = 'left';
        }
        ctx.setLineDash([]);
      });

      // Roads
      m.features.filter(f => f.type === 'road' && f.points && f.points.length >= 2).forEach(f => {
        ctx.strokeStyle = 'rgba(200,200,160,0.5)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(f.points![0][0], f.points![0][1]);
        f.points!.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        const mid = Math.floor(f.points!.length / 2);
        const [mx, my] = f.points![mid];
        ctx.fillStyle = 'rgba(220,220,180,0.85)';
        ctx.font = '8px Space Grotesk,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛣 ROAD', mx, my - 6);
        ctx.textAlign = 'left';
        ctx.lineCap = 'butt';
      });

      // Pinch points
      m.features.filter(f => f.type === 'pinch_point').forEach(f => {
        if (f.cx == null || f.cy == null || f.r == null) return;
        ctx.fillStyle = 'rgba(0,200,170,0.25)';
        ctx.strokeStyle = 'rgba(0,200,170,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.cx, f.cy, f.r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00c8aa';
        ctx.font = 'bold 9px Space Grotesk,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PINCH POINT', f.cx, f.cy + 4);
        ctx.textAlign = 'left';
      });

      // No-build zones
      m.features.filter(f => f.type === 'nobuild').forEach(f => {
        ctx.fillStyle = 'rgba(248,81,73,0.2)';
        ctx.strokeStyle = 'rgba(248,81,73,0.8)';
        ctx.lineWidth = 1.5;
        if (f.points && f.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(f.points[0][0], f.points[0][1]);
          f.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          const cx = f.points.reduce((s, p) => s + p[0], 0) / f.points.length;
          const cy = f.points.reduce((s, p) => s + p[1], 0) / f.points.length;
          ctx.fillStyle = 'rgba(248,81,73,1)';
          ctx.font = 'bold 10px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⛔ ' + (f.label || 'NO-BUILD'), cx, cy);
          ctx.textAlign = 'left';
        } else if (f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
          if (f.label) {
            ctx.fillStyle = 'rgba(248,81,73,1)';
            ctx.font = 'bold 10px Space Grotesk,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⛔ ' + f.label, rx + rw / 2, ry + rh / 2);
            ctx.textAlign = 'left';
          }
        }
      });
    }

    // Property boundary: only draw on schematic fallback; satellite maps show parcel outlines natively.
    const boundary = m.features.find(f => f.type === 'boundary');
    if (!imgLoaded && boundary?.points) {
      ctx.strokeStyle = '#ff8c8c';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      boundary.points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Substation marker (always on top)
    const [sx, sy] = m.substationPx;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = imgLoaded ? 6 : 0;
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', sx, sy + 3);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 9px JetBrains Mono,monospace';
    ctx.textAlign = 'left';
    if (imgLoaded) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeText('Substation', sx + 13, sy + 5);
      ctx.shadowBlur = 0;
    }
    ctx.fillText('Substation', sx + 13, sy + 5);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawFeature(ctx: CanvasRenderingContext2D, f: Feature) {
    ctx.save();
    switch (f.type) {
      case 'ocean':
      case 'water': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = f.type === 'ocean' ? '#1a3a5c' : '#1a4060';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#2a6090';
        ctx.lineWidth = 0.8;
        for (let i = ry + 8; i < ry + rh; i += 12) {
          ctx.beginPath();
          for (let x = rx; x < rx + rw; x += 8) {
            const wave = Math.sin((x - rx) * 0.15) * 2;
            x === rx ? ctx.moveTo(x, i + wave) : ctx.lineTo(x, i + wave);
          }
          ctx.stroke();
        }
        if (f.label) {
          ctx.fillStyle = '#4a9fc0';
          ctx.font = 'italic 11px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f.label, rx + rw / 2, ry + rh / 2);
        }
        break;
      }
      case 'forest': {
        const r = Array.isArray(f.rect?.[0]) ? (f.rect![0] as unknown as number[]) : f.rect!;
        const [rx, ry, rw, rh] = r;
        ctx.fillStyle = '#1e3a18';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.fillStyle = '#2a5020';
        for (let x = rx + 6; x < rx + rw - 6; x += 14) for (let y = ry + 6; y < ry + rh - 6; y += 14) {
          const jx = (Math.sin(x * y * 0.01) * 5) | 0, jy = (Math.cos(x * y * 0.01) * 5) | 0;
          ctx.beginPath(); ctx.arc(x + jx, y + jy, 4, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'field': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = '#2a4a1a';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#3a6025';
        ctx.lineWidth = 0.6;
        for (let x = rx; x < rx + rw; x += GRID) { ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); ctx.stroke(); }
        if (f.label) {
          ctx.fillStyle = '#4a7a30';
          ctx.font = '10px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f.label, rx + rw / 2, ry + rh / 2);
        }
        break;
      }
      case 'building': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#5a5a7a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.fillStyle = '#6a7a9a30';
        for (let x = rx + 4; x < rx + rw - 10; x += 12) for (let y = ry + 4; y < ry + rh - 10; y += 12) {
          ctx.fillRect(x, y, 8, 7);
        }
        if (f.label) {
          ctx.fillStyle = '#8a9aba';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f.label, rx + rw / 2, ry + rh / 2 + 4);
        }
        break;
      }
      case 'parking': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = '#2a2a35';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#ffffff15';
        ctx.lineWidth = 0.6;
        for (let x = rx + 6; x < rx + rw; x += 12) { ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); ctx.stroke(); }
        break;
      }
      case 'road': {
        if (!f.points) break;
        ctx.strokeStyle = '#4a3a25';
        ctx.lineWidth = 6;
        ctx.beginPath();
        f.points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.stroke();
        ctx.strokeStyle = '#6a5a35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        f.points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.stroke();
        break;
      }
      case 'contour_zone': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        const density: Record<string, number> = { low: 25, medium: 18, high: 12, extreme: 8 };
        const d = density[f.density || 'medium'];
        ctx.strokeStyle = '#c8a420';
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.35;
        for (let i = 0; i < Math.floor(rh / d); i++) {
          const y = ry + i * d + 4;
          ctx.beginPath();
          ctx.moveTo(rx, y);
          for (let x = rx; x < rx + rw; x += 8) {
            const wave = Math.sin(x * 0.04 + i * 0.7) * 4 + Math.sin(x * 0.09 + i * 0.3) * 3;
            ctx.lineTo(x, y + wave);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      }
      case 'tidal_zone': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = '#00c8aa18';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#00c8aa40';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);
        break;
      }
      case 'pinch_point': {
        if (f.cx == null || f.cy == null || f.r == null) break;
        ctx.fillStyle = '#00c8aa30';
        ctx.strokeStyle = '#00c8aa';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(f.cx, f.cy, f.r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00c8aa';
        ctx.font = '8px Space Grotesk,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PINCH', f.cx, f.cy + 3);
        break;
      }
      case 'nobuild': {
        if (!f.rect) break;
        const [rx, ry, rw, rh] = f.rect;
        ctx.fillStyle = '#f8514920';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#f8514970';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);
        if (f.label) {
          ctx.fillStyle = '#f85149';
          ctx.font = '9px Space Grotesk,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(f.label, rx + rw / 2, ry + rh / 2);
        }
        break;
      }
    }
    ctx.restore();
  }

  function drawOverlay() {
    const canvas = getEl<HTMLCanvasElement>('overlayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(mapScale, mapScale);
    const plist = placements[currentMap] || [];

    (cables[currentMap] || []).forEach(seg => {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); ctx.stroke();
      ctx.setLineDash([]);
      const mid = [(seg.x1 + seg.x2) / 2, (seg.y1 + seg.y2) / 2];
      const px = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
      const cm = px / GRID;
      const ft = Math.round(cm * MAPS[currentMap].scale / 30.48);
      ctx.fillStyle = '#e74c3caa';
      ctx.font = '8px JetBrains Mono,monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft + 'ft', mid[0], mid[1] - 3);
    });

    const windBufferPx = TECHS.wind.bufferFt / (MAPS[currentMap].scale / 30.48) * GRID;
    plist.filter(p => p.tech === 'wind').forEach(p => {
      ctx.beginPath(); ctx.arc(p.cx, p.cy, windBufferPx, 0, Math.PI * 2);
      ctx.fillStyle = '#58a6ff35'; ctx.fill();
      ctx.strokeStyle = '#58a6ff90'; ctx.lineWidth = 2; ctx.stroke();
    });

    plist.forEach(p => {
      const t = TECHS[p.tech];
      const ftPerCell = MAPS[currentMap].scale / 30.48;
      const r = Math.max(8, t.placedRadiusFt / ftPerCell * GRID);

      // Drop shadow
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(p.cx, p.cy + r + 2, r * 0.8, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Placed unit — real-world scaled shape
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.color + '70';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;

      if (t.placedWidthFt && t.placedHeightFt) {
        const hw = Math.max(12, t.placedWidthFt  / ftPerCell * GRID) / 2;
        const hh = Math.max(8,  t.placedHeightFt / ftPerCell * GRID) / 2;
        const rot = ((p.rotation || 0) * Math.PI) / 180;

        ctx.save();
        ctx.translate(p.cx, p.cy);
        ctx.rotate(rot);

        // Construction zone rectangle (geothermal only)
        if (t.constructionWidthFt && t.constructionHeightFt) {
          const chw = Math.max(16, t.constructionWidthFt  / ftPerCell * GRID) / 2;
          const chh = Math.max(12, t.constructionHeightFt / ftPerCell * GRID) / 2;
          ctx.beginPath();
          ctx.roundRect(-chw, -chh, chw * 2, chh * 2, 4);
          ctx.fillStyle = t.color + '38';
          ctx.fill();
          ctx.strokeStyle = t.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = 'bold 9px Space Grotesk,sans-serif';
          ctx.fillStyle = t.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText('construction zone', 0, -chh + 12);
        }

        // Main rectangle
        ctx.fillStyle = t.color + '70';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 3);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, Math.round(hh * 0.9))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.symbol, 0, 0);

        ctx.restore();

        // Label always upright, positioned above the visual bounding box
        const rot90 = p.rotation === 90 || p.rotation === 270;
        const visHalfH = rot90 ? hw : hh;
        const labelY = p.cy - visHalfH - 5;
        ctx.font = 'bold 10px Space Grotesk,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const labelW = ctx.measureText(t.name).width + 8;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(p.cx - labelW / 2, labelY - 10, labelW, 13);
        ctx.fillStyle = t.color;
        ctx.fillText(t.name, p.cx, labelY);
      } else {
        // Circle for all other techs
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, Math.round(r * 0.9))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.symbol, p.cx, p.cy);
        ctx.textBaseline = 'alphabetic';
        const labelY = p.cy - r - 5;
        ctx.font = 'bold 10px Space Grotesk,sans-serif';
        const labelW = ctx.measureText(t.name).width + 8;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(p.cx - labelW / 2, labelY - 10, labelW, 13);
        ctx.fillStyle = t.color;
        ctx.fillText(t.name, p.cx, labelY);
      }

      ctx.globalAlpha = 1;
    });

    if (mode === 'place' && selectedTech && mousePos.x > 0) {
      const t = TECHS[selectedTech];
      const snapped = snapToGridCell(mousePos.x, mousePos.y, selectedTech);
      const _waterTechs = ['hydroL', 'hydroH', 'tidal'];
      const _snappedZone = getZoneAt(snapped.x, snapped.y);
      const _isWaterZone = _snappedZone?.type === 'water' || _snappedZone?.type === 'ocean' || _snappedZone?.type === 'tidal_zone';
      const _boundary = MAPS[currentMap].features.find(f => f.type === 'boundary' && f.points);
      const isOutside = !_waterTechs.includes(selectedTech) && !(selectedTech === 'wind' && _isWaterZone) && !!_boundary?.points && !pointInPolygon(snapped.x, snapped.y, _boundary.points);
      const isOverlapBlocked = wouldOverlap(snapped.x, snapped.y, selectedTech, pendingRotation);
      const isBlocked = isOutside || isOverlapBlocked;
      canvas.style.cursor = isBlocked ? 'not-allowed' : 'crosshair';

      const ghostColor = isBlocked ? '#f85149' : t.color;
      const ftPerCellG = MAPS[currentMap].scale / 30.48;

      const ghostRot = (pendingRotation * Math.PI) / 180;

      // Construction zone ghost (geo)
      if (t.constructionWidthFt && t.constructionHeightFt) {
        const chw = Math.max(16, t.constructionWidthFt  / ftPerCellG * GRID) / 2;
        const chh = Math.max(12, t.constructionHeightFt / ftPerCellG * GRID) / 2;
        ctx.globalAlpha = 0.55;
        ctx.save();
        ctx.translate(snapped.x, snapped.y);
        ctx.rotate(ghostRot);
        ctx.fillStyle = ghostColor + '55';
        ctx.strokeStyle = ghostColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.roundRect(-chw, -chh, chw * 2, chh * 2, 4);
        ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '9px Space Grotesk,sans-serif';
        ctx.fillStyle = ghostColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('construction zone', 0, -chh + 12);
        ctx.restore();
      }

      // Main shape ghost — mirrors placed unit exactly
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = ghostColor + 'cc';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      if (t.placedWidthFt && t.placedHeightFt) {
        const hw = Math.max(12, t.placedWidthFt  / ftPerCellG * GRID) / 2;
        const hh = Math.max(8,  t.placedHeightFt / ftPerCellG * GRID) / 2;
        ctx.save();
        ctx.translate(snapped.x, snapped.y);
        ctx.rotate(ghostRot);
        ctx.beginPath();
        ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 3);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        // Rotation badge
        if (pendingRotation !== 0) {
          ctx.globalAlpha = 0.9;
          const rot90 = pendingRotation === 90 || pendingRotation === 270;
          const visHalfH = rot90 ? hw : hh;
          ctx.font = 'bold 10px Space Grotesk,sans-serif';
          ctx.fillStyle = ghostColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(`↻ ${pendingRotation}°`, snapped.x, snapped.y - visHalfH - 6);
        }
      } else {
        const r = Math.max(8, t.placedRadiusFt / ftPerCellG * GRID);
        ctx.beginPath();
        ctx.arc(snapped.x, snapped.y, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (mode !== 'pan') {
      canvas.style.cursor = 'crosshair';
    }
    ctx.restore();
  }

  function getCanvasPos(e: MouseEvent) {
    const canvas = getEl<HTMLCanvasElement>('overlayCanvas');
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / mapScale, y: (e.clientY - rect.top) / mapScale };
  }

  function getZoneAt(x: number, y: number): Feature | null {
    const features = MAPS[currentMap].features;
    const priority = ['nobuild', 'pinch_point', 'water', 'ocean', 'tidal_zone', 'building', 'parking', 'road', 'forest', 'field', 'contour_zone'];
    for (const type of priority) {
      const f = features.find(feat => {
        if (feat.type !== type) return false;
        if (type === 'pinch_point') return Math.hypot((feat.cx || 0) - x, (feat.cy || 0) - y) < (feat.r || 0);
        return pointInFeature(x, y, feat);
      });
      if (f) return f;
    }
    return null;
  }

  function getZoneDesc(type: string): string {
    const descs: Record<string, string> = {
      water: '✓ Hydro/Tidal suitable',
      ocean: '✓ Tidal/Offshore suitable',
      tidal_zone: '✓ Tidal turbine zone',
      pinch_point: '⭐ Tidal pinch point — strong current zone',
      building: '⚠ Restricted — no wind buffer',
      forest: (getEl<HTMLSelectElement>('envConstraints')?.value === 'Migratory Bird') ? '⚠ Forested — wind turbines violate Migratory Bird Ordinance' : '✓ Forested area',
      field: '✓ Good for Solar/Wind/Geothermal',
      parking: '✓ Good for Solar/Wind arrays',
      road: '✓ Road access — Biomass suitable',
      nobuild: '✗ No-Build zone',
      contour_zone: 'Steep terrain — check hydro potential',
      boundary: 'Property boundary',
    };
    return descs[type] || '';
  }

  // Minimum distance from point (px,py) to any edge of a polygon
  function segmentsIntersect(ax1: number, ay1: number, ax2: number, ay2: number,
                             bx1: number, by1: number, bx2: number, by2: number): boolean {
    const d1x = ax2 - ax1, d1y = ay2 - ay1;
    const d2x = bx2 - bx1, d2y = by2 - by1;
    const cross = d1x * d2y - d1y * d2x;
    if (Math.abs(cross) < 1e-10) return false;
    const dx = bx1 - ax1, dy = by1 - ay1;
    const t = (dx * d2y - dy * d2x) / cross;
    const u = (dx * d1y - dy * d1x) / cross;
    return t > 0 && t < 1 && u > 0 && u < 1;
  }

  function pointToPolygonDist(px: number, py: number, points: number[][]): number {
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const [ax, ay] = points[i];
      const [bx, by] = points[(i + 1) % points.length];
      const dx = bx - ax, dy = by - ay;
      const lenSq = dx * dx + dy * dy;
      const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
      minDist = Math.min(minDist, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
    }
    return minDist;
  }

  function checkPlacementViolations(x: number, y: number, tech: string): string[] {
    const violations: string[] = [];
    const zone = getZoneAt(x, y);

    const waterTechs = ['hydroL', 'hydroH', 'tidal'];
    const isOffshoreWind = tech === 'wind' && zone && (zone.type === 'ocean' || zone.type === 'water');
    if (!waterTechs.includes(tech) && !isOffshoreWind) {
      const boundary = MAPS[currentMap].features.find(f => f.type === 'boundary' && f.points);
      if (boundary?.points && !pointInPolygon(x, y, boundary.points)) {
        violations.push('Must be placed within campus property boundary');
      }
    }

    if (tech === 'hydroL' || tech === 'hydroH') {
      if (!zone || (zone.type !== 'water' && zone.type !== 'ocean')) {
        violations.push('Hydro must be placed on water');
      }
    }
    if (tech === 'tidal') {
      if (!zone || (zone.type !== 'water' && zone.type !== 'ocean' && zone.type !== 'tidal_zone')) {
        violations.push('Tidal must be placed in coastal/water area');
      }
    }
    if (tech === 'geo') {
      if (zone && (zone.type === 'water' || zone.type === 'ocean')) {
        violations.push('Geothermal cannot be placed on water');
      }
      if (zone && zone.type === 'nobuild') {
        violations.push('No-build zone: Geothermal not allowed');
      }
    }
    if (tech === 'biomass') {
      const roads = MAPS[currentMap].features.filter(f => f.type === 'road' && (f.points || []).length >= 2);
      if (roads.length > 0) {
        const nearRoad = roads.some(f => pointToPolygonDist(x, y, f.points!) < GRID * 5);
        if (!nearRoad) violations.push('Biomass must be near a road for fuel delivery trucks');
      }
      const biomassBufferPx = 200 / (MAPS[currentMap].scale / 30.48) * GRID;
      const tooCloseToBuilding = MAPS[currentMap].features.some(f =>
        f.type === 'building' && (f.points || []).length >= 2 && pointToPolygonDist(x, y, f.points!) < biomassBufferPx
      );
      if (tooCloseToBuilding) violations.push('Biomass too close to building — exhaust and smoke hazard near windows (200 ft buffer)');
    }
    if (tech === 'wind') {
      const bufferPx = TECHS.wind.bufferFt / (MAPS[currentMap].scale / 30.48) * GRID;
      MAPS[currentMap].features.forEach(f => {
        if (f.type === 'building' && f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          const closest = [Math.max(rx, Math.min(x, rx + rw)), Math.max(ry, Math.min(y, ry + rh))];
          const d = Math.hypot(closest[0] - x, closest[1] - y);
          if (d < bufferPx) violations.push('Wind buffer touches building — $200K fee');
        }
      });
      const boundary = MAPS[currentMap].features.find(f => f.type === 'boundary' && f.points);
      if (boundary?.points && pointToPolygonDist(x, y, boundary.points) < bufferPx) {
        violations.push('Wind buffer touches property line — $200K fee');
      }
      if (zone && zone.type === 'forest' && getEl<HTMLSelectElement>('envConstraints')?.value === 'Migratory Bird') {
        violations.push('Migratory Bird Ordinance: turbines not permitted in forested areas');
      }
    }
    return violations;
  }

  function getEffectiveHalfDims(tech: string, rotation: number, ftPerCell: number): { hw: number; hh: number } {
    const t = TECHS[tech];
    const hw = Math.max(12, t.placedWidthFt!  / ftPerCell * GRID) / 2;
    const hh = Math.max(8,  t.placedHeightFt! / ftPerCell * GRID) / 2;
    return (rotation === 90 || rotation === 270) ? { hw: hh, hh: hw } : { hw, hh };
  }

  function shapesOverlap(
    x1: number, y1: number, tech1: string, rot1: number,
    x2: number, y2: number, tech2: string, rot2: number,
    ftPerCell: number
  ): boolean {
    const t1 = TECHS[tech1];
    const t2 = TECHS[tech2];
    const isRect1 = !!(t1.placedWidthFt && t1.placedHeightFt);
    const isRect2 = !!(t2.placedWidthFt && t2.placedHeightFt);

    if (!isRect1 && !isRect2) {
      const r1 = Math.max(8, t1.placedRadiusFt / ftPerCell * GRID);
      const r2 = Math.max(8, t2.placedRadiusFt / ftPerCell * GRID);
      return Math.hypot(x1 - x2, y1 - y2) < r1 + r2;
    }

    if (isRect1 && isRect2) {
      const d1 = getEffectiveHalfDims(tech1, rot1, ftPerCell);
      const d2 = getEffectiveHalfDims(tech2, rot2, ftPerCell);
      return Math.abs(x1 - x2) < d1.hw + d2.hw && Math.abs(y1 - y2) < d1.hh + d2.hh;
    }

    // One rect, one circle — find closest point on rect to circle center
    const [rx, ry, rTech, rRot, cx, cy, cTech] = isRect1
      ? [x1, y1, tech1, rot1, x2, y2, tech2]
      : [x2, y2, tech2, rot2, x1, y1, tech1];
    const { hw, hh } = getEffectiveHalfDims(rTech, rRot, ftPerCell);
    const circR = Math.max(8, TECHS[cTech].placedRadiusFt / ftPerCell * GRID);
    const nearX = Math.max(rx - hw, Math.min(cx, rx + hw));
    const nearY = Math.max(ry - hh, Math.min(cy, ry + hh));
    return Math.hypot(nearX - cx, nearY - cy) < circR;
  }

  function wouldOverlap(x: number, y: number, tech: string, rotation = 0, excludeIdx = -1): boolean {
    const ftPerCell = MAPS[currentMap].scale / 30.48;
    return (placements[currentMap] || []).some((p, i) => {
      if (i === excludeIdx) return false;
      return shapesOverlap(x, y, tech, rotation, p.cx, p.cy, p.tech, p.rotation || 0, ftPerCell);
    });
  }

  function placeUnit(x: number, y: number) {
    if (!selectedTech) return;
    const snapped = snapToGridCell(x, y, selectedTech);
    const waterTechs = ['hydroL', 'hydroH', 'tidal'];
    const snappedZone = getZoneAt(snapped.x, snapped.y);
    const isWaterZone = snappedZone?.type === 'water' || snappedZone?.type === 'ocean' || snappedZone?.type === 'tidal_zone';
    if (!waterTechs.includes(selectedTech) && !(selectedTech === 'wind' && isWaterZone)) {
      const boundary = MAPS[currentMap].features.find(f => f.type === 'boundary' && f.points);
      if (boundary?.points && !pointInPolygon(snapped.x, snapped.y, boundary.points)) return;
    }
    if (wouldOverlap(snapped.x, snapped.y, selectedTech, pendingRotation)) return;
    const violations = checkPlacementViolations(snapped.x, snapped.y, selectedTech);
    placements[currentMap].push({
      tech: selectedTech, cx: snapped.x, cy: snapped.y,
      id: Date.now() + Math.random(),
      violations, rotation: pendingRotation
    });
    buildOptimalCables();
    drawOverlay();
    updateUI();
  }

  function buildOptimalCables() {
    const plist = placements[currentMap] || [];
    const sub = MAPS[currentMap].substationPx as [number, number];
    if (!sub || plist.length === 0) { cables[currentMap] = []; return; }

    // Nodes: index 0 = substation, rest = placements
    const nodes: Array<[number, number]> = [
      [sub[0], sub[1]],
      ...plist.map(p => [p.cx, p.cy] as [number, number]),
    ];

    // Prim's MST — finds minimum total cable length connecting all units to substation
    const inTree = new Set<number>([0]);
    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    while (inTree.size < nodes.length) {
      let bestDist = Infinity;
      let bestI = -1, bestJ = -1;
      inTree.forEach(i => {
        nodes.forEach((_, j) => {
          if (inTree.has(j)) return;
          const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
          if (d < bestDist) { bestDist = d; bestI = i; bestJ = j; }
        });
      });
      if (bestJ === -1) break;
      result.push({ x1: nodes[bestI][0], y1: nodes[bestI][1], x2: nodes[bestJ][0], y2: nodes[bestJ][1] });
      inTree.add(bestJ);
    }

    cables[currentMap] = result;
  }

  function eraseUnit(x: number, y: number) {
    const plist = placements[currentMap];
    if (!plist?.length) return;
    const ftPerCell = MAPS[currentMap].scale / 30.48;
    // Use real-world-scaled hit radii matching the rendered shapes
    const idx = plist.findIndex(p => {
      const t = TECHS[p.tech];
      const hitR = t.placedWidthFt
        ? Math.max(Math.max(12, t.placedWidthFt  / ftPerCell * GRID) / 2,
                   Math.max(8,  t.placedHeightFt! / ftPerCell * GRID) / 2) + 6
        : Math.max(8, t.placedRadiusFt / ftPerCell * GRID) + 6;
      return Math.hypot(p.cx - x, p.cy - y) < hitR;
    });
    if (idx >= 0) {
      plist.splice(idx, 1);
      buildOptimalCables();
      drawOverlay();
      updateUI();
    }
  }

  function rotateUnit(x: number, y: number) {
    const plist = placements[currentMap];
    if (!plist?.length) return;
    const ftPerCell = MAPS[currentMap].scale / 30.48;
    let bestIdx = -1, bestDist = Infinity;
    plist.forEach((p, i) => {
      const t = TECHS[p.tech];
      const hitR = t.placedWidthFt
        ? Math.max(Math.max(12, t.placedWidthFt  / ftPerCell * GRID) / 2,
                   Math.max(8,  t.placedHeightFt! / ftPerCell * GRID) / 2) + 6
        : Math.max(8, t.placedRadiusFt / ftPerCell * GRID) + 6;
      const dist = Math.hypot(p.cx - x, p.cy - y);
      if (dist < hitR && dist < bestDist) { bestDist = dist; bestIdx = i; }
    });
    if (bestIdx >= 0) {
      plist[bestIdx].rotation = (((plist[bestIdx].rotation || 0) + 90) % 360);
      drawOverlay();
      updateUI();
    }
  }

  function updateInfoPanel(x: number, y: number) {
    const m = MAPS[currentMap];
    const [sx, sy] = m.substationPx;
    // In place mode, show distance from snapped position (what will actually be placed)
    const displayX = mode === 'place' && selectedTech ? snapToGridCell(x, y, selectedTech).x : x;
    const displayY = mode === 'place' && selectedTech ? snapToGridCell(x, y, selectedTech).y : y;
    const distPx = Math.hypot(displayX - sx, displayY - sy);
    const distCm = distPx / GRID;
    const ftPerCm2 = MAPS[currentMap].scale / 30.48;
    const cableCost = (distCm * ftPerCm2) * 500; // $500/ft = $50K per 100 ft
    const zone = getZoneAt(x, y);
    const ftPerCm = MAPS[currentMap].scale / 30.48;
    const cursorEl = getEl('infoCursor'); if (cursorEl) cursorEl.textContent = `${Math.round(displayX / GRID * ftPerCm)}ft, ${Math.round(displayY / GRID * ftPerCm)}ft`;
    const zoneEl = getEl('infoZone'); if (zoneEl) zoneEl.textContent = zone ? (zone.label || zone.type) : 'open land';
    const distEl = getEl('infoDist'); if (distEl) distEl.textContent = `${Math.round(distCm * ftPerCm)} ft`;
    const costEl = getEl('infoCableCost'); if (costEl) costEl.textContent = `$${(cableCost / 1000).toFixed(0)}K`;
  }

  function polygonArea(pts: number[][]): number {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
  }

  function pointInPolygon(px: number, py: number, pts: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function featureArea(f: Feature): number {
    if (f.points && f.points.length >= 3) return polygonArea(f.points);
    if (f.rect) return f.rect[2] * f.rect[3];
    return 0;
  }

  function pointInFeature(px: number, py: number, f: Feature): boolean {
    if (f.points && f.points.length >= 3) return pointInPolygon(px, py, f.points);
    if (f.rect) return px >= f.rect[0] && px <= f.rect[0] + f.rect[2] && py >= f.rect[1] && py <= f.rect[1] + f.rect[3];
    return false;
  }

  function computeForestStats(mapId = currentMap) {
    const m = MAPS[mapId];
    const boundary = m.features.find(f => f.type === 'boundary' && f.points);
    let campusArea = boundary?.points ? polygonArea(boundary.points) : m.width * m.height;
    const totalForestArea = m.features
      .filter(f => f.type === 'forest')
      .reduce((sum, f) => sum + featureArea(f), 0);
    const forestPct = campusArea > 0 ? (totalForestArea / campusArea) * 100 : 0;
    const ftPerCell = m.scale / 30.48;
    let clearedAreaPx2 = 0;
    const seenIds = new Set<number>();
    (placements[mapId] || []).forEach((p, i) => {
      const uid = p.id ?? i;
      if (seenIds.has(uid)) return;
      const t = TECHS[p.tech];
      // Use construction footprint for clearing when available (e.g. geothermal drilling zone)
      const clearW = t.constructionWidthFt ?? t.placedWidthFt;
      const clearH = t.constructionHeightFt ?? t.placedHeightFt;
      const hw = clearW ? clearW / ftPerCell * GRID / 2 : t.placedRadiusFt / ftPerCell * GRID;
      const hh = clearH ? clearH / ftPerCell * GRID / 2 : hw;
      // Sample 9 points across the clearing footprint — catches units whose center is just outside the polygon
      const samples: [number, number][] = [
        [p.cx,            p.cy           ],
        [p.cx - hw * 0.6, p.cy          ], [p.cx + hw * 0.6, p.cy          ],
        [p.cx,            p.cy - hh * 0.6], [p.cx,            p.cy + hh * 0.6],
        [p.cx - hw * 0.8, p.cy - hh * 0.8], [p.cx + hw * 0.8, p.cy - hh * 0.8],
        [p.cx - hw * 0.8, p.cy + hh * 0.8], [p.cx + hw * 0.8, p.cy + hh * 0.8],
      ];
      const forestHits = samples.filter(([sx, sy]) =>
        m.features.some(f => f.type === 'forest' && pointInFeature(sx, sy, f))
      ).length;
      if (forestHits > 0) {
        seenIds.add(uid);
        let unitAreaPx2: number;
        if (clearW && clearH) {
          unitAreaPx2 = (clearW / ftPerCell * GRID) * (clearH / ftPerCell * GRID);
        } else {
          const r = t.placedRadiusFt / ftPerCell * GRID;
          unitAreaPx2 = Math.PI * r * r;
        }
        clearedAreaPx2 += unitAreaPx2 * (forestHits / samples.length);
      }
    });
    const clearedPct = totalForestArea > 0 ? Math.min(100, (clearedAreaPx2 / totalForestArea) * 100) : 0;
    return { forestPct: Math.round(forestPct), clearedPct: parseFloat(clearedPct.toFixed(1)) };
  }

  function updateUI() {
    // Sync placements/cables to sharedState for plan sharing
    const mapIds = Object.keys(placements);
    sharedState.placements = {};
    sharedState.cables = {};
    mapIds.forEach(id => {
      sharedState.placements[id] = placements[id].map(p => ({ tech: p.tech, cx: p.cx, cy: p.cy }));
      sharedState.cables[id] = cables[id] ? [...cables[id]] : [];
    });

    // Aggregate ALL placements across all maps for cost/kw totals
    const allPlacements = Object.values(placements).flat();
    let totalKw = 0, totalStorage = 0, totalCost = 0;
    const counts: Record<string, number> = {};
    allPlacements.forEach(p => {
      const t = TECHS[p.tech];
      totalKw += t.kw;
      totalStorage += t.storageKwh;
      const hubDiscount = sharedState.hydroHubActive && (p.tech === 'geo' || p.tech === 'hydroL' || p.tech === 'hydroH') ? 0.8 : 1;
      totalCost += t.cost * hubDiscount;
      counts[p.tech] = (counts[p.tech] || 0) + 1;
    });

    // Cable costs across all maps — $500/ft ($50K per 100 ft)
    // MST cables already represent full optimal routing; only count those segments
    let cableFt = 0;
    Object.entries(cables).forEach(([mapId, segs]) => {
      const ftPerCm = MAPS[mapId].scale / 30.48;
      segs.forEach(seg => {
        cableFt += (Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1) / GRID) * ftPerCm;
      });
    });
    const CABLE_COST_PER_FT = 500; // $500/ft = $50K per 100 ft
    totalCost += cableFt * CABLE_COST_PER_FT;
    if (totalKw > (sharedState.campusPeakDemand || 3000)) totalCost += 500000;

    // Count wind turbines in ecologically sensitive zones (forest, wetland)
    let windSensitive = 0;
    Object.keys(placements).forEach(mapId => {
      placements[mapId].forEach(p => {
        if (p.tech === 'wind') {
          const z = getZoneAt(p.cx, p.cy);
          if (z && (z.type === 'forest' || z.type === 'wetland')) windSensitive++;
        }
      });
    });

    // Check if any placed wind turbine violates the 500ft building/property buffer
    const windBufferFromPlacements = Object.values(placements).flat().some(p =>
      p.tech === 'wind' && p.violations && p.violations.some((v: string) => v.includes('Wind buffer'))
    );
    // Check if any cable crosses the property boundary (offshore wind interconnect fee)
    const windBufferFromCables = Object.keys(cables).some(mapId => {
      const boundary = MAPS[mapId]?.features.find(f => f.type === 'boundary' && f.points);
      if (!boundary?.points) return false;
      const pts = boundary.points;
      return (cables[mapId] || []).some(seg =>
        pts.some((_, i) => {
          const [ax, ay] = pts[i];
          const [bx, by] = pts[(i + 1) % pts.length];
          return segmentsIntersect(seg.x1, seg.y1, seg.x2, seg.y2, ax, ay, bx, by);
        })
      );
    });
    const windBufferHit = windBufferFromPlacements || windBufferFromCables;

    // Sync to shared state so Grid Simulator can read it
    sharedState.techCounts = counts;
    sharedState.totalMapCost = totalCost;
    sharedState.totalMapKw = totalKw;
    sharedState.totalMapCableFt = cableFt;
    sharedState.windSensitiveZoneCount = windSensitive;
    sharedState.windBufferPenalty = windBufferHit;
    emitMapUpdate();

    const budgetLimit = sharedState.budgetLimit;
    const budgetM = (budgetLimit / 1e6).toFixed(0);
    const islandTime = totalKw > 0 ? (totalStorage / (sharedState.campusPeakDemand || 3000)).toFixed(1) : '0';

    const kwEl = getEl('statPower');
    if (kwEl) kwEl.className = 'map-stat ' + (totalKw >= 3000 ? 'ok' : totalKw >= 1500 ? 'warn' : '');
    const kwVal = getEl('valPower'); if (kwVal) kwVal.textContent = `${(totalKw / 1000).toFixed(1)}MW / 3MW`;

    const storageVal = getEl('valStorage'); if (storageVal) storageVal.textContent = `${totalStorage.toLocaleString()} kWh`;
    const cableVal = getEl('valCable'); if (cableVal) cableVal.textContent = `${Math.round(cableFt)} ft`;
    const budgetEl = getEl('statBudget');
    if (budgetEl) {
      const over = totalCost > budgetLimit;
      budgetEl.className = 'map-stat' + (over ? ' danger' : totalCost > budgetLimit * 0.85 ? ' warn' : '');
    }
    const budgetVal = getEl('valBudget'); if (budgetVal) budgetVal.textContent = `$${(totalCost / 1e6).toFixed(2)}M / $${budgetM}M`;
    const islandVal = getEl('valIsland'); if (islandVal) islandVal.textContent = `${islandTime}h`;
    const { forestPct, clearedPct } = computeForestStats();
    const forestEl = getEl('statForest');
    const forestVal = getEl('valForest');
    if (forestEl && forestVal) {
      if (forestPct === 0) {
        forestEl.className = 'map-stat';
        forestVal.textContent = 'none';
      } else if (clearedPct === 0) {
        forestEl.className = 'map-stat';
        forestVal.textContent = `${forestPct}% of campus`;
      } else {
        forestEl.className = 'map-stat ' + (clearedPct > 25 ? 'err' : clearedPct > 10 ? 'warn' : '');
        forestVal.innerHTML = `${clearedPct}% cleared <span style="opacity:0.5">(${forestPct}% of campus)</span>`;
      }
    }

    // Counts panel (current map only for clarity)
    const plist = placements[currentMap] || [];
    const currentCounts: Record<string, number> = {};
    plist.forEach(p => { currentCounts[p.tech] = (currentCounts[p.tech] || 0) + 1; });
    const cp = getEl('countsPanel');
    if (cp) {
      if (plist.length === 0) {
        cp.innerHTML = '<div style="font-size:10px;color:var(--muted);text-align:center;padding:4px">No placements yet</div>';
      } else {
        cp.innerHTML = Object.entries(currentCounts).map(([k, v]) => {
          const t = TECHS[k];
          return `<div class="map-count-row"><span class="map-count-label">${t.name}</span><span class="map-count-val" style="color:${t.color}">×${v}</span></div>`;
        }).join('');
        cp.innerHTML += `<div class="map-count-row" style="border-top:1px solid var(--border);margin-top:2px;padding-top:2px"><span class="map-count-label">Total cost (all maps)</span><span class="map-count-val" style="color:${totalCost > budgetLimit ? 'var(--danger)' : 'var(--accent)'}">$${(totalCost / 1e6).toFixed(2)}M</span></div>`;
      }
    }

    const allViolations: string[] = [];
    plist.forEach(p => {
      if (p.violations && p.violations.length) {
        p.violations.forEach(v => allViolations.push(`${TECHS[p.tech].name}: ${v}`));
      }
    });
    // Utility upgrade fee is shown on the balance sheet — not a siting violation
    if (totalCost > budgetLimit) allViolations.push(`⛔ OVER BUDGET by $${((totalCost - budgetLimit) / 1e6).toFixed(2)}M`);

    // Forest clearing — check every map independently
    Object.keys(MAPS).forEach(mapId => {
      const hasForest = MAPS[mapId].features.some(f => f.type === 'forest');
      if (!hasForest) return;
      const { clearedPct } = computeForestStats(mapId);
      if (clearedPct > 25) {
        allViolations.push(`🌿 VIOLATION — ${MAPS[mapId].name}: ${clearedPct.toFixed(1)}% of forest cleared — max 25% permitted (Vernal Pool Protection).`);
      }
    });

    sharedState.mapViolations = [...allViolations];

    // Unused import suppressor
    void MAP_TECH_TO_SIM;
  }

  function selectTech(tech: string) {
    selectedTech = tech;
    pendingRotation = 0;
    document.querySelectorAll('.map-tech-btn').forEach(b => b.classList.remove('active'));
    getEl(`btn-${tech}`)?.classList.add('active');
    if (mode !== 'place') setMode('place');
  }

  function setMode(m: string) {
    mode = m;
    getEl('modPlace')?.classList.toggle('active', m === 'place');
    getEl('modErase')?.classList.toggle('active', m === 'erase');
    getEl('modMove')?.classList.toggle('active',  m === 'move');
    getEl('modPan')?.classList.toggle('active',   m === 'pan');
    const wrap = getEl('canvasWrap');
    wrap?.classList.toggle('erase-mode', m === 'erase');
    const ov = getEl<HTMLCanvasElement>('overlayCanvas');
    if (ov) ov.style.cursor = m === 'pan' ? 'grab' : m === 'move' ? 'grab' : '';
  }

  function clearAll() {
    if (!confirm('Clear all placements on this map?')) return;
    placements[currentMap] = [];
    cables[currentMap] = [];
    cableStart = null;
    drawOverlay();
    updateUI();
  }

  // Event listeners on overlay canvas
  const overlayCanvas = getEl<HTMLCanvasElement>('overlayCanvas');
  let panDragging = false;
  let panStartX = 0, panStartY = 0, panScrollX = 0, panScrollY = 0;
  let moveDragging = false;
  let movingIdx = -1;

  if (overlayCanvas) {
    overlayCanvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return; // ignore right/middle clicks
      if (mode === 'pan') {
        if (e.shiftKey) {
          const { x, y } = getCanvasPos(e);
          rotateUnit(x, y);
          return;
        }
        const container = getEl('mapContainer');
        if (!container) return;
        panDragging = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panScrollX = container.scrollLeft;
        panScrollY = container.scrollTop;
        overlayCanvas.style.cursor = 'grabbing';
        return;
      }
      const { x, y } = getCanvasPos(e);
      if (mode === 'place') {
        if (e.shiftKey && TECHS[selectedTech]?.placedWidthFt) {
          pendingRotation = (pendingRotation + 90) % 360;
          drawOverlay();
        } else {
          placeUnit(x, y);
        }
      } else if (mode === 'erase') {
        if (e.shiftKey) {
          rotateUnit(x, y);
        } else {
          eraseUnit(x, y);
        }
      } else if (mode === 'move') {
        const plist = placements[currentMap];
        if (!plist?.length) return;
        const ftPerCell = MAPS[currentMap].scale / 30.48;
        let bestIdx = -1, bestDist = Infinity;
        plist.forEach((p, i) => {
          const t = TECHS[p.tech];
          const hitR = t.placedWidthFt
            ? Math.max(Math.max(12, t.placedWidthFt  / ftPerCell * GRID) / 2,
                       Math.max(8,  t.placedHeightFt! / ftPerCell * GRID) / 2) + 8
            : Math.max(8, t.placedRadiusFt / ftPerCell * GRID) + 8;
          const dist = Math.hypot(p.cx - x, p.cy - y);
          if (dist < hitR && dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        if (bestIdx >= 0) {
          moveDragging = true;
          movingIdx = bestIdx;
          if (overlayCanvas) overlayCanvas.style.cursor = 'grabbing';
        }
      }
    });

    overlayCanvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (mode === 'pan') {
        if (panDragging) {
          const container = getEl('mapContainer');
          if (container) {
            container.scrollLeft = panScrollX - (e.clientX - panStartX);
            container.scrollTop  = panScrollY - (e.clientY - panStartY);
          }
        }
        return;
      }
      const { x, y } = getCanvasPos(e);
      mousePos = { x, y };
      updateInfoPanel(x, y);
      if (moveDragging && movingIdx >= 0) {
        const p = placements[currentMap][movingIdx];
        const snapped = snapToGridCell(x, y, p.tech);
        if (wouldOverlap(snapped.x, snapped.y, p.tech, p.rotation || 0, movingIdx)) {
          overlayCanvas.style.cursor = 'not-allowed';
        } else {
          overlayCanvas.style.cursor = 'grabbing';
          p.cx = snapped.x;
          p.cy = snapped.y;
        }
        buildOptimalCables();
        drawOverlay();
        return;
      }
      if (mode === 'place' || (mode === 'cable' && cableStart)) drawOverlay();

      const tooltip = getEl('mapTooltip');
      const zone = getZoneAt(x, y);
      if (zone && tooltip) {
        tooltip.className = 'map-tooltip';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
        tooltip.innerHTML = `<b>${zone.label || zone.type}</b><br>${getZoneDesc(zone.type)}`;
      } else if (tooltip) {
        tooltip.className = 'map-tooltip hidden';
      }
    });

    overlayCanvas.addEventListener('mouseup', () => {
      if (panDragging) {
        panDragging = false;
        overlayCanvas.style.cursor = mode === 'pan' ? 'grab' : 'grab';
      }
      if (moveDragging) {
        moveDragging = false;
        movingIdx = -1;
        overlayCanvas.style.cursor = 'grab';
        buildOptimalCables();
        updateUI();
      }
    });

    overlayCanvas.addEventListener('mouseleave', () => {
      panDragging = false;
      if (moveDragging) {
        moveDragging = false;
        movingIdx = -1;
        buildOptimalCables();
        updateUI();
      }
      mousePos = { x: 0, y: 0 };
      const tooltip = getEl('mapTooltip');
      if (tooltip) tooltip.className = 'map-tooltip hidden';
    });

    overlayCanvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault(); // suppress browser context menu on canvas
    });
  }

  // Zoom controls
  function applyZoom(newZoom: number, pivotX?: number, pivotY?: number) {
    const container = getEl('mapContainer');
    if (!container) return;
    const prevZoom = zoomLevel;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    const ratio = zoomLevel / prevZoom;
    const scrollX = pivotX !== undefined ? pivotX * ratio - (pivotX - container.scrollLeft) : container.scrollLeft * ratio;
    const scrollY = pivotY !== undefined ? pivotY * ratio - (pivotY - container.scrollTop) : container.scrollTop * ratio;
    resizeCanvases();
    drawAll();
    container.scrollLeft = scrollX;
    container.scrollTop = scrollY;
    const btn = getEl('zoomReset');
    if (btn) btn.textContent = Math.round(zoomLevel * 100) + '%';
  }

  const mapContainer = getEl('mapContainer');
  if (mapContainer) {
    mapContainer.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const rect = mapContainer.getBoundingClientRect();
      const pivotX = e.clientX - rect.left + mapContainer.scrollLeft;
      const pivotY = e.clientY - rect.top + mapContainer.scrollTop;
      applyZoom(zoomLevel * (e.deltaY > 0 ? 0.9 : 1.1), pivotX, pivotY);
    }, { passive: false });
  }

  getEl('zoomIn')?.addEventListener('click', () => applyZoom(zoomLevel * 1.25));
  getEl('zoomOut')?.addEventListener('click', () => applyZoom(zoomLevel * 0.8));
  getEl('zoomReset')?.addEventListener('click', () => applyZoom(1.0));

  // Listen for simulator budget changes → refresh map budget display
  window.addEventListener('gc:sim-update', () => updateUI());

  // Restore plan from shared URL
  window.addEventListener('gc:restore-plan', (e: Event) => {
    const detail = (e as CustomEvent<{ placements?: Record<string, Array<{ tech: string; cx: number; cy: number }>>; cables?: Record<string, Array<{ x1: number; y1: number; x2: number; y2: number }>> }>).detail;
    Object.keys(MAPS).forEach(mapId => {
      placements[mapId] = [];
      if (detail.placements?.[mapId]) {
        detail.placements[mapId].forEach(p => {
          const violations = checkPlacementViolations(p.cx, p.cy, p.tech);
          placements[mapId].push({ tech: p.tech, cx: p.cx, cy: p.cy, id: Date.now() + Math.random(), violations });
        });
      }
    });
    // Rebuild cables via MST for each map (cables are derived, not saved)
    const savedMap = currentMap;
    Object.keys(MAPS).forEach(mapId => { currentMap = mapId; buildOptimalCables(); });
    currentMap = savedMap;
    drawAll();
    updateUI();
  });

  // Re-resize and redraw when the container becomes visible (e.g. switching from simulator view).
  // The component mounts hidden (display:none), so the initial resizeCanvases() gets clientWidth=0.
  const mapContainerEl = getEl('mapContainer');
  if (mapContainerEl) {
    const ro = new ResizeObserver(() => {
      if (mapContainerEl.clientWidth > 0) {
        resizeCanvases();
        drawAll();
      }
    });
    ro.observe(mapContainerEl);
  }

  // Init
  resizeCanvases();
  drawAll();
  updateUI();
  selectTech('solar');
}
