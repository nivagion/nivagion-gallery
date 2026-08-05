import { NextResponse } from "next/server";
import type { Locale } from "../../../lib/i18n-copy";

export function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "hr" ? "hr" : "en";
  const next = safeNext(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, url.origin));
  response.cookies.set("nivagion_locale", locale satisfies Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
