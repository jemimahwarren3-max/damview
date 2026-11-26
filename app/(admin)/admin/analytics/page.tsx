import { getAnalytics } from "@/lib/actions/analytics";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const data = await getAnalytics(30);
  return <AnalyticsClient data={data} />;
}
