import { createServerClient } from "@supabase/ssr";
import type { Database } from "@super/db/types";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];
const PROTECTED_PREFIXES = ["/app", "/onboarding"];
type CookieBatch = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}[];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieBatch) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            void options;
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!isProtectedRoute && !isPublicRoute) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
  }

  const membershipResult = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const hasMembership = Boolean(membershipResult.data);

  if (pathname === "/onboarding" && hasMembership) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname.startsWith("/app") && !hasMembership) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup") {
    return NextResponse.redirect(
      new URL(hasMembership ? "/app" : "/onboarding", request.url),
    );
  }

  return response;
}

export const config = {
  matcher: ["/", "/auth/:path*", "/app/:path*", "/onboarding/:path*"],
};
