import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
import "./manage-pp.css";
import "./brand-system.css";
export const metadata: Metadata = { title: "Vistar · Expand your business", description: "Vistar helps your business grow with reusable NFC and QR cards that make every tap count.", icons: { icon: [{ url: "https://res.cloudinary.com/dclr2ihxn/image/upload/v1794889091/VISTAR_Orbital_V_Icon_ricskn.png", type: "image/png" }] } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
