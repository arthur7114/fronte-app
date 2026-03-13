import { createServerClient as _createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a Supabase client for server-side usage (SSR, Server Actions, Route Handlers).
 * Cookie handling must be provided by the caller (framework-specific).
 */
export function createServerClient(
    cookieStore: {
        getAll: () => { name: string; value: string }[];
        setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
    },
) {
    return _createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookieStore.setAll(cookiesToSet);
                },
            },
        },
    );
}
