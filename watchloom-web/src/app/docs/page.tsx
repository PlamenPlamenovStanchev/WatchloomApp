import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";

type ApiEndpoint = {
  method: string;
  path: string;
  auth: "Public" | "Logged in" | "Cookie or bearer token" | "OAuth redirect";
  purpose: string;
  input?: string;
  response: string;
};

type ApiSection = {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
};

const apiSections: ApiSection[] = [
  {
    title: "Authentication",
    description: "Account creation, login sessions, password reset, and Google sign-in.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        auth: "Public",
        purpose: "Create a new user account.",
        input: "JSON body validated by the register schema: username, email, password, and related registration fields.",
        response: "201 with { success: true, data: { user } } or 400 validation errors.",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        auth: "Public",
        purpose: "Authenticate a user and set the auth cookie.",
        input: "JSON body validated by the login schema: email/username credentials and password.",
        response: "200 with auth data and a secure auth cookie, or an auth/validation error.",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        auth: "Public",
        purpose: "Clear the auth cookie for the current browser session.",
        response: "200 with { loggedOut: true }.",
      },
      {
        method: "GET",
        path: "/api/auth/me",
        auth: "Cookie or bearer token",
        purpose: "Return the currently authenticated active user.",
        input: "Auth cookie or Authorization: Bearer token.",
        response: "200 with { user } or 401 Unauthorized.",
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        auth: "Public",
        purpose: "Request a password reset email when the account exists.",
        input: "JSON body validated by the forgot-password schema: email.",
        response: "200 message response. The response avoids revealing whether an email exists.",
      },
      {
        method: "POST",
        path: "/api/auth/reset-password",
        auth: "Public",
        purpose: "Reset a password using a valid password reset token.",
        input: "JSON body validated by the reset-password schema: token and new password.",
        response: "200 message response or 400 for invalid/expired reset token.",
      },
      {
        method: "GET",
        path: "/api/auth/google",
        auth: "OAuth redirect",
        purpose: "Start Google OAuth sign-in and store a short-lived state cookie.",
        response: "Redirects to Google OAuth, or returns 500 if Google client configuration is missing.",
      },
      {
        method: "GET",
        path: "/api/auth/google/callback",
        auth: "OAuth redirect",
        purpose: "Handle Google OAuth callback, create/sign in the SSO user, and set the auth cookie.",
        input: "Google callback query params: code and state.",
        response: "Redirects to /dashboard on success or /login?error=google_auth_failed on failure.",
      },
    ],
  },
  {
    title: "Public Catalog",
    description: "Read-only routes for browsing catalog data.",
    endpoints: [
      {
        method: "GET",
        path: "/api/movies",
        auth: "Public",
        purpose: "List movies with pagination, search, and genre filtering.",
        input: "Query params: page, pageSize, q, genre.",
        response: "Movie list with pagination metadata and genre data.",
      },
      {
        method: "GET",
        path: "/api/movies/[slug]",
        auth: "Public",
        purpose: "Fetch one movie by slug.",
        response: "Movie details or 404 Movie not found.",
      },
      {
        method: "GET",
        path: "/api/series",
        auth: "Public",
        purpose: "List series with pagination, search, and genre filtering.",
        input: "Query params: page, pageSize, q, genre.",
        response: "Series list with pagination metadata and genre data.",
      },
      {
        method: "GET",
        path: "/api/series/[slug]",
        auth: "Public",
        purpose: "Fetch one series by slug.",
        response: "Series details or 404 Series not found.",
      },
      {
        method: "GET",
        path: "/api/series/[slug]/seasons",
        auth: "Public",
        purpose: "Fetch seasons for a series.",
        response: "Series summary and season items, or 404 Series not found.",
      },
      {
        method: "GET",
        path: "/api/seasons/[seasonId]/episodes",
        auth: "Public",
        purpose: "Fetch episodes for one season.",
        response: "Season id and episode items, or 404 Season not found.",
      },
      {
        method: "GET",
        path: "/api/genres",
        auth: "Public",
        purpose: "List catalog genres.",
        response: "Genre items.",
      },
    ],
  },
  {
    title: "Watchlists",
    description: "Authenticated routes for the current user's watchlists and watchlist items.",
    endpoints: [
      {
        method: "GET",
        path: "/api/watchlists",
        auth: "Logged in",
        purpose: "List the current user's watchlists.",
        response: "Watchlist summaries or 401 Unauthorized.",
      },
      {
        method: "POST",
        path: "/api/watchlists",
        auth: "Logged in",
        purpose: "Create a watchlist.",
        input: "JSON body: name, optional description.",
        response: "201 with created watchlist or validation/service error.",
      },
      {
        method: "GET",
        path: "/api/watchlists/planned",
        auth: "Logged in",
        purpose: "List planned watch items for the current user.",
        response: "Planned watch items or 401 Unauthorized.",
      },
      {
        method: "GET",
        path: "/api/watchlists/[watchlistId]",
        auth: "Logged in",
        purpose: "Fetch one owned watchlist with items.",
        response: "Watchlist details or 404 Watchlist not found.",
      },
      {
        method: "PATCH",
        path: "/api/watchlists/[watchlistId]",
        auth: "Logged in",
        purpose: "Update an owned watchlist.",
        input: "JSON body: optional name and/or description. Description can be null.",
        response: "Updated watchlist or 404 Watchlist not found.",
      },
      {
        method: "DELETE",
        path: "/api/watchlists/[watchlistId]",
        auth: "Logged in",
        purpose: "Delete an owned watchlist.",
        response: "true on success or 404 Watchlist not found.",
      },
      {
        method: "POST",
        path: "/api/watchlists/[watchlistId]/items",
        auth: "Logged in",
        purpose: "Add a movie or series to an owned watchlist.",
        input: "JSON body: mediaType, movieId or seriesId, status, rating, notes, plannedWatchAt.",
        response: "201 with created watchlist item or service error.",
      },
      {
        method: "PATCH",
        path: "/api/watchlist-items/[itemId]",
        auth: "Logged in",
        purpose: "Update an owned watchlist item.",
        input: "JSON body: optional status, rating, notes, plannedWatchAt. Nullable values clear fields.",
        response: "Updated item or 404 Watchlist item not found.",
      },
      {
        method: "DELETE",
        path: "/api/watchlist-items/[itemId]",
        auth: "Logged in",
        purpose: "Remove an owned watchlist item.",
        response: "true on success or 404 Watchlist item not found.",
      },
    ],
  },
  {
    title: "Favourites",
    description: "Authenticated routes for saving and removing favourite movies or series.",
    endpoints: [
      {
        method: "GET",
        path: "/api/favourites",
        auth: "Logged in",
        purpose: "List the current user's favourites with media data.",
        response: "Favourite items or 401 Unauthorized.",
      },
      {
        method: "POST",
        path: "/api/favourites",
        auth: "Logged in",
        purpose: "Add a movie or series to favourites.",
        input: "JSON body: mediaType and mediaId.",
        response: "201 with favourite record, duplicate error, or media-not-found error.",
      },
      {
        method: "GET",
        path: "/api/favourites/by-media",
        auth: "Logged in",
        purpose: "Check whether one movie or series is already favourited.",
        input: "Query params: mediaType and mediaId.",
        response: "Favourite record or null.",
      },
      {
        method: "DELETE",
        path: "/api/favourites/by-media",
        auth: "Logged in",
        purpose: "Remove a favourite by media type and media id.",
        input: "JSON body: mediaType and mediaId.",
        response: "true/false depending on whether a favourite was removed.",
      },
      {
        method: "DELETE",
        path: "/api/favourites/[favouriteId]",
        auth: "Logged in",
        purpose: "Remove a favourite by favourite id.",
        response: "true on success or 404 Favourite not found.",
      },
    ],
  },
  {
    title: "Reviews",
    description: "Public review reading and authenticated review management.",
    endpoints: [
      {
        method: "GET",
        path: "/api/reviews",
        auth: "Public",
        purpose: "List public reviews for a movie or series.",
        input: "Query params: mediaType and mediaId.",
        response: "Public review items.",
      },
      {
        method: "POST",
        path: "/api/reviews",
        auth: "Logged in",
        purpose: "Create a review for a movie or series.",
        input: "JSON body: mediaType, mediaId, rating, title/content/public fields.",
        response: "201 with created review or validation/service error.",
      },
      {
        method: "GET",
        path: "/api/reviews/mine",
        auth: "Logged in",
        purpose: "List reviews written by the current user.",
        response: "User review items or 401 Unauthorized.",
      },
      {
        method: "PATCH",
        path: "/api/reviews/[reviewId]",
        auth: "Logged in",
        purpose: "Update an owned review.",
        input: "JSON body with review fields accepted by the review input parser.",
        response: "Updated review or 404 Review not found.",
      },
      {
        method: "DELETE",
        path: "/api/reviews/[reviewId]",
        auth: "Logged in",
        purpose: "Delete an owned review.",
        response: "true on success or 404 Review not found.",
      },
    ],
  },
];

