import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { dashboardRepository } from "@/features/erp/repositories/product.repository";
import { handleError } from "@/lib/errors/app-error";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type") ?? "stats";

    if (type === "stats") {
      const stats = await dashboardRepository.getStats(user.organizationId);
      return NextResponse.json(stats);
    }

    if (type === "revenue") {
      const months = parseInt(request.nextUrl.searchParams.get("months") ?? "6");
      const data = await dashboardRepository.getRevenueChart(user.organizationId, months);
      return NextResponse.json(data);
    }

    if (type === "pipeline") {
      const data = await dashboardRepository.getPipelineSummary(user.organizationId);
      return NextResponse.json(data);
    }

    if (type === "activity") {
      const data = await dashboardRepository.getRecentActivity(user.organizationId);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
