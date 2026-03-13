import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a Supabase client for browser-side usage (Client Components).
 * Uses cookie-based auth automatically.
 */
export function createBrowserClient() {
    return _createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}
