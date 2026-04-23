import { createServerClient } from "@supabase/ssr";
import type { Database } from "@super/db/types";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthenticatedAppPath } from "@/lib/auth-routing";

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/auth/login", "/auth/signup"];
const PROTECTED_PREFIXES = ["/app", "/dashboard", "/onboarding"];

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
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const membershipResult = (await supabase
    .from("memberships")
    .select("id, tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()) as {
    data: { id: string; tenant_id: string } | null;
    error: { message: string } | null;
  };

  const membership = membershipResult.data;
  let hasSite = false;

  if (membership?.tenant_id) {
    const siteResult = await supabase
      .from("sites")
      .select("id")
      .eq("tenant_id", membership.tenant_id)
      .limit(1)
      .maybeSingle();

    hasSite = Boolean(siteResult.data);
  }

  const destination = resolveAuthenticatedAppPath({
    hasMembership: Boolean(membership),
    hasSite,
  });

  if (!membership && (pathname.startsWith("/app") || pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding/site") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname === "/onboarding" && membership) {
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (
    membership &&
    !hasSite &&
    (pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/app/dashboard" ||
      pathname.startsWith("/app/dashboard/"))
  ) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/cadastro") {
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/cadastro", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/cadastro", "/auth/:path*", "/app/:path*", "/dashboard/:path*", "/onboarding/:path*"],
};
