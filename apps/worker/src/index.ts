import "dotenv/config";
import { APP_NAME } from "@super/shared";
import { startProcessor } from "./processor.js";

console.log(`[Worker] Starting processor for ${APP_NAME}...`);

// Simple infinite loop that polls for jobs
async function main() {
    console.log("[Worker] Polling for new jobs...");

    // Start the actual processor
    await startProcessor();

    // Set interval to poll every 10 seconds locally
    setInterval(async () => {
        await startProcessor();
    }, 10000);
}

main().catch((error) => {
    console.error("[Worker] Fatal error:", error);
    process.exit(1);
});
