export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-52 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-80 bg-neutral-100 rounded" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className="bg-neutral-200 p-2.5 rounded-xl w-10 h-10" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-20 bg-neutral-200 rounded" />
              <div className="h-6 w-14 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="h-5 w-36 bg-neutral-200 rounded mb-4" />
          <div className="h-64 bg-neutral-100 rounded-xl" />
        </div>
        <div className="glass-card p-6">
          <div className="h-5 w-36 bg-neutral-200 rounded mb-4" />
          <div className="h-64 bg-neutral-100 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="h-5 w-40 bg-neutral-200 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
                <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                  <div className="h-3 w-20 bg-neutral-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-neutral-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="h-5 w-40 bg-neutral-200 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
                <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                  <div className="h-3 w-20 bg-neutral-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-neutral-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
