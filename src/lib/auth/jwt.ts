import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-32-chars!!"
);

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser extends TokenPayload {
  id: string;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function createAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "refresh") return null;
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}

export const AUTH_COOKIES = {
  accessToken: "nexus_access_token",
  refreshToken: "nexus_refresh_token",
} as const;

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIES.accessToken, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  cookieStore.set(AUTH_COOKIES.refreshToken, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.accessToken);
  cookieStore.delete(AUTH_COOKIES.refreshToken);
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessTokenFromCookies();
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    ...payload,
  };
}

export function tokenPayloadToAuthUser(payload: TokenPayload): AuthUser {
  return { id: payload.sub, ...payload };
}
