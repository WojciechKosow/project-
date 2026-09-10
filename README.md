# Mini Blog

Prosty, ale profesjonalny system logowania i publikowania postów zbudowany na
**Next.js (App Router)**, **PostgreSQL** i **JWT** (sesja w cookie httpOnly).

## Funkcje

- Rejestracja i logowanie (hasła hashowane przez `bcryptjs`).
- Sesja oparta na podpisanym tokenie JWT (`jose`) trzymanym w bezpiecznym,
  `httpOnly` cookie.
- Publikowanie własnych postów przez zalogowanych użytkowników (Server Actions).
- Publiczny feed najnowszych postów oraz panel z własnymi postami.

## Stos i architektura

| Warstwa            | Rozwiązanie                                              |
| ------------------ | ------------------------------------------------------- |
| Baza danych        | PostgreSQL (`pg`, surowe zapytania SQL)                 |
| Sesja / auth       | JWT (`jose`) + cookie `httpOnly`                        |
| Hasła              | `bcryptjs`                                               |
| Logika serwerowa   | Server Actions + Data Access Layer (`app/lib/dal.ts`)   |

Kluczowe pliki:

- `app/lib/db.ts` – pula połączeń Postgres.
- `app/lib/session.ts` – szyfrowanie/odszyfrowanie i zarządzanie sesją.
- `app/lib/dal.ts` – weryfikacja sesji (`verifySession`, `getCurrentUser`).
- `app/actions/auth.ts` – rejestracja, logowanie, wylogowanie.
- `app/actions/posts.ts` – dodawanie postów.
- `db/schema.sql` – schemat bazy.

## Uruchomienie

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Skonfiguruj środowisko – skopiuj `.env.example` do `.env.local` i uzupełnij:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` – połączenie do Postgresa.
   - `SESSION_SECRET` – długi losowy sekret (np. `openssl rand -base64 32`).

3. Utwórz schemat bazy danych:

   ```bash
   npm run db:init
   ```

4. Uruchom serwer deweloperski:

   ```bash
   npm run dev
   ```

Aplikacja będzie dostępna pod `http://localhost:3000`.

## Bezpieczeństwo

- Autoryzacja jest sprawdzana wewnątrz każdej Server Action (nie tylko w UI).
- Cookie sesji jest `httpOnly`, `sameSite=lax` oraz `secure` w produkcji.
- W tokenie JWT trzymane jest tylko `userId` – bez danych wrażliwych.
