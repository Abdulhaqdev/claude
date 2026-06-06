import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/services/auth.service";
import { handleError } from "@/lib/errors/app-error";
import { AUTH_COOKIES } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const ua = request.headers.get("user-agent") ?? undefined;

    const result = await authService.login(body.email, body.password, ip, ua);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE() {
  const refreshToken = (await import("next/headers"))
    .cookies()
    .then((c) => c.get(AUTH_COOKIES.refreshToken)?.value);

  await authService.logout(await refreshToken);
  return NextResponse.json({ success: true });
}
