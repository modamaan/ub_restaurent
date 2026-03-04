"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RESTAURANT_CONFIG } from "@/lib/config";

function LiveTime() {
    const [time, setTime] = useState("");
    useEffect(() => {
        function tick() {
            setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }));
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return <span>{time}</span>;
}


export default function Navbar() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="w-full sticky top-0 z-50 font-[Outfit]">
            {/* ── Top info bar ── */}
            <div className="bg-[#1a0a00] text-[#fecba8] text-xs px-4 md:px-8 py-1.5 flex items-center justify-between flex-wrap gap-y-1">
                {/* Left: time + hours */}
                <div className="flex items-center gap-3">
                    {/* Mobile: show opening hours */}
                    <span className="flex sm:hidden items-center gap-1">
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                        <span>Open: {RESTAURANT_CONFIG.openingHours}</span>
                    </span>
                    {/* Desktop: show live time + opening hours */}
                    <span className="hidden sm:flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                        <LiveTime />
                    </span>
                    <span className="hidden sm:inline text-[#fecba8]/50">|</span>
                    <span className="hidden sm:inline opacity-70">Open: {RESTAURANT_CONFIG.openingHours}</span>
                </div>

                {/* Right: contact info */}
                <div className="flex items-center gap-4">
                    {/* Instagram */}
                    <a href="https://www.instagram.com/ubgrillsandsnacks" target="_blank" rel="noopener noreferrer"
                        className="hover:text-white transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                    </a>

                    {/* Phone */}
                    <a href={`tel:+${RESTAURANT_CONFIG.whatsappNumber}`}
                        className="hidden sm:flex items-center gap-1 hover:text-white transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +91 83348 88000
                    </a>

                    {/* Email */}
                    <a href="mailto:ubgrills@gmail.com"
                        className="hidden md:flex items-center gap-1 hover:text-white transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        ubgrills@gmail.com
                    </a>
                </div>
            </div>

            {/* ── Main navbar ── */}
            <nav className="bg-[#2a0e00] text-white px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
                {/* Logo / Name */}
                <Link href="/" className="flex flex-col leading-tight no-underline">
                    <span className="text-xl font-extrabold tracking-tight" style={{ color: "#e8500a" }}>
                        UB <span className="text-white">Grills</span>
                    </span>
                    <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "#fecba8" }}>
                        & Snacks · Kunnamkulam
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
                    <Link href="/"
                        className="text-[#fecba8] hover:text-white transition-colors no-underline uppercase tracking-wide text-xs">
                        Home
                    </Link>
                </div>

                {/* Order Now + mobile menu toggle */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/menu")}
                        className="text-white text-sm font-bold px-5 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#e8500a" }}>
                        Order Now
                    </button>
                    {/* Mobile hamburger */}
                    <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                        <svg className="w-5 h-5 text-[#fecba8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            {menuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-[#2a0e00] border-t border-[#ffffff15] px-6 py-4 flex flex-col gap-3 text-sm font-semibold">
                    <Link href="/" onClick={() => setMenuOpen(false)}
                        className="text-[#fecba8] hover:text-white transition-colors uppercase tracking-wide text-xs">
                        Home
                    </Link>
                    <div className="border-t border-[#ffffff15] pt-3 flex flex-col gap-1 text-[#fecba8]/70 text-xs">
                        <span>📞 +91 83348 88000</span>
                        <span>✉️ ubgrills@gmail.com</span>
                        <span>🕐 Open: {RESTAURANT_CONFIG.openingHours}</span>
                    </div>
                </div>
            )}
        </header>
    );
}
