export default function GuestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-neutral-100 rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className="bg-neutral-200 p-2.5 rounded-xl w-10 h-10" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-neutral-200 rounded" />
              <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="h-5 w-32 bg-neutral-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-neutral-100 rounded" />
              <div className="h-10 bg-neutral-200 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-10 w-32 bg-neutral-200 rounded-xl mt-4" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200/60">
          <div className="h-5 w-28 bg-neutral-200 rounded" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100">
              <div className="h-10 w-10 bg-neutral-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
                <div className="h-3 w-24 bg-neutral-100 rounded" />
              </div>
              <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
