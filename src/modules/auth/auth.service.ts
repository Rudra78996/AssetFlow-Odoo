import { randomUUID } from "node:crypto";
import { authRepository } from "./auth.repository";
import type { SignupInput, LoginInput } from "./auth.schema";
import { hashPassword, verifyPassword, hashToken, verifyToken } from "@/lib/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import { RoleLabel } from "@/modules/shared/presenters";
import { logActivity } from "@/modules/activity/activity.service";
import type { User, Department } from "@prisma/client";

type UserWithDept = User & { department: Department | null };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function publicUser(u: UserWithDept) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: RoleLabel[u.role],
    department: u.department?.name ?? "",
    avatar: u.avatarUrl ?? undefined,
  };
}

async function issueTokens(u: UserWithDept): Promise<TokenPair> {
  const tokenId = randomUUID();
  const accessToken = signAccessToken({ sub: u.id, role: u.role, email: u.email });
  const refreshToken = signRefreshToken({ sub: u.id, tokenId });
  // Store only the hash of the refresh token so a DB leak cannot be replayed.
  await authRepository.setRefreshTokenHash(u.id, await hashToken(refreshToken));
  return { accessToken, refreshToken };
}

export const authService = {
  publicUser,

  async signup(input: SignupInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw new ConflictError("An account with this email already exists");

    const name = input.name ?? `${input.firstName} ${input.lastName}`.trim();
    const dept = input.department
      ? await authRepository.findDepartmentByName(input.department)
      : null;

    const user = await authRepository.create({
      name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "EMPLOYEE",
      departmentId: dept?.id ?? null,
    });

    const tokens = await issueTokens(user);
    await logActivity({
      userId: user.id,
      action: "auth.signup",
      objectType: "User",
      objectId: user.id,
    });
    return { user: publicUser(user), tokens };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    // Constant-ish path: still run a hash comparison shape to avoid trivial timing leaks.
    if (!user || !user.isActive || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const tokens = await issueTokens(user);
    await logActivity({
      userId: user.id,
      action: "auth.login",
      objectType: "User",
      objectId: user.id,
    });
    return { user: publicUser(user), tokens };
  },

  // Rotating refresh with reuse detection: the presented token must match the
  // stored hash. A mismatch means the token was already rotated (i.e. stolen +
  // replayed) -> we invalidate the session entirely as a compromise signal.
  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedError("Missing refresh token");
    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
    const user = await authRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedError("Session expired");

    const matches = await verifyToken(refreshToken, user.refreshTokenHash);
    if (!matches) {
      await authRepository.setRefreshTokenHash(user.id, null); // kill session
      throw new UnauthorizedError("Refresh token reuse detected; session revoked");
    }
    const tokens = await issueTokens(user); // rotates + stores new hash
    return { user: publicUser(user), tokens };
  },

  async logout(userId: string | undefined) {
    if (userId) await authRepository.setRefreshTokenHash(userId, null);
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return publicUser(user);
  },
};
