"use client";

import { useCart } from "@/lib/cart-context";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { useState } from "react";
import { z } from "zod";

const phoneSchema = z
    .string()
    .trim()
    .regex(
        /^(?:\+91|91|0)?[6-9]\d{9}$/,
        "Enter a valid 10-digit mobile number (e.g. 9876543210)"
    );

type OrderType = "pickup" | "delivery";

export default function CartDrawer() {
    const { items, increase, decrease, clear, totalItems, totalPrice } = useCart();
    const [open, setOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [orderType, setOrderType] = useState<OrderType>("pickup");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [addressError, setAddressError] = useState("");

    function buildWhatsAppMessage() {
        const lines = [
            `🍽️ *New Order – ${RESTAURANT_CONFIG.name}*`,
            `👤 Name: ${customerName}`,
            `📦 Order Type: ${orderType === "pickup" ? "Pickup" : "Pay on Delivery"}`,
        ];
        if (orderType === "delivery") {
            lines.push(`📞 Phone: ${phone}`);
            lines.push(`📍 Address: ${address}`);
        }
        lines.push(
            "",
            "📋 *Order Details:*",
            ...items.map((ci) => `• ${ci.item.name} × ${ci.quantity} = ₹${ci.item.price * ci.quantity}`),
            "",
            `💰 *Total: ₹${totalPrice}*`,
            "",
            "Thank you! Please confirm my order. 🙏"
        );
        return encodeURIComponent(lines.join("\n"));
    }

    const [ordering, setOrdering] = useState(false);

    async function handleWhatsApp() {
        let valid = true;
        if (!customerName.trim()) { setNameError("Name is required."); valid = false; } else setNameError("");

        const phoneResult = phoneSchema.safeParse(phone);
        if (!phoneResult.success) {
            setPhoneError(phoneResult.error.issues[0].message);
            valid = false;
        } else {
            setPhoneError("");
        }

        if (orderType === "delivery") {
            if (!address.trim()) { setAddressError("Delivery address is required."); valid = false; } else setAddressError("");
        } else {
            setAddressError("");
        }
        if (!valid) return;

        setOrdering(true);
        try {
            // Save order to DB
            await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName,
                    phone,
                    orderType,
                    address: orderType === "delivery" ? address : "",
                    totalPrice,
                    items: items.map((ci) => ({
                        name: ci.item.name,
                        quantity: ci.quantity,
                        price: ci.item.price,
                    })),
                }),
            });
        } catch {
            // Non-blocking: still open WhatsApp even if DB save fails
        }

        // Open WhatsApp
        window.open(`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=${buildWhatsAppMessage()}`, "_blank");

        // Clear cart and close drawer
        clear();
        setOpen(false);
        setOrdering(false);
    }

    if (totalItems === 0 && !open) return null;

    return (
        <>
            {/* Floating Cart Bar */}
            {totalItems > 0 && !open && (
                <div onClick={() => setOpen(true)}
                    className="cart-bar-anim fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-brand text-white
            flex items-center gap-3 px-6 py-3.5 rounded-full cursor-pointer
            shadow-[0_8px_32px_rgba(232,80,10,0.45)] min-w-[280px] max-w-[90vw]
            hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,80,10,0.5)] transition-all">
                    <span className="bg-white/25 text-sm font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                        {totalItems} item{totalItems > 1 ? "s" : ""}
                    </span>
                    <span className="flex-1 text-[15px] font-bold text-center">View Cart &amp; Order</span>
                    <span className="text-[15px] font-extrabold whitespace-nowrap">₹{totalPrice}</span>
                </div>
            )}

            {/* Drawer */}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end animate-[fadeIn_0.2s_ease]"
                    onClick={() => setOpen(false)}>
                    <div className="drawer-slide bg-white w-full max-w-[480px] mx-auto rounded-t-3xl flex flex-col max-h-[88vh]"
                        onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold">🛒 Your Order</h2>
                            <button onClick={() => setOpen(false)}
                                className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
                            {items.length === 0 ? (
                                <p className="text-center text-gray-400 py-10 text-[15px]">Your cart is empty.</p>
                            ) : (
                                <>
                                    {items.map((ci) => (
                                        <div key={ci.item.id} className="flex items-center justify-between gap-3 bg-orange-50 rounded-xl px-4 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">{ci.item.name}</p>
                                                <p className="text-xs text-gray-400">₹{ci.item.price} each</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-1 bg-white border border-brand rounded-full px-1 py-0.5">
                                                    <button onClick={() => decrease(ci.item.id)}
                                                        className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-base font-bold hover:bg-brand-dark transition-colors">−</button>
                                                    <span className="text-brand font-bold text-sm min-w-[22px] text-center">{ci.quantity}</span>
                                                    <button onClick={() => increase(ci.item.id)}
                                                        className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-base font-bold hover:bg-brand-dark transition-colors">+</button>
                                                </div>
                                                <span className="text-sm font-bold text-brand">₹{ci.item.price * ci.quantity}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Name input */}
                                    <div className="mt-1">
                                        <label className="text-[13px] font-semibold text-gray-600 block mb-1.5">
                                            Your Name <span className="text-red-500">*</span>
                                        </label>
                                        <input type="text" placeholder="Enter your name..."
                                            value={customerName} onChange={(e) => { setCustomerName(e.target.value); setNameError(""); }}
                                            className={`w-full border rounded-xl px-4 py-2.5 text-sm font-[Outfit] outline-none transition-colors ${nameError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand"}`} />
                                        {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                                    </div>

                                    {/* Phone input – always visible */}
                                    <div>
                                        <label className="text-[13px] font-semibold text-gray-600 block mb-1.5">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input type="tel" placeholder="e.g. 9876543210"
                                            value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                                            className={`w-full border rounded-xl px-4 py-2.5 text-sm font-[Outfit] outline-none transition-colors ${phoneError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand"}`} />
                                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                                    </div>

                                    {/* Order type toggle */}
                                    <div className="mt-1">
                                        <label className="text-[13px] font-semibold text-gray-600 block mb-2">Order Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(["pickup", "delivery"] as OrderType[]).map((type) => (
                                                <button key={type}
                                                    onClick={() => setOrderType(type)}
                                                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${orderType === type ? "bg-brand text-white border-brand shadow" : "bg-white text-gray-500 border-gray-200 hover:border-brand/50"}`}>
                                                    {type === "pickup" ? "🏃 Pickup" : "🛵 Pay on Delivery"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conditional delivery address */}
                                    {orderType === "delivery" && (
                                        <div>
                                            <label className="text-[13px] font-semibold text-gray-600 block mb-1.5">
                                                Delivery Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea placeholder="Enter your full delivery address..."
                                                value={address} onChange={(e) => { setAddress(e.target.value); setAddressError(""); }}
                                                rows={3}
                                                className={`w-full border rounded-xl px-4 py-2.5 text-sm font-[Outfit] outline-none transition-colors resize-none ${addressError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand"}`} />
                                            {addressError && <p className="text-red-500 text-xs mt-1">{addressError}</p>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
                                <div className="flex justify-between text-lg font-extrabold text-gray-900 mb-1">
                                    <span>Total</span><span>₹{totalPrice}</span>
                                </div>
                                <button onClick={handleWhatsApp} disabled={ordering}
                                    className="bg-whatsapp text-white py-4 rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2.5
                    hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(37,211,102,0.35)] disabled:opacity-70 disabled:cursor-not-allowed">
                                    {ordering ? (
                                        <span className="animate-spin text-xl">⏳</span>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    )}
                                    {ordering ? "Placing Order…" : "Order on WhatsApp"}
                                </button>
                                <button onClick={() => { clear(); setOpen(false); }}
                                    className="border border-gray-200 text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:border-red-400 hover:text-red-500 transition-all">
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
