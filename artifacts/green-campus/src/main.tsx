import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 Rendering App...");
try {
  createRoot(document.getElementById("root")!).render(<App />);
  console.log("✅ App rendered successfully");
} catch (error) {
  console.error("❌ Error rendering App:", error);
}
