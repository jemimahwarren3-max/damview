export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-44 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-neutral-100 rounded" />
      </div>

      {/* Date range filter */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="h-10 w-40 bg-neutral-200 rounded-xl" />
        <div className="h-10 w-40 bg-neutral-200 rounded-xl" />
        <div className="h-10 w-28 bg-neutral-200 rounded-xl" />
      </div>

      {/* Report sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="h-5 w-40 bg-neutral-200 rounded mb-4" />
            <div className="h-48 bg-neutral-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
