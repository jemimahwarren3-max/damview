export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-32 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-neutral-100 rounded" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-4">
          <div className="h-5 w-36 bg-neutral-200 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-neutral-200 rounded" />
                  <div className="h-3 w-48 bg-neutral-100 rounded" />
                </div>
                <div className="h-8 w-14 bg-neutral-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
