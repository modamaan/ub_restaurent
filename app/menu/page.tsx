import { Suspense } from "react";
import { getMenu } from "@/lib/db/queries";
import { RESTAURANT_CONFIG } from "@/lib/config";
import MenuPageClient from "@/app/MenuPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
    title: `Menu | ${RESTAURANT_CONFIG.name}`,
    description: `Browse the full menu and order from ${RESTAURANT_CONFIG.fullName} online via WhatsApp.`,
};

export default async function MenuPage() {
    const menu = await getMenu();
    return (
        <Suspense>
            <MenuPageClient menu={menu} config={RESTAURANT_CONFIG} />
        </Suspense>
    );
}
