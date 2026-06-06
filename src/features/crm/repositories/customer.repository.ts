import prisma from "@/lib/db/prisma";
import type { PaginationParams } from "@/lib/validations/schemas";
import { getPaginationParams, buildPaginatedResult } from "@/lib/validations/schemas";
import type { CustomerInput } from "@/lib/validations/schemas";
import type { Prisma } from "@prisma/client";

export class CustomerRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
          { company: { contains: params.search, mode: "insensitive" } },
          { code: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder },
      }),
      prisma.customer.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async findById(id: string, organizationId: string) {
    return prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        communications: { orderBy: { createdAt: "desc" }, take: 10 },
        notes: { orderBy: { createdAt: "desc" }, take: 10 },
        deals: { where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } } },
      },
    });
  }

  async create(organizationId: string, data: CustomerInput) {
    return prisma.customer.create({
      data: { ...data, organizationId },
    });
  }

  async update(id: string, data: Partial<CustomerInput>) {
    return prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string, organizationId: string) {
    await prisma.customer.deleteMany({ where: { id, organizationId } });
  }
}

export const customerRepository = new CustomerRepository();

export class DealRepository {
  async findByStage(organizationId: string) {
    return prisma.deal.findMany({
      where: {
        organizationId,
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        customer: { select: { name: true, company: true } },
        lead: { select: { firstName: true, lastName: true, company: true } },
      },
    });
  }

  async updateStage(id: string, stage: string) {
    return prisma.deal.update({
      where: { id },
      data: {
        stage: stage as never,
        ...(stage === "CLOSED_WON" || stage === "CLOSED_LOST"
          ? { closedAt: new Date() }
          : {}),
      },
    });
  }

  async create(organizationId: string, data: {
    title: string;
    value: number;
    stage: string;
    customerId?: string;
    leadId?: string;
    probability?: number;
    expectedClose?: Date;
  }) {
    return prisma.deal.create({
      data: {
        organizationId,
        title: data.title,
        value: data.value,
        stage: data.stage as never,
        customerId: data.customerId || null,
        leadId: data.leadId || null,
        probability: data.probability ?? 10,
        expectedClose: data.expectedClose,
      },
    });
  }

  async update(id: string, organizationId: string, data: {
    title: string;
    value: number;
    stage: string;
    customerId?: string;
    leadId?: string;
    probability?: number;
    expectedClose?: Date;
  }) {
    return prisma.deal.updateMany({
      where: { id, organizationId },
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage as never,
        customerId: data.customerId || null,
        leadId: data.leadId || null,
        probability: data.probability,
        expectedClose: data.expectedClose,
        ...(data.stage === "CLOSED_WON" || data.stage === "CLOSED_LOST"
          ? { closedAt: new Date() }
          : {}),
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.deal.deleteMany({ where: { id, organizationId } });
  }
}

export const dealRepository = new DealRepository();

import type { LeadInput } from "@/lib/validations/schemas";

export class LeadRepository {
  async findMany(organizationId: string, params: PaginationParams) {
    const { skip, take } = getPaginationParams(params);

    const where: Prisma.LeadWhereInput = {
      organizationId,
      ...(params.search && {
        OR: [
          { firstName: { contains: params.search, mode: "insensitive" } },
          { lastName: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
          { company: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.lead.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async create(organizationId: string, data: LeadInput) {
    return prisma.lead.create({
      data: {
        organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        company: data.company,
        status: data.status,
        source: data.source,
        score: data.score,
      },
    });
  }

  async update(id: string, organizationId: string, data: LeadInput) {
    return prisma.lead.updateMany({
      where: { id, organizationId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        company: data.company,
        status: data.status,
        source: data.source,
        score: data.score,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await prisma.lead.deleteMany({ where: { id, organizationId } });
  }
}

export const leadRepository = new LeadRepository();
