"use client";

import { useState, useEffect, useRef } from "react";
import { BedDouble, Armchair } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function BillingTabsClient({
  defaultTab,
  hotelContent,
  restaurantContent,
}: {
  defaultTab: "hotel" | "restaurant";
  hotelContent: ReactNode;
  restaurantContent: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"hotel" | "restaurant">(
    defaultTab,
  );
  const supabaseRef = useRef(createClient());
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel("billing:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bills" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_bills" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_tables" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="seg-group">
        <button
          onClick={() => setActiveTab("hotel")}
          data-active={activeTab === "hotel"}
          className="seg-item"
        >
          <BedDouble className="h-4 w-4" />
          Hotel
        </button>
        <button
          onClick={() => setActiveTab("restaurant")}
          data-active={activeTab === "restaurant"}
          className="seg-item"
        >
          <Armchair className="h-4 w-4" />
          Restaurant
        </button>
      </div>

      {/* Content — pre-rendered, just hidden/shown via CSS */}
      <div className={activeTab === "hotel" ? "block" : "hidden"}>
        {hotelContent}
      </div>
      <div className={activeTab === "restaurant" ? "block" : "hidden"}>
        {restaurantContent}
      </div>
    </div>
  );
}
