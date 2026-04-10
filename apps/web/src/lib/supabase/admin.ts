import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@super/db/types";

function readEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((accumulator, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

      if (!key) {
        return accumulator;
      }

      accumulator[key] = rawValue.replace(/^['"]|['"]$/g, "");
      return accumulator;
    }, {});
}

function getServerEnv(name: string) {
  if (process.env[name]) {
    return process.env[name];
  }

  const appDir = process.cwd();
  const rootDir = path.resolve(appDir, "../..");
  const mergedEnv = {
    ...readEnvFile(path.join(rootDir, ".env.local")),
    ...readEnvFile(path.join(rootDir, ".env")),
    ...readEnvFile(path.join(appDir, ".env.local")),
    ...readEnvFile(path.join(appDir, ".env")),
  };

  const value = mergedEnv[name];

  if (value) {
    process.env[name] = value;
  }

  return value;
}

export function getAdminSupabaseClient() {
  const url = getServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "As variaveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias no servidor.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getOptionalAdminSupabaseClient() {
  const url = getServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
