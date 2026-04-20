/* Flutter-style shimmer skeleton loader */
export function PageShimmer() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="shimmer-block h-5 w-40" />

      {/* Search / action bar */}
      <div className="shimmer-block h-11 w-full" />

      {/* Section label */}
      <div className="shimmer-block h-4 w-28" />

      {/* Card list */}
      <div className="overflow-hidden rounded-2xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Avatar / logo placeholder */}
              <div className="shimmer-block h-10 w-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="shimmer-block h-4 w-3/4" />
                <div className="shimmer-block h-3 w-1/2" />
              </div>
            </div>
            {i < 5 && <div className="mt-4 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Secondary card */}
      <div className="overflow-hidden rounded-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="shimmer-block h-10 w-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="shimmer-block h-4 w-2/3" />
                <div className="shimmer-block h-3 w-1/3" />
              </div>
            </div>
            {i < 3 && <div className="mt-4 h-px bg-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}
