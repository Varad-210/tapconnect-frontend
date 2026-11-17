"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");

    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Your message could not be sent. Please try again.");
      }
      if (!result?.received) {
        throw new Error("We could not confirm your message. Please try again.");
      }

      setSent(true);
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your message could not be sent. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="contact-band" id="contact">
      <span className="eyebrow">HERE TO HELP</span>
      <h2>Let&apos;s make your next tap count.</h2>
      <p>Questions about choosing or setting up your cards? Send our team a note.</p>
      {sent ? (
        <div className="sent-message" role="status">
          <Check size={17} aria-hidden="true" />
          Thanks. Your message is in Vistar&apos;s inbox.
        </div>
      ) : (
        <form className="contact-form" onSubmit={submit}>
          <input name="name" required minLength={2} maxLength={100} placeholder="Your name" aria-label="Your name" />
          <input name="email" required type="email" maxLength={254} placeholder="Email address" aria-label="Email address" />
          <textarea name="message" required minLength={10} maxLength={2000} placeholder="How can we help?" aria-label="How can we help?" />
          <button className="button primary" disabled={busy}>
            {busy ? "Sending…" : "Send message"}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
          {error && <small className="inline-error" role="alert">{error}</small>}
        </form>
      )}
    </section>
  );
}
