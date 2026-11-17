"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, PackageCheck } from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  totalPaise: number;
  createdAt: string;
  items: { productName: string; variantName: string; quantity: number; unitPricePaise: number }[];
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PROCESSING: "Preparing your order",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
const steps: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value / 100);

export default function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOrderNumber(new URLSearchParams(window.location.search).get("orderNumber") || "");
  }, []);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn’t find an order with those details.");
      setOrder(data.order);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const stage = order ? steps.indexOf(order.status) : -1;

  return <main className="track-order-main"><div className="track-order-wrap"><section className="track-order-intro"><span className="eyebrow">VISTAR ORDER CARE</span><h1>Track your order.</h1><p>Enter your order number and the email address used at checkout. No account needed.</p></section><section className="track-order-card"><form onSubmit={lookup} className="track-order-form"><div className="field"><label htmlFor="order-number">Order number</label><input id="order-number" name="orderNumber" required autoComplete="off" placeholder="For example, GT-…" value={orderNumber} onChange={event => setOrderNumber(event.target.value.toUpperCase())} /></div><div className="field"><label htmlFor="track-email">Checkout email</label><input id="track-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} /></div>{error && <p className="inline-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? "Looking up your order…" : "Track order"}<ArrowRight size={16} /></button></form></section>{order && <section className="tracked-order-card" aria-live="polite"><div className="tracked-order-head"><span className="tracked-order-icon"><PackageCheck size={21} /></span><div><span className="eyebrow">ORDER {order.orderNumber}</span><h2>{statusLabels[order.status]}</h2></div><span className={`tracked-status-pill ${order.status === "CANCELLED" ? "cancelled" : ""}`}>{statusLabels[order.status]}</span></div>{order.status === "CANCELLED" ? <p className="tracked-note">This order was cancelled. If you need help, contact the Vistar team.</p> : <ol className="order-progress">{steps.map((step, index) => <li key={step} className={index <= stage ? "complete" : ""}><span className="progress-dot">{index < stage ? <Check size={12} /> : index + 1}</span><span>{statusLabels[step]}</span></li>)}</ol>}<div className="tracked-items"><h3>Order summary</h3>{order.items.map((item, index) => <div className="tracked-item" key={`${item.productName}-${item.variantName}-${index}`}><span>{item.productName}<small>{item.variantName} · Qty {item.quantity}</small></span><b>{money(item.unitPricePaise * item.quantity)}</b></div>)}<div className="tracked-total"><span>Total · {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}</span><b>{money(order.totalPaise)}</b></div><p className="tracked-date">Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div></section>}<p className="track-order-help">Need help with an order? <a href="/#contact">Contact our team</a></p></div></main>;
}

