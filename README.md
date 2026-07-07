# PetAPI Cloud

A Next.js landing page for PetAPI Cloud, a developer-focused cat and dog API platform with SaaS dashboards and an AI support assistant.

## What Is Included

- Modern responsive SaaS landing page
- Hero API response preview and pet image samples
- Social proof, features, developer experience, pricing, FAQ, and final CTA sections
- User dashboard and admin dashboard previews
- Clerk authentication with protected user and admin routes
- Supabase PostgreSQL schema for users, subscriptions, API keys, usage, docs, chats, and feedback
- Drizzle schema and migration with Supabase pgvector support
- Super-admin invite flow for admin users
- RAG file uploads backed by private Supabase Storage
- Floating AI support chat widget backed by `/api/chat`
- RAG retrieval over Supabase document chunks with an OpenAI-compatible provider
- Versioned pet API demo endpoints under `/api/v1`

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- Clerk
- Supabase
- Drizzle ORM and Drizzle Kit
- pgvector
- OpenNext for Cloudflare deployment
- pnpm for package scripts

## Configure

Copy `.env.example` into your local environment and fill in:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` for Drizzle migrations
- `SUPER_ADMIN_EMAILS` for owners who can invite admins and manage all uploads
- `ADMIN_EMAILS` for admin access without invite privileges
- `OPENAI_COMPATIBLE_*` values for embeddings and chat completions
- `RAG_UPLOADS_BUCKET` if you want a bucket name other than `rag-uploads`

For `DATABASE_URL`, use the Supabase database connection string from Project Settings > Database. Make sure the password is the current database password and URL-encoded if it contains special characters. For migrations, prefer the direct connection string when your network allows it; otherwise use the session pooler connection string rather than a transaction pooler connection.

Run the database migration:

```bash
pnpm db:migrate
```

If Drizzle exits at `applying migrations...` without printing the Postgres error, test the connection directly with:

```bash
pnpm db:check
```

After adding knowledge base documents or RAG upload files from `/admin`, the app creates chunks immediately. Use the admin re-index action when you need to regenerate all chunks and embeddings.

Admin role split:

- `super_admin`: can invite admins, manage all uploaded RAG files, and access every admin tool.
- `admin`: can add documents, upload RAG files, delete their own uploads, and re-index the knowledge base.
- `user`: can access the user dashboard and API keys only.

## Develop

Run the local development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
pnpm lint
pnpm build
```

## Backend Routes

- `POST /api/chat` answers support questions with RAG and stores chat history when Supabase is configured.
- `POST /api/dashboard/api-keys` creates hashed API keys for the signed-in user.
- `GET|POST /api/admin/documents` lists and uploads knowledge base documents.
- `GET|POST /api/admin/uploads` lists and uploads RAG files.
- `DELETE /api/admin/uploads/:id` deletes an uploaded file and its linked RAG document.
- `GET|POST /api/admin/invitations` lists and creates admin invitations. Requires `super_admin`.
- `POST /api/admin/rag/reindex` regenerates RAG chunks and embeddings.
- `GET /api/v1/images/random`, `/api/v1/breeds`, `/api/v1/facts/random`, and `/api/v1/search` serve pet API responses and log usage.

## Deploy

Build and deploy through OpenNext for Cloudflare:

```bash
pnpm deploy
```
