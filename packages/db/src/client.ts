import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

type BrowserSupabaseClient = ReturnType<typeof _createBrowserClient<Database, "public">>;

/**
 * Creates a Supabase client for browser-side usage (Client Components).
 * Uses cookie-based auth automatically.
 */
export function createBrowserClient(): BrowserSupabaseClient {
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    return _createBrowserClient<Database, "public">(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey!,
    );
}
