// Breathelax/app/components/InstallPrompt.jsx
import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault(); // stop default mini-prompt
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch {}
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center pointer-events-none z-50">
      <button
        onClick={install}
        className="pointer-events-auto px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:brightness-110 active:translate-y-px"
      >
        📲 Installera Breathelax
      </button>
    </div>
  );
}
