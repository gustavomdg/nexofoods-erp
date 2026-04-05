export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 h-28 animate-pulse"
        >
          <div className="flex justify-between mb-4">
            <div className="h-4 w-32 rounded bg-slate-700" />
            <div className="h-8 w-8 rounded-lg bg-slate-700" />
          </div>
          <div className="h-7 w-40 rounded bg-slate-700" />
          <div className="h-3 w-48 rounded bg-slate-700/70 mt-2" />
        </div>
      ))}
    </div>
  );
}
