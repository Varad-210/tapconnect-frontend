"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowUpRight, Command, Nfc, QrCode, ShieldCheck } from "lucide-react";
import PublicBusinessProfile from "@/components/PublicBusinessProfile";

type PublicProfile = {
  name: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  links: { label: string; url: string; kind: string }[];
  destinationUrl: string | null;
  keywords: string[];
  tone: string | null;
};

export default function PublicProfilePage() {
  const { code } = useParams<{ code: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [pending, setPending] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let current = true;
    fetch(`/api/assets/${encodeURIComponent(code)}`, { cache: "no-store" })
      .then(async response => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => {
        if (!current) return;
        if (!ok) setMissing(true);
        else if (body.status === "PENDING") setPending(true);
        else if (body.status === "ACTIVE" && body.profile) setProfile(body.profile);
        else setMissing(true);
      })
      .catch(() => { if (current) setMissing(true); });
    return () => { current = false; };
  }, [code]);

  if (profile) return <PublicBusinessProfile code={code} {...profile} reviewKeywords={profile.keywords} reviewTone={profile.tone} />;
  if (pending) return (
    <main className="public-profile-page">
      <section className="business-profile-card business-profile-pending-card">
        <div className="business-profile-accent" />
        <div className="business-profile-pending-brand"><span className="brand-mark"><Command size={15} /></span>Vistar</div>
        <div className="profile-head">
          <span className="profile-logo"><QrCode size={29} /></span>
          <h1>Set up your business profile</h1>
          <p>This Vistar card is ready to activate.</p>
        </div>
        <div className="profile-links">
          <a href={`/${code}/activate`}><ShieldCheck size={16} />Activate this card <ArrowUpRight size={14} /></a>
        </div>
        <div className="business-profile-footer"><Nfc size={12} />Powered by <strong>Vistar</strong></div>
      </section>
    </main>
  );
  if (missing) return <main className="public-profile-page"><section className="business-profile-card"><h1>Card not found</h1><p>This card is unavailable. Check the link and try again.</p></section></main>;
  return <main className="public-profile-page"><section className="business-profile-card"><p>Loading your Vistar profile…</p></section></main>;
}
