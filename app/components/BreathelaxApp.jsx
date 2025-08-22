// Breathelax/app/components/BreathelaxApp.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { saveUsage } from "../lib/storage";
import StatsPanel from "./StatsPanel";

const PATTERNS = {
  Box: { label: "Box", seq: [4, 4, 4, 4] },
  Relax: { label: "Relax", seq: [4, 6, 8, 0] },
  Energize: { label: "Energize", seq: [6, 2, 6, 0] },
  Sleep: { label: "Sleep", seq: [4, 7, 8, 0] },
};

const DARK_BG = "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950";
const LIGHT_BG = "bg-gradient-to-b from-sky-50 via-sky-100 to-white";

const fmt = (n) => `${n}`.padStart(2, "0");
const MIN_SESSION_SECONDS = 15; // minimum length for a session to be saved

export default function BreathelaxApp() {
  const [running, setRunning] = useState(false);
  const [patternKey, setPatternKey] = useState("Relax");
  const [custom, setCustom] = useState([4, 0, 4, 0]);
  const [phase, setPhase] = useState(0); // 0=inhale,1=hold1,2=exhale,3=hold2
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [bgSound, setBgSound] = useState("None");
  const [dark, setDark] = useState(true);
  const [full, setFull] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const seq = useMemo(() => {
    return patternKey === "Custom" ? custom : (PATTERNS[patternKey]?.seq || PATTERNS.Relax.seq);
  }, [patternKey, custom]);

  // WebAudio context
  const audioCtxRef = useRef(null);
  const bgOscRef = useRef(null);

  const ping = (freq = 440) => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g).connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o.start();
      o.stop(now + 0.4);
    } catch (e) {}
  };

  const startBg = () => {
    stopBg();
    if (bgSound === "None") return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = bgSound === "Wave" ? "sine" : "triangle";
      o.frequency.value = bgSound === "Wave" ? 110 : 174;
      g.gain.value = 0.02;
      o.connect(g).connect(ctx.destination);
      o.start();
      bgOscRef.current = o;
    } catch (e) {}
  };
  const stopBg = () => {
    if (bgOscRef.current) {
      try { bgOscRef.current.stop(); } catch {}
      bgOscRef.current = null;
    }
  };

  useEffect(() => { return () => stopBg(); }, []);

  // Timer engine
  useEffect(() => {
    let raf; let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (running) {
        setSessionSeconds((s) => s + dt);
        setTimeInPhase((t) => t + dt);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // Phase progression
  useEffect(() => {
    if (!running) return;
    const dur = seq[phase] || 0;
    if (dur === 0 && (phase === 1 || phase === 3)) {
      setPhase((p) => (p + 1) % 4);
      ping(660);
      setTimeInPhase(0);
      return;
    }
    if (timeInPhase >= dur && dur > 0) {
      setPhase((p) => (p + 1) % 4);
      ping(phase === 2 ? 392 : 523);
      setTimeInPhase(0);
    }
  }, [timeInPhase, phase, seq, running]);

  // Save session when stopped
  const prevRunning = useRef(false);
  useEffect(() => {
    if (!running && prevRunning.current) {
      if (sessionSeconds >= MIN_SESSION_SECONDS) {
        saveUsage(Math.floor(sessionSeconds));
      }
      setSessionSeconds(0);
    }
    prevRunning.current = running;
  }, [running]);

  const progressInPhase = useMemo(() => {
    const dur = seq[phase] || 1;
    return Math.min(1, Math.max(0, dur ? timeInPhase / dur : 1));
  }, [timeInPhase, seq, phase]);

  // circle scale based on phase
  const scale = useMemo(() => {
    const minS = 0.65, maxS = 1.0;
    if (phase === 0) return minS + (maxS - minS) * progressInPhase; // inhale
    if (phase === 2) return maxS - (maxS - minS) * progressInPhase; // exhale
    return phase === 1 ? maxS : minS; // holds
  }, [phase, progressInPhase]);

  const phaseLabel = ["Inhale", "Hold", "Exhale", "Hold"][phase];
  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); setFull(true);} 
      else { await document.exitFullscreen(); setFull(false);} 
    } catch (e) {}
  };
  const seqLabel = (s) => s.join("-");

  const bgClass = dark ? DARK_BG : LIGHT_BG;
  const textClass = dark ? "text-slate-100" : "text-slate-900";

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-xl tracking-wide font-semibold">BREATHELAX</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark((d) => !d)}>{dark ? "🌙" : "☀️"}</button>
            <button onClick={() => setSoundOn((s) => !s)}>{soundOn ? "🔊" : "🔇"}</button>
            <button onClick={toggleFull}>{full ? "🗗" : "🗖"}</button>
          </div>
        </div>

        {/* Main breathing view */}
        <div className="flex flex-col items-center justify-center px-6">
          <div className="text-center mb-4 opacity-80">{phaseLabel}</div>
          <div className="relative h-[320px] w-[320px]" onClick={() => setRunning((r) => !r)}>
            <div
              className="absolute inset-0 rounded-full shadow-2xl"
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.25s ease-out",
                background: dark
                  ? "radial-gradient(circle, rgba(99,102,241,0.65), rgba(56,189,248,0.25))"
                  : "radial-gradient(circle, rgba(56,189,248,0.5), rgba(99,102,241,0.15))"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-medium">
              <span>{phaseLabel}</span>
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-6 flex items-center gap-2 text-sm opacity-80">
            <span>{patternKey}</span>
            <span>{seqLabel(seq)}</span>
            <span>{fmt(Math.floor(sessionSeconds / 60))}:{fmt(Math.floor(sessionSeconds % 60))}</span>
          </div>

          {/* Stats */}
          <div className="mt-10 w-full max-w-md">
            <StatsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
