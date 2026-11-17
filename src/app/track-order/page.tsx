import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import OrderTracker from "@/components/OrderTracker";

export const metadata = {
  title: "Track your order · Vistar",
  description: "Check the latest status of your Vistar order using your order number and checkout email.",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return <><PublicHeader /><OrderTracker /><PublicFooter /></>;
}

