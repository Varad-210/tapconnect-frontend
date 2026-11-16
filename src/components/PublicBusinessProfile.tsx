"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookUser,
  Globe,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import GoogleLogo, { InstagramLogo, WhatsAppLogo } from "@/components/GoogleLogo";
import ReviewAssistant from "@/components/ReviewAssistant";

type ProfileLink = { label: string; url: string; kind: string };
type PublicBusinessProfileProps = {
  code: string;
  name: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  links: ProfileLink[];
  destinationUrl: string | null;
  reviewKeywords: string[];
  reviewTone: string | null;
};

function safeVCardValue(value: string) {
  return value.replace(/[\\,;]/g, "\\$&").replace(/\r?\n/g, "\\n");
}

function detectLinkKind(link: ProfileLink) {
  const v = `${link.kind} ${link.label} ${link.url}`.toLowerCase();
  if (/whatsapp|wa\.me/.test(v)) return "whatsapp";
  if (/instagram/.test(v)) return "instagram";
  if (/review|google/.test(v)) return "review";
  if (/phone|call|tel:/.test(v)) return "phone";
  if (/website|web|site/.test(v)) return "website";
  return "other";
}

type LinkKind = "review" | "whatsapp" | "phone" | "website" | "instagram" | "contact" | "other";

function LinkButton({
  href,
  onClick,
  kind,
  label,
  primary,
}: {
  href?: string;
  onClick?: () => void;
  kind: LinkKind;
  label: string;
  primary?: boolean;
}) {
  const cls = `pp-link-btn pp-link-${kind}${primary ? " pp-link-primary" : ""}`;
  const icon =
    kind === "review" ? (
      <span className="pp-google-badge">
        <GoogleLogo size={20} />
      </span>
    ) :
    kind === "whatsapp" ? (
      <span className="pp-brand-logo-badge">
        <WhatsAppLogo size={20} />
      </span>
    ) :
    kind === "instagram" ? (
      <span className="pp-brand-logo-badge">
        <InstagramLogo size={20} />
      </span>
    ) :
    kind === "phone" ? <Phone size={18} color="#2563eb" /> :
    kind === "website" ? <Globe size={18} color="#2563eb" /> :
    kind === "contact" ? <BookUser size={18} color="#2563eb" /> :
    <Globe size={18} color="#2563eb" />;

  const inner = (
    <>
      <span className="pp-link-icon">{icon}</span>
      <span className="pp-link-label">{label}</span>
    </>
  );

  if (onClick) {
    return <button type="button" className={cls} onClick={onClick}>{inner}</button>;
  }
  return <a className={cls} href={href} target="_blank" rel="noreferrer">{inner}</a>;
}

