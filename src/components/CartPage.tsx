"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

type Line = { productId: string; variantId: string; productName: string; variantName: string; pricePaise: number; quantity: number; stock: number };
type CatalogProduct = { id: string; name: string; variants: { id: string; active: boolean; stock: number; name: string; pricePaise: number }[] };
type EmailStatus = "sent" | "not_configured" | "failed";
const KEY = "Tapconnect_cart_v1";
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value / 100);

export function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved: Line[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      fetch("/api/products", { cache: "no-store" })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then((result: { ok: boolean; data: { products?: CatalogProduct[] } }) => {
          const { ok, data } = result;
          if (!ok || !Array.isArray(data.products)) throw new Error("Catalog unavailable");
          const current: Line[] = [];
          for (const line of saved) {
            const product = data.products.find(item => item.id === line.productId);
            const variant = product?.variants.find(item => item.id === line.variantId);
            if (product && variant?.active && variant.stock > 0) current.push({ ...line, productName: product.name, variantName: variant.name, pricePaise: variant.pricePaise, stock: variant.stock, quantity: Math.min(line.quantity, variant.stock) });
          }
          persist(current);
        })
        .catch(() => persist(saved));
    } catch {
      persist([]);
    }
  }, []);

  function persist(next: Line[]) {
    setLines(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setReady(true);
    window.dispatchEvent(new Event("Tapconnect:cart"));
  }

  const total = useMemo(() => lines.reduce((sum, line) => sum + line.pricePaise * line.quantity, 0), [lines]);
  function change(id: string, quantity: number) {
    persist(lines.map(line => line.variantId === id ? { ...line, quantity: Math.min(line.stock || 100, quantity) } : line).filter(line => line.quantity > 0));
  }

  return <><PublicHeader /><main className="cart-main"><Link href="/" className="back-link"><ArrowLeft size={15} />Continue shopping</Link><h1>Your shopping bag</h1>{!ready ? <p>Loading your bag…</p> : !lines.length ? <div className="empty-cart"><h2>Your bag is taking a little tap break.</h2><p>Explore cards made to help customers find and review your business.</p><Link className="button primary" href="/#products">Shop cards <ArrowRight size={15} /></Link></div> : <div className="cart-layout"><section className="cart-lines">{lines.map(line => <article className="cart-row" key={line.variantId}><div className="cart-product-art"><span className="site-logo-mark">✦</span></div><div className="cart-product-info"><h2>{line.productName}</h2><p>{line.variantName}</p><strong>{money(line.pricePaise)}</strong></div><div className="quantity-step"><button aria-label="Decrease quantity" onClick={() => change(line.variantId, line.quantity - 1)}><Minus size={14} /></button><span>{line.quantity}</span><button aria-label="Increase quantity" disabled={line.quantity >= line.stock} onClick={() => change(line.variantId, line.quantity + 1)}><Plus size={14} /></button></div><button className="remove-line" aria-label="Remove item" onClick={() => change(line.variantId, 0)}><Trash2 size={16} /></button></article>)}</section><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Shipping</span><span>Calculated at checkout</span></div><hr /><div className="summary-total"><span>Total</span><b>{money(total)}</b></div><p>Cash on delivery at this time.</p><Link href="/checkout" className="button primary">Continue to checkout <ArrowRight size={15} /></Link></aside></div>}</main><PublicFooter /></>;
}

export function CheckoutPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNumber: string; email: string; emailStatus: EmailStatus } | null>(null);
  useEffect(() => {
    try { setLines(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setLines([]); }
  }, []);

  const fields = [["customerName", "Full name", "text", "name"], ["email", "Email address", "email", "email"], ["phone", "Phone number", "tel", "tel"], ["address", "Street address", "text", "street-address"], ["city", "City", "text", "address-level2"], ["region", "State / region", "text", "address-level1"], ["postalCode", "Postal code", "text", "postal-code"]] as const;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(fields.map(([key]) => [key, form.get(key)])), items: lines.map(line => ({ variantId: line.variantId, quantity: line.quantity })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn’t place your order. Please try again.");
      setOrder({ orderNumber: data.order.orderNumber, email, emailStatus: data.order.emailStatus || "not_configured" });
      setLines([]);
      localStorage.removeItem(KEY);
      window.dispatchEvent(new Event("Tapconnect:cart"));
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <><PublicHeader /><main className="checkout-main"><Link href="/cart" className="back-link"><ArrowLeft size={15} />Back to bag</Link>{order ? <section className="order-success"><span className="feature-icon">✓</span><p className="eyebrow">THANK YOU FOR CHOOSING VISTAR</p><h1>Order received</h1><p>Your order number is <b>{order.orderNumber}</b>.</p>{order.emailStatus === "sent" ? <p>We’ve sent an order confirmation and tracking link to <b>{order.email}</b>.</p> : <p>Your order is saved. Email updates aren’t available right now, but you can track your order with this number and the email used at checkout.</p>}<Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`} className="button primary">Track your order <ArrowRight size={15} /></Link></section> : <><h1>Delivery details</h1><p>Complete your details and place a cash-on-delivery order.</p>{!lines.length ? <div className="empty-cart">Your bag is empty. <Link href="/#products">Browse cards</Link></div> : <form className="checkout-layout" onSubmit={submit}><section className="checkout-fields">{fields.map(([key, label, type, autoComplete]) => <div className="field" key={key}><label htmlFor={key}>{label}</label><input id={key} name={key} type={type} required autoComplete={autoComplete} /></div>)}<p className="payment-note">Payment method: cash on delivery. We’ll email your order confirmation and status updates.</p>{error && <p className="inline-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Placing order…" : "Place order"}<ArrowRight size={15} /></button></section><aside className="order-summary"><h2>In your bag</h2>{lines.map(line => <div key={line.variantId}><span>{line.productName} · {line.variantName} × {line.quantity}</span><b>{money(line.pricePaise * line.quantity)}</b></div>)}<hr /><div className="summary-total"><span>Total</span><b>{money(lines.reduce((sum, line) => sum + line.quantity * line.pricePaise, 0))}</b></div></aside></form>}</>}</main><PublicFooter /></>;
}

