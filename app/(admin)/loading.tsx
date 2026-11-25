export default function AdminLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-600"></div>
        <p className="text-sm font-medium text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}
