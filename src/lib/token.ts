import crypto from "node:crypto";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TRAINER" | "ADMIN";
  avatar?: string | null;
  headline?: string | null;
  phone?: string | null;
}

export interface SessionPayload extends SessionUser {
  iat: number;
  exp: number;
}

export const SESSION_COOKIE_NAME = "skillnova_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Retrieve the cryptographic secret key from environment variables.
 * Enforces strict presence in production environments.
 */
export function getAuthSecret(): string {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: AUTH_SECRET or NEXTAUTH_SECRET is not set in production."
      );
    }
    // Local development fallback
    return "skillnova-dev-local-secret-32-chars-key!!";
  }

  return secret;
}

/**
 * Cryptographically sign a session token using HMAC-SHA256 with timestamp expiry.
 * Produces a tamper-proof compact token: <payloadBase64Url>.<signatureBase64Url>
 */
export function signSessionToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify cryptographic signature and validity of a session token.
 * Uses timing-safe comparisons to eliminate side-channel timing attack vectors.
 */
export function verifySessionToken(token: string | null | undefined): SessionUser | null {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [payloadB64, signature] = parts;
    if (!payloadB64 || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSignature);

    // Timing-safe comparison to prevent timing analysis attacks
    if (
      sigBuf.length !== expSigBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expSigBuf)
    ) {
      return null;
    }

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr) as SessionPayload;

    // Verify session expiration
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now > payload.exp) {
      return null;
    }

    // Verify role integrity
    if (!["STUDENT", "TRAINER", "ADMIN"].includes(payload.role)) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatar,
      headline: payload.headline,
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Create a secure, single-use, time-limited (1-hour) password reset token.
 * Embeds the user's current passwordHash into the HMAC key, ensuring that as soon
 * as the password is reset, all previously issued reset tokens are automatically invalidated.
 */
export function createPasswordResetToken(user: {
  id: string;
  email: string;
  passwordHash: string;
}): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const payloadStr = `${user.id}:${user.email.toLowerCase().trim()}:${expiresAt}`;
  const hmacKey = `${getAuthSecret()}:${user.passwordHash}`;
  const signature = crypto.createHmac("sha256", hmacKey).update(payloadStr).digest("base64url");
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verify a single-use, time-limited password reset token.
 */
export function verifyPasswordResetToken(
  token: string,
  user: { id: string; email: string; passwordHash: string }
): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payloadB64, signature] = parts;
    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const [userId, email, expStr] = payloadStr.split(":");

    if (userId !== user.id || email !== user.email.toLowerCase().trim()) {
      return false;
    }

    const expiresAt = parseInt(expStr, 10);
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      return false; // Expired
    }

    const hmacKey = `${getAuthSecret()}:${user.passwordHash}`;
    const expectedSig = crypto.createHmac("sha256", hmacKey).update(payloadStr).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSig);

    return sigBuf.length === expSigBuf.length && crypto.timingSafeEqual(sigBuf, expSigBuf);
  } catch {
    return false;
  }
}
