# Auth starter — setup & how it works

A register / login system for Next.js with:

- **Postgres** for storing users
- **bcrypt**-hashed passwords (never stored in plaintext)
- **JWT** session tokens (signed with `jose`), kept in an **httpOnly cookie**
- a public **landing page**, `/login`, `/register`, and a protected **`/dashboard`**

It's written to be understood. If you know Spring Boot + JWT, the mental model
carries over almost 1:1 — the notes below point out where Next.js differs.

---

## 1. What you have to do with the database

You said you'll run Postgres on your PC. Here's the whole checklist.

### Step 1 — Make sure Postgres is running

Install it if you haven't (`postgresql.org/download`, or Postgres.app on macOS,
or `brew install postgresql`, or the official installer on Windows). Confirm the
`psql` command works:

```bash
psql --version
```

### Step 2 — Create a database

The app stores everything in one database. Create one (I'll call it `acme` —
use any name, just keep it consistent in Step 4):

```bash
# Connect as the default postgres superuser, then create the DB:
psql -U postgres -c "CREATE DATABASE acme;"
```

> On a fresh install the admin user is usually **`postgres`**. It may have a
> password you set during install (Windows installer asks for one), or none on
> a local macOS/Linux setup. Whatever it is, you'll need it in Step 4.

If you prefer a GUI, do the same thing in **pgAdmin**: right-click *Databases →
Create → Database*, name it `acme`.

### Step 3 — Create the `users` table

The exact table definition lives in [`db/schema.sql`](db/schema.sql). Run it
against the database you just made:

```bash
psql -U postgres -d acme -f db/schema.sql
```

That's it — this creates the `users` table (id, email, name, password_hash,
created_at). Running it again later is safe; it won't wipe anything.

### Step 4 — Tell the app how to connect (this is where your password goes)

Copy the example env file:

```bash
cp .env.example .env.local
```

Open **`.env.local`** and fill in two values:

```bash
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/acme
JWT_SECRET=paste_a_long_random_string_here
```

**Where your "password and names" go** — it's all inside `DATABASE_URL`:

```
postgresql://  postgres  :  YOUR_DB_PASSWORD  @ localhost : 5432 /  acme
               ^user        ^password           ^host      ^port   ^database name
```

- **user** — your Postgres username (usually `postgres`)
- **password** — that user's password (leave empty if your local Postgres has
  none: `postgresql://postgres@localhost:5432/acme`)
