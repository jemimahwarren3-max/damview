import Link from "next/link";
import { BedDouble, Armchair } from "lucide-react";

export default function BillingTabs({
  tab,
  hotelHref,
  restaurantHref,
}: {
  tab: "hotel" | "restaurant";
  hotelHref: string;
  restaurantHref: string;
}) {
  return (
    <div className="seg-group">
      <Link href={hotelHref} data-active={tab === "hotel"} className="seg-item">
        <BedDouble className="h-4 w-4" />
        Hotel
      </Link>
      <Link
        href={restaurantHref}
        data-active={tab === "restaurant"}
        className="seg-item"
      >
        <Armchair className="h-4 w-4" />
        Restaurant
      </Link>
    </div>
  );
}
