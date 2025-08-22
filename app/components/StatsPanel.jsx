// Breathelax/app/components/StatsPanel.jsx
import React, { useEffect, useState } from "react";
import { getUsageLastNDays, calcStreak } from "../lib/storage";
import { clamp } from "../lib/utils";

export default function StatsPanel() {
  const [data, setData] = useState(() => getUsageLastNDays(7));
  const [streak, setStreak] = useState(() => calcStreak());

  useEffect(() => {
    const id = setInterval(() => {
      setData(getUsageLastNDays(7));
      setStreak(calcStreak());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const maxSec = Math.max(60, ...data.map((d) => d.seconds));
  const total = data.reduce((a, b) => a + b.seconds, 0);

  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-medium">Statistics</div>
        <div className="text-xs opacity-70">Last 7 days</div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <InfoTile label="Total Time" value={`${Math.round(total / 60)} min`} />
        <InfoTile label="Today" value={`${Math.round(data[6].seconds / 60)} min`} />
        <InfoTile label="Streak" value={`${streak} days`} />
      </div>
      <div className="mt-5 flex items-end gap-3 h-28">
        {data.map((d,i)=>(
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-t-xl bg-indigo-400/60" style={{height:`${clamp((d.seconds/maxSec)*100,2,100)}%`}} />
            <div className="text-[10px] opacity-70">{d.label.slice(0,1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}