- **host** — `localhost` (it's on your PC)
- **port** — `5432` (Postgres default)
- **database name** — must match what you created in Step 2 (`acme`)

For `JWT_SECRET`, generate a real random value:

```bash
openssl rand -base64 32
```

> **Why `.env.local`?** Next.js loads it automatically, and it's git-ignored
> (see `.gitignore` → `.env*`), so your DB password and JWT secret never get
> committed. **`.env.example` is the safe, checked-in template** — it holds no
> real secrets. This is *the* place credentials belong; never hard-code them in
> source files.

### Step 5 — Run it

```bash
npm install       # if you haven't already
npm run dev
```

Open <http://localhost:3000>, click **Get started**, register, and you'll land
on the dashboard.

**To check it worked in the DB:**

```bash
psql -U postgres -d acme -c "SELECT id, email, name, created_at FROM users;"
```

You'll see your account — and note the `password_hash` column holds a bcrypt
hash like `$2b$12$...`, never your actual password.

---

## 2. How it all works

### The big picture (one request)

```
Browser ──POST /api/auth/login──▶ Route Handler
                                    ├─ look up user in Postgres
                                    ├─ bcrypt.compare(password, hash)
                                    ├─ sign a JWT  { sub: userId, email, name }
                                    └─ Set-Cookie: token=<jwt>  (httpOnly)
Browser ◀───────────────────────────┘  cookie now stored by the browser

Browser ──GET /dashboard──────────▶ proxy.ts (fast check: is the JWT valid?)
                                    └─ page.tsx: getCurrentUser()
                                         ├─ read token cookie
                                         ├─ verify JWT signature
                                         └─ re-load user from Postgres → render
```

### The pieces, and their Spring Boot analogues

| File | What it does | Spring Boot analogue |
|------|--------------|----------------------|
| `db/schema.sql` | The `users` table definition | your Flyway/Liquibase migration |
| `lib/db.ts` | Postgres connection **pool** + a `query()` helper | `DataSource` / HikariCP + `JdbcTemplate` |
| `lib/users.ts` | All SQL that touches `users` | a `UserRepository` |
| `lib/jwt.ts` | Sign / verify the JWT (HS256) | your `JwtService` |
| `lib/auth.ts` | Password hashing + read/write the session cookie | `PasswordEncoder` + session handling |
| `lib/validation.ts` | Input checks | Bean Validation (`@Valid`) |
| `app/api/auth/*/route.ts` | The register / login / logout **endpoints** | `@RestController` methods |
| `proxy.ts` | Runs before every page; fast redirect | a `OncePerRequestFilter` |
| `app/dashboard/page.tsx` | Protected page, re-checks auth on the server | a `@PreAuthorize` controller |

### Key ideas worth internalizing

**1. Passwords are hashed with bcrypt, one-way.**
On register we call `bcrypt.hash(password, 12)` and store only the result. On
login we call `bcrypt.compare(entered, storedHash)`. The plaintext is never
saved and can't be recovered — same as Spring's `BCryptPasswordEncoder`. The
`12` is the cost factor (higher = slower = harder to brute-force).

**2. The session is a stateless JWT — but delivered by a cookie.**
The token carries `sub` (user id), `email`, `name`, and an expiry, signed with
`JWT_SECRET`. Because it's signed, nobody can tamper with the claims. This is
exactly your Spring Boot JWT.

The one Next.js-flavored choice: instead of the browser storing the token in
JS and sending an `Authorization: Bearer` header, we put it in an **httpOnly
cookie**. httpOnly means client-side JavaScript can't read it, which defends
against XSS token theft, and the browser attaches it automatically. (For a
mobile/native client you'd switch back to the Bearer header — the token itself
is identical.) The cookie is also `sameSite: lax` (CSRF defense) and `secure`
in production (HTTPS only).

**3. There are two auth checks, on purpose.**
- **Optimistic** (`proxy.ts`): runs on every navigation, only verifies the JWT
  signature from the cookie — *no database call*, so it stays fast. It's a UX
  convenience (redirect guests away from `/dashboard`, redirect logged-in users
  away from `/login`).
- **Authoritative** (`getCurrentUser()` in `lib/auth.ts`, called by the page):
  verifies the JWT **and** re-loads the user from Postgres. This is the real
  security boundary — it catches deleted users and runs on the server before
  any protected HTML is sent.

  Never trust the proxy alone; the official Next.js guidance is to do the real
  check close to the data. That's why `dashboard/page.tsx` calls
  `getCurrentUser()` itself and `redirect('/login')` if it's null.

**4. Server Components vs Client Components.**
- `app/page.tsx` and `app/dashboard/page.tsx` are **Server Components** — they
  run only on the server, so they can read the cookie and hit the DB directly
  (no API call needed to know who you are).
- `components/auth-form.tsx` and `logout-button.tsx` are **Client Components**
  (`"use client"`) — they need browser state and event handlers, so they talk
  to the server through the `/api/auth/*` endpoints.

**5. SQL injection is handled by parameterised queries.**
Every query passes values as `$1, $2` placeholders (see `lib/users.ts`), never
by string-concatenation — the same reason you use `?` placeholders in JDBC.

### What "the token cookie" looks like end to end

1. `POST /api/auth/login` verifies the password, then `createSession(user)`
   signs a JWT and calls `cookieStore.set("token", jwt, { httpOnly, ... })`.
2. The browser stores that cookie and sends it on every future request.
3. `getCurrentUser()` reads `cookieStore.get("token")`, verifies it, loads the
   user. Logout deletes the cookie.

---

## 3. Where to go next (to make it "real SaaS")

This is a solid, secure core. Things a production app typically adds on top:

- **Refresh tokens** — a short-lived access token + a long-lived refresh token,
  so you're not forcing a full re-login every 7 days.
- **Rate limiting** on `/api/auth/login` to slow brute-force attempts.
- **A migration tool** (Prisma, Drizzle, or Flyway-style SQL migrations) instead
  of running `schema.sql` by hand, once you have more than one table.
- **Roles / permissions** — add a `role` column and check it in `getCurrentUser`
  consumers (the JWT can carry the role for optimistic checks).
- **Email verification & password reset** — deliberately left out per your ask;
  both require actually sending email.

Everything above plugs into the structure that's already here.
