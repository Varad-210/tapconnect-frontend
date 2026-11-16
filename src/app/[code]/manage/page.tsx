"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Briefcase, Camera, ChevronRight, Eye, KeyRound,
  Link2, LockKeyhole, Plus, Save, Settings2, Sparkles, Star, Trash2,
} from "lucide-react";
import GoogleLogo from "@/components/GoogleLogo";

type Profile = {
  name: string; category: string; tagline: string; description: string;
  logoUrl?: string | null;
  destinationUrl: string; links: { label: string; url: string; kind: string }[];
  keywords: string[]; tone: string;
};

type Tab = "details" | "links" | "security";

const PRESET_CATEGORIES = [
  { emoji: "☕", label: "Cafe & Bakery" },
  { emoji: "🍽️", label: "Restaurant" },
  { emoji: "🛒", label: "Retail Shop & Grocery" },
  { emoji: "⚙️", label: "Hardware Shop" },
  { emoji: "💈", label: "Salon & Spa" },
  { emoji: "🏥", label: "Clinic & Healthcare" },
  { emoji: "💪", label: "Gym & Fitness" },
  { emoji: "🏨", label: "Hotel & Stay" },
  { emoji: "🚗", label: "Auto Repair & Service" },
  { emoji: "📸", label: "Photography & Studio" },
  { emoji: "👗", label: "Fashion & Boutique" },
  { emoji: "💊", label: "Pharmacy & Medical" },
  { emoji: "🍕", label: "Fast Food & Street Food" },
  { emoji: "🏫", label: "Education & Coaching" },
  { emoji: "🏗️", label: "Construction & Real Estate" },
  { emoji: "💻", label: "IT & Technology" },
  { emoji: "🌿", label: "Agriculture & Nursery" },
  { emoji: "✂️", label: "Tailoring & Stitching" },
  { emoji: "🎉", label: "Events & Decoration" },
  { emoji: "🔧", label: "Electrical & Plumbing" },
  { emoji: "📦", label: "Logistics & Transport" },
  { emoji: "🏦", label: "Finance & Insurance" },
  { emoji: "🎵", label: "Music & Entertainment" },
  { emoji: "🌐", label: "Other / Custom Category" },
];

