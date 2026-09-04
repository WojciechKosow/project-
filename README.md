This is a [Next.js](https://nextjs.org) app with a JWT-based auth system:
register, login, logout, a public landing page, and a protected dashboard —
backed by Postgres, bcrypt-hashed passwords, and JWT sessions in httpOnly
cookies.

## Getting Started

**👉 Read [`SETUP.md`](SETUP.md) first** — it walks through the database setup
(what to create, where your DB password goes), the environment variables, and a
full explanation of how the auth flow works.

Quick version:

```bash
# 1. Create the database and table (see SETUP.md for details)
psql -U postgres -c "CREATE DATABASE acme;"
psql -U postgres -d acme -f db/schema.sql

# 2. Configure credentials
cp .env.example .env.local   # then edit DATABASE_URL and JWT_SECRET

# 3. Install and run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

- `db/schema.sql` — the `users` table
- `lib/` — database pool, user queries, JWT, password hashing, session helpers
- `app/api/auth/{register,login,logout}/route.ts` — the auth API endpoints
- `proxy.ts` — optimistic route protection (Next.js 16's renamed middleware)
- `app/page.tsx`, `app/login`, `app/register`, `app/dashboard` — the pages

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- The bundled, version-accurate docs in `node_modules/next/dist/docs/`
