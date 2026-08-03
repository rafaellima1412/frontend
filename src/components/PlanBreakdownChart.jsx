import EmptyState from "./EmptyState";

const FALLBACK_COLOR = "#94a3b8";

export default function PlanBreakdownChart({ area }) {
  const labels = area?.labels ?? [];
  const data = area?.data ?? [];
  const colors = area?.colors ?? [];
  const total = data.reduce((sum, value) => sum + value, 0);

  if (!total) {
    return <EmptyState message="Nenhuma venda registrada ainda." />;
  }

  let cursor = 0;
  const gradient = labels
    .map((_, i) => {
      const color = colors[i] ?? FALLBACK_COLOR;
      const start = (cursor / total) * 360;
      cursor += data[i];
      const end = (cursor / total) * 360;
      return `${color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-xl font-semibold text-ink-900">{total}</span>
          <span className="text-[11px] text-slate-400">{total === 1 ? "venda" : "vendas"}</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {labels.map((label, i) => (
          <li key={label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors[i] ?? FALLBACK_COLOR }}
              />
              {label}
            </span>
            <span className="font-medium text-ink-900">{data[i]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
