export default function MenuLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-7 w-40 bg-neutral-200 rounded-lg mb-2" />
          <div className="h-4 w-60 bg-neutral-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-neutral-200 rounded-xl" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-neutral-200 rounded-xl" />
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="h-32 bg-neutral-200 rounded-xl" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-5 w-28 bg-neutral-200 rounded" />
                <div className="h-5 w-14 bg-neutral-200 rounded" />
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded" />
              <div className="h-3 w-20 bg-neutral-100 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-neutral-200 rounded-lg" />
              <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
