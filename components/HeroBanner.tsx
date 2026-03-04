"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroBanner({ banners }: { banners?: (string | null)[] }) {
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);

    // Filter out nulls so we only show actually uploaded banners
    const validBanners = (banners || []).filter(Boolean) as string[];

    const slides = validBanners.length > 0 ? validBanners.map(src => ({
        src,
        alt: "UB Grills & Snacks",
        label: "Welcome to UB Grills & Snacks"
    })) : [
        { src: "/ub5.webp", alt: "Welcome", label: "Kunnamkulam's Favourite Grill Spot" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setFading(true);
            setTimeout(() => { setCurrent((p) => (p + 1) % slides.length); setFading(false); }, 500);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    function goTo(idx: number) {
        if (idx === current) return;
        setFading(true);
        setTimeout(() => { setCurrent(idx); setFading(false); }, 400);
    }

    const slide = slides[current];

    return (
        <header className="relative w-full overflow-hidden"
            style={{ height: "clamp(280px, 55vw, 520px)" }}>

            {/* Background image */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}>
                <Image src={slide.src} alt={slide.alt} fill style={{ objectFit: "cover", objectPosition: "center" }} priority={current === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-black/55 z-10" />
                <div className="absolute inset-0 z-20"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%, rgba(0,0,0,0.25) 100%)" }} />
            </div>

            {/* Content — centred, no floating logo to clash */}
            <div className={`relative z-30 h-full flex flex-col items-center justify-center px-4 text-center gap-2 transition-opacity duration-400 ${fading ? "opacity-0" : "opacity-100"}`}>

                {/* Logo — small on mobile, bigger on desktop */}
                <Image
                    src="/logo.png"
                    alt="UB Logo"
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-white/60 shadow-xl object-cover sm:w-20 sm:h-20 mb-1"
                />

                {/* Badge */}
                <span className="inline-block bg-brand/85 text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                    🔥 Live Menu · Order Now
                </span>

                {/* Heading */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl">
                    UB <span className="text-brand">Grills</span><br />
                    <span className="text-2xl sm:text-4xl md:text-5xl font-bold">& Snacks</span>
                </h1>

                {/* Slide label */}
                <p className="text-white/80 text-xs sm:text-sm drop-shadow">{slide.label}</p>

                {/* Info row — stacks on tiny screens */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-[13px] text-white/70 mt-1">
                    <span>📍 Kunnamkulam, Kerala</span>
                    <span className="hidden sm:inline">·</span>
                    <span>🕐 10:00 AM – 10:00 PM</span>
                    <a href="https://wa.me/917025520084" target="_blank" rel="noopener noreferrer"
                        className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                        💬 WhatsApp
                    </a>
                </div>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
                        className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-300
                            ${i === current ? "bg-brand w-5 shadow-[0_0_6px_rgba(232,80,10,0.7)]" : "bg-white/40 w-1.5"}`} />
                ))}
            </div>

            {/* Scroll hint — only md+ */}
            <div className="hidden md:flex absolute bottom-2.5 right-4 z-30 items-center gap-1 text-[11px] text-white/40">
                <span>Scroll to Menu</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </header>
    );
}
