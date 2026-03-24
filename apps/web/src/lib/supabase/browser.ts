"use client";

import { createBrowserClient } from "@super/db/client";

export function getBrowserSupabaseClient() {
  return createBrowserClient();
}
