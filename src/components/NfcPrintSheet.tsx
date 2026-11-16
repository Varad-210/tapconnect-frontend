"use client";

import { useEffect, useState } from "react";
import { Nfc, Smartphone } from "lucide-react";
import type { CSSProperties } from "react";
import type { CardTemplate } from "@/components/CreateCardTemplate";
import CardTemplateFrame from "@/components/CardTemplateFrame";

export type PrintCardData = { serial: string; publicCode: string; cardName?: string; businessName?: string };
type CardStyle = CSSProperties & { "--card-primary": string; "--card-secondary": string; "--card-text": string };

type Props = { cards: PrintCardData[]; brand: string; primary: string; secondary: string; text: string; template?: CardTemplate | null; printSignal: number };

function ReviewCard({ card, brand, primary, secondary, text, template, eager = false }: { card: PrintCardData; brand: string; primary: string; secondary: string; text: string; template?: CardTemplate | null; eager?: boolean }) {
  const cardBrand = card.businessName || card.cardName || brand;
  return (
    <article className={`production-card${template?.html ? " production-card-custom" : ""}`} style={{ "--card-primary": primary, "--card-secondary": secondary, "--card-text": text } as CardStyle}>
      {template?.html ? (
        <CardTemplateFrame
          className="production-card-template"
          title={`${template.name} design for ${card.serial}`}
          html={template.html}
          css={template.css || ""}
          brand={cardBrand}
          primary={primary}
          secondary={secondary}
          text={text}
          serial={card.serial}
          qrCode={`/api/assets/${card.publicCode}/qr?format=svg&inline=1`}
          publicUrl={`/${card.publicCode}`}
        />
      ) : <>
      <header className="production-card-header">
        <div className="production-brand-letter" aria-label={cardBrand}>{cardBrand.trim().charAt(0).toUpperCase()}</div>
        <div className="production-nfc-mark"><Nfc size={19} /><span>NFC</span></div>
        <div className="production-stars" aria-label="Five stars">★★★★★</div>
        <div className="production-feedback">YOUR FEEDBACK MATTERS</div>
      </header>
      <div className="production-gold-band" />
      <div className="production-card-actions">
        <div className="production-tap">
          <span className="production-phone-icon"><Smartphone size={24} /></span>
          <strong>TAP YOUR PHONE</strong>
          <small>NFC READY</small>
        </div>
        <span className="production-or">OR</span>
        <div className="production-qr">
          <img src={`/api/assets/${card.publicCode}/qr?format=svg&inline=1`} alt={`Unique QR code for ${card.serial}`} loading={eager ? "eager" : "lazy"} />
          <strong>SCAN QR CODE</strong>
        </div>
      </div>
      <footer className="production-card-footer"><span>SN: {card.serial}</span><span>{cardBrand || "GetTappy"}</span></footer>
      </>}
    </article>
  );
}

export default function NfcPrintSheet({ cards, brand, primary, secondary, text, template, printSignal }: Props) {
  const [printReady, setPrintReady] = useState(false);
  useEffect(() => { if (printSignal > 0) setPrintReady(true); }, [printSignal]);
  useEffect(() => {
    if (!printReady) return;
    let cancelled = false;
    const onAfterPrint = () => setPrintReady(false);
    window.addEventListener("afterprint", onAfterPrint);
    requestAnimationFrame(async () => {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>(".production-print-pages img"));
      const frames = Array.from(document.querySelectorAll<HTMLIFrameElement>(".production-print-pages iframe"));
      await Promise.all([
        ...images.map(image => image.decode().catch(() => undefined)),
        ...frames.map(frame => frame.contentDocument?.readyState === "complete" ? Promise.resolve() : new Promise<void>(resolve => {
          frame.addEventListener("load", () => resolve(), { once: true });
          window.setTimeout(resolve, 5000);
        })),
      ]);
      const embeddedImages = frames.flatMap(frame => Array.from(frame.contentDocument?.images || []));
      await Promise.all(embeddedImages.map(image => image.decode().catch(() => undefined)));
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [printReady]);
  if (!cards.length) return null;
  const pages = Array.from({ length: Math.ceil(cards.length / 4) }, (_, index) => cards.slice(index * 4, index * 4 + 4));
  const gallery = cards.slice(0, 25);

  return (
    <section className="production-sheet-root" aria-label="Generated NFC card sheet">
      <header className="production-gallery-heading">
        <div><h2>Card Production Gallery ({cards.length} Cards)</h2><p>Each card has its own QR code and public link.</p></div>
      </header>
      <div className="production-gallery-grid">
        {gallery.map(card => <ReviewCard key={card.serial} card={card} brand={brand} primary={primary} secondary={secondary} text={text} template={template} />)}
      </div>
      {cards.length > gallery.length && <p className="production-gallery-note">Showing 25 cards here. The print sheet includes all {cards.length} cards.</p>}
      {printReady&&<div className="production-print-pages" aria-hidden="true">{pages.map((page, pageIndex) => <div className="production-print-page" key={pageIndex}>{page.map(card => <ReviewCard key={card.serial} card={card} brand={brand} primary={primary} secondary={secondary} text={text} template={template} eager />)}</div>)}</div>}
    </section>
  );
}
