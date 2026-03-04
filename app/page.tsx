import HomePage from "@/components/HomePage";
import { getBanners, getMenu } from "@/lib/db/queries";

export const metadata = {
  title: "UB Grills & Snacks | Kunnamkulam",
  description: "UB Grills & Snacks — the best grilled chicken, crispy snacks and more in Kunnamkulam, Kerala. Order now via WhatsApp or online.",
};

export const revalidate = 0; // Ensure homepage fetches fresh banners & menu

export default async function Home() {
  const [banners, menu] = await Promise.all([
    getBanners(),
    getMenu()
  ]);

  const mustTryCategory = menu.find(c => c.name.trim().toLowerCase() === "must try");
  const mustTryItems = mustTryCategory?.items.slice(0, 6) || [];

  return <HomePage banners={banners} mustTryItems={mustTryItems} />;
}
