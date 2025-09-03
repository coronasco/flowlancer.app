# API Contracts (Envelope)

All responses: `{ ok: true, data }` or `{ ok: false, error: { code, message } }`.

## Projects
- GET `/api/projects` → `{ projects: { id, name }[] }`
- POST `/api/projects` → `{ project }` body: `{ name }`
- GET `/api/projects/[id]` → `{ project | null }`
- PATCH `/api/projects/[id]` → `{ project }` body: `{ name }`
- DELETE `/api/projects/[id]` → `{ deleted: true }`

## Tasks
- GET `/api/projects/[id]/tasks` → `{ tasks }`
- POST `/api/projects/[id]/tasks` → `{ task }` body: `{ title, status }`
- PATCH `/api/projects/[id]/tasks/status` → `{ task }` body: `{ taskId, status }`
- PATCH `/api/projects/[id]/tasks/title` → `{ task }` body: `{ taskId, title }`
- DELETE `/api/projects/[id]/tasks/title` → `{ deleted: true }` body: `{ taskId }`

## Invoices
- POST `/api/invoices/from-project` → `{ invoice }` body: `{ projectId }`

## Feed
- POST `/api/feed/posts` → `{ post }` body: `{ text }`

## Stripe
- POST `/api/stripe/webhook` → `{ received: true }` (placeholder)
