import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookie } from "../../_utils";
import { handleGoogleSSO } from "@/services/oauth.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    : `http://localhost:3000/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing GOOGLE credentials" }, { status: 500 });
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokenData = await tokenResponse.json();

    // 2. Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userData = await userResponse.json();

    if (!userData.email_verified) {
      throw new Error("Google email not verified");
    }

    // 3. Process SSO user
    const result = await handleGoogleSSO({
      sub: userData.sub,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    });

    // 4. Set authentication cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setAuthCookie(response, result.accessToken);
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
