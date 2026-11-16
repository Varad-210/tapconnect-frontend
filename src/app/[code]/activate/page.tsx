"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Command, Nfc, Sparkles } from "lucide-react";

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
  { emoji: "💻", label: "IT & Technology" },
  { emoji: "🌐", label: "Other / Custom Category" },
];

export default function ActivatePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [key, setKey] = useState("");
  const [pin, setPin] = useState("");
  const [needsPin, setNeedsPin] = useState(true);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("☕ Cafe & Bakery");
  const [customCategory, setCustomCategory] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tagline, setTagline] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isCustom = selectedCategory === "OTHER" || selectedCategory === "🌐 Other / Custom Category";

  useEffect(() => {
    fetch(`/api/assets/${code}/activation-info`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.requiresPinSetup === "boolean") setNeedsPin(d.requiresPinSetup);
      })
      .catch(() => {});
  }, [code]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const finalCategory = isCustom ? customCategory.trim() : selectedCategory.replace(/^[^\s]+\s*/, "").trim();
    if (!finalCategory) {
      setError("Please select or enter a business category.");
      setBusy(false);
      return;
    }

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 20);

    try {
      const r = await fetch(`/api/assets/${code}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activationCode: key,
          pin: pin || undefined,
          businessName: name,
          category: finalCategory,
          tagline: tagline || undefined,
          destinationUrl: destination || undefined,
          keywords: keywordList.length ? keywordList : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(`/${code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="profile-page">
      <form className="profile-card" onSubmit={submit}>
        <div className="profile-brand">
          <span className="brand-mark"><Command size={15} /></span>Tapconnect
        </div>
        <div className="profile-head" style={{ paddingBottom: 4 }}>
          <span className="profile-logo"><Nfc size={30} /></span>
          <h1>Activate your card</h1>
          <p>Set up the business profile connected to this QR or NFC card.</p>
        </div>

        <div className="field">
          <label>Activation code <span style={{ color: "#dc2626" }}>*</span></label>
          <input
            required
            minLength={10}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your activation code"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label>Business name <span style={{ color: "#dc2626" }}>*</span></label>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your business name"
          />
        </div>

        {needsPin ? (
          <div className="field">
            <label>Set a four-digit editing PIN <span style={{ color: "#dc2626" }}>*</span></label>
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
            />
          </div>
        ) : (
          <div className="admin-note">
            A unique editing PIN is already secured for this card. Use the one-time credential sheet provided with it.
          </div>
        )}

        {/* Compulsory Category Selection */}
        <div className="field">
          <label>Business Category <span style={{ color: "#dc2626" }}>*</span></label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: "100%", height: 42, borderRadius: 8, padding: "0 10px" }}
            required
          >
            {PRESET_CATEGORIES.map((c) => (
              <option key={c.label} value={`${c.emoji} ${c.label}`}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Category Input if "Other" is chosen */}
        {isCustom && (
          <div className="field" style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px dashed #cbd5e1" }}>
            <label style={{ fontWeight: 600 }}>
              Custom Category Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Pani Puri Stall, Pottery Studio, Pet Grooming…"
              style={{ marginTop: 4, marginBottom: 10 }}
            />
            <label style={{ fontSize: 12, color: "#64748b" }}>
              <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              Add review keywords for this category (optional):
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. delicious taste, crispy puris, quick service"
              style={{ marginTop: 4 }}
            />
            <small style={{ color: "#94a3b8", fontSize: 11 }}>
              Comma-separated. Used by AI to generate customized 5-star customer reviews.
            </small>
          </div>
        )}

        <div className="field">
          <label>Tagline <span className="secondary">(optional)</span></label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short intro or bio"
          />
        </div>

        <div className="field">
          <label>Google Review or Destination URL <span className="secondary">(optional)</span></label>
          <input
            type="url"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="https://search.google.com/local/writereview?placeid=..."
          />
        </div>

        {error && (
          <>
            <p style={{ color: "#dc2626", fontSize: 12 }}>{error}</p>
            {error.includes("Sign in") && (
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: "#2563eb" }}
              >
                Sign in as the assigned reseller, then return here to activate.
              </a>
            )}
          </>
        )}

        <button className="btn primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Activating…" : "Activate profile"}
        </button>
        <a
          href={`/${code}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: "#64748b",
            fontSize: 12,
            textDecoration: "none",
            marginTop: 14,
          }}
        >
          <ArrowLeft size={13} />Back
        </a>
      </form>
    </main>
  );
}
