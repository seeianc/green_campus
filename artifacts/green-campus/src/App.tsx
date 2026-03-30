import { useState } from "react";
import EnergyGridSimulator from "@/pages/EnergyGridSimulator";
import CampusMapTool from "@/pages/CampusMapTool";

export default function App() {
  const [showMap, setShowMap] = useState(false);

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
