# Vistar

Vistar helps businesses expand through reusable NFC and QR cards, review links, digital business profiles, and an admin managed inventory.

## Architecture

- Frontend: Next.js app deployed on Vercel at `https://vistarai.vercel.app`.
- Backend: API-only Next.js service deployed on Render from the `tapconnect-backend` repository.
- Database: Neon PostgreSQL. Runtime requests use the pooled URL; Prisma migrations use the direct URL.
- The Vercel frontend proxies `/api/*` to the Render API, keeping browser sessions on the Vistar domain.

## Local development

1. Set `BACKEND_URL=http://localhost:3001` in the frontend environment.
2. In the backend repository, set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `APP_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Start the backend on port 3001, then start the frontend with `npm run dev` on port 3000.

## Key routes

- Storefront: `/`
- Admin dashboard: `/admin`
- Admin products: `/admin/products`
- Admin NFC bulk generator: `/admin/nfc/bulk-generate`
- API health: `https://vistar-api.onrender.com/api/health`

The product catalog and all admin APIs are database-backed. Seeded design templates and admin credentials are managed by the backend's `prisma/seed.ts`.
