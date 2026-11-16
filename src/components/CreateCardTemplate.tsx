"use client";

import { useState, type FormEvent } from "react";
import { Code2, Eye, LoaderCircle, Plus, X } from "lucide-react";

export type CardTemplate = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  preview: { primary: string; secondary: string; text: string; brand: string };
  published: boolean;
  html?: string | null;
  react?: string | null;
  css?: string | null;
};

type Props = {
  primary: string;
  secondary: string;
  text: string;
  brand: string;
  onClose: () => void;
  onCreated: (template: CardTemplate) => void;
};

const starterHtml = `<article class="card">
  <div class="brand">{{brand}}</div>
  <div class="waves">)))</div>
  <p>Tap to connect</p>
  <img class="qr" src="{{qrCode}}" alt="Scan to connect" />
  <small>{{serial}}</small>
</article>`;

const starterReact = `export default function Card({ brand, serial, qrCode }) {
  return (
    <article className="card">
      <div className="brand">{brand}</div>
      <div className="waves">)))</div>
      <p>Tap to connect</p>
      <img className="qr" src={qrCode} alt="Scan to connect" />
      <small>{serial}</small>
    </article>
  );
}`;

const starterCss = `.card { box-sizing: border-box; width: 320px; height: 200px; padding: 24px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(145deg, {{primary}}, {{secondary}}); color: {{text}}; font-family: Arial, sans-serif; text-align: center; }
.brand { font-size: 19px; font-weight: 700; }
.waves { font-size: 34px; letter-spacing: 5px; }
.card p { margin: 0; font-weight: 600; }
.qr { width: 46px; height: 46px; object-fit: contain; }
.card small { font-size: 9px; }`;

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function buildTemplatePreview(html: string, css: string, brand: string, primary: string, secondary: string, text: string, serial = "TP-NFC-0001", qrCode?: string, publicUrl = "https://example.com/card") {
  const qrPlaceholder = qrCode || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23152538' d='M2 2h17v17H2zm4 4v9h9V6zM29 2h17v17H29zm4 4v9h9V6zM2 29h17v17H2zm4 4v9h9v-9zM25 25h6v6h-6zm8 0h4v4h-4zm8 0h5v8h-5zM25 34h5v5h-5zm8 4h5v8h-5zm8 0h5v5h-5z'/%3E%3C/svg%3E";
  const markup = html
    .replaceAll("{{brand}}", escapeHtml(brand || "Your business"))
    .replaceAll("{{serial}}", escapeHtml(serial))
    .replaceAll("{{qrCode}}", escapeHtml(qrPlaceholder))
    .replaceAll("{{publicUrl}}", escapeHtml(publicUrl));
  const resolvedCss = css.replaceAll("{{primary}}", primary).replaceAll("{{secondary}}", secondary).replaceAll("{{text}}", text);
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https: http:; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none';"><style>*{box-sizing:border-box}html,body{width:100%;height:100%;min-height:100%;margin:0;padding:0;overflow:hidden;box-sizing:border-box;display:grid;place-items:center;background:#f4f7fb}${resolvedCss}html,body{width:100%!important;height:100%!important;min-height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;display:grid!important;place-items:center!important}body>*{max-width:100%;max-height:100%}</style></head><body>${markup}</body></html>`;
}

export default function CreateCardTemplate({ primary, secondary, text, brand, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("MINIMAL");
  const [mode, setMode] = useState<"HTML" | "REACT">("HTML");
  const [htmlSource, setHtmlSource] = useState(starterHtml);
  const [reactSource, setReactSource] = useState(starterReact);
  const [css, setCss] = useState(starterCss);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const source = mode === "HTML" ? htmlSource : reactSource;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/design-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description: `${category.toLowerCase()} custom card design`,
          preview: { primary, secondary, text, brand: brand || "Tapconnect" },
          html: mode === "HTML" ? htmlSource : undefined,
          react: mode === "REACT" ? reactSource : undefined,
          css,
          published: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this template.");
      onCreated(result.template as CardTemplate);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="template-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="template-editor-modal" onSubmit={save} aria-labelledby="template-editor-title">
        <header className="template-editor-header">
          <div><span className="template-editor-icon"><Code2 size={17} /></span><h2 id="template-editor-title">Add card template</h2><p>Name your design and add its card code.</p></div>
          <button className="icon-button" type="button" aria-label="Close template editor" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="template-editor-grid">
          <div>
            <div className="field"><label htmlFor="template-name">Template name</label><input id="template-name" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={80} required placeholder="e.g. Cafe Minimal" /></div>
            <div className="field"><label htmlFor="template-category">Design category</label><select id="template-category" value={category} onChange={event => setCategory(event.target.value)}><option value="MINIMAL">Minimal</option><option value="PREMIUM">Premium</option><option value="BUSINESS">Business</option><option value="MODERN">Modern</option></select></div>
            <div className="template-code-tabs"><button type="button" className={mode === "HTML" ? "selected" : ""} onClick={() => setMode("HTML")}>HTML</button><button type="button" className={mode === "REACT" ? "selected" : ""} onClick={() => setMode("REACT")}>React</button></div>
            <div className="field"><label htmlFor="template-source">{mode === "HTML" ? "HTML card markup" : "React component source"}</label><textarea id="template-source" className="template-code-input" value={source} onChange={event => mode === "HTML" ? setHtmlSource(event.target.value) : setReactSource(event.target.value)} required maxLength={40000} spellCheck={false} /></div>
            <div className="field"><label htmlFor="template-css">Card CSS</label><textarea id="template-css" className="template-css-input" value={css} onChange={event => setCss(event.target.value)} maxLength={20000} spellCheck={false} /></div>
            <p className="template-editor-help">Use <code>{"{{brand}}"}</code>, <code>{"{{serial}}"}</code>, <code>{"{{qrCode}}"}</code>, and <code>{"{{publicUrl}}"}</code> placeholders. HTML is previewed in an isolated frame. React source is saved with the template and isn’t executed by the app.</p>
          </div>
          <aside className="template-editor-preview-wrap"><h3><Eye size={14} /> Live preview</h3>{mode === "HTML" ? <iframe className="template-editor-preview" title="HTML card template preview" sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={buildTemplatePreview(source, css, brand, primary, secondary, text)} /> : <div className="template-react-preview"><div className="bulk-preview-card" style={{ background: `linear-gradient(145deg,${primary},${secondary})`, color: text }}><span className="brand-mark">{brand || "Tapconnect"}</span><h3>Tap to connect</h3><span className="qr-placeholder">QR code added per card</span></div><p>React source saved with this template. It is kept as code and not run inside the dashboard.</p></div>}</aside>
        </div>
        {error && <p className="bulk-errors">{error}</p>}
        <footer className="template-editor-actions"><button className="button outline" type="button" onClick={onClose}>Cancel</button><button className="button primary" type="submit" disabled={saving||name.trim().length<2}>{saving ? <LoaderCircle size={14} className="spin" /> : <Plus size={14} />}{saving ? "Saving…" : "Save template"}</button></footer>
      </form>
    </div>
  );
}