export default function PublicBusinessProfile(props: PublicBusinessProfileProps) {
  const router = useRouter();
  const taps = useRef({ count: 0, lastTap: 0 });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  // Detect review link
  const destinationLooksLikeReview = Boolean(
    props.destinationUrl &&
    /google\.[^/]+\/(?:maps|search)|writereview|write.?review|review\.google/i.test(props.destinationUrl)
  );
  const reviewLink =
    props.links.find(l => /review|google|rating/i.test(`${l.kind} ${l.label} ${l.url}`)) ||
    (destinationLooksLikeReview && props.destinationUrl
      ? { label: "Leave a 5-Star Review", kind: "review", url: props.destinationUrl }
      : null);
  const reviewIsDestination = Boolean(reviewLink && props.destinationUrl === reviewLink.url);
  const reviewHref = reviewLink
    ? reviewIsDestination ? `/api/assets/${props.code}/go` : reviewLink.url
    : null;

  // Detect canonical links
  const excludedUrls = new Set([reviewLink?.url].filter(Boolean));
  const whatsappLink = props.links.find(l => !excludedUrls.has(l.url) && /whatsapp|wa\.me/i.test(`${l.kind} ${l.label} ${l.url}`));
  const phoneLink = props.links.find(l => !excludedUrls.has(l.url) && /phone|call|tel/i.test(`${l.kind} ${l.label} ${l.url}`));
  const websiteLink = props.links.find(l => !excludedUrls.has(l.url) && /website|web|site/i.test(`${l.kind} ${l.label}`));
  const instagramLink = props.links.find(l => !excludedUrls.has(l.url) && /instagram/i.test(`${l.kind} ${l.label} ${l.url}`));

  const canonicalUrls = new Set([reviewLink?.url, whatsappLink?.url, phoneLink?.url, websiteLink?.url, instagramLink?.url].filter(Boolean));
  const otherLinks = props.links.filter(l => !canonicalUrls.has(l.url));

  // Website fallback from destinationUrl
  const destinationIsSocial = props.destinationUrl && [whatsappLink?.url, instagramLink?.url].includes(props.destinationUrl);
  const websiteUrl = websiteLink?.url || (!destinationLooksLikeReview && !destinationIsSocial ? props.destinationUrl : null);

  function handleLogoTap() {
    const now = Date.now();
    const count = now - taps.current.lastTap > 2500 ? 1 : taps.current.count + 1;
    taps.current = { count, lastTap: now };
    if (count === 4) { taps.current = { count: 0, lastTap: 0 }; router.push(`/${props.code}/manage`); }
  }

  function saveContact() {
    const contactUrl = websiteUrl || props.destinationUrl;
    const vcard = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${safeVCardValue(props.name)}`,
      `ORG:${safeVCardValue(props.name)}`,
      props.category ? `TITLE:${safeVCardValue(props.category)}` : "",
      contactUrl ? `URL:${safeVCardValue(contactUrl)}` : "",
      "END:VCARD",
    ].filter(Boolean).join("\r\n");
    const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "business"}.vcf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2200);
  }

  return (
    <main className="pp-page">
      <div className="pp-card">
        {/* Brand header */}
        <div className="pp-brand-header">
          <span className="pp-brand-icon">T</span>
          <span className="pp-brand-name">TapConnect</span>
        </div>

        {/* Logo (rounded warm box, 4 taps opens studio) */}
        <button className="pp-logo-btn" type="button" onClick={handleLogoTap} aria-label="Business logo">
          {props.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.logoUrl} alt={`${props.name} logo`} />
          ) : (
            <span className="pp-logo-fallback">☕</span>
          )}
        </button>

        {/* Name & subtitle */}
        <h1 className="pp-name">{props.name}</h1>
        {(props.tagline || props.category) && (
          <p className="pp-subtitle">{props.tagline || props.category}</p>
        )}

        {/* 5-Star Rating Pill (matches Image 3) */}
        <div className="pp-rating-pill">
          <div className="pp-stars">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>
          <span className="pp-rating-text">4.9 (198 reviews)</span>
        </div>

        {/* Description */}
        {props.description && <p className="pp-desc">{props.description}</p>}

        {/* Action Buttons (Matches Image 3: clean, no extra text) */}
        <div className="pp-actions">
          {reviewLink && reviewHref && (
            <LinkButton
              kind="review"
              label="Leave a 5-Star Review"
              primary
              onClick={() => setReviewOpen(true)}
            />
          )}

          {phoneLink && (
            <LinkButton
              kind="phone"
              label="Call Business"
              href={phoneLink.url.startsWith("tel:") ? phoneLink.url : `tel:${phoneLink.url}`}
            />
          )}

          {whatsappLink && (
            <LinkButton
              kind="whatsapp"
              label="Chat on WhatsApp"
              href={whatsappLink.url}
            />
          )}

          {websiteUrl && (
            <LinkButton
              kind="website"
              label="Visit Website"
              href={websiteUrl}
            />
          )}

          <LinkButton
            kind="contact"
            label={contactSaved ? "✓ Contact Card Saved" : "Save Contact Card"}
            onClick={saveContact}
          />

          {instagramLink && (
            <LinkButton
              kind="instagram"
              label="Follow on Instagram"
              href={instagramLink.url}
            />
          )}

          {otherLinks.map((link, i) => (
            <LinkButton
              key={i}
              kind={detectLinkKind(link) as LinkKind}
              label={link.label || "Visit Link"}
              href={link.url}
            />
          ))}
        </div>

        {/* Clean footer */}
        <div className="pp-footer">
          Powered by <strong>TapConnect</strong>
        </div>
      </div>

      {/* 5-Star Review Assistant popup */}
      {reviewOpen && reviewHref && (
        <ReviewAssistant
          businessName={props.name}
          businessCategory={props.category}
          reviewHref={reviewHref}
          reviewLabel={reviewLink?.label || "Google Review"}
          keywords={props.reviewKeywords}
          initialTone={props.reviewTone}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </main>
  );
}
