import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { productRepository } from "@/features/erp/repositories/product.repository";
import { paginationSchema } from "@/lib/validations/schemas";
import { handleError } from "@/lib/errors/app-error";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(user.role, "products:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = paginationSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const result = await productRepository.findMany(user.organizationId, params);
    return NextResponse.json(result);
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(user.role, "products:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const product = await productRepository.create(user.organizationId, body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
