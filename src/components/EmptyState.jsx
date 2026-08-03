export default function EmptyState({ message }) {
  return (
    <div className="flex h-full min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}
