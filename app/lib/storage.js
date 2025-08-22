// Breathelax/app/lib/storage.js
export const STORAGE_KEY = "breathelax_usage";

export function saveUsage(seconds) {
  try {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const obj = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const d = new Date();
    const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    obj[dayKey] = (obj[dayKey] || 0) + seconds;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

export function getUsageLastNDays(n = 7) {
  const arr = [];
  try {
    const obj = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      arr.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        seconds: obj[dayKey] || 0,
      });
    }
  } catch {
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), seconds: 0 });
    }
  }
  return arr;
}

export function calcStreak() {
  let streak = 0;
  try {
    const obj = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (let i = 0; ; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      if ((obj[dayKey] || 0) > 0) streak++;
      else break;
    }
  } catch {}
  return streak;
}

// tiny util so StatsPanel can clamp
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
