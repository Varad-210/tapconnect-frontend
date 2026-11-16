"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import GoogleLogo from "@/components/GoogleLogo";
import {
  formatGoogle5StarUrl,
  generateCategoryReviews,
  getBusinessSubcategories,
  type ReviewTone,
} from "@/lib/review-engine";

type ReviewAssistantProps = {
  businessName: string;
  businessCategory?: string | null;
  reviewHref: string;
  reviewLabel: string;
  keywords: string[];
  initialTone: string | null;
  onClose: () => void;
};

const tones: { value: ReviewTone; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "desi", label: "Desi Hinglish" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "short", label: "Short" },
  { value: "formal", label: "Formal" },
];

function normalizeTone(value: string | null): ReviewTone {
  if (value === "formal" || value === "enthusiastic" || value === "short" || value === "desi") return value;
  if (value === "professional") return "formal";
  if (value === "concise") return "short";
  return "casual";
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to fallback
  }

  try {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.style.position = "fixed";
    temporary.style.top = "0";
    temporary.style.left = "0";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.focus();
    temporary.select();
    const result = document.execCommand("copy");
    temporary.remove();
    return result;
  } catch {
    return false;
  }
}

export default function ReviewAssistant({
  businessName,
  businessCategory,
  reviewHref,
  reviewLabel,
  keywords,
  initialTone,
  onClose,
}: ReviewAssistantProps) {
  const subcategories = useMemo(
    () => getBusinessSubcategories(businessCategory, businessName),
    [businessCategory, businessName]
  );

  const [selectedSubcatId, setSelectedSubcatId] = useState<string>(
    () => subcategories[0]?.id || "taste"
  );
  const [tone, setTone] = useState<ReviewTone>(() => normalizeTone(initialTone));
  const [variation, setVariation] = useState(0);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [notes, setNotes] = useState("");
  const [showCustomDetails, setShowCustomDetails] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);

  // Initialize with 3 pre-generated reviews immediately (zero wait time)
  const [drafts, setDrafts] = useState<string[]>(() => {
    const firstSubcat = subcategories[0];
    return generateCategoryReviews({
      businessName,
      category: businessCategory,
      subcategoryId: firstSubcat?.id || "taste",
      subcategoryLabel: firstSubcat?.label || "Taste & Quality",
      tone: normalizeTone(initialTone),
      keywords,
      variation: 0,
    });
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function changeSubcategory(newSubcatId: string) {
    setSelectedSubcatId(newSubcatId);
    setSelectedReviewIndex(0);
    const subcat = subcategories.find(s => s.id === newSubcatId);
    const updated = generateCategoryReviews({
      businessName,
      category: businessCategory,
      subcategoryId: newSubcatId,
      subcategoryLabel: subcat?.label || "Aspect",
      tone,
      keywords: selectedIdeas.length ? selectedIdeas : keywords,
      notes,
      variation,
    });
    setDrafts(updated);
  }

  function changeTone(newTone: ReviewTone) {
    setTone(newTone);
    const subcat = subcategories.find(s => s.id === selectedSubcatId);
    const updated = generateCategoryReviews({
      businessName,
      category: businessCategory,
      subcategoryId: selectedSubcatId,
      subcategoryLabel: subcat?.label || "Aspect",
      tone: newTone,
      keywords: selectedIdeas.length ? selectedIdeas : keywords,
      notes,
      variation,
    });
    setDrafts(updated);
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    const nextVar = variation + 1;
    setVariation(nextVar);
    const subcat = subcategories.find(s => s.id === selectedSubcatId);

    try {
      const res = await fetch("/api/reviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category: businessCategory,
          subcategoryId: selectedSubcatId,
          subcategoryLabel: subcat?.label || "Aspect",
          tone,
          keywords: selectedIdeas.length ? selectedIdeas : keywords,
          notes,
          variation: nextVar,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews) && data.reviews.length >= 3) {
          setDrafts(data.reviews);
          setSelectedReviewIndex(0);
          setIsRegenerating(false);
          return;
        }
      }
    } catch {
      // Fallback to local engine
    }

    const localFresh = generateCategoryReviews({
      businessName,
      category: businessCategory,
      subcategoryId: selectedSubcatId,
      subcategoryLabel: subcat?.label || "Aspect",
      tone,
      keywords: selectedIdeas.length ? selectedIdeas : keywords,
      notes,
      variation: nextVar,
    });
    setDrafts(localFresh);
    setSelectedReviewIndex(0);
    setIsRegenerating(false);
  }

  async function copyDraft(index: number) {
    const success = await copyToClipboard(drafts[index]);
    if (success) {
      setCopied(index);
      setCopyError(false);
      window.setTimeout(() => setCopied(current => (current === index ? null : current)), 2000);
    } else {
      setCopyError(true);
    }
  }

  async function handleCopyAndRedirect() {
    const chosenDraft = drafts[selectedReviewIndex] || drafts[0];
    if (!chosenDraft) return;

    setRedirecting(true);
    const success = await copyToClipboard(chosenDraft);
    if (!success) {
      setCopyError(true);
    }

    const targetUrl = formatGoogle5StarUrl(reviewHref);

    // Give visual confirmation, then smoothly open Google Review
    window.setTimeout(() => {
      const newTab = window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
        window.location.href = targetUrl;
      }
      window.setTimeout(() => setRedirecting(false), 2000);
    }, 350);
  }

  function toggleIdea(idea: string) {
    const updated = selectedIdeas.includes(idea)
      ? selectedIdeas.filter(item => item !== idea)
      : [...selectedIdeas, idea];
    setSelectedIdeas(updated);
    const subcat = subcategories.find(s => s.id === selectedSubcatId);
    setDrafts(
      generateCategoryReviews({
        businessName,
        category: businessCategory,
        subcategoryId: selectedSubcatId,
        subcategoryLabel: subcat?.label || "Aspect",
        tone,
        keywords: updated.length ? updated : keywords,
        notes,
        variation,
      })
    );
  }

  return (
    <div
      className="review-assistant-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="review-assistant"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-assistant-title"
      >
        <header className="review-assistant-header">
          <span className="review-assistant-mark" style={{ background: "#ffffff", border: "1.5px solid #e2e8f0" }}>
            <GoogleLogo size={24} />
          </span>
          <div>
            <p>GOOGLE 5-STAR REVIEWS</p>
            <h2 id="review-assistant-title">Review Assistant</h2>
          </div>
          <button
            className="review-assistant-close"
            type="button"
            onClick={onClose}
            aria-label="Close review assistant"
          >
            <X size={20} />
          </button>
        </header>

        <div className="review-assistant-content">
          <div className="review-business-banner">
            <div>
              <h3>{businessName}</h3>
              <p className="review-category-tag">
                {businessCategory ? `Category: ${businessCategory}` : "5★ Customer Reviews"}
              </p>
            </div>
            <div className="review-banner-stars" aria-label="5 stars rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
            </div>
          </div>

          {/* Subcategories selector */}
          <div className="review-section">
            <div className="review-section-header">
              <span className="review-step-pill">1</span>
              <label>Choose an aspect to highlight:</label>
            </div>
            <div className="review-subcat-tabs">
              {subcategories.map(subcat => (
                <button
                  key={subcat.id}
                  type="button"
                  className={`review-subcat-tab ${selectedSubcatId === subcat.id ? "active" : ""}`}
                  onClick={() => changeSubcategory(subcat.id)}
                >
                  <span>{subcat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone selector & Regenerate bar */}
          <div className="review-section">
            <div className="review-section-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="review-step-pill">2</span>
                <label>Select tone:</label>
              </div>
              <button
                type="button"
                className="review-regen-btn"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                title="Generate fresh 5-star reviews"
              >
                <RefreshCw size={13} className={isRegenerating ? "spin" : ""} />
                <span>{isRegenerating ? "Generating..." : "Regenerate"}</span>
              </button>
            </div>
            <div className="review-tone-options">
              {tones.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={tone === option.value ? "selected" : ""}
                  aria-pressed={tone === option.value}
                  onClick={() => changeTone(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional custom visit notes accordion */}
          <div className="review-custom-accordion">
            <button
              type="button"
              className="review-accordion-toggle"
              onClick={() => setShowCustomDetails(curr => !curr)}
            >
              <span>Want to mention custom details? (Optional)</span>
              {showCustomDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showCustomDetails && (
              <div className="review-custom-body">
                {keywords.length > 0 && (
                  <div className="review-ideas" style={{ marginBottom: 10 }}>
                    <p>Idea tags: <span>select to include</span></p>
                    <div className="review-idea-chips">
                      {keywords.slice(0, 10).map((kw, i) => (
                        <button
                          key={`${kw}-${i}`}
                          type="button"
                          className={selectedIdeas.includes(kw) ? "selected" : ""}
                          onClick={() => toggleIdea(kw)}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea
                  className="review-experience-input"
                  value={notes}
                  maxLength={400}
                  placeholder="e.g. delicious pani puri, polite bhaiya, clean counter"
                  onChange={e => {
                    const val = e.target.value;
                    setNotes(val);
                    const subcat = subcategories.find(s => s.id === selectedSubcatId);
                    setDrafts(
                      generateCategoryReviews({
                        businessName,
                        category: businessCategory,
                        subcategoryId: selectedSubcatId,
                        subcategoryLabel: subcat?.label || "Aspect",
                        tone,
                        keywords: selectedIdeas.length ? selectedIdeas : keywords,
                        notes: val,
                        variation,
                      })
                    );
                  }}
                />
              </div>
            )}
          </div>

          {/* 3 Review suggestions */}
          <div className="review-draft-list" aria-live="polite">
            <div className="review-draft-heading">
              <strong>Select your preferred 5-star review:</strong>
              <span className="review-hint-sub">Tap card to select · Editable</span>
            </div>

            {drafts.map((draft, index) => {
              const isSelected = selectedReviewIndex === index;
              return (
                <article
                  key={`${selectedSubcatId}-${tone}-${variation}-${index}`}
                  className={`review-draft-card ${isSelected ? "selected-card" : ""}`}
                  onClick={() => setSelectedReviewIndex(index)}
                >
                  <div className="review-card-top-row">
                    <div className="review-card-status">
                      <span className={`review-radio ${isSelected ? "radio-checked" : ""}`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="review-draft-num">Draft 0{index + 1}</span>
                    </div>

                    <div className="review-card-stars">
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span className="review-stars-text">5★</span>
                    </div>
                  </div>

                  <textarea
                    aria-label={`Review suggestion ${index + 1}`}
                    rows={3}
                    value={draft}
                    onChange={event => {
                      const updatedVal = event.target.value;
                      setDrafts(current =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? updatedVal : item
                        )
                      );
                    }}
                    onClick={e => e.stopPropagation()}
                  />

                  <div className="review-card-bottom-row">
                    <span className="review-selected-tag">
                      {isSelected ? "✓ Selected for Google" : "Click to select"}
                    </span>
                    <button
                      type="button"
                      className="review-mini-copy-btn"
                      onClick={e => {
                        e.stopPropagation();
                        copyDraft(index);
                      }}
                    >
                      <Copy size={12} />
                      <span>{copied === index ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Bottom bar with Copy & Google Review redirect */}
        <footer className="review-assistant-footer">
          <div className="review-footer-hint">
            <span>Tap below to copy & open Google Review</span>
            {copyError && (
              <span className="review-copy-error">
                Please select and copy the text manually.
              </span>
            )}
          </div>

          <button
            type="button"
            className="review-submit-google-button"
            onClick={handleCopyAndRedirect}
            disabled={redirecting || !drafts[selectedReviewIndex]}
          >
            <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: "50%", background: "#ffffff" }}>
              <GoogleLogo size={18} />
            </span>
            <span className="review-button-main-text">
              {redirecting
                ? "Copied! Opening Google..."
                : "Copy Review & Open Google (5★)"}
            </span>
            <ExternalLink size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}
