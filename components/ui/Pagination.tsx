"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  pageParam?: string;
}

export default function Pagination({
  totalCount,
  currentPage,
  pageSize,
  pageParam = "page",
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const from = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const to = Math.min(currentPage * pageSize, totalCount);

  // Build visible page buttons: always show first, last, and ±2 around current
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;

    let prev = -1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        if (prev !== -1 && i - prev > 1) pages.push("ellipsis");
        pages.push(i);
        prev = i;
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200/60 bg-neutral-50/30 gap-3">
      <p className="text-xs text-neutral-500 font-medium">
        Showing{" "}
        <span className="font-bold text-neutral-700">
          {from.toLocaleString('en-US')}–{to.toLocaleString('en-US')}
        </span>{" "}
        of{" "}
        <span className="font-bold text-neutral-700">
          {totalCount.toLocaleString('en-US')}
        </span>{" "}
        records
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex p-1.5 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2.5"
        >
          First
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="w-8 text-center text-neutral-400 text-xs select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => goToPage(item)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  item === currentPage
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex p-1.5 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2.5"
        >
          Last
        </button>
      </div>
    </div>
  );
}

