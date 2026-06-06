import prisma from "@/lib/db/prisma";
import type { PaginationParams, ExpenseInput } from "@/lib/validations/schemas";
import { getPaginationParams, buildPaginatedResult } from "@/lib/validations/schemas";

export class NotificationRepository {
  async findForUser(userId: string, organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId, organizationId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.notification.count({ where: { userId, organizationId } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }
}

export class SaleRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where: { organizationId },
        orderBy: { orderDate: "desc" },
        skip,
        take,
        include: {
          customer: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.sale.count({ where: { organizationId } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }
}

export class PurchaseRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { organizationId },
        orderBy: { orderDate: "desc" },
        skip,
        take,
        include: {
          supplier: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchase.count({ where: { organizationId } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }
}

export class ExpenseRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where: { organizationId },
        orderBy: { date: "desc" },
        skip,
        take,
      }),
      prisma.expense.count({ where: { organizationId } }),
    ]);

    return buildPaginatedResult(
      data.map((e) => ({ ...e, amount: Number(e.amount) })),
      total,
      params
    );
  }

  async create(organizationId: string, data: Omit<ExpenseInput, "date"> & { date?: Date }) {
    return prisma.expense.create({
      data: {
        organizationId,
        description: data.description,
        category: data.category,
        amount: data.amount,
        date: data.date ?? new Date(),
        vendor: data.vendor,
      },
    });
  }

  async update(id: string, organizationId: string, data: Partial<Omit<ExpenseInput, "date">> & { date?: Date }) {
    return prisma.expense.updateMany({
      where: { id, organizationId },
      data: {
        description: data.description,
        category: data.category,
        amount: data.amount,
        date: data.date,
        vendor: data.vendor,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.expense.deleteMany({ where: { id, organizationId } });
  }
}

export class DispatchRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.dispatch.findMany({
        where: { warehouse: { organizationId } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          warehouse: { select: { name: true, code: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.dispatch.count({ where: { warehouse: { organizationId } } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }
}

export class TransferRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.transfer.findMany({
        where: {
          OR: [
            { fromWarehouse: { organizationId } },
            { toWarehouse: { organizationId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          fromWarehouse: { select: { name: true, code: true } },
          toWarehouse: { select: { name: true, code: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.transfer.count({
        where: {
          OR: [
            { fromWarehouse: { organizationId } },
            { toWarehouse: { organizationId } },
          ],
        },
      }),
    ]);

    return buildPaginatedResult(data, total, params);
  }
}

export class ReceivingRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const [data, total] = await Promise.all([
      prisma.receiving.findMany({
        where: { warehouse: { organizationId } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          warehouse: { select: { name: true, code: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.receiving.count({ where: { warehouse: { organizationId } } }),
    ]);

    return buildPaginatedResult(data, total, params);
  }
}

export const notificationRepository = new NotificationRepository();
export const saleRepository = new SaleRepository();
export const purchaseRepository = new PurchaseRepository();
export const expenseRepository = new ExpenseRepository();
export const dispatchRepository = new DispatchRepository();
export const transferRepository = new TransferRepository();
export const receivingRepository = new ReceivingRepository();
