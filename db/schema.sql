-- ---------------------------------------------------------------------------
-- Database schema for the auth system.
--
-- Run this ONCE against your local Postgres database to create the tables.
-- See SETUP.md for the exact commands. Re-running it is safe: every statement
-- uses "IF NOT EXISTS", so it will not error or wipe existing data.
-- ---------------------------------------------------------------------------

-- pgcrypto gives us gen_random_uuid(), so the database generates user ids for
-- us instead of the app. (On Postgres 13+ this is built in, but enabling the
-- extension keeps it working on older versions too.)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- We store the email lowercased (the app does this) so uniqueness is
    -- case-insensitive: "Bob@x.com" and "bob@x.com" are the same account.
    email         TEXT         NOT NULL UNIQUE,

    name          TEXT         NOT NULL,

    -- NEVER the plaintext password. This holds the bcrypt hash, e.g.
    -- "$2b$12$....". Even with full DB access you cannot read the password.
    password_hash TEXT         NOT NULL,

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- The UNIQUE constraint above already creates an index on email, which is the
-- column we look up on every login. Nothing else is needed for this app.
