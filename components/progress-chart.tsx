type Point = { label: string; value: number };

export function ProgressChart({ points }: { points: Point[] }) {
  const width = 320;
  const height = 140;
  const padX = 16;
  const padY = 20;
  const min = 0;
  const max = 100;

  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - (p.value - min) / (max - min)) * (height - padY * 2),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x} ${height - padY} L${coords[0].x} ${height - padY} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="progress-line" x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#FF5DA2" />
          </linearGradient>
          <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#progress-fill)" />
        <path d={linePath} fill="none" stroke="url(#progress-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="#FF5DA2" stroke="#0A0A0F" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
