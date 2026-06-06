import prisma from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export class AuditService {
  async log(data: {
    organizationId: string;
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
  }) {
    return prisma.activityLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata ?? {},
        ipAddress: data.ipAddress,
      },
    });
  }

  async getRecent(organizationId: string, limit = 20) {
    return prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }

  async getByEntity(entity: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatar: true },
        },
      },
    });
  }
}

export const auditService = new AuditService();
