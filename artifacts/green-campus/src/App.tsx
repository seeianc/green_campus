import { useState } from "react";
import CampusMapTool from "@/pages/CampusMapTool";
import EnergyGridSimulator from "@/pages/EnergyGridSimulator";

const TOOLS = [
  { id: "map", label: "⚡ Campus Map Placer" },
  { id: "simulator", label: "📊 Grid Simulator" },
];

export default function App() {
  const [activeTool, setActiveTool] = useState<"map" | "simulator">("map");

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
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as "map" | "simulator")}
            style={{
              padding: "10px 20px",
              background: activeTool === tool.id ? "#161b22" : "transparent",
              color: activeTool === tool.id ? "#e6edf3" : "#7d8590",
              border: "none",
              borderBottom: activeTool === tool.id ? "2px solid #3fb950" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeTool === tool.id ? 600 : 400,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.15s",
            }}
          >
            {tool.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", marginRight: "16px", fontSize: "11px", color: "#7d8590", fontFamily: "monospace" }}>
          Green Campus Planning Tools
        </div>
      </nav>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: activeTool === "map" ? "flex" : "none", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <CampusMapTool />
        </div>
        <div style={{ display: activeTool === "simulator" ? "flex" : "none", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <EnergyGridSimulator />
        </div>
      </div>
    </div>
  );
}
