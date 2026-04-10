import { createServerClient as _createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

type CookieAdapter = {
    getAll: () => { name: string; value: string }[];
    setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
};
type ServerSupabaseClient = ReturnType<typeof _createServerClient<Database, "public">>;

/**
 * Creates a Supabase client for server-side usage (SSR, Server Actions, Route Handlers).
 * Cookie handling must be provided by the caller (framework-specific).
 */
export function createServerClient(
    cookieStore: CookieAdapter,
): ServerSupabaseClient {
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    return _createServerClient<Database, "public">(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: Parameters<CookieAdapter["setAll"]>[0]) {
                    cookieStore.setAll(cookiesToSet);
                },
            },
        },
    );
}
