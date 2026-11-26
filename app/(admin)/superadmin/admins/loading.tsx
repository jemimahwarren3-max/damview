export default function AdminsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-7 w-48 bg-neutral-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-neutral-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-neutral-200 rounded-xl" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200/60">
          <div className="h-5 w-28 bg-neutral-200 rounded" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100">
              <div className="h-10 w-10 bg-neutral-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
                <div className="h-3 w-48 bg-neutral-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-neutral-200 rounded-full" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
                <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
