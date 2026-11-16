export const FEEDBACK_SHEET_TEMPLATE = {
  name: "Feedback Matters · NFC + QR Sheet",
  category: "BUSINESS",
  description: "Black and gold review card with NFC tap and unique QR code.",
  primary: "#0E1013",
  secondary: "#D6B542",
  text: "#FFFFFF",
  brand: "GetTappy",
  html: `<article class="review-card">
  <header class="review-top">
    <div class="brand-g">G</div>
    <div class="nfc-mark">◉<small>NFC</small></div>
    <div class="stars">★★★★★</div>
    <div class="feedback">YOUR FEEDBACK MATTERS</div>
  </header>
  <div class="gold-band"></div>
  <section class="actions">
    <div class="tap-action"><span class="phone">▯</span><b>TAP YOUR PHONE</b><small>NFC READY</small></div>
    <span class="or">OR</span>
    <div class="qr-action"><img src="{{qrCode}}" alt="Scan this unique QR code"/><b>SCAN QR CODE</b></div>
  </section>
  <footer class="serial">SN: {{serial}}<span>{{brand}}</span></footer>
</article>`,
  css: `.review-card{width:200px;height:200px;overflow:hidden;border:1px solid #e3e6ea;border-radius:18px;background:#fff;color:#101827;font-family:Arial,sans-serif;display:flex;flex-direction:column}.review-top{height:42%;position:relative;display:flex;align-items:center;flex-direction:column;padding:10px 8px 7px;background:{{primary}};color:{{text}}}.brand-g{font-size:32px;font-weight:900;line-height:1;background:conic-gradient(#4285f4 0 25%,#34a853 25% 50%,#fbbc05 50% 75%,#ea4335 75%);color:transparent;background-clip:text;-webkit-background-clip:text}.nfc-mark{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;align-items:center;font-size:15px}.nfc-mark small{font-size:7px;font-weight:bold}.stars{margin-top:4px;color:#ffd21c;font-size:16px;letter-spacing:2px}.feedback{margin-top:4px;font-size:7px;font-weight:800;letter-spacing:2px}.gold-band{height:5%;background:{{secondary}}}.actions{flex:1;display:grid;grid-template-columns:1fr 22px 1fr;align-items:center;justify-items:center;padding:8px 9px 4px}.tap-action,.qr-action{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center}.phone{width:38px;height:38px;border:2px solid #15243a;border-radius:50%;display:grid;place-items:center;font-size:23px}.tap-action b,.qr-action b{font-size:6px}.tap-action small{font-size:6px;color:#63738b}.or{width:19px;height:19px;border-radius:50%;display:grid;place-items:center;background:#111827;color:#fff;font-size:6px;font-weight:bold}.qr-action img{width:42px;height:42px;object-fit:contain;padding:2px;border:1px solid #15243a;border-radius:7px}.serial{height:10%;padding:0 9px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf0f4;color:#8794a7;font-size:6px}`,
} as const;
