"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Menu, ShoppingBag, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

const navigation = [
  ["How it works", "/how-it-works"],
  ["NFC setup", "/nfc-setup"],
  ["QR setup", "/qr-setup"],
  ["Google review cards", "/google-review-cards"],
  ["Instagram cards", "/instagram-cards"],
  ["FAQs", "/#faqs"],
  ["Contact us", "/#contact"],
];

export function PublicHeader() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("Tapconnect_cart_v1") || "[]");
        setCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
      } catch {
        setCount(0);
      }
    };

    update();
    window.addEventListener("storage", update);
    window.addEventListener("Tapconnect:cart", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("Tapconnect:cart", update);
    };
  }, []);

  return (
    <>
      <div className="announce">
        <span>NFC ENABLED</span><i aria-hidden="true">•</i>
        <span>QR READY</span><i aria-hidden="true">•</i>
        <span>NO SUBSCRIPTION</span><i aria-hidden="true">•</i>
        <span>VISTAR · EXPAND YOUR BUSINESS</span>
      </div>
      <header className="site-header standard-site-header">
        <Link className="site-logo" href="/" aria-label="Vistar home">
          <BrandLogo />
        </Link>
        <nav className={`site-nav ${open ? "open" : ""}`} aria-label="Main navigation">
          {navigation.map(([label, href]) => {
            const targetPath = href.split("#")[0] || "/";
            const isActive = !href.includes("#") && pathname === targetPath;
            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <Link className="header-cta" href="/#products">
          Shop cards <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <div className="header-tools">
          <Link className="cart-link" href="/cart" aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag size={19} aria-hidden="true" />
            {count > 0 && <span>{count}</span>}
          </Link>
          <button
            className="hamburger"
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(value => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="site-logo" href="/" aria-label="Vistar home">
          <BrandLogo />
        </Link>
        <p>Expand your business, one tap at a time.</p>
      </div>
      <div className="footer-groups">
        <section className="footer-link-group" aria-labelledby="footer-explore">
          <h2 id="footer-explore">Explore</h2>
          <nav aria-label="Explore Vistar">
            <Link href="/#products">Shop cards</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/nfc-setup">NFC setup</Link>
            <Link href="/qr-setup">QR setup</Link>
          </nav>
        </section>
        <section className="footer-link-group" aria-labelledby="footer-resources">
          <h2 id="footer-resources">Resources</h2>
          <nav aria-label="Vistar resources">
            <Link href="/google-review-cards">Google review cards</Link>
            <Link href="/instagram-cards">Instagram cards</Link>
            <Link href="/#faqs">FAQs</Link>
          </nav>
        </section>
        <section className="footer-link-group" aria-labelledby="footer-account">
          <h2 id="footer-account">Account</h2>
          <nav aria-label="Account links">
            <Link href="/#contact">Contact us</Link>
            <Link href="/cart">Shopping bag</Link>
            <Link href="/admin">Platform sign in</Link>
          </nav>
        </section>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Vistar. All rights reserved.</small>
        <span>Built to help your business grow.</span>
      </div>
    </footer>
  );
}
