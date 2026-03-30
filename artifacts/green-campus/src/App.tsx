import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";
import EnergyGridSimulator from "@/pages/EnergyGridSimulator";
import CampusMapTool from "@/pages/CampusMapTool";
import { sharedState } from "@/shared";

const GIST_API = "https://api.github.com/gists";
const POLL_INTERVAL = 5000;
function getStoredPat(): string {
  return localStorage.getItem("gc_github_pat") || "";
}

function storePatIfNeeded(): string {
  let pat = localStorage.getItem("gc_github_pat") || "";
  if (!pat) {
    pat = window.prompt(
      "To join a live session, enter a GitHub Personal Access Token with 'gist' scope.\n\n" +
      "Create one at: github.com/settings/tokens → Tokens (classic) → Generate new token\n" +
      "→ check only 'gist' → set No expiration\n\n" +
      "This is stored only in your browser — never sent anywhere except GitHub."
    ) || "";
    if (pat) localStorage.setItem("gc_github_pat", pat);
  }
  return pat;
}

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [shareLabel, setShareLabel] = useState("🔗 Share Plan");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("⚡ Start Session");

  const sessionIdRef = useRef<string>("");
  const lastContentRef = useRef<string>("");
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPullingRef = useRef(false);

  // ── Plan serialization ──────────────────────────────────────────────────
  function getPlanState(): object {
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
    return { v: 1, placements: sharedState.placements, cables: sharedState.cables, sim, bessHours };
  }

  // ── Snapshot share (existing) ───────────────────────────────────────────
  function sharePlan() {
    const plan = getPlanState();
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(plan));
    const url = `${window.location.origin}${window.location.pathname}?plan=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareLabel("✅ Copied!");
      setTimeout(() => setShareLabel("🔗 Share Plan"), 2500);
    });
  }

  // ── Gist helpers ────────────────────────────────────────────────────────
  async function gistPost(pat: string, content: string): Promise<string> {
    const res = await fetch(GIST_API, {
      method: "POST",
      headers: {
        Authorization: `token ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "Green Campus Plan Session",
        public: false,
        files: { "plan.json": { content } },
      }),
    });
    if (!res.ok) throw new Error(`Gist create failed: ${res.status}`);
    const data = await res.json();
    return data.id as string;
  }

  async function gistPatch(pat: string, gistId: string, content: string): Promise<void> {
    const res = await fetch(`${GIST_API}/${gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: { "plan.json": { content } } }),
    });
    if (!res.ok) console.warn(`Gist patch failed: ${res.status}`);
  }

  async function gistGet(gistId: string): Promise<string | null> {
    const pat = getStoredPat();
    const headers: Record<string, string> = { "Cache-Control": "no-cache" };
    if (pat) headers["Authorization"] = `token ${pat}`;
    const res = await fetch(`${GIST_API}/${gistId}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.files?.["plan.json"]?.content ?? null;
  }

  // ── Push state to Gist if changed (called on interval) ─────────────────
  async function maybePush() {
    if (!sessionIdRef.current || isPullingRef.current) return;
    const pat = getStoredPat();
    if (!pat) return;
    const content = JSON.stringify(getPlanState());
    if (content === lastContentRef.current) return;
    lastContentRef.current = content;
    await gistPatch(pat, sessionIdRef.current, content);
  }

  // ── Poll Gist for remote changes ────────────────────────────────────────
  async function pollGist(gistId: string) {
    const content = await gistGet(gistId);
    if (!content || content === lastContentRef.current) return;
    try {
      const plan = JSON.parse(content);
      isPullingRef.current = true;
      lastContentRef.current = content;
      window.dispatchEvent(new CustomEvent("gc:restore-plan", { detail: plan }));
      setTimeout(() => { isPullingRef.current = false; }, 3200);
    } catch {
      console.warn("Failed to parse Gist content");
    }
  }

  function startPolling(gistId: string) {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (pushTimerRef.current) clearInterval(pushTimerRef.current);
    pollTimerRef.current = setInterval(() => pollGist(gistId), POLL_INTERVAL);
    // Push local changes every 3 seconds if state has changed
    pushTimerRef.current = setInterval(() => maybePush(), 3000);
  }

  function stopSession() {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    if (pushTimerRef.current) { clearTimeout(pushTimerRef.current); pushTimerRef.current = null; }
    sessionIdRef.current = "";
    lastContentRef.current = "";
    setSessionActive(false);
    setSessionLabel("⚡ Start Session");
    // Remove session param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    window.history.replaceState(null, "", url.toString());
  }

  // ── Start a new session ─────────────────────────────────────────────────
  async function createSession() {
    if (sessionActive) { stopSession(); return; }
    const pat = storePatIfNeeded();
    if (!pat) { alert("A GitHub PAT is required to start a session."); return; }
    setSessionLabel("Creating…");
    try {
      const content = JSON.stringify(getPlanState());
      const gistId = await gistPost(pat, content);
      sessionIdRef.current = gistId;
      lastContentRef.current = content;

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      url.searchParams.set("session", gistId);
      window.history.replaceState(null, "", url.toString());

      // Copy session URL to clipboard
      navigator.clipboard.writeText(url.toString()).catch(() => {});

      setSessionActive(true);
      setSessionLabel("● Live (click to stop)");
      startPolling(gistId);
      alert(
        "Session started! Session URL copied to clipboard.\n\n" +
        "Share the URL with others so they can join. Each person needs their own GitHub PAT."
      );
    } catch (err) {
      console.error(err);
      setSessionLabel("⚡ Start Session");
      alert("Failed to create session. Check your GitHub PAT and try again.");
    }
  }

  // ── Join an existing session ────────────────────────────────────────────
  async function joinSession(gistId: string) {
    const pat = storePatIfNeeded();
    if (!pat) { alert("A GitHub PAT is required to join a session."); return; }
    const content = await gistGet(gistId);
    if (!content) { console.warn("Could not fetch session Gist"); return; }
    try {
      const plan = JSON.parse(content);
      sessionIdRef.current = gistId;
      lastContentRef.current = content;
      isPullingRef.current = true;
      window.dispatchEvent(new CustomEvent("gc:restore-plan", { detail: plan }));
      setTimeout(() => { isPullingRef.current = false; }, 3200);
    } catch {
      console.warn("Failed to parse session Gist");
    }
    setSessionActive(true);
    setSessionLabel("● Live (click to stop)");
    startPolling(gistId);
  }

  // ── On mount: restore from ?plan= or join ?session= ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get("session");
    const planParam = params.get("plan");

    if (sessionParam) {
      // Delay to let child components initialise
      setTimeout(() => joinSession(sessionParam), 300);
    } else if (planParam) {
      try {
        const json = LZString.decompressFromEncodedURIComponent(planParam);
        if (!json) return;
        const plan = JSON.parse(json);
        window.dispatchEvent(new CustomEvent("gc:restore-plan", { detail: plan }));
      } catch {
        console.warn("Failed to restore plan from URL");
      }
    }
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, []);

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
          onClick={createSession}
          style={{
            marginRight: "8px",
            padding: "5px 14px",
            borderRadius: "4px",
            border: `1px solid ${sessionActive ? "#388bfd" : "#30363d"}`,
            background: sessionActive ? "#0d2044" : "transparent",
            color: sessionActive ? "#79c0ff" : "#7d8590",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {sessionLabel}
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
