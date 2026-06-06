import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import prisma from "@/lib/db/prisma";
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
  type TokenPayload,
} from "@/lib/auth/jwt";
import { UnauthorizedError, ConflictError } from "@/lib/errors/app-error";
import { UserRole } from "@prisma/client";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName,
        slug: `${slug}-${nanoid(6)}`,
        users: {
          create: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.SUPER_ADMIN,
          },
        },
      },
      include: { users: true },
    });

    const user = organization.users[0];
    return this.createSession(user, "127.0.0.1", "registration");
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: { email, status: "ACTIVE" },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.createSession(user, ipAddress, userAgent);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
    await clearAuthCookies();
  }

  async refreshSession(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const stored = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      throw new UnauthorizedError("Refresh token expired or revoked");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("User not found or inactive");
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.createSession(user);
  }

  private async createSession(
    user: {
      id: string;
      email: string;
      role: UserRole;
      organizationId: string;
      firstName: string;
      lastName: string;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
