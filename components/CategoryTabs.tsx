"use client";

import { MenuCategory } from "@/lib/menu-data";

type VegFilter = "all" | "veg" | "nonveg";

interface Props {
    categories: MenuCategory[];
    selected: string;
    onSelect: (id: string) => void;
    vegFilter: VegFilter;
    onVegFilter: (v: VegFilter) => void;
}

export default function CategoryTabs({ categories, selected, onSelect, vegFilter, onVegFilter }: Props) {
    const pill = "shrink-0 text-sm font-semibold px-5 py-2 rounded-full border transition-all duration-200 whitespace-nowrap";

    return (
        <div className="sticky top-0 z-10 bg-cream border-b border-orange-100 px-0 py-3 mb-6">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {/* Category pills */}
                <button
                    onClick={() => onSelect("all")}
                    className={`${pill} ${selected === "all"
                        ? "bg-brand border-brand text-white shadow-[0_4px_14px_rgba(232,80,10,0.35)]"
                        : "bg-white border-orange-100 text-gray-500 hover:border-brand hover:text-brand"}`}
                >
                    🍴 All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`${pill} ${selected === cat.id
                            ? "bg-brand border-brand text-white shadow-[0_4px_14px_rgba(232,80,10,0.35)]"
                            : "bg-white border-orange-100 text-gray-500 hover:border-brand hover:text-brand"}`}
                    >
                        {cat.name}
                    </button>
                ))}

                {/* Divider */}
                <div className="w-px h-6 bg-orange-200 shrink-0 mx-1" />

                {/* Veg / Non-Veg pills */}
                <button
                    onClick={() => onVegFilter("all")}
                    className={`${pill} ${vegFilter === "all"
                        ? "bg-brand border-brand text-white shadow-[0_4px_14px_rgba(232,80,10,0.35)]"
                        : "bg-white border-orange-100 text-gray-500 hover:border-brand hover:text-brand"}`}
                >
                    🍴 All
                </button>
                <button
                    onClick={() => onVegFilter("veg")}
                    className={`${pill} flex items-center gap-1.5 ${vegFilter === "veg"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "bg-white border-orange-100 text-gray-500 hover:border-green-500 hover:text-green-700"}`}
                >
                    <span className="veg-indicator veg" />
                    Veg Only
                </button>
                <button
                    onClick={() => onVegFilter("nonveg")}
                    className={`${pill} flex items-center gap-1.5 ${vegFilter === "nonveg"
                        ? "bg-red-50 border-red-500 text-red-600"
                        : "bg-white border-orange-100 text-gray-500 hover:border-red-400 hover:text-red-500"}`}
                >
                    <span className="veg-indicator nonveg" />
                    Non-Veg
                </button>
            </div>
        </div>
    );
}
