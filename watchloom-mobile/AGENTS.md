# AGENTS.md — Mobile App

## App Scope

This folder contains the Expo React Native mobile application.

The mobile app is a focused client for regular users. It should support:

- Authentication
- Browsing movies and series
- Viewing details
- Managing watchlists
- Managing favourites
- Setting planned watch time
- Local notifications for planned watch items

Admin and editor functionality should stay in the web app.

## Technologies

- React Native
- Expo
- Expo Router
- TypeScript
- REST API communication with the Next.js backend
- Secure token storage
- Expo Notifications

## Architecture Guidelines

- Communicate with the backend only through REST API endpoints.
- Store auth tokens securely, not in plain AsyncStorage when avoidable.
- Keep API calls in a dedicated client/service layer.
- Reuse shared types and validators from `/watchloom-shared` where possible.
- Keep screens small and split complex UI into reusable components.
- Handle loading, empty, offline and error states clearly.
- Do not duplicate backend business rules in the mobile app.
- Keep mobile scope limited to regular user features.

## UI Guidelines

- Design for both phones and tablets.
- Use clear navigation and readable layouts.
- Keep watchlist actions simple and fast.
- Use native-feeling date/time selection for planned watch items.
- Use local notifications only after the user grants permission.
