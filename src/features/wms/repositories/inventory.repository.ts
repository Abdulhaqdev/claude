import prisma from "@/lib/db/prisma";
import { cache, CacheKeys } from "@/lib/cache/cache";

export class InventoryRepository {
  async getOverview(organizationId: string) {
    return cache.getOrSet(
      CacheKeys.inventory(organizationId),
      async () => {
        const [warehouses, totalItems, totalValue, movements] = await Promise.all([
          prisma.warehouse.findMany({
            where: { organizationId, status: "ACTIVE" },
            include: {
              _count: { select: { inventoryItems: true } },
              inventoryItems: {
                select: { quantity: true, product: { select: { costPrice: true } } },
              },
            },
          }),
          prisma.inventoryItem.aggregate({
            where: { warehouse: { organizationId } },
            _sum: { quantity: true },
          }),
          prisma.$queryRaw<[{ total: number }]>`
            SELECT COALESCE(SUM(i.quantity * p."costPrice"), 0)::float as total
            FROM inventory_items i
            JOIN products p ON p.id = i."productId"
            JOIN warehouses w ON w.id = i."warehouseId"
            WHERE w."organizationId" = ${organizationId}
          `,
          prisma.stockMovement.findMany({
            where: { warehouseId: { in: await this.getWarehouseIds(organizationId) } },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          }),
        ]);

        const warehouseStats = warehouses.map((w) => ({
          id: w.id,
          name: w.name,
          code: w.code,
          itemCount: w._count.inventoryItems,
          totalQty: w.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
          value: w.inventoryItems.reduce(
            (sum, i) => sum + i.quantity * Number(i.product.costPrice),
            0
          ),
          capacity: w.capacity,
          utilization: w.capacity
            ? Math.round(
                (w.inventoryItems.reduce((s, i) => s + i.quantity, 0) / w.capacity) * 100
              )
            : null,
        }));

        return {
          totalItems: totalItems._sum.quantity ?? 0,
          totalValue: totalValue[0]?.total ?? 0,
          warehouseStats,
          recentMovements: movements,
        };
      },
      120
    );
  }

  async getHeatmap(organizationId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { warehouse: { organizationId } },
      include: {
        product: { select: { name: true, sku: true, minStock: true } },
        warehouse: { select: { name: true, code: true } },
        shelf: { select: { name: true, code: true } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      product: item.product.name,
      sku: item.product.sku,
      warehouse: item.warehouse.name,
      shelf: item.shelf?.code ?? "—",
      quantity: item.quantity,
      status:
        item.quantity === 0
          ? "empty"
          : item.quantity <= item.product.minStock
            ? "low"
            : item.quantity > item.product.minStock * 3
              ? "high"
              : "normal",
    }));
  }

  private async getWarehouseIds(organizationId: string) {
    const warehouses = await prisma.warehouse.findMany({
      where: { organizationId },
      select: { id: true },
    });
    return warehouses.map((w) => w.id);
  }
}

export const inventoryRepository = new InventoryRepository();

import type { WarehouseInput } from "@/lib/validations/schemas";

export class WarehouseRepository {
  async findAll(organizationId: string) {
    return prisma.warehouse.findMany({
      where: { organizationId },
      include: {
        zones: { include: { shelves: true } },
        _count: { select: { inventoryItems: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string, organizationId: string) {
    return prisma.warehouse.findFirst({
      where: { id, organizationId },
      include: {
        zones: {
          include: {
            shelves: {
              include: {
                inventoryItems: {
                  include: { product: { select: { name: true, sku: true } } },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(organizationId: string, data: WarehouseInput) {
    return prisma.warehouse.create({
      data: {
        organizationId,
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity,
      },
    });
  }

  async update(id: string, organizationId: string, data: WarehouseInput) {
    return prisma.warehouse.updateMany({
      where: { id, organizationId },
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.warehouse.deleteMany({ where: { id, organizationId } });
  }
}

export const warehouseRepository = new WarehouseRepository();
