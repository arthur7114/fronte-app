import { createServerClient } from "@super/db/server";
import { cookies } from "next/headers";

export async function getServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient({
    getAll() {
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Server Components cannot always write cookies. Middleware refreshes sessions.
      }
    },
  });
}
