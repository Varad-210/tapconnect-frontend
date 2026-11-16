"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildTemplatePreview } from "@/components/CreateCardTemplate";

type Props = {
  html: string;
  css: string;
  brand: string;
  primary: string;
  secondary: string;
  text: string;
  serial: string;
  qrCode: string;
  publicUrl: string;
  title: string;
  className: string;
};

export default function CardTemplateFrame(props: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => buildTemplatePreview(
    props.html,
    props.css,
    props.brand,
    props.primary,
    props.secondary,
    props.text,
    props.serial,
    props.qrCode,
    props.publicUrl,
  ), [props.html, props.css, props.brand, props.primary, props.secondary, props.text, props.serial, props.qrCode, props.publicUrl]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fitCard = () => {
      try {
        const doc = frame.contentDocument;
        const card = doc?.body?.firstElementChild as HTMLElement | null;
        if (!doc || !card) return;

        const cardWidth = card.offsetWidth || card.scrollWidth;
        const cardHeight = card.offsetHeight || card.scrollHeight;
        const viewportWidth = (doc.documentElement?.clientWidth ?? 0) - 20;
        const viewportHeight = (doc.documentElement?.clientHeight ?? 0) - 20;
        if (cardWidth <= 0 || cardHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) return;

        const scale = Math.min(viewportWidth / cardWidth, viewportHeight / cardHeight);
        card.style.transformOrigin = "center center";
        card.style.transform = `scale(${scale})`;
      } catch {
        // Ignore transient DOM access errors during initial iframe parsing
      }
    };

    frame.addEventListener("load", fitCard);
    window.addEventListener("resize", fitCard);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fitCard);
    observer?.observe(frame);
    fitCard();

    return () => {
      frame.removeEventListener("load", fitCard);
      window.removeEventListener("resize", fitCard);
      observer?.disconnect();
    };
  }, [srcDoc]);

  return (
    <iframe
      ref={frameRef}
      className={props.className}
      title={props.title}
      sandbox="allow-same-origin"
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
    />
  );
}
