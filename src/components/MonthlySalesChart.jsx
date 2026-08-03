import EmptyState from "./EmptyState";

export default function MonthlySalesChart({ finance }) {
  const labels = finance?.labels ?? [];
  const data = finance?.data ?? [];
  const max = Math.max(...data, 1);

  if (!labels.length) {
    return <EmptyState message="Sem histórico de vendas por mês ainda." />;
  }

  return (
    <div className="flex h-40 items-end gap-3">
      {labels.map((label, i) => {
        const value = data[i] ?? 0;
        const heightPct = (value / max) * 100;
        return (
          <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-medium text-ink-900">{value}</span>
            <div className="w-full rounded-t-md bg-brand-500" style={{ height: `${heightPct}%` }} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
