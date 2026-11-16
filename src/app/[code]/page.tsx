import { ArrowUpRight, Command, Nfc, QrCode, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PublicBusinessProfile from "@/components/PublicBusinessProfile";

export const dynamic = "force-dynamic";

export default async function PublicProfile({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const asset = await db.asset.findUnique({
    where: { publicCode: code },
    include: { business: { include: { links: { orderBy: { sortOrder: "asc" } } } } },
  });

  if (!asset || asset.status === "BLOCKED") notFound();
  if (asset.status === "ACTIVE") await db.scanEvent.create({ data: { assetId: asset.id, source: "profile" } });

  if (asset.status === "PENDING") {
    return (
      <main className="public-profile-page">
        <section className="business-profile-card business-profile-pending-card">
          <div className="business-profile-accent" />
          <div className="business-profile-pending-brand"><span className="brand-mark"><Command size={15} /></span>Tapconnect</div>
          <div className="profile-head">
            <span className="profile-logo"><QrCode size={29} /></span>
            <h1>Set up your business profile</h1>
            <p>This Tapconnect card is ready to activate.</p>
          </div>
          <div className="profile-links">
            <a href={`/${code}/activate`}><ShieldCheck size={16} />Activate this card <ArrowUpRight size={14} /></a>
          </div>
          <div className="business-profile-footer"><Nfc size={12} />Powered by <strong>Tapconnect NFC</strong></div>
        </section>
      </main>
    );
  }

  const business = asset.business;
  if (!business) notFound();

  return (
    <PublicBusinessProfile
      code={code}
      name={business.name}
      category={business.category}
      tagline={business.tagline}
      description={business.description}
      logoUrl={business.logoUrl}
      links={business.links.map(({ label, url, kind }) => ({ label, url, kind }))}
      destinationUrl={asset.destinationUrl}
      reviewKeywords={business.keywords}
      reviewTone={business.tone}
    />
  );
}
