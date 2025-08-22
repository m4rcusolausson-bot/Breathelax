// Breathelax/app/App.jsx
import React, { useEffect } from "react";
import BreathingApp from "./components/BreathelaxApp";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  // Register Service Worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen w-full">
      <BreathingApp />
      <InstallPrompt /> {/* Shows when the app is installable */}
    </div>
  );
}
