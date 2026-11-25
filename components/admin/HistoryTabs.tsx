"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Building2, UtensilsCrossed } from "lucide-react";

export default function HistoryTabs({
  hotelContent,
  restaurantContent,
}: {
  hotelContent: React.ReactNode;
  restaurantContent: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("rsearch") || searchParams.get("rpage")
    ? "restaurant"
    : "hotel";

  const switchTab = (tab: "hotel" | "restaurant") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "hotel") {
      // Clear restaurant search params when going to hotel
      params.delete("rsearch");
      params.delete("rpage");
    } else {
      // Clear hotel search params when going to restaurant
      params.delete("search");
      params.delete("page");
      // Ensure rpage=1 is present so activeTab derivation detects "restaurant"
      if (!params.get("rpage")) params.set("rpage", "1");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="seg-group">
        <button
          onClick={() => switchTab("hotel")}
          data-active={activeTab === "hotel"}
          className="seg-item"
        >
          <Building2 className="h-4 w-4" /> Hotel
        </button>
        <button
          onClick={() => switchTab("restaurant")}
          data-active={activeTab === "restaurant"}
          className="seg-item"
        >
          <UtensilsCrossed className="h-4 w-4" /> Restaurant Tables
        </button>
      </div>
      <div>
        {activeTab === "hotel" ? hotelContent : restaurantContent}
      </div>
    </div>
  );
}
