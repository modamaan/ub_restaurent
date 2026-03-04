"use client";

import { MenuItem } from "@/lib/menu-data";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import Image from "next/image";

export default function MenuCard({ item }: { item: MenuItem }) {
    const { items, addItem, increase, decrease } = useCart();
    const cartItem = items.find((ci) => ci.item.id === item.id);
    const [bump, setBump] = useState(false);

    function handleAdd() {
        addItem(item);
        setBump(true);
        setTimeout(() => setBump(false), 300);
    }

    if (!item.available) return null;

    return (
        <div className="flex items-center justify-between gap-4 py-4 px-1 border-b border-gray-100 last:border-0">

            {/* Left: text */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2 mb-2">
                        {item.description}
                    </p>
                )}
                <p className="font-extrabold text-[20px] leading-none" style={{ color: "#e8500a" }}>
                    ₹ {item.price}
                </p>
            </div>

            {/* Right: image + Add button */}
            <div className="relative shrink-0 w-[100px] pb-4">
                {/* Image */}
                <div className="w-[100px] h-[100px] rounded-2xl overflow-hidden bg-gray-100 relative">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover", objectPosition: "center" }}
                            sizes="100px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50">
                            🍽️
                        </div>
                    )}
                </div>

                {/* Add / qty — outside overflow-hidden, centred at bottom */}
                <div className="absolute bottom-0 inset-x-0 flex justify-center">
                    {cartItem ? (
                        <div className="flex items-center gap-1 bg-white border border-orange-100 rounded-full px-1.5 py-0.5 shadow-md">
                            <button
                                onClick={() => decrease(item.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                style={{ background: "#e8500a" }}>
                                −
                            </button>
                            <span className="text-xs font-bold min-w-[16px] text-center text-gray-800">
                                {cartItem.quantity}
                            </span>
                            <button
                                onClick={() => increase(item.id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                style={{ background: "#e8500a" }}>
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAdd}
                            className={`text-white text-[13px] font-bold px-5 py-1 rounded-full shadow-md transition-all ${bump ? "btn-bump" : ""}`}
                            style={{ background: "#e8500a" }}>
                            Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
