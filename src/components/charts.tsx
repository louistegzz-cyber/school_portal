interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  max?: number;
  suffix?: string;
}

export function BarChart({ data, height = 180, max, suffix }: BarChartProps) {
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / maxVal) * (height - 30));
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="text-xs font-semibold text-slate-700">{d.value}{suffix}</div>
              <div
                className="w-full rounded-t-md transition-all hover:opacity-90"
                style={{ height: h, backgroundColor: d.color ?? '#2563eb', minHeight: 4 }}
                title={`${d.label}: ${d.value}`}
              />
              <div className="text-[10px] text-slate-500 text-center truncate w-full">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function Donut({ data, size = 160 }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const stroke = 22;
  const inner = radius - stroke;
  const circ = 2 * Math.PI * (radius - stroke / 2);
  let offset = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = (
            <circle
              key={i}
              cx={radius}
              cy={radius}
              r={radius - stroke / 2}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={radius} y={radius} textAnchor="middle" dominantBaseline="middle" className="rotate-90" style={{ transformOrigin: 'center', transform: 'rotate(90deg)' }} fill="#0f172a" fontSize="22" fontWeight="700">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-semibold text-slate-800 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressRow({ label, value, max, color = '#2563eb' }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
