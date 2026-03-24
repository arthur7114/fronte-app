import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { APP_NAME } from "@super/shared";
import { startProcessor } from "./processor.js";

function bootstrapEnv() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const workerDir = path.resolve(currentDir, "..");
  const rootDir = path.resolve(workerDir, "..", "..");

  loadEnv({ path: path.join(rootDir, ".env") });
  loadEnv({ path: path.join(rootDir, ".env.local"), override: true });
  loadEnv({ path: path.join(workerDir, ".env") });
  loadEnv({ path: path.join(workerDir, ".env.local"), override: true });
}

bootstrapEnv();

console.log(`[Worker] Starting processor for ${APP_NAME}...`);

let isProcessing = false;

async function runCycle() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    await startProcessor();
  } catch (error) {
    console.error("[Worker] Cycle error:", error);
  } finally {
    isProcessing = false;
  }
}

async function main() {
  await runCycle();

  setInterval(() => {
    void runCycle();
  }, 10000);
}

main().catch((error) => {
  console.error("[Worker] Fatal error:", error);
  process.exit(1);
});
