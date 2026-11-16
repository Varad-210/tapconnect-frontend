import type { Metadata } from "next";
import "./globals.css";
import "./commerce.css";
import "./manage-pp.css";
export const metadata: Metadata = { title: "Tapconnect · NFC + QR Business Cards", description: "Make every tap count with reusable NFC and QR review cards." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
