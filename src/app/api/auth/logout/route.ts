import { NextResponse } from "next/server";
import { authService } from "@/features/auth/services/auth.service";
import { AUTH_COOKIES } from "@/lib/auth/jwt";

export async function POST() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIES.refreshToken)?.value;

  if (refreshToken) {
    await authService.logout(refreshToken);
  } else {
    await authService.logout();
  }

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
