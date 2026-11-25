"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function SuperadminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Superadmin page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-500 mb-6 text-center max-w-md">
        An unexpected error occurred while loading this page. This could be a
        temporary network issue. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-600 text-white text-sm font-bold hover:bg-neutral-700 transition-colors shadow-sm shadow-neutral-200"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
