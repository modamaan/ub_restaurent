"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RESTAURANT_CONFIG } from "@/lib/config";

export default function AdminLoginPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    function handleLogin() {
        if (pin === RESTAURANT_CONFIG.adminPin) {
            sessionStorage.setItem("admin_auth", "true");
            router.push("/admin/dashboard");
        } else {
            setError("Incorrect PIN. Please try again.");
            setPin("");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(135deg, #1a0a00, #3d1200)" }}>
            <div className="bg-white rounded-3xl p-10 w-full max-w-sm text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <div className="text-5xl mb-3">🔐</div>
                <h1 className="text-2xl font-extrabold mb-1">Admin Panel</h1>
                <p className="text-gray-400 text-sm mb-7">{RESTAURANT_CONFIG.name}</p>

                {error && <p className="text-red-500 text-[13px] mb-3">{error}</p>}

                <input
                    type="password"
                    placeholder="••••"
                    maxLength={8}
                    value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoFocus
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-2xl font-bold tracking-[8px] text-center font-[Outfit] outline-none focus:border-brand transition-colors mb-4"
                />
                <button onClick={handleLogin}
                    className="w-full bg-brand text-white py-3.5 rounded-xl text-base font-bold hover:bg-brand-dark transition-colors">
                    Login →
                </button>
                <p className="mt-4 text-[12px] text-gray-300">Default PIN: 1234 (change in lib/config.ts)</p>
            </div>
        </div>
    );
}