const methodClassName: Record<string, string> = {
  DELETE: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200",
  GET: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  PATCH: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
  POST: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200",
};

export default async function DocsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/docs");
  }

  return (
    <main className="min-h-screen px-4 py-8 text-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-4">
          <p className="watchloom-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
            Developer docs
          </p>
          <div className="max-w-3xl space-y-3">
            <h1 className="watchloom-gradient-text text-3xl font-semibold tracking-tight sm:text-5xl">
              Watchloom API Routes
            </h1>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
              A compact reference for the API routes currently used by Watchloom. This page is
              visible only to registered, logged-in users.
            </p>
          </div>
        </header>

        <section className="watchloom-surface rounded-3xl p-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Response shape</h2>
          <p className="mt-2">
            Most routes return JSON with <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-900">success</code>{" "}
            and either <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-900">data</code>,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-900">message</code>, or{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-900">error</code>. Authenticated routes use
            the Watchloom auth cookie unless a route explicitly accepts a bearer token.
          </p>
        </section>

        <div className="space-y-8">
          {apiSections.map((section) => (
            <section key={section.title} className="space-y-4" aria-labelledby={`${section.title}-heading`}>
              <div>
                <h2 id={`${section.title}-heading`} className="text-2xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{section.description}</p>
              </div>

              <div className="grid gap-4">
                {section.endpoints.map((endpoint) => (
                  <article key={`${endpoint.method}:${endpoint.path}`} className="watchloom-surface rounded-3xl p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${methodClassName[endpoint.method]}`}
                          >
                            {endpoint.method}
                          </span>
                          <code className="break-all rounded-xl bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{endpoint.purpose}</p>
                      </div>
                      <span className="watchloom-pill inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
                        {endpoint.auth}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      {endpoint.input ? (
                        <div>
                          <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Input</dt>
                          <dd className="mt-1 leading-6 text-zinc-600 dark:text-zinc-400">{endpoint.input}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Response</dt>
                        <dd className="mt-1 leading-6 text-zinc-600 dark:text-zinc-400">{endpoint.response}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
