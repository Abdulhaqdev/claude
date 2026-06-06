import prisma from "@/lib/db/prisma";
import type { PaginationParams } from "@/lib/validations/schemas";
import { getPaginationParams, buildPaginatedResult } from "@/lib/validations/schemas";
import type { Prisma } from "@prisma/client";

export class InvoiceRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where: Prisma.InvoiceWhereInput = {
      organizationId,
      ...(params.search && {
        OR: [
          { invoiceNumber: { contains: params.search, mode: "insensitive" } },
          { customer: { name: { contains: params.search, mode: "insensitive" } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { issueDate: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async getSummary(organizationId: string) {
    const [outstanding, paidThisMonth, overdue, draft] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { in: ["SENT", "OVERDUE"] },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "PAID",
          paidDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { organizationId, status: "OVERDUE" },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { organizationId, status: "DRAFT" } }),
    ]);

    return {
      outstanding: Number(outstanding._sum.total ?? 0),
      paidThisMonth: Number(paidThisMonth._sum.total ?? 0),
      overdue: Number(overdue._sum.total ?? 0),
      draft,
    };
  }
}

export const invoiceRepository = new InvoiceRepository();

export class CategoryRepository {
  async findAll(organizationId: string) {
    return prisma.category.findMany({
      where: { organizationId },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  async create(organizationId: string, data: { name: string; slug: string; description?: string }) {
    return prisma.category.create({
      data: { organizationId, name: data.name, slug: data.slug, description: data.description },
    });
  }

  async update(id: string, organizationId: string, data: { name: string; slug: string; description?: string }) {
    return prisma.category.updateMany({
      where: { id, organizationId },
      data: { name: data.name, slug: data.slug, description: data.description },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.category.deleteMany({ where: { id, organizationId } });
  }
}

export const categoryRepository = new CategoryRepository();

import type { SupplierInput } from "@/lib/validations/schemas";

export class SupplierRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where: Prisma.SupplierWhereInput = {
      organizationId,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { code: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.supplier.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async create(organizationId: string, data: SupplierInput) {
    return prisma.supplier.create({
      data: {
        organizationId,
        name: data.name,
        code: data.code,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        paymentTerms: data.paymentTerms,
      },
    });
  }

  async update(id: string, organizationId: string, data: SupplierInput) {
    return prisma.supplier.updateMany({
      where: { id, organizationId },
      data: {
        name: data.name,
        code: data.code,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        paymentTerms: data.paymentTerms,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.supplier.deleteMany({ where: { id, organizationId } });
  }
}

export const supplierRepository = new SupplierRepository();
