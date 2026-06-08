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

## Android APK Preview Build

The `preview` EAS profile builds an internal Android APK and injects the production backend API URL:

```text
EXPO_PUBLIC_API_BASE_URL=https://watchloom.netlify.app
```

The mobile API client reads this value from `process.env.EXPO_PUBLIC_API_BASE_URL`. Do not hardcode
localhost, LAN IPs, or a separate mobile hosting URL in source code.

Before building, run:

```bash
npm run typecheck
npx expo-doctor
```

Install and authenticate EAS CLI if needed:

```bash
npm install -g eas-cli
eas login
eas init
```

Build the APK:

```bash
eas build --platform android --profile preview
```

When EAS asks for Android credentials, use Expo-managed credentials and allow Expo to generate or
manage the Android keystore for this preview build.

After the build completes, download the APK from the Expo build page and rename it:

```text
watchloom-mobile-v1.0.0.apk
```

Do not commit the APK to the source tree unless explicitly requested.

## GitHub Release

Create a release through GitHub:

1. Open `Releases`.
2. Select `Draft a new release`.
3. Use tag `mobile-v1.0.0`.
4. Use title `Watchloom Mobile MVP v1.0.0`.
5. Attach `watchloom-mobile-v1.0.0.apk`.

Suggested release notes:

```markdown
## Watchloom Mobile MVP v1.0.0

- Android APK preview build.
- Uses production API: https://watchloom.netlify.app
- Includes authentication, profile/logout, movies and series catalogs, details pages, seasons and episodes, watchlists, planned watching, favourites, reviews, and local notifications.
```

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
