import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";
import EnergyGridSimulator from "@/pages/EnergyGridSimulator";
import CampusMapTool from "@/pages/CampusMapTool";
import { sharedState } from "@/shared";

// Firebase config — these values are public-safe, access is controlled by DB rules
const firebaseConfig = {
  apiKey: "AIzaSyAuHDUZSSHNs_8VmJXDUBVSjE4V_7AmjS4",
  authDomain: "green-campus-c4ebd.firebaseapp.com",
  databaseURL: "https://green-campus-c4ebd-default-rtdb.firebaseio.com",
  projectId: "green-campus-c4ebd",
  storageBucket: "green-campus-c4ebd.firebasestorage.app",
  messagingSenderId: "59870993495",
  appId: "1:59870993495:web:57c202057d5c7f300d5712",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [shareLabel, setShareLabel] = useState("🔗 Share Plan");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("⚡ Start Session");

  const sessionIdRef = useRef<string>("");
  const lastContentRef = useRef<string>("");
  const pushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPullingRef = useRef(false);
  const dbListenerRef = useRef<ReturnType<typeof ref> | null>(null);

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

  // ── Snapshot share (URL-based, no session) ──────────────────────────────
  function sharePlan() {
    const plan = getPlanState();
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(plan));
    const url = `${window.location.origin}${window.location.pathname}?plan=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareLabel("✅ Copied!");
      setTimeout(() => setShareLabel("🔗 Share Plan"), 2500);
    });
  }

  // ── Firebase: attach real-time listener ────────────────────────────────
  function attachListener(sessionId: string) {
    const dbRef = ref(db, `sessions/${sessionId}`);
    dbListenerRef.current = dbRef;
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || !data.plan) return;
      const content = JSON.stringify(data.plan);
      if (content === lastContentRef.current) return;
      try {
        const plan = JSON.parse(content);
        isPullingRef.current = true;
        lastContentRef.current = content;
        window.dispatchEvent(new CustomEvent("gc:restore-plan", { detail: plan }));
        setTimeout(() => { isPullingRef.current = false; }, 3200);
      } catch {
        console.warn("Failed to parse session data");
      }
    });
  }

  // ── Firebase: push state if changed (runs on interval) ─────────────────
  async function maybePush() {
    if (!sessionIdRef.current || isPullingRef.current) return;
    const content = JSON.stringify(getPlanState());
    if (content === lastContentRef.current) return;
    lastContentRef.current = content;
    await set(ref(db, `sessions/${sessionIdRef.current}`), { plan: JSON.parse(content) });
  }

  function startPushInterval() {
    if (pushTimerRef.current) clearInterval(pushTimerRef.current);
    pushTimerRef.current = setInterval(() => maybePush(), 3000);
  }

  // ── Stop session ────────────────────────────────────────────────────────
  function stopSession() {
    if (dbListenerRef.current) { off(dbListenerRef.current); dbListenerRef.current = null; }
    if (pushTimerRef.current) { clearInterval(pushTimerRef.current); pushTimerRef.current = null; }
    sessionIdRef.current = "";
    lastContentRef.current = "";
    isPullingRef.current = false;
    setSessionActive(false);
    setSessionLabel("⚡ Start Session");
    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    window.history.replaceState(null, "", url.toString());
  }

  // ── Create a new session ────────────────────────────────────────────────
  async function createSession() {
    if (sessionActive) { stopSession(); return; }
    setSessionLabel("Starting…");
    try {
      const sessionId = generateSessionId();
      const plan = getPlanState();
      const content = JSON.stringify(plan);
      await set(ref(db, `sessions/${sessionId}`), { plan });
      sessionIdRef.current = sessionId;
      lastContentRef.current = content;

      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      url.searchParams.set("session", sessionId);
      window.history.replaceState(null, "", url.toString());
      navigator.clipboard.writeText(url.toString()).catch(() => {});

      attachListener(sessionId);
      startPushInterval();
      setSessionActive(true);
      setSessionLabel("● Live (click to stop)");
      alert("Session started! URL copied to clipboard.\n\nShare it with others — no setup needed on their end.");
    } catch (err) {
      console.error(err);
      setSessionLabel("⚡ Start Session");
      alert("Failed to start session. Check your internet connection.");
    }
  }

  // ── Join an existing session ────────────────────────────────────────────
  async function joinSession(sessionId: string) {
    sessionIdRef.current = sessionId;
    attachListener(sessionId);
    startPushInterval();
    setSessionActive(true);
    setSessionLabel("● Live (click to stop)");
  }

  // ── On mount: restore from ?plan= or join ?session= ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get("session");
    const planParam = params.get("plan");

    if (sessionParam) {
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
      if (dbListenerRef.current) off(dbListenerRef.current);
      if (pushTimerRef.current) clearInterval(pushTimerRef.current);
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
