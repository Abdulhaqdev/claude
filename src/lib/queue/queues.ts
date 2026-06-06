import { Queue, Worker, type Job } from "bullmq";
import redis from "@/lib/redis/client";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
};

export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  EMAIL: "email",
  INVOICE_PDF: "invoice-pdf",
  LOW_STOCK: "low-stock-check",
  AUDIT: "audit",
} as const;

function createQueue(name: string) {
  return new Queue(name, { connection });
}

export const notificationQueue = createQueue(QUEUE_NAMES.NOTIFICATIONS);
export const emailQueue = createQueue(QUEUE_NAMES.EMAIL);
export const invoicePdfQueue = createQueue(QUEUE_NAMES.INVOICE_PDF);
export const lowStockQueue = createQueue(QUEUE_NAMES.LOW_STOCK);
export const auditQueue = createQueue(QUEUE_NAMES.AUDIT);

export interface NotificationJob {
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface InvoicePdfJob {
  invoiceId: string;
  organizationId: string;
}

export async function enqueueNotification(data: NotificationJob) {
  return notificationQueue.add("send", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
}

export async function enqueueInvoicePdf(data: InvoicePdfJob) {
  return invoicePdfQueue.add("generate", data, {
    attempts: 2,
    backoff: { type: "fixed", delay: 2000 },
  });
}

export async function scheduleLowStockCheck(organizationId: string) {
  return lowStockQueue.add(
    "check",
    { organizationId },
    { repeat: { pattern: "0 */6 * * *" } }
  );
}

export function startWorkers() {
  const notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job: Job<NotificationJob>) => {
      const { default: prisma } = await import("@/lib/db/prisma");
      await prisma.notification.create({
        data: {
          userId: job.data.userId,
          organizationId: job.data.organizationId,
          type: job.data.type as never,
          title: job.data.title,
          message: job.data.message,
          link: job.data.link,
        },
      });
    },
    { connection }
  );

  const lowStockWorker = new Worker(
    QUEUE_NAMES.LOW_STOCK,
    async (job: Job<{ organizationId: string }>) => {
      const { productRepository } = await import(
        "@/features/erp/repositories/product.repository"
      );
      const lowStock = await productRepository.getLowStock(job.data.organizationId);

      for (const item of lowStock) {
        const admins = await (
          await import("@/lib/db/prisma")
        ).default.user.findMany({
          where: {
            organizationId: job.data.organizationId,
            role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE"] },
          },
        });

        for (const admin of admins) {
          await enqueueNotification({
            userId: admin.id,
            organizationId: job.data.organizationId,
            type: "LOW_STOCK",
            title: "Low Stock Alert",
            message: `${item.name} (${item.sku}) has ${item.totalQty} units remaining`,
            link: `/erp/products`,
          });
        }
      }
    },
    { connection }
  );

  notificationWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return { notificationWorker, lowStockWorker };
}

export { redis as queueRedis };
