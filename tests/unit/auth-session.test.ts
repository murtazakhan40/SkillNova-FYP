import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  signSessionToken,
  verifySessionToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  SessionUser,
} from "@/lib/token";

describe("Unit: Authentication & Session Verification", () => {
  const mockUser: SessionUser = {
    id: "user-uuid-1234",
    name: "Murtaza Wazir",
    email: "student@skillnova.edu",
    role: "STUDENT",
  };

  it("should create a valid HMAC-SHA256 session token with payload.signature format", () => {
    const token = signSessionToken(mockUser);
    expect(token).toBeDefined();
    const parts = token.split(".");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(10);
    expect(parts[1].length).toBeGreaterThan(10);
  });

  it("should successfully verify a valid signed token and preserve user claims", () => {
    const token = signSessionToken(mockUser);
    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(mockUser.id);
    expect(verified?.email).toBe(mockUser.email);
    expect(verified?.role).toBe("STUDENT");
  });

  it("should reject tampered token signatures", () => {
    const token = signSessionToken(mockUser);
    const [payload, signature] = token.split(".");
    // Corrupt signature
    const corruptedSignature = signature.slice(0, -4) + "XXXX";
    const corruptedToken = `${payload}.${corruptedSignature}`;
    expect(verifySessionToken(corruptedToken)).toBeNull();
  });

  it("should reject role escalation forgery attack (STUDENT -> ADMIN)", () => {
    const token = signSessionToken(mockUser);
    const [payload, signature] = token.split(".");

    // Decode, alter role, and re-encode without secret key
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    decoded.role = "ADMIN";
    const forgedPayload = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    const forgedToken = `${forgedPayload}.${signature}`;

    expect(verifySessionToken(forgedToken)).toBeNull();
  });

  it("should reject expired session tokens", () => {
    // Manually construct an expired token
    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const expiredPayload = {
      ...mockUser,
      iat: pastTime - 3600,
      exp: pastTime,
    };
    const payloadB64 = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const secret = process.env.NEXTAUTH_SECRET || "skillnova-test-secret-key-32-chars-long!";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");
    const expiredToken = `${payloadB64}.${signature}`;

    expect(verifySessionToken(expiredToken)).toBeNull();
  });

  it("should verify password reset tokens and invalidate them after password hash changes", () => {
    const userObj = {
      id: "u123",
      email: "student@skillnova.edu",
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
    };
    const resetToken = createPasswordResetToken(userObj);

    // Valid reset token verification
    const isValid = verifyPasswordResetToken(resetToken, userObj);
    expect(isValid).toBe(true);

    // Once password changes (new hash), old reset token must be invalidated
    const updatedUserObj = {
      ...userObj,
      passwordHash: "$2a$10$NEW_HASH_AFTER_RESET_987654321000",
    };
    const isInvalidated = verifyPasswordResetToken(resetToken, updatedUserObj);
    expect(isInvalidated).toBe(false);
  });
});
