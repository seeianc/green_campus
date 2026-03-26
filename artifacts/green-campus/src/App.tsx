import EnergyGridSimulator from "@/pages/EnergyGridSimulator";

export default function App() {
  console.log("🎨 App component rendering");

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
        <div style={{ marginLeft: "auto", marginRight: "16px", fontSize: "11px", color: "#7d8590", fontFamily: "monospace" }}>
          Green Campus Planning Tools
        </div>
      </nav>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EnergyGridSimulator />
      </div>
    </div>
  );
}
