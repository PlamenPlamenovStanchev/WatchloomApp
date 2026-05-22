# AGENTS.md

## Project Context

This repository contains a multi-platform full-stack movie and TV series catalog application.

The project is built as a Node.js monorepo with:

- `/watchloom-web` — Next.js web app, backend API, server actions, admin/editor panels
- `/watchloom-mobile` — Expo React Native mobile app
- `/watchloom-shared` — shared TypeScript types, validators, constants and helpers

The application supports anonymous catalog browsing, authenticated user watchlists, reviews, favourites, editor-managed catalog content and admin user management.

## Main Technologies

- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- PostgreSQL with Neon
- Drizzle ORM and Drizzle Kit migrations
- React Native with Expo
- JWT authentication
- bcrypt or argon2 password hashing
- Jest, Playwright and GitHub Actions

## Development Guidelines

- Keep the monorepo structure clean and modular.
- Put shared reusable logic in `/watchloom-shared`.
- Keep business logic in service files, not directly inside UI components or route handlers.
- Use Drizzle migrations for every database schema change.
- Never store plain-text passwords.
- Enforce authorization checks in API routes, server actions and protected pages.
- Prefer small, focused components over large files.
- Keep commits small, meaningful and frequent.
- Update documentation when architecture, setup or major features change.
