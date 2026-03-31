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
        width: 300px;
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
      .map-tech-btn {
        display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 5px;
        cursor: pointer; border: 1px solid var(--border); background: var(--surface2);
        color: var(--text); font-family: 'Space Grotesk',sans-serif; font-size: 12px;
        font-weight: 500; transition: all .15s; text-align: left; width: 100%;
      }
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

      .map-violations-panel {
        padding: 8px; background: #1c1010; border-radius: 5px; border: 1px solid #3a1a1a;
        max-height: 200px; overflow-y: auto;
      }
      .map-violation { font-size: 11px; color: var(--danger); padding: 3px 0; border-bottom: 1px solid #2a1010; }
      .map-violation:last-child { border-bottom: none; }
      .map-no-violations { font-size: 10px; color: var(--accent); }

      .map-container {
        flex: 1;
        overflow: auto;
        position: relative;
        background: #0a1628;
        min-height: 0;
      }
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
        position: absolute; bottom: 12px; right: 12px;
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
            <div class="map-stat" id="statPower">Power: <span>0 kW</span></div>
            <div class="map-stat" id="statStorage">Storage: <span>0 kWh</span></div>
            <div class="map-stat" id="statCable">Cable: <span>0 ft</span></div>
            <div class="map-stat" id="statBudget">Budget: <span>$0</span></div>
            <div class="map-stat" id="statIsland">Island: <span>0 h</span></div>
            <div class="map-stat" id="statForest">Forest: <span>—</span></div>
          </div>
          <button class="map-clear-btn" id="mapClearBtn">✕ Clear Map</button>
        </div>

        <div class="map-main">
          <div class="map-sidebar">
            <div class="map-sidebar-section">Mode</div>
            <div class="map-mode-row">
              <button class="map-mode-btn active" id="modPlace">Place</button>
              <button class="map-mode-btn" id="modErase">Erase</button>
              <button class="map-mode-btn" id="modPan">Pan</button>
            </div>

            <div class="map-sidebar-section">Generation</div>
            <button class="map-tech-btn" id="btn-solar" style="color:#f0b429">
              <span class="map-tech-dot" style="background:#f0b429"></span>
              <div><div>Solar PV</div><div class="map-tech-meta">500kW · $1M · 5 sq</div></div>
            </button>
            <button class="map-tech-btn" id="btn-wind" style="color:#58a6ff">
              <span class="map-tech-dot" style="background:#58a6ff"></span>
              <div><div>Wind</div><div class="map-tech-meta">3000kW · $2.5M · 5cm R</div></div>
            </button>
            <button class="map-tech-btn" id="btn-geo" style="color:#bc8cff">
              <span class="map-tech-dot" style="background:#bc8cff"></span>
              <div><div>Geothermal</div><div class="map-tech-meta">2000kW · $5M · 13sq</div></div>
            </button>
            <button class="map-tech-btn" id="btn-hydroL" style="color:#39c8e8">
              <span class="map-tech-dot" style="background:#39c8e8"></span>
              <div><div>Hydro (Low)</div><div class="map-tech-meta">500kW · $4M · water</div></div>
            </button>
            <button class="map-tech-btn" id="btn-hydroH" style="color:#0099cc">
              <span class="map-tech-dot" style="background:#0099cc"></span>
              <div><div>Hydro (High)</div><div class="map-tech-meta">2000kW · $4M · water</div></div>
            </button>
            <button class="map-tech-btn" id="btn-tidal" style="color:#00c8aa">
              <span class="map-tech-dot" style="background:#00c8aa"></span>
              <div><div>Tidal</div><div class="map-tech-meta">500kW · $1.5M · coast</div></div>
            </button>
            <button class="map-tech-btn" id="btn-biomass" style="color:#7ee787">
              <span class="map-tech-dot" style="background:#7ee787"></span>
              <div><div>Biomass</div><div class="map-tech-meta">1000kW · $3.5M · 13sq</div></div>
            </button>

            <div class="map-sidebar-section">Storage</div>
            <button class="map-tech-btn" id="btn-bess" style="color:#ff8c8c">
              <span class="map-tech-dot" style="background:#ff8c8c"></span>
              <div><div>BESS</div><div class="map-tech-meta">1000kWh · $500K · 0.5cm sq</div></div>
            </button>
            <button class="map-tech-btn" id="btn-thermal" style="color:#ffb347">
              <span class="map-tech-dot" style="background:#ffb347"></span>
              <div><div>Thermal</div><div class="map-tech-meta">2500kWh · $1M · 1cm sq</div></div>
            </button>
            <button class="map-tech-btn" id="btn-flywheel" style="color:#da8fff">
              <span class="map-tech-dot" style="background:#da8fff"></span>
              <div><div>Flywheel</div><div class="map-tech-meta">1000kWh · $300K · 1cm sq</div></div>
            </button>
            <button class="map-tech-btn" id="btn-caes" style="color:#84fab0">
              <span class="map-tech-dot" style="background:#84fab0"></span>
              <div><div>CAES</div><div class="map-tech-meta">5000kWh · $2M · 2cm sq</div></div>
            </button>

            <div class="map-sidebar-section">Placements</div>
            <div class="map-counts" id="countsPanel">
              <div style="font-size:10px;color:var(--muted);text-align:center;padding:4px">No placements yet</div>
            </div>

            <div class="map-sidebar-section" id="violationsSectionHeader">Violations</div>
            <div class="map-violations-panel" id="violationsPanel">
              <div class="map-no-violations">✓ No violations</div>
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

          <div class="map-container" id="mapContainer">
            <div class="map-canvas-wrap" id="canvasWrap">
              <canvas id="bgCanvas"></canvas>
              <canvas id="overlayCanvas" style="position:absolute;top:0;left:0"></canvas>
            </div>
            <div style="position:absolute;bottom:12px;left:12px;display:flex;gap:4px;z-index:10">
              <button id="zoomIn" style="width:28px;height:28px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#e6edf3;font-size:16px;font-weight:700;cursor:pointer;line-height:1;padding:0">+</button>
              <button id="zoomReset" style="height:28px;padding:0 8px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#7d8590;font-size:10px;font-weight:600;cursor:pointer;font-family:'Space Grotesk',sans-serif">100%</button>
              <button id="zoomOut" style="width:28px;height:28px;border-radius:4px;border:1px solid #30363d;background:#161b22;color:#e6edf3;font-size:16px;font-weight:700;cursor:pointer;line-height:1;padding:0">−</button>
            </div>
            <div class="map-info-panel">
              <div class="map-info-row"><span class="map-info-key">Cursor</span><span class="map-info-val" id="infoCursor">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Zone</span><span class="map-info-val" id="infoZone">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Distance to sub</span><span class="map-info-val" id="infoDist">–</span></div>
              <div class="map-info-row"><span class="map-info-key">Cable cost</span><span class="map-info-val" id="infoCableCost">–</span></div>
            </div>
          </div>
        </div>

        <div class="map-tooltip hidden" id="mapTooltip"></div>
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
  const TECHS: Record<string, { name: string; color: string; kw: number; cost: number; storage: number; storageKwh: number; symbol: string; size: number; rule: string; bufferCm: number; squareFootprint: number }> = {
    solar:    { name:'Solar PV',     color:'#f0b429', kw:500,  cost:1000000,  storage:0, storageKwh:0,    symbol:'☀', size:2.25, rule:'land',  bufferCm:0,  squareFootprint:5 },
    wind:     { name:'Wind',         color:'#58a6ff', kw:3000, cost:2500000,  storage:0, storageKwh:0,    symbol:'🌬', size:1,    rule:'any',   bufferCm:5,  squareFootprint:0 },
    geo:      { name:'Geothermal',   color:'#bc8cff', kw:2000, cost:5000000,  storage:0, storageKwh:0,    symbol:'⬡', size:3.6,  rule:'land',  bufferCm:0,  squareFootprint:13 },
    hydroL:   { name:'Hydro Low',    color:'#39c8e8', kw:500,  cost:4000000,  storage:0, storageKwh:0,    symbol:'〜', size:1,    rule:'water', bufferCm:0,  squareFootprint:1 },
    hydroH:   { name:'Hydro High',   color:'#0099cc', kw:2000, cost:4000000,  storage:0, storageKwh:0,    symbol:'〜', size:1,    rule:'water', bufferCm:0,  squareFootprint:1 },
    tidal:    { name:'Tidal',        color:'#00c8aa', kw:500,  cost:1500000,  storage:0, storageKwh:0,    symbol:'⊕', size:1,    rule:'coast', bufferCm:0,  squareFootprint:1 },
    biomass:  { name:'Biomass',      color:'#7ee787', kw:1000, cost:3500000,  storage:0, storageKwh:0,    symbol:'🌿', size:3.6,  rule:'road',  bufferCm:0,  squareFootprint:13 },
    bess:     { name:'BESS',         color:'#ff8c8c', kw:0,    cost:500000,   storage:1, storageKwh:1000, symbol:'▣', size:0.5,  rule:'land',  bufferCm:0,  squareFootprint:0.25 },
    thermal:  { name:'Thermal',      color:'#ffb347', kw:0,    cost:1000000,  storage:1, storageKwh:2500, symbol:'◈', size:1,    rule:'land',  bufferCm:0,  squareFootprint:1 },
    flywheel: { name:'Flywheel',     color:'#da8fff', kw:0,    cost:300000,   storage:1, storageKwh:1000, symbol:'⊙', size:1,    rule:'land',  bufferCm:0,  squareFootprint:1 },
    caes:     { name:'CAES',         color:'#84fab0', kw:0,    cost:2000000,  storage:1, storageKwh:5000, symbol:'◎', size:2,    rule:'land',  bufferCm:0,  squareFootprint:4 },
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
      width: 900, height: 1274, scale: 3048,
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
      width: 950, height: 671, scale: 3048,
      substationPx: [440, 500],
      features: [
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
      width: 950, height: 671, scale: 4048,
      substationPx: [196, 363],
      features: [
        { type:'forest', points:[[707,263],[765,251],[804,300],[780,317],[784,343],[702,363],[685,326],[522,377],[682,320]] },
        { type:'field', points:[[228,416],[217,307],[265,320],[344,293],[358,255],[416,240],[502,281],[527,300],[699,274],[677,318],[425,401],[411,376],[347,393],[339,408],[265,430]] },
        { type:'field', points:[[479,217],[526,259],[609,242],[649,273],[762,250],[690,159]] },
        { type:'building', points:[[139,335],[160,341],[158,360],[195,367],[192,383],[127,375],[129,378]] },
        { type:'parking', points:[[132,379],[192,386],[184,409],[124,402]] },
        { type:'tidal_zone', points:[[877,344],[894,352],[949,401],[932,434],[934,470],[949,670],[906,667],[906,595],[864,645],[863,665],[844,668],[868,601],[893,571],[885,531]] },
        { type:'water', points:[[887,342],[943,369],[936,313],[893,246],[790,189],[748,85],[749,2],[693,2],[700,117],[714,158]] },
        { type:'boundary', points:[[97,332],[117,404],[201,416],[277,443],[363,423],[352,398],[410,382],[425,449],[434,442],[422,405],[691,339],[698,376],[788,347],[783,320],[787,313],[808,301],[690,155],[315,254],[317,263]] },
      ]
    },
    LCS: {
      name: 'LCS — Coastal Forest',
      desc: 'Heavily forested campus with field and nearby pond',
      width: 950, height: 671, scale: 5213,
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
      name: 'STG — Lakeside Campus',
      desc: 'Hillside campus beside a marsh and tidal zone',
      width: 900, height: 1274, scale: 3448,
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

  const GRID = 18;
  let currentMap = 'EDS';
  let selectedTech = 'solar';
  let mode = 'place';
  let mapScale = 1;
  let zoomLevel = 1.0;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5.0;
  type Placement = { tech: string; cx: number; cy: number; id: number; violations: string[] };
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
    LCS: [{ label: 'Coastal', color: '#39c8e8' }, { label: 'Forest', color: '#2ea043' }, { label: 'High Contour', color: '#d29922' }],
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
  getEl('modPan')?.addEventListener('click', () => setMode('pan'));
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

    // Property boundary fallback: only draw on schematic fallback.
    // Satellite maps already include parcel outlines.
    const boundary = m.features.find(f => f.type === 'boundary');
    if (!imgLoaded && boundary && boundary.points) {
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

    plist.filter(p => p.tech === 'wind').forEach(p => {
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 5 * GRID, 0, Math.PI * 2);
      ctx.fillStyle = '#58a6ff35'; ctx.fill();
      ctx.strokeStyle = '#58a6ff90'; ctx.lineWidth = 2; ctx.stroke();
    });

    plist.forEach(p => {
      const t = TECHS[p.tech];
      const r = (t.size * GRID) / 2;

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(p.cx, p.cy + r + 2, r * 0.8, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.globalAlpha = 1;
      ctx.fillStyle = t.color + 'dd';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;

      if (p.tech === 'wind') {
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, Math.max(r, 8), 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        const cells = FOOTPRINT_CELLS[p.tech];
        if (cells) {
          const minX = Math.min(...cells.map(([x]) => x));
          const maxX = Math.max(...cells.map(([x]) => x));
          const minY = Math.min(...cells.map(([, y]) => y));
          const maxY = Math.max(...cells.map(([, y]) => y));
          const widthCells = maxX - minX + 1;
          const heightCells = maxY - minY + 1;
          const left = p.cx - (widthCells * GRID) / 2;
          const top = p.cy - (heightCells * GRID) / 2;

          cells.forEach(([cx, cy]) => {
            const px = left + cx * GRID;
            const py = top + cy * GRID;
            ctx.fillStyle = p.tech === 'solar' ? '#1a5aaa' : t.color + 'aa';
            ctx.fillRect(px, py, GRID, GRID);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 0.5, py + 0.5, GRID - 1, GRID - 1);
          });
        } else {
          const span = Math.max(0.5, t.size) * GRID;
          const left = p.cx - span / 2;
          const top = p.cy - span / 2;
          ctx.fillStyle = t.color + 'aa';
          ctx.fillRect(left, top, span, span);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(left + 0.5, top + 0.5, span - 1, span - 1);
        }
      }

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(13, r)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText(t.symbol, p.cx, p.cy + Math.max(5, r * 0.35));


      // Label with background for readability
      ctx.font = 'bold 11px Space Grotesk,sans-serif';
      ctx.textAlign = 'center';
      const labelY = p.cy - Math.max(r, 8) - 6;
      const labelW = ctx.measureText(t.name).width + 8;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(p.cx - labelW / 2, labelY - 10, labelW, 13);
      ctx.fillStyle = t.color;
      ctx.fillText(t.name, p.cx, labelY);

      ctx.globalAlpha = 1;
    });

    if (mode === 'place' && selectedTech && mousePos.x > 0) {
      const t = TECHS[selectedTech];
      const snapped = snapToGridCell(mousePos.x, mousePos.y, selectedTech);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = t.color;
      if (selectedTech === 'wind') {
        ctx.beginPath();
        ctx.arc(snapped.x, snapped.y, Math.max(8, (t.size * GRID) / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        const cells = FOOTPRINT_CELLS[selectedTech];
        if (cells) {
          const minX = Math.min(...cells.map(([x]) => x));
          const maxX = Math.max(...cells.map(([x]) => x));
          const minY = Math.min(...cells.map(([, y]) => y));
          const maxY = Math.max(...cells.map(([, y]) => y));
          const widthCells = maxX - minX + 1;
          const heightCells = maxY - minY + 1;
          const left = snapped.x - (widthCells * GRID) / 2;
          const top = snapped.y - (heightCells * GRID) / 2;
          cells.forEach(([cx, cy]) => {
            const px = left + cx * GRID;
            const py = top + cy * GRID;
            ctx.fillRect(px, py, GRID, GRID);
          });
        } else {
          const span = Math.max(0.5, t.size) * GRID;
          const left = snapped.x - span / 2;
          const top = snapped.y - span / 2;
          ctx.fillRect(left, top, span, span);
        }
      }
      ctx.globalAlpha = 1;
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
      pinch_point: '⭐ 20% tidal power bonus!',
      building: '⚠ Restricted — no wind buffer',
      forest: '⚠ Forested — wind turbines violate Migratory Bird Ordinance',
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
      const tooCloseToBuilding = MAPS[currentMap].features.some(f =>
        f.type === 'building' && (f.points || []).length >= 2 && pointToPolygonDist(x, y, f.points!) < GRID * 3
      );
      if (tooCloseToBuilding) violations.push('Biomass too close to building — exhaust and smoke hazard near windows');
    }
    if (tech === 'wind') {
      MAPS[currentMap].features.forEach(f => {
        if (f.type === 'building' && f.rect) {
          const [rx, ry, rw, rh] = f.rect;
          const closest = [Math.max(rx, Math.min(x, rx + rw)), Math.max(ry, Math.min(y, ry + rh))];
          const d = Math.hypot(closest[0] - x, closest[1] - y);
          if (d < 5 * GRID) violations.push('Wind buffer touches building — $200K fee');
        }
      });
      if (zone && zone.type === 'forest') {
        violations.push('Migratory Bird Ordinance: turbines not permitted in forested areas');
      }
    }
    return violations;
  }

  function placeUnit(x: number, y: number) {
    if (!selectedTech) return;
    const snapped = snapToGridCell(x, y, selectedTech);
    const violations = checkPlacementViolations(snapped.x, snapped.y, selectedTech);
    placements[currentMap].push({
      tech: selectedTech, cx: snapped.x, cy: snapped.y,
      id: Date.now() + Math.random(),
      violations
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
    const idx = plist.findIndex(p => {
      const t = TECHS[p.tech];
      if (p.tech === 'wind') {
        const r = Math.max(12, t.size * GRID / 2) + 4;
        return Math.hypot(p.cx - x, p.cy - y) < r;
      }
      const cells = FOOTPRINT_CELLS[p.tech];
      if (cells) {
        const minX = Math.min(...cells.map(([cx]) => cx));
        const maxX = Math.max(...cells.map(([cx]) => cx));
        const minY = Math.min(...cells.map(([, cy]) => cy));
        const maxY = Math.max(...cells.map(([, cy]) => cy));
        const width = (maxX - minX + 1) * GRID;
        const height = (maxY - minY + 1) * GRID;
        const left = p.cx - width / 2;
        const top = p.cy - height / 2;
        return x >= left && x <= left + width && y >= top && y <= top + height;
      }
      const span = Math.max(0.5, t.size) * GRID;
      const left = p.cx - span / 2;
      const top = p.cy - span / 2;
      return x >= left && x <= left + span && y >= top && y <= top + span;
    });
    if (idx >= 0) {
      plist.splice(idx, 1);
      buildOptimalCables();
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

  function computeForestStats() {
    const m = MAPS[currentMap];
    // Campus area via shoelace formula on boundary polygon
    const boundary = m.features.find(f => f.type === 'boundary' && f.points);
    let campusArea = 0;
    if (boundary?.points) {
      campusArea = polygonArea(boundary.points);
    } else {
      campusArea = m.width * m.height;
    }
    // Total forested area — supports both polygon points and rect
    const totalForestArea = m.features
      .filter(f => f.type === 'forest')
      .reduce((sum, f) => sum + featureArea(f), 0);
    const forestPct = campusArea > 0 ? (totalForestArea / campusArea) * 100 : 0;
    // Cleared forest: placements whose center falls inside any forest feature
    let clearedArea = 0;
    (placements[currentMap] || []).forEach(p => {
      const onForest = m.features.some(f => f.type === 'forest' && pointInFeature(p.cx, p.cy, f));
      if (onForest) {
        const t = TECHS[p.tech];
        const fp = t.squareFootprint > 0 ? t.squareFootprint : 1;
        clearedArea += fp * GRID * GRID;
      }
    });
    const clearedPct = totalForestArea > 0 ? Math.min(100, (clearedArea / totalForestArea) * 100) : 0;
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
      totalCost += t.cost;
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
    if (totalKw > 3000) totalCost += 500000;

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

    // Sync to shared state so Grid Simulator can read it
    sharedState.techCounts = counts;
    sharedState.totalMapCost = totalCost;
    sharedState.totalMapKw = totalKw;
    sharedState.totalMapCableFt = cableFt;
    sharedState.windSensitiveZoneCount = windSensitive;
    emitMapUpdate();

    const budgetLimit = sharedState.budgetLimit;
    const budgetM = (budgetLimit / 1e6).toFixed(0);
    const islandTime = totalKw > 0 ? (totalStorage / 5000).toFixed(1) : '0';

    const kwEl = getEl('statPower');
    if (kwEl) {
      kwEl.className = 'map-stat ' + (totalKw >= 5000 ? 'ok' : totalKw >= 3000 ? 'warn' : '');
      kwEl.innerHTML = `Power: <span>${(totalKw / 1000).toFixed(1)}MW / 5MW</span>`;
    }

    const storageEl = getEl('statStorage'); if (storageEl) storageEl.innerHTML = `Storage: <span>${totalStorage.toLocaleString()} kWh</span>`;
    const cableEl = getEl('statCable'); if (cableEl) cableEl.innerHTML = `Cable: <span>${Math.round(cableFt)} ft</span>`;
    const budgetEl = getEl('statBudget');
    if (budgetEl) {
      const over = totalCost > budgetLimit;
      budgetEl.className = 'map-stat' + (over ? ' danger' : totalCost > budgetLimit * 0.85 ? ' warn' : '');
      budgetEl.innerHTML = `Budget: <span>$${(totalCost / 1e6).toFixed(2)}M / $${budgetM}M</span>`;
    }
    const islandEl = getEl('statIsland'); if (islandEl) islandEl.innerHTML = `Island: <span>${islandTime}h</span>`;
    const { forestPct, clearedPct } = computeForestStats();
    const forestEl = getEl('statForest');
    if (forestEl) {
      if (forestPct === 0) {
        forestEl.className = 'map-stat';
        forestEl.innerHTML = `Forest: <span>none</span>`;
      } else if (clearedPct === 0) {
        forestEl.className = 'map-stat';
        forestEl.innerHTML = `Forest: <span>${forestPct}% of campus</span>`;
      } else {
        forestEl.className = 'map-stat ' + (clearedPct > 25 ? 'err' : clearedPct > 10 ? 'warn' : '');
        forestEl.innerHTML = `Forest: <span>${clearedPct}% cleared</span> <span style="opacity:0.5">(${forestPct}% of campus)</span>`;
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
    if (totalKw > 3000) allViolations.unshift('⚡ Utility upgrade required (+$500K)');
    if (totalStorage < 2000 && allPlacements.length > 0) allViolations.push('⚠ Need 2,000+ kWh for Grid-Down resilience');
    if (totalCost > budgetLimit) allViolations.push(`⛔ OVER BUDGET by $${((totalCost - budgetLimit) / 1e6).toFixed(2)}M`);

    const vp = getEl('violationsPanel');
    const vh = getEl('violationsSectionHeader');
    if (vp) {
      vp.innerHTML = allViolations.length
        ? allViolations.map(v => `<div class="map-violation">⚠ ${v}</div>`).join('')
        : '<div class="map-no-violations">✓ No violations</div>';
    }
    if (vh) {
      vh.style.color = allViolations.length ? 'var(--danger)' : '';
      vh.textContent = allViolations.length ? `Violations (${allViolations.length})` : 'Violations';
    }
    sharedState.mapViolations = [...allViolations];

    // Unused import suppressor
    void MAP_TECH_TO_SIM;
  }

  function selectTech(tech: string) {
    selectedTech = tech;
    document.querySelectorAll('.map-tech-btn').forEach(b => b.classList.remove('active'));
    getEl(`btn-${tech}`)?.classList.add('active');
    if (mode !== 'place') setMode('place');
  }

  function setMode(m: string) {
    mode = m;
    getEl('modPlace')?.classList.toggle('active', m === 'place');
    getEl('modErase')?.classList.toggle('active', m === 'erase');
    getEl('modPan')?.classList.toggle('active', m === 'pan');
    const wrap = getEl('canvasWrap');
    wrap?.classList.toggle('erase-mode', m === 'erase');
    const ov = getEl<HTMLCanvasElement>('overlayCanvas');
    if (ov) ov.style.cursor = m === 'pan' ? 'grab' : '';
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

  if (overlayCanvas) {
    overlayCanvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (mode === 'pan') {
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
        placeUnit(x, y);
      } else if (mode === 'erase') {
        eraseUnit(x, y);
      } else if (false) {
        // cable mode removed — cables are auto-routed via MST
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
        overlayCanvas.style.cursor = mode === 'pan' ? 'grab' : '';
      }
    });

    overlayCanvas.addEventListener('mouseleave', () => {
      panDragging = false;
      mousePos = { x: 0, y: 0 };
      const tooltip = getEl('mapTooltip');
      if (tooltip) tooltip.className = 'map-tooltip hidden';
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
