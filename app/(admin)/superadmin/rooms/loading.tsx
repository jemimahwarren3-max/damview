export default function RoomsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-44 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-neutral-100 rounded" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className="bg-neutral-200 p-2.5 rounded-xl w-10 h-10" />
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-neutral-200 rounded" />
              <div className="h-6 w-12 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
              <div className="h-5 w-14 bg-neutral-200 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-neutral-100 rounded" />
              <div className="h-3 w-16 bg-neutral-100 rounded" />
            </div>
            <div className="h-8 w-full bg-neutral-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