export default function ManagePage() {
  const { code } = useParams<{ code: string }>();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<Tab>("details");
  const [profile, setProfile] = useState<Profile>({
    name: "", category: "Cafe & Bakery", tagline: "", description: "", destinationUrl: "",
    links: [], keywords: [], tone: "casual",
  });
  const [keywordText, setKeywordText] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [convertingLink, setConvertingLink] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState("");

  useEffect(() => {
    if (!unlocked) {
      fetch(`/api/assets/${code}/pin`).then(r => { if (r.ok) setUnlocked(true); }).catch(() => {});
    }
    if (unlocked) {
      fetch(`/api/assets/${code}/profile`).then(r => r.json()).then(d => {
        if (d.profile) {
          const rawTone = d.profile.tone;
          const tone = rawTone === "professional" ? "formal" : rawTone === "concise" ? "short" : rawTone === "friendly" ? "casual" : rawTone ?? "casual";
          const cat = d.profile.category ?? "";
          const isPreset = PRESET_CATEGORIES.some(c => c.label.toLowerCase() === cat.toLowerCase());
          if (cat && !isPreset) {
            setCustomCategory(cat);
            setIsCustomCategory(true);
          } else {
            setIsCustomCategory(false);
          }
          setProfile({
            name: d.profile.name ?? "",
            category: cat || "Cafe & Bakery",
            tagline: d.profile.tagline ?? "",
            description: d.profile.description ?? "",
            logoUrl: d.profile.logoUrl,
            destinationUrl: d.profile.destinationUrl ?? "",
            links: (d.profile.links || []).map((l: { label?: string | null; url?: string | null; kind?: string | null }) => ({
              label: l.label ?? "", url: l.url ?? "", kind: l.kind ?? "custom",
            })),
            keywords: d.profile.keywords || [], tone,
          });
          setKeywordText((d.profile.keywords || []).join(", "));
        }
      });
    }
  }, [unlocked, code]);

  async function unlock(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await fetch(`/api/assets/${code}/pin`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setUnlocked(true);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  async function convertGoogleReviewUrl(rawUrl: string, targetIndex?: number) {
    const trimmed = (rawUrl || "").trim();
    if (!trimmed) {
      setConvertSuccess("");
      return;
    }
    setConvertingLink(true);
    setConvertSuccess("");
    try {
      const res = await fetch("/api/utils/convert-review-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.isConverted && data.reviewUrl) {
        if (targetIndex !== undefined) {
          setProfile(p => ({
            ...p,
            links: p.links.map((item, i) =>
              i === targetIndex
                ? { ...item, url: data.reviewUrl, label: item.label || "Google Review", kind: "review" }
                : item
            ),
          }));
        } else {
          setProfile(p => {
            const hasReviewLink = p.links.some(l => /review|google/i.test(`${l.kind} ${l.label}`));
            const updatedLinks = hasReviewLink
              ? p.links.map(l => /review|google/i.test(`${l.kind} ${l.label}`) ? { ...l, url: data.reviewUrl } : l)
              : [{ label: "Google Review", url: data.reviewUrl, kind: "review" }, ...p.links];
            return {
              ...p,
              destinationUrl: data.reviewUrl,
              links: updatedLinks,
            };
          });
        }
        setConvertSuccess(`✓ Converted to 5-Star Review link! (Place ID: ${data.placeId || "Verified"})`);
      } else {
        setConvertSuccess("⚠️ Could not extract Place ID from this link. Make sure it is a valid Google Maps link.");
      }
    } catch (err) {
      setConvertSuccess(`⚠️ Error: ${(err as Error).message || "Could not convert link"}`);
    } finally {
      setConvertingLink(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const finalCategory = isCustomCategory ? customCategory.trim() : profile.category.trim();
    if (!finalCategory) {
      setError("Please select or enter a business category.");
      setBusy(false);
      return;
    }

    try {
      const keywords = keywordText.split(",").map(k => k.trim()).filter(Boolean).slice(0, 20);
      const r = await fetch(`/api/assets/${code}/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          category: finalCategory,
          tagline: profile.tagline.trim(),
          description: profile.description.trim(),
          destinationUrl: profile.destinationUrl.trim(),
          links: profile.links.map(l => ({ ...l, label: l.label.trim(), url: l.url.trim() })),
          keywords,
          newPin: newPin || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfile(p => ({ ...p, keywords, category: finalCategory }));
      setNewPin(""); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  const update = (key: keyof Profile, value: string) => setProfile(p => ({ ...p, [key]: value }));

  if (!unlocked) return (
    <main className="manage-page">
      <form className="manage-pin-card" onSubmit={unlock}>
        <div className="manage-brand"><span className="manage-brand-mark">T</span>TapConnect</div>
        <div className="manage-pin-icon"><LockKeyhole size={30} /></div>
        <h1 className="manage-pin-title">Enter your security PIN</h1>
        <p className="manage-pin-sub">Unlock Smart Card Studio to edit your business profile.</p>
        <input className="manage-pin-input" type="password" inputMode="numeric" pattern="[0-9]{4}"
          maxLength={4} required value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••" autoComplete="one-time-code" />
        {error && <p className="manage-error">{error}</p>}
        <button className="manage-btn-primary" disabled={busy}>{busy ? "Checking…" : "Unlock Studio"}</button>
        <a href={`/${code}`} className="manage-back-link"><ArrowLeft size={13} />Back to profile</a>
      </form>
    </main>
  );

  // AI Review Keywords tab removed from this sidebar navigation
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "details", icon: <Briefcase size={16} />, label: "Business Details" },
    { id: "links", icon: <Link2 size={16} />, label: "Destination Links" },
    { id: "security", icon: <KeyRound size={16} />, label: "Security (PIN)" },
  ];

  return (
    <main className="manage-page">
      <form className="manage-shell" onSubmit={save}>
        {/* Top bar */}
        <div className="manage-topbar">
          <div className="manage-brand"><span className="manage-brand-mark">T</span>TapConnect</div>
          <div className="manage-topbar-actions">
            <a className="manage-btn-outline" href={`/${code}`} target="_blank" rel="noreferrer">
              <Eye size={14} />Preview Profile
            </a>
            <button type="submit" className="manage-btn-primary" disabled={busy}>
              <Save size={14} />{busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="manage-layout">
          {/* Sidebar tabs */}
          <nav className="manage-sidebar">
            {tabs.map(t => (
              <button key={t.id} type="button"
                className={`manage-tab-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}>
                {t.icon}<span>{t.label}</span>
                <ChevronRight size={15} className="manage-tab-chevron" />
              </button>
            ))}
          </nav>

          {/* Panel */}
          <div className="manage-panel">
            {/* ── Business Details (matches Image 2) ── */}
            {tab === "details" && (
              <div className="manage-section">
                <div className="manage-section-head" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="manage-section-icon"><Briefcase size={22} /></div>
                    <div>
                      <h2>Business Details</h2>
                      <p>Update your business information</p>
                    </div>
                  </div>

                  {/* Logo Card with Camera badge (matches Image 2) */}
                  <div style={{ position: "relative", width: 68, height: 68, borderRadius: 18, background: "#fef3c7", border: "1.5px solid #fde68a", display: "grid", placeItems: "center", fontSize: 32 }}>
                    {profile.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
                    ) : (
                      <span>☕</span>
                    )}
                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: 7, background: "#334155", color: "#fff", display: "grid", placeItems: "center" }}>
                      <Camera size={13} />
                    </div>
                  </div>
                </div>

                <div className="manage-field">
                  <label>Business Name <span className="manage-required">*</span></label>
                  <input required value={profile.name} onChange={e => update("name", e.target.value)}
                    placeholder="e.g. My Smart Business" />
                </div>

                <div className="manage-field">
                  <label>Business Category <span className="manage-required">*</span></label>
                  <select
                    value={isCustomCategory ? "🌐 Other / Custom Category" : profile.category}
                    onChange={e => {
                      const val = e.target.value;
                      if (val.includes("Other")) {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        update("category", val);
                      }
                    }}
                    required
                    style={{ width: "100%", height: 44, borderRadius: 10, padding: "0 12px", border: "1.5px solid #d1d9e6", background: "#f9fafc", font: "600 14px Manrope, sans-serif" }}
                  >
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat.label} value={cat.label}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Custom Category chosen: provide input and let them add keywords right here */}
                {isCustomCategory && (
                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1.5px dashed #cbd5e1", marginBottom: 20 }}>
                    <div className="manage-field" style={{ marginBottom: 10 }}>
                      <label style={{ fontWeight: 650 }}>
                        Custom Category Name <span className="manage-required">*</span>
                      </label>
                      <input
                        required
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        placeholder="e.g. Pani Puri Stall, Pottery Studio, Pet Grooming…"
                      />
                    </div>
                    <div className="manage-field" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12, color: "#64748b" }}>
                        <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                        Review keywords for this category (optional, comma-separated):
                      </label>
                      <input
                        value={keywordText}
                        onChange={e => setKeywordText(e.target.value)}
                        placeholder="e.g. spicy chaat, crispy puris, quick service"
                      />
                      <small style={{ color: "#94a3b8", fontSize: 11, display: "block", marginTop: 4 }}>
                        Used automatically by the AI review engine to tailor 5-star customer review suggestions.
                      </small>
                    </div>
                  </div>
                )}

                <div className="manage-field">
                  <label>Bio / Tagline</label>
                  <textarea value={profile.description} onChange={e => update("description", e.target.value)}
                    placeholder="Tap any link below to explore our services and connect with us!" rows={3} />
                </div>
              </div>
            )}

            {/* ── Destination Links Tab (with Automatic 5-Star Review Generator) ── */}
            {tab === "links" && (
              <div className="manage-section">
                <div className="manage-section-head">
                  <div className="manage-section-icon"><Link2 size={22} /></div>
                  <div>
                    <h2>Destination Links</h2>
                    <p>Add links to your Google Review, WhatsApp, website, Instagram, or anything else.</p>
                  </div>
                </div>

                {/* 5-Star Google Review Link Auto-Generator Box */}
                <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                      <GoogleLogo size={18} />
                    </span>
                    <strong style={{ font: "700 14px Manrope, sans-serif", color: "#1e3a8a" }}>
                      Automatic 5-Star Google Review Link
                    </strong>
                  </div>
                  <p style={{ margin: "0 0 10px", color: "#3b82f6", fontSize: 12.5, lineHeight: 1.5 }}>
                    Paste your Google Maps link (e.g. <code>https://maps.app.goo.gl/...</code> or place URL).
                    The system will automatically convert it into a direct 5-star review link.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="url"
                      placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/2HKN66fwAmWUftYy9)"
                      value={profile.destinationUrl}
                      onChange={e => update("destinationUrl", e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          convertGoogleReviewUrl(profile.destinationUrl);
                        }
                      }}
                      style={{ flex: 1, height: 42, background: "#fff" }}
                    />
                    <button
                      type="button"
                      className="manage-btn-primary"
                      disabled={convertingLink || !profile.destinationUrl}
                      onClick={() => convertGoogleReviewUrl(profile.destinationUrl)}
                    >
                      {convertingLink ? "Converting…" : "Auto-Convert"}
                    </button>
                  </div>
                  {convertSuccess && (
                    <p style={{
                      color: convertSuccess.startsWith("✓") ? "#15803d" : "#b45309",
                      fontSize: 12.5,
                      fontWeight: 700,
                      margin: "10px 0 0"
                    }}>
                      {convertSuccess}
                    </p>
                  )}
                </div>

                <div className="manage-links-list">
                  {profile.links.map((link, index) => (
                    <div key={index} className="manage-link-row">
                      <div className="manage-link-num">{index + 1}</div>
                      <div className="manage-link-fields">
                        <input aria-label="Link label" placeholder="Label (e.g. Google Review, WhatsApp)"
                          value={link.label}
                          onChange={e => setProfile(p => ({ ...p, links: p.links.map((item, i) => i === index ? { ...item, label: e.target.value } : item) }))} />
                        <input aria-label="Link URL" type="url" placeholder="https://…"
                          value={link.url}
                          onChange={e => {
                            const val = e.target.value;
                            setProfile(p => ({ ...p, links: p.links.map((item, i) => i === index ? { ...item, url: val } : item) }));
                            if (/maps|goo\.gl/i.test(val)) {
                              convertGoogleReviewUrl(val, index);
                            }
                          }} />
                      </div>
                      <button type="button" className="manage-link-delete" aria-label="Remove link"
                        onClick={() => setProfile(p => ({ ...p, links: p.links.filter((_, i) => i !== index) }))}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="manage-btn-add-link"
                  onClick={() => setProfile(p => ({ ...p, links: [...p.links, { label: "", url: "", kind: "custom" }] }))}>
                  <Plus size={15} />Add Link
                </button>
              </div>
            )}

            {/* ── Security (PIN) Tab ── */}
            {tab === "security" && (
              <div className="manage-section">
                <div className="manage-section-head">
                  <div className="manage-section-icon"><KeyRound size={22} /></div>
                  <div>
                    <h2>Security (PIN)</h2>
                    <p>Change the 4-digit PIN used to unlock the profile editor.</p>
                  </div>
                </div>

                <div className="manage-field">
                  <label>New Editing PIN <span className="manage-hint">(leave blank to keep current)</span></label>
                  <input type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4}
                    value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Enter a new 4-digit PIN" className="manage-pin-field" />
                </div>

                <p className="manage-security-note">Your PIN is verified securely. Editing access expires after 20 minutes of inactivity.</p>
              </div>
            )}

            {error && <p className="manage-error" style={{ marginTop: 12 }}>{error}</p>}
            {saved && <p className="manage-saved">✓ Changes saved successfully.</p>}

            <div className="manage-panel-actions">
              <a href={`/${code}`} className="manage-btn-outline" target="_blank" rel="noreferrer">
                <Settings2 size={14} />Preview Profile
              </a>
              <button type="submit" className="manage-btn-primary" disabled={busy}>
                <Save size={14} />{busy ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
