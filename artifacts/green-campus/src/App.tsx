import { useState, useEffect } from "react";
import LZString from "lz-string";
import EnergyGridSimulator from "@/pages/EnergyGridSimulator";
import CampusMapTool from "@/pages/CampusMapTool";
import { sharedState } from "@/shared";

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [shareLabel, setShareLabel] = useState("🔗 Share Plan");

  // On mount: restore plan from ?plan= URL param (after child components init)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("plan");
    if (!encoded) return;
    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return;
      const plan = JSON.parse(json);
      window.dispatchEvent(new CustomEvent("gc:restore-plan", { detail: plan }));
    } catch {
      console.warn("Failed to restore plan from URL");
    }
  }, []);

  function sharePlan() {
    const numIds = ["solar","wind","geo","hydroLow","hydroHigh","tidalStd","tidalPP","biomass",
                    "liIon","thermal","flywheel","caes","hydrogen","v2g","scada","cabling","wSolar","wElec","wEng"];
    const selectIds = ["windBuffer","demandPattern","budgetTier","workforce","envConstraints","pivotCard"];
    const sim: Record<string, string | number> = {};
    numIds.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      sim[id] = el ? +(el.value || 0) : 0;
    });
    selectIds.forEach(id => {
      const el = document.getElementById(id) as HTMLSelectElement | null;
      sim[id] = el ? el.value : "";
    });
    const bessHours: number[] = [];
    for (let i = 0; i < 24; i++) {
      const btn = document.getElementById(`hourBtn-${i}`);
      if (btn && btn.classList.contains("active")) bessHours.push(i);
    }
    const plan = { v: 1, placements: sharedState.placements, cables: sharedState.cables, sim, bessHours };
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(plan));
    const url = `${window.location.origin}${window.location.pathname}?plan=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareLabel("✅ Copied!");
      setTimeout(() => setShareLabel("🔗 Share Plan"), 2500);
    });
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0d1117" }}>
      <nav style={{
        background: "#0d1117",
        borderBottom: "1px solid #30363d",
        display: "flex",
        alignItems: "center",
        gap: 0,
        flexShrink: 0,
        paddingLeft: "12px",
      }}>
        <div style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#e6edf3", fontFamily: "'Space Grotesk', sans-serif" }}>
          📊 Renewable Energy Grid Simulator
        </div>
        <div style={{ marginLeft: "auto", marginRight: "12px", fontSize: "11px", color: "#7d8590", fontFamily: "monospace" }}>
          Green Campus Planning Tools
        </div>
        <button
          onClick={sharePlan}
          style={{
            marginRight: "8px",
            padding: "5px 14px",
            borderRadius: "4px",
            border: "1px solid #30363d",
            background: "transparent",
            color: "#7d8590",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {shareLabel}
        </button>
        <button
          onClick={() => setShowMap(v => !v)}
          style={{
            marginRight: "12px",
            padding: "5px 14px",
            borderRadius: "4px",
            border: `1px solid ${showMap ? "#3fb950" : "#30363d"}`,
            background: showMap ? "#1a3a22" : "transparent",
            color: showMap ? "#3fb950" : "#e6edf3",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {showMap ? "⚡ SIMULATOR" : "🗺 MAP"}
        </button>
      </nav>

      <div style={{ flex: 1, overflow: "hidden", display: showMap ? "none" : "flex", flexDirection: "column", minHeight: 0 }}>
        <EnergyGridSimulator />
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: showMap ? "flex" : "none", flexDirection: "column", minHeight: 0 }}>
        <CampusMapTool />
      </div>
    </div>
  );
}
