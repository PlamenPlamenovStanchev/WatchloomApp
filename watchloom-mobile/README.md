# Watchloom Mobile

Expo React Native client for Watchloom regular-user features. Admin, editor, and catalog CRUD
workflows belong in the web application.

## Development

Install dependencies from the monorepo root, then start the Expo development server:

```bash
npm install
npm run dev:mobile
```

Configure the API base URL with `EXPO_PUBLIC_API_BASE_URL`. For local development, point it to the
reachable URL for the Next.js backend, such as `http://localhost:3000` when running in a browser.

## Structure

```text
app/                Expo Router screens and layouts
src/components/ui/  Reusable UI primitives
src/config/         Environment configuration
src/constants/      Route names and theme tokens
src/hooks/          Reusable React hooks
src/lib/            Low-level client helpers
src/providers/      App-level React providers
src/services/       Feature-oriented REST API services
src/types/          Mobile API and domain types
```

Backend communication should stay in `src/lib` and `src/services`. Reuse types and validators from
`watchloom-shared` where practical.
