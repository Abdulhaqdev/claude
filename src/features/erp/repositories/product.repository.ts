import prisma from "@/lib/db/prisma";
import { cache, CacheKeys } from "@/lib/cache/cache";
import type { PaginationParams } from "@/lib/validations/schemas";
import { getPaginationParams, buildPaginatedResult } from "@/lib/validations/schemas";
import type { ProductInput } from "@/lib/validations/schemas";
import type { Prisma } from "@prisma/client";

export class ProductRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where: Prisma.ProductWhereInput = {
      organizationId,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { sku: { contains: params.search, mode: "insensitive" } },
          { barcode: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder },
        include: {
          category: { select: { name: true } },
          inventoryItems: { select: { quantity: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const enriched = data.map((p) => ({
      ...p,
      stock: p.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
      wholesalePrice: Number(p.wholesalePrice),
      sellPrice: Number(p.sellPrice),
      costPrice: Number(p.costPrice),
    }));

    return buildPaginatedResult(enriched, total, params);
  }

  async findAllForGrid(organizationId: string) {
    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        inventoryItems: { select: { quantity: true } },
      },
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand ?? "",
      color: p.color ?? "",
      size: p.size ?? "",
      wholesalePrice: Number(p.wholesalePrice),
      sellPrice: Number(p.sellPrice),
      costPrice: Number(p.costPrice),
      minStock: p.minStock,
      barcode: p.barcode ?? "",
      categoryId: p.categoryId ?? "",
      status: p.status,
      category: p.category?.name ?? "Uncategorized",
      stock: p.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
    }));
  }

  async getCategories(organizationId: string) {
    return prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  }

  async findById(id: string, organizationId: string) {
    return prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        inventoryItems: {
          include: { warehouse: { select: { name: true, code: true } } },
        },
      },
    });
  }

  async create(organizationId: string, data: ProductInput) {
    const product = await prisma.product.create({
      data: { ...data, organizationId },
    });
    await cache.invalidatePattern(`products:${organizationId}:*`);
    return product;
  }

  async update(id: string, organizationId: string, data: Partial<ProductInput>) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    await cache.invalidatePattern(`products:${organizationId}:*`);
    return product;
  }

  async delete(id: string, organizationId: string) {
    await prisma.product.delete({ where: { id } });
    await cache.invalidatePattern(`products:${organizationId}:*`);
  }

  async getLowStock(organizationId: string) {
    return prisma.$queryRaw<
      Array<{ id: string; name: string; sku: string; minStock: number; totalQty: bigint }>
    >`
      SELECT p.id, p.name, p.sku, p."minStock", COALESCE(SUM(i.quantity), 0) as "totalQty"
      FROM products p
      LEFT JOIN inventory_items i ON i."productId" = p.id
      WHERE p."organizationId" = ${organizationId} AND p.status = 'ACTIVE'
      GROUP BY p.id, p.name, p.sku, p."minStock"
      HAVING COALESCE(SUM(i.quantity), 0) <= p."minStock"
      ORDER BY COALESCE(SUM(i.quantity), 0) ASC
      LIMIT 20
    `;
  }
}

export const productRepository = new ProductRepository();

export class DashboardRepository {
  async getStats(organizationId: string) {
    return cache.getOrSet(
      CacheKeys.dashboard(organizationId),
      async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [
          totalProducts,
          totalCustomers,
          totalOrders,
          monthlyRevenue,
          lastMonthRevenue,
          openDeals,
          lowStockCount,
          pendingDispatches,
        ] = await Promise.all([
          prisma.product.count({ where: { organizationId, status: "ACTIVE" } }),
          prisma.customer.count({ where: { organizationId, status: "ACTIVE" } }),
          prisma.sale.count({
            where: { organizationId, status: { not: "CANCELLED" } },
          }),
          prisma.sale.aggregate({
            where: {
              organizationId,
              status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
              orderDate: { gte: startOfMonth },
            },
            _sum: { total: true },
          }),
          prisma.sale.aggregate({
            where: {
              organizationId,
              status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
              orderDate: { gte: startOfLastMonth, lt: startOfMonth },
            },
            _sum: { total: true },
          }),
          prisma.deal.count({
            where: {
              organizationId,
              stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
            },
          }),
          prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) as count FROM (
              SELECT p.id FROM products p
              LEFT JOIN inventory_items i ON i."productId" = p.id
              WHERE p."organizationId" = ${organizationId}
              GROUP BY p.id, p."minStock"
              HAVING COALESCE(SUM(i.quantity), 0) <= p."minStock"
            ) sub
          `.then((r) => Number(r[0]?.count ?? 0)),
          prisma.dispatch.count({
            where: { status: { in: ["PENDING", "PICKING", "PACKED"] } },
          }),
        ]);

        const currentRev = Number(monthlyRevenue._sum.total ?? 0);
        const lastRev = Number(lastMonthRevenue._sum.total ?? 0);
        const revenueChange =
          lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 0;

        return {
          totalProducts,
          totalCustomers,
          totalOrders,
          monthlyRevenue: currentRev,
          revenueChange,
          openDeals,
          lowStockCount,
          pendingDispatches,
        };
      },
      120
    );
  }

  async getRevenueChart(organizationId: string, months = 6) {
    const results = await prisma.$queryRaw<
      Array<{ month: string; revenue: number; orders: bigint }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "orderDate"), 'Mon YYYY') as month,
        COALESCE(SUM(total), 0)::float as revenue,
        COUNT(*) as orders
      FROM sales
      WHERE "organizationId" = ${organizationId}
        AND status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
        AND "orderDate" >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', "orderDate")
      ORDER BY DATE_TRUNC('month', "orderDate") ASC
    `;

    return results.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }

  async getPipelineSummary(organizationId: string) {
    return cache.getOrSet(
      CacheKeys.pipeline(organizationId),
      async () => {
        const deals = await prisma.deal.groupBy({
          by: ["stage"],
          where: { organizationId },
          _count: { id: true },
          _sum: { value: true },
        });

        return deals.map((d) => ({
          stage: d.stage,
          count: d._count.id,
          value: Number(d._sum.value ?? 0),
        }));
      },
      180
    );
  }

  async getRecentActivity(organizationId: string, limit = 10) {
    return prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
