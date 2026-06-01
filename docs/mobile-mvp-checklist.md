# Mobile MVP Smoke Checklist

Use this checklist to manually verify the MVP requirements for the Watchloom mobile app before triggering a build.

## Authentication & Onboarding
- [ ] App starts successfully (shows splash screen)
- [ ] Login works with valid credentials
- [ ] Register works to create a new account
- [ ] User profile loads
- [ ] Logout works correctly

## Core Catalog
- [ ] Movies tab loads the catalog via API
- [ ] Series tab loads the catalog via API
- [ ] Movie details load (metadata, poster, overview)
- [ ] Series details load
- [ ] Seasons and episodes properly load for series

## Engagement Features
- [ ] My Watchlists area loads user list
- [ ] Create a new watchlist is functional
- [ ] Can add a movie/series to a watchlist
- [ ] Can update item status (e.g. Planned, Watching, Watched)
- [ ] Planned notification scheduling works correctly (push notification)
- [ ] Adding/removing items from Favourites works
- [ ] App loads and displays user reviews (if applicable)

## Environment
- [ ] `EXPO_PUBLIC_API_BASE_URL` works with physical device (LAN IP) or emulator without hardcoding inside source
- [ ] No local/debug APIs are committed implicitly
