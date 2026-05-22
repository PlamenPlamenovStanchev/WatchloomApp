# AGENTS.md — Web App

## App Scope

This folder contains the Next.js web application. It includes:

- Public web UI
- Backend REST API for the mobile app
- Server Actions for the web app
- Authentication and authorization
- User dashboard
- Admin and editor panels

## Technologies

- Next.js App Router
- React Server Components
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL / Neon
- JWT authentication
- bcrypt or argon2
- Zod validation

## Architecture Guidelines

- Use Server Components by default.
- Use Client Components only when browser interactivity is required.
- Keep database access inside services and repository-style helpers.
- Server Actions should call services, not contain heavy business logic.
- REST API route handlers should validate input, call services and return consistent JSON responses.
- Use shared types and validators from `/watchloom-shared` when possible.
- Keep admin/editor logic separate from regular user logic.
- Protect private pages with middleware or server-side authorization checks.
- Do not expose secrets, tokens or database credentials to the client.

## UI Guidelines

- Keep pages responsive for desktop and mobile browsers.
- Use reusable UI components for cards, forms, filters, pagination and layout.
- Prefer clean, accessible forms with clear validation messages.
- Avoid oversized components; split complex screens into smaller sections.
- Use loading, empty and error states for data-driven pages.

## Database Guidelines
- Neon MCP database access rules: Connect Neon MCP only to a database project named `WatchloomDB` in my Neon account
- Use Drizzle schema definitions and Drizzle Kit migrations.
- Commit generated migration SQL files.
- Add indexes for slugs, search fields, foreign keys and pagination-heavy queries.
- Avoid N+1 queries in catalog, watchlist, review and admin screens.
