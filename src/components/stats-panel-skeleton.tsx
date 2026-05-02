export function StatsPanelSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
      <div className="mx-4 mb-3 h-9 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-muted"
            style={{ minHeight: 110 }}
          />
        ))}
      </div>
    </div>
  );
}
