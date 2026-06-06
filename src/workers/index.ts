import { startWorkers } from "@/lib/queue/queues";

console.log("[Worker] Starting BullMQ workers...");

const workers = startWorkers();

process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down...");
  await workers.notificationWorker.close();
  await workers.lowStockWorker.close();
  process.exit(0);
});

console.log("[Worker] All workers started successfully");
