# Movie & Series Catalog App

A multi-platform full-stack application for browsing movies and TV series, managing personal watchlists, writing reviews and organizing favourite titles.

This project is developed as a capstone project for a full-stack AI-assisted development course.

## Project Idea

The app provides a public catalog of movies and TV series. Anonymous users can browse titles, search by title, genre, director, actor or creator and open detailed pages.

Registered users can create personal watchlists, add movies or series, set watch status, rate titles, write reviews and mark favourites.

Editors can manage catalog content. Admins can manage users, roles and the full catalog.

The mobile app focuses on regular user features such as browsing, watchlists, favourites and planned watch notifications.

## Tech Stack

### Web and Backend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Server Actions
- REST API routes
- Drizzle ORM
- Neon PostgreSQL
- JWT authentication
- bcrypt or argon2 password hashing

### Mobile

- React Native
- Expo
- Expo Router
- REST API client
- Expo Notifications

### Tooling

- Node.js monorepo
- pnpm workspaces
- Drizzle Kit migrations
- Jest
- Playwright
- GitHub Actions

## Main Features

### Anonymous Users

- Home page
- Movies catalog
- Series catalog
- Search
- Pagination
- Movie details page
- Series details page
- Seasons and episodes list
- About page
- Contact page

### Registered Users

- Register, login and logout
- Dashboard
- Create and manage watchlists
- Add or remove movies and series from watchlists
- Set status: watched, watching or to watch
- Select planned watch date and time
- Rate titles
- Write reviews
- Add favourites

### Editors

- Create, update and delete movies
- Create, update and delete series
- Manage seasons and episodes
- Upload or manage posters when storage is enabled

### Admins

- Full catalog management
- User management
- Role management
- Review or process contact messages
- Grant editor role

## Database Overview

Planned core tables:

- users
- movies
- series
- seasons
- episodes
- genres
- people
- movie_genres
- series_genres
- movie_people
- series_people
- watchlists
- watchlist_items
- reviews
- favourites
- contact_messages
- media_assets

The schema will be managed through Drizzle ORM and Drizzle Kit migrations. Migration SQL files must be committed to the repository.

## Development Rules

- Use TypeScript everywhere.
- Keep business logic in services.
- Use Server Actions for the web app.
- Use REST API routes for the mobile app.
- Use Drizzle migrations for all schema changes.
- Never store plain-text passwords.
- Add authorization checks for protected actions and API endpoints.
- Keep UI components small and reusable.
- Commit each stable step.

## Local Development

Setup instructions will be expanded as the project grows.

Expected workflow:

```bash
pnpm install
pnpm dev
```

Environment variables will be documented in `.env.example`.

## Testing

Planned testing setup:

- Unit tests with Jest
- Integration tests for services and API routes
- End-to-end tests with Playwright
- GitHub Actions workflow to run checks on push

## Deployment

Planned deployment:

- Web/backend app deployed on a serverless platform such as Netlify or Vercel
- PostgreSQL database hosted on Neon
- Optional file storage with Cloudflare R2
- Optional Android APK build with Expo/EAS and GitHub Releases


