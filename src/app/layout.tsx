import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
import "./manage-pp.css";
import "./brand-system.css";
export const metadata: Metadata = { title: "Vistar · Expand your business", description: "Vistar helps your business grow with reusable NFC and QR cards that make every tap count." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
