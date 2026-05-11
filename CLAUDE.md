# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Next.js frontend
```bash
npm run dev      # development server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

### Firebase Cloud Functions (`functions/`)
```bash
cd functions
npm run build          # compile TypeScript
npm run serve          # build + start emulator (functions only)
npm run deploy         # deploy functions to Firebase
npm run email          # preview email templates with react-email dev server
```

## Architecture

This is a Next.js 15 (App Router) application for Fundação CSN, a Brazilian foundation that manages social investment projects. It uses Firebase as its primary backend, Vercel Blob for file storage, and Resend for transactional email.

### Project structure

- `src/app/(pages)/` — route groups for all pages
- `src/app/actions/` — Next.js Server Actions (form submissions, data mutations)
- `src/app/api/` — API routes: session auth, file upload, file downloads
- `src/components/` — client and server components organized by feature
- `src/context/` — React context providers (theme, PDF mode, page enable/disable)
- `src/firebase/` — Firebase client and Admin SDK initialization, Firestore schema
- `src/lib/` — auth helpers, Zod schemas, utility functions
- `functions/` — Firebase Cloud Functions (separate Node 22 package)

### Authentication and user roles

Three user types, distinguished by Firebase custom claims set on first login in `src/app/api/auth/session/route.ts`:

| Claim | Type | Access |
|---|---|---|
| `userIntAdmin: true` | Admin (domains: conpec.com.br, csn.com.br, fundacaocsn.org.br + `administrador: true` in `usuarioInt` collection) | All admin routes + project details |
| `userIntAdmin: false, userExt: false` | Internal non-admin | `/dashboard` |
| `userExt: true` | External (any other email domain) | `/inicio-externo`, `/detalhes-projeto` |

The middleware (`src/middleware.ts`) decodes the JWT directly (no Firestore call) and redirects based on these claims. The session is a Firebase session cookie (5-day expiry, `httpOnly`) created via `/api/auth/session`. Server-side auth uses `getCurrentUser()` from `src/lib/auth.ts` (Firebase Admin SDK).

### Firestore data model

Core collections:
- `projetos` — one document per project. `status`: `"pendente" | "aprovado" | "reprovado"`. `ativo`: boolean. `ultimoFormulario`: ID of the most recent form doc.
- `forms-cadastro` — registration form submissions; `projetoID` links back to `projetos`.
- `forms-acompanhamento` — follow-up form submissions; also `projetoID`-linked.
- `dadosEstados` — **pre-aggregated** indicators per Brazilian state (keyed by slug like `minas_gerais`). Kept in sync by the `alterarDadosEstados` Cloud Function whenever a `projetos` document is written.
- `usuarioInt` / `usuarioExt` — user records.
- `associacao` — links an external user (`usuarioID`) to their `projetosIDs[]`.
- `leis` — configurable list of incentive laws.
- `blob-uploads` — audit log of every file uploaded via Vercel Blob.

`src/firebase/schema/entities.ts` contains all TypeScript interfaces and the domain constant lists (`segmentoList`, `odsList`, `publicoList`, etc.).

### Aggregated statistics and deduplication

The admin home page (`src/app/page.tsx`) reads from `dadosEstados` (one doc per state) and manually de-duplicates projects that span multiple states before displaying totals. The deduplication logic in `buscarDadosGerais()` batches Firestore reads in groups of 10 (Firestore `in` limit).

The Cloud Function `alterarDadosEstados` (`functions/src/index.ts`) recalculates all indicators for every state affected by a project change.

### File upload flow

Files are uploaded client-side to Vercel Blob via the `@vercel/blob/client` `upload()` helper, which calls `/api/upload` for authorization. The returned Blob URL is then included in the FormData sent to a Server Action, which stores the URL in Firestore. Images served from `*.public.blob.vercel-storage.com` (configured in `next.config.ts`).

### Form submission pattern

Forms use `react-hook-form` + Zod (`src/lib/schemas.ts`). Files are uploaded to Vercel Blob first on the client, then the resulting URLs are included in FormData submitted to a Server Action. The Server Action re-validates with Zod before writing to Firestore.

### Cloud Functions

All functions are in `functions/src/index.ts`:
- `alterarDadosEstados` — Firestore trigger on `projetos/{id}` writes; recalculates `dadosEstados`.
- `emailsProjetoAprovado` — Trigger: when project `status` changes to `"aprovado"`, sends approval email and schedules 3/7/10-month follow-up notification timestamps.
- `verificarEmailsPendentes` — Scheduled daily at 08:00; sends follow-up emails when notification timestamps have passed.
- `desativarProjetosExpirados` — Scheduled daily at 06:00; sets `ativo: false` on projects whose `dataFinal` has passed.

Email templates live in `functions/src/emails/` and use `@react-email/components`.

### Context providers

Defined in `src/app/layout.tsx` wrapping all pages:
- `AppProvider` — `paginaDesabilitada` flag (persisted to `localStorage`); used to disable public-facing pages site-wide from the admin panel.
- `ThemeProvider` — light/dark theme.
- `PDFProvider` — `isPdfMode` boolean; components conditionally render a print-friendly layout when true.

### UI conventions

- Font: Roobert (FCSN brand font, local `.woff2` files in `src/assets/fonts/`). Tailwind weight classes map directly: `font-bold` → Roobert-Bold, etc.
- Pages use `md:mx-20` horizontal margin.
- Titles use `text-2xl`.
- UI primitives come from shadcn/ui (`src/components/ui/`) built on Radix UI.

## Environment variables

**Next.js (`.env.local`):**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL          # Firebase Admin SDK service account
FIREBASE_PRIVATE_KEY           # Firebase Admin SDK private key (newlines as \n)
BLOB_READ_WRITE_TOKEN          # Vercel Blob token
```

**Cloud Functions (`functions/.env`, see `functions/env.default`):**
```
RESEND_KEY      # Resend API key
EMAIL_FROM      # Sender address
PROJECT_URL     # Production URL (used in email links)
```
