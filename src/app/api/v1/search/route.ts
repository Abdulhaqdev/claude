import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { handleError } from "@/lib/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = request.nextUrl.searchParams.get("q") ?? "";
    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const [products, customers, deals] = await Promise.all([
      prisma.product.findMany({
        where: {
          organizationId: user.organizationId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, sku: true },
      }),
      prisma.customer.findMany({
        where: {
          organizationId: user.organizationId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true },
      }),
      prisma.deal.findMany({
        where: {
          organizationId: user.organizationId,
          title: { contains: query, mode: "insensitive" },
        },
        take: 5,
        select: { id: true, title: true, stage: true },
      }),
    ]);

    return NextResponse.json({
      results: [
        ...products.map((p) => ({ type: "product", ...p, href: `/dashboard/erp/products` })),
        ...customers.map((c) => ({ type: "customer", ...c, href: `/dashboard/crm/customers` })),
        ...deals.map((d) => ({ type: "deal", ...d, href: `/dashboard/crm/deals` })),
      ],
    });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
