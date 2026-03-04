import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { RESTAURANT_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: `${RESTAURANT_CONFIG.name} | Online Menu`,
  description: `Order from ${RESTAURANT_CONFIG.fullName} online via WhatsApp. Browse our menu and place your order instantly.`,
  keywords: "restaurant, grills, snacks, Kunnamkulam, order online, WhatsApp order",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
