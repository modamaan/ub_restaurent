"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "./Navbar";
import HeroBanner from "./HeroBanner";
import { RESTAURANT_CONFIG } from "@/lib/config";
import type { MenuItem } from "@/lib/menu-data";

export default function HomePage({
    banners,
    mustTryItems = []
}: {
    banners?: (string | null)[],
    mustTryItems?: MenuItem[]
}) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoPaused, setIsVideoPaused] = useState(false);

    const toggleVideo = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsVideoPaused(false);
        } else {
            videoRef.current.pause();
            setIsVideoPaused(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffaf6] font-[Outfit]">
            <Navbar />

            {/* ── Hero ── */}
            <HeroBanner banners={banners} />

            {/* ── Stats strip ── */}
            <div style={{ background: "#e8500a" }} className="text-white py-4 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { val: "500+", label: "Happy Customers" },
                        { val: "30+", label: "Menu Items" },
                        { val: "2+", label: "Years Serving" },
                        { val: "⭐ 4.8", label: "Rating" },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="text-2xl font-extrabold">{s.val}</p>
                            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── About ── */}
            <section className="max-w-4xl mx-auto px-4 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    {/* Text */}
                    <div>
                        <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: "#e8500a" }}>
                            About Us
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug mb-4">
                            The Best Grills<br />in Kunnamkulam
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-4">
                            UB Grills &amp; Snacks was born out of a passion for bold flavours and good food.
                            We bring you the finest grilled delicacies and crispy snacks, prepared fresh with
                            quality ingredients every single day.
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            From our signature charcoal-grilled chicken to golden crispy fries, every dish
                            is a celebration of authentic taste. Visit us or order via WhatsApp — we&apos;re
                            always ready to serve you!
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#e8500a" }}>
                            <span>📍 {RESTAURANT_CONFIG.address}</span>
                        </div>
                    </div>

                    {/* Visual card */}
                    <div className="relative">
                        <div className="relative rounded-[32px] overflow-hidden shadow-2xl aspect-square md:aspect-[4/5] bg-gray-100">
                            <Image
                                src="/ub5.webp"
                                alt="Freshly Grilled"
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <div>
                                <p className="font-extrabold text-gray-900 text-sm">4.8 / 5</p>
                                <p className="text-xs text-gray-400">Customer Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Must Try Gallery ── */}
            {mustTryItems.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 py-16">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "#e8500a" }}>
                            Our Menu
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900">Our Must Try</h2>
                        <p className="text-gray-400 text-sm mt-2">Click &quot;Add&quot; to browse the full menu and place your order</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mustTryItems.map((item) => (
                            <div key={item.id}
                                onClick={() => router.push("/menu")}
                                className="flex items-center gap-4 py-4 px-4 border border-gray-100 rounded-2xl bg-white shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                                {/* Image */}
                                <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden shrink-0 bg-orange-50">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                                    )}
                                </div>
                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-[15px] leading-snug mb-1 truncate">{item.name}</p>
                                    {item.description && (
                                        <p className="text-[12px] text-gray-400 line-clamp-2 mb-1">{item.description}</p>
                                    )}
                                    <p className="font-extrabold text-lg" style={{ color: "#e8500a" }}>₹{item.price}</p>
                                </div>
                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ background: "#e8500a" }}>Order →</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button
                            onClick={() => router.push("/menu")}
                            className="text-white font-bold px-10 py-3.5 rounded-full text-base shadow transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "#e8500a" }}>
                            View Full Menu & Order →
                        </button>
                    </div>
                </section>
            )}

            {/* ── Promotional Video Section ── */}
            <section className="bg-[#1a0a00] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <span className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "#fecba8" }}>
                        Experience the Magic
                    </span>
                    <h2 className="text-3xl font-extrabold mb-8">See How We Grill It</h2>

                    <div
                        className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-black/50 border border-white/10 group cursor-pointer"
                        onClick={toggleVideo}
                    >
                        <video
                            ref={videoRef}
                            src="/ub2.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onPause={() => setIsVideoPaused(true)}
                            onPlay={() => setIsVideoPaused(false)}
                        />

                        {/* Custom Play/Pause Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isVideoPaused ? 'opacity-100 bg-black/40' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isVideoPaused ? (
                                <div className="w-20 h-20 bg-red-600/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center pl-2 transition-transform scale-110 shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-black/40 hover:bg-red-600/90 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Contact strip ── */}
            <section className="py-12 px-4 text-white text-center"
                style={{ background: "linear-gradient(135deg, #1a0a00, #3d1200)" }}>
                <h2 className="text-2xl font-extrabold mb-2">Ready to Order? 🍽️</h2>
                <p className="text-sm mb-6" style={{ color: "#fecba8" }}>
                    Order online or contact us directly — we&apos;re happy to serve!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => router.push("/menu")}
                        className="text-white font-bold px-8 py-3 rounded-full transition-all hover:opacity-90"
                        style={{ background: "#e8500a" }}>
                        🍽️ Order Online
                    </button>
                    <a href={`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 font-semibold px-8 py-3 rounded-full no-underline text-white transition-all hover:opacity-90"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
                        📞 +91 70255 20084
                    </a>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-[#1a0a00] text-center py-5 text-xs" style={{ color: "#fecba8" }}>
                <p>© {new Date().getFullYear()} {RESTAURANT_CONFIG.fullName}</p>
                <p className="opacity-50 mt-1">Made with ❤️ in Kunnamkulam</p>
                <p className="mt-3">
                    <a href="/admin" className="opacity-20 hover:opacity-60 transition-opacity text-[10px] tracking-widest uppercase">
                        Admin
                    </a>
                </p>
            </footer>
        </div>
    );
}
