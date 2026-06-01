// Lightweight dependency-free SVG charts (mirrors the Android Canvas charts).

const W = 320;
const H = 150;

export function BarChart({ entries, color = "#2563EB" }) {
  if (!entries || entries.length === 0) return null;
  const max = Math.max(1, ...entries.map((e) => e.value));
  const slot = W / entries.length;
  const barW = slot * 0.5;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-40">
        {entries.map((e, i) => {
          const h = (e.value / max) * (H - 8);
          const x = i * slot + (slot - barW) / 2;
          return (
            <rect
              key={i}
              x={x}
              y={H - h}
              width={barW}
              height={h}
              rx={barW / 3}
              fill={color}
            />
          );
        })}
      </svg>
      <div className="flex">
        {entries.map((e, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted truncate">
            {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ entries, color = "#0EA5E9" }) {
  if (!entries || entries.length < 2) {
    return entries && entries.length === 1 ? <BarChart entries={entries} color={color} /> : null;
  }
  const max = Math.max(...entries.map((e) => e.value));
  const min = Math.min(...entries.map((e) => e.value));
  const range = Math.max(1, max - min);
  const stepX = W / (entries.length - 1);
  const y = (v) => H - 8 - ((v - min) / range) * (H - 24);
  const pts = entries.map((e, i) => `${i * stepX},${y(e.value)}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `M 0,${H} L ${pts.join(" L ")} L ${(entries.length - 1) * stepX},${H} Z`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-40">
        <path d={area} fill={color} opacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div className="flex">
        {entries.map((e, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted truncate">
            {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}
