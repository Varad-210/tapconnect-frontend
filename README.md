# Tapconnect

Tapconnect is a Next.js storefront and QR/NFC management app with only two platform account roles: `ADMIN` and `RESELLER`. Shoppers and contact enquiries are stored as order/message records; there is no customer login role.

## Run locally

Requires Node.js 20.9+ and PostgreSQL 14+.

1. Copy `.env.example` to `.env` and configure `DATABASE_URL` (pooled runtime connection) and `DIRECT_URL` (direct migration connection), `SESSION_SECRET` (32+ characters), `APP_URL`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` (12+ characters).
2. Optionally set `NEXT_PUBLIC_NFC_SETUP_VIDEO_URL`, `NEXT_PUBLIC_QR_SETUP_VIDEO_URL`, and `NEXT_PUBLIC_WHATSAPP_NUMBER` for real support media/links.
3. Run `npm install`, `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
4. Start with `npm run dev`. The public store is `/`; dashboards are `/admin` and `/reseller`.

Admin-created products and pack prices appear on the shop. No sample prices or stock are fabricated. Add products at `/admin/products`. Orders and contact messages are at `/admin/orders` and `/admin/messages`.

## Implemented

- Public Tapconnect home, product collections, product details, How It Works, NFC setup, QR setup, FAQs, contact form, responsive navigation, and cart quantity.
- Product catalog records with pack variants, rupee prices stored as paise, publish/unpublish, stock, product editing, and admin order management.
- Guest checkout as cash-on-delivery. Orders reserve stock transactionally and do not create shopper accounts.
- ADMIN/RESELLER dashboards, server-side authorization, reseller asset scoping, reseller bulk-generation permission, asset blocking/reactivation, and admin PIN reset.
- Bulk NFC generation at `/admin/nfc/bulk-generate` and `/reseller/nfc/bulk-generate`, including saved designs, admin-created named HTML/React/CSS template sources, a black-and-gold Feedback Matters card-sheet template, palette customization, CSV import/row validation, unique public codes and serials, distinct four-digit PINs across a generation run, activation credentials, a unique QR image for each card, inventory records, one-time CSV credential export, and browser-printable card sheets (four cards per A4 page). Quantity up to 1,000 is processed as transactional groups of at most 100.
- Existing public profile, activation, dynamic redirect, PIN-gated profile editor, individual PNG/SVG QR downloads, and scan tracking.
- Mobile-first public profile card with a discreet four-tap logo shortcut to the existing PIN-gated editor; the visible “Manage profile” footer link is removed.
- PostgreSQL models for products, variants, orders, order items, generation batches, templates, inventory movements, contact messages, and existing QR/NFC records.

## Remaining setup or implementation

- No database URL or deployment credentials were supplied, so migrations, seeding, and deployment have not been run. The linked Mocha reference site was not reachable through the available page lookup; the marketing layout follows the written brief and the attached Tapconnect dashboard references.
- Online payment is not connected because no Razorpay configuration exists in this project. Checkout currently uses cash on delivery; add payment creation, webhook signature verification, and reconciliation before accepting online payments.
- NFC/QR guide videos show a clear unconfigured state until real video URLs are set. WhatsApp support requires a configured number.
- Product artwork can be managed by image URL; persistent image upload/storage is not configured.
- Admins can create named templates with HTML or React source and CSS. HTML source is previewed in a sandbox with scripts disabled; React source is stored but not executed. Editing existing templates, template version publishing UI, logo upload, and dedicated downloadable multi-card PDF/PNG export are not implemented; the print dialog can save the A4 sheet as PDF.
- CSV import currently supports `Business Name`, `Card Name`, and `Destination URL`; unsupported columns are rejected instead of ignored.
- Bulk chunks are transactional and the browser reports progress, but they are synchronous requests rather than background jobs. The per-process rate limits also need a shared store before horizontal scaling.
- Google OAuth, Razorpay, AI review suggestions, detailed scan charts/unique visitors, bulk QR generation, inventory transfer history screens, email notifications, and physical card print specifications still need provider/configuration or additional implementation.
- No automated tests or production build have been run in this workspace.
