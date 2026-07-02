# Preproute — Test Management Application

A 5-page test management app for creating, editing, and publishing MCQ tests.
Built with React + TypeScript against the Preproute admin API.

**Live demo:** _add your Vercel URL here_

**Login:** `vedant-admin` / `vedant123`

---

## Features

- **Authentication** — JWT login, token persisted in `localStorage`, protected routes, auto-logout on 401.
- **Dashboard** — all tests in a responsive table (cards on mobile) with status badges, live search by name,
  and status filters (All / Draft / Live). View, Edit, and Delete (with confirmation) actions.
- **Create / Edit Test** — dependent dropdowns (Subject → Topics → Sub-topics), test type, difficulty,
  marking scheme, and structure. Save as draft or continue to questions. Full validation.
- **Add Questions** — MCQ form with 4 options and a correct-answer picker, a **rich-text editor** (bold, italic,
  underline, lists, links, and **inline images**), optional explanation / difficulty. **CSV bulk import** of
  questions (see `public/sample-questions.csv`). Questions collect in an editable list and are bulk-saved.
- **Preview & Publish** — full test overview with every question and the correct answer highlighted; publish
  flips the test to `live` and returns to the dashboard.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript (Vite) |
| Routing | React Router v6 |
| Server state | TanStack Query (React Query) |
| Auth state | React Context + `localStorage` |
| HTTP | Axios with interceptors |
| Forms & validation | React Hook Form + Zod |
| Rich text | TipTap (question editor: bold/italic/underline/lists/links) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Technical decisions

- **React Query + Context, not Redux.** Almost all state here is *server* state (tests, subjects, topics,
  questions). React Query handles caching, loading/error states, and cache invalidation after mutations with
  very little code. The only truly global client state is the auth session, which a small Context covers.
  Redux would have added boilerplate without a matching benefit for a 5-page app.

- **React Hook Form + Zod.** One Zod schema per form is the single source of truth for both validation and the
  inferred TypeScript type, so the form values and validation rules can never drift apart.

- **A thin API layer that unwraps the envelope.** The backend wraps every response as
  `{ status, message, data }`. A single `unwrap()` helper and typed functions in `src/api/*` mean components
  and hooks only ever deal with clean domain objects.

- **Name ↔ id mapping for the edit flow.** The API is asymmetric: it returns subject / topics / sub-topics as
  display **names** on reads, but expects **UUIDs** on writes. `src/lib/mappers.ts` maps names back to ids
  when an existing test is loaded for editing, so the dependent dropdowns repopulate correctly.

- **Relative `/api` + proxy to avoid CORS.** The staging backend does not send CORS headers, so direct browser
  calls are blocked. The app calls a relative `/api`, which is proxied to the backend by the Vite dev server
  locally (`vite.config.ts`) and by a rewrite in production (`vercel.json`). Every request is therefore
  same-origin.

- **The wizard carries state in the URL.** Steps are keyed by the test id in the route
  (`/tests/:id/questions`, `/tests/:id/preview`). The draft is created on step 1, and later steps read it back
  from the API — no separate global wizard store to keep in sync.

## Getting started

```bash
npm install
cp .env.example .env   # defaults to the staging API via proxy
npm run dev            # http://localhost:5173
```

Other scripts:

```bash
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Project structure

```
src/
  api/          axios client + typed endpoint functions (auth, tests, questions, taxonomy)
  components/
    ui/         Button, Input, Select, MultiSelect, Modal, Badge, Spinner, Toast
    layout/     AppShell, ProtectedRoute
  context/      AuthContext
  hooks/        React Query hooks + query keys
  lib/          validation (Zod), mappers, constants, storage, formatting helpers
  pages/        Login, Dashboard, TestForm (create/edit), Questions, Preview
  types/        shared domain + API types
```

## API

Base URL is configured via `VITE_API_BASE_URL` (default `/api`, proxied to the staging server).
Endpoints used: `auth/login`, `subjects`, `topics/subject/:id`, `sub-topics/multi-topics`, `tests` (CRUD),
`questions/bulk`, and `questions/fetchBulk`.

## Deployment (Vercel)

The repo includes `vercel.json`, which (1) rewrites `/api/*` to the backend to avoid CORS and (2) serves
`index.html` for client-side routes. Import the repo in Vercel and deploy — no extra configuration is required.
