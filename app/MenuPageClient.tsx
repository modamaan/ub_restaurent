"use client";

import { useState, useMemo } from "react";
import { MenuCategory } from "@/lib/menu-data";
import { RESTAURANT_CONFIG } from "@/lib/config";
import CategoryTabs from "@/components/CategoryTabs";
import MenuCard from "@/components/MenuCard";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/Navbar";

type VegFilter = "all" | "veg" | "nonveg";

export default function MenuPageClient({ menu, config }: { menu: MenuCategory[]; config: typeof RESTAURANT_CONFIG }) {
    const [selectedCat, setSelectedCat] = useState("all");
    const [vegFilter, setVegFilter] = useState<VegFilter>("all");

    const visible = useMemo(() => {
        const cats = selectedCat === "all" ? menu : menu.filter((c) => c.id === selectedCat);
        return cats
            .map((cat) => ({
                ...cat,
                items: cat.items.filter((item) => {
                    if (!item.available) return false;
                    if (vegFilter === "veg") return item.isVeg;
                    if (vegFilter === "nonveg") return !item.isVeg;
                    return true;
                }),
            }))
            .filter((cat) => cat.items.length > 0);
    }, [menu, selectedCat, vegFilter]);

    return (
        <>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 pb-32">
                <CategoryTabs
                    categories={menu}
                    selected={selectedCat}
                    onSelect={setSelectedCat}
                    vegFilter={vegFilter}
                    onVegFilter={setVegFilter}
                />

                {visible.length === 0 && (
                    <div className="text-center py-16 text-gray-400 text-base"> No items found for this filter.</div>
                )}

                {visible.map((cat) => (
                    <section key={cat.id} className="mb-6">
                        <h2 className="text-xl font-bold mt-7 mb-1" style={{ color: "#e8500a" }}>
                            {cat.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            {cat.items.map((item) => <MenuCard key={item.id} item={item} />)}
                        </div>
                    </section>
                ))}
            </main>

            <CartDrawer />

            <footer className="text-center py-5 text-gray-400 text-[13px] border-t border-orange-100">
                © {new Date().getFullYear()} {config.fullName} · Orders via WhatsApp
            </footer>
        </>
    );
}
