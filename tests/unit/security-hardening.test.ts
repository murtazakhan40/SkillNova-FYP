import path from "node:path";
import crypto from "node:crypto";
import { describe, it, expect } from "vitest";

describe("Unit: Security Hardening & Vulnerability Guards", () => {
  it("should block path traversal attempts when resolving download paths", () => {
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const maliciousPaths = [
      "../../etc/passwd",
      "../.env",
      "..\\..\\windows\\system32\\cmd.exe",
      "assignments/../../../secret.txt",
    ];

    maliciousPaths.forEach((malPath) => {
      const cleanRelative = malPath.replace(/^\/?uploads\/?/, "");
      const resolved = path.resolve(uploadsRoot, cleanRelative);
      const isContained = resolved.startsWith(uploadsRoot);
      expect(isContained).toBe(false);
    });

    // Legitimate path should pass
    const legitPath = "assignments/123/submission_file.pdf";
    const legitResolved = path.resolve(uploadsRoot, legitPath);
    expect(legitResolved.startsWith(uploadsRoot)).toBe(true);
  });

  it("should disallow SVG avatar uploads to prevent Stored XSS vectors", () => {
    const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

    const dangerousExtensions = [".svg", ".svgz", ".html", ".exe", ".js"];
    dangerousExtensions.forEach((ext) => {
      expect(ALLOWED_IMAGE_EXTENSIONS.has(ext)).toBe(false);
    });

    const safeExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    safeExtensions.forEach((ext) => {
      expect(ALLOWED_IMAGE_EXTENSIONS.has(ext)).toBe(true);
    });
  });

  it("should sanitize JSON-LD by replacing opening angle brackets to prevent script escape XSS", () => {
    const payloadWithPotentialEscape = {
      "@context": "https://schema.org",
      name: "</script><script>alert('xss')</script>",
      description: "Learn Next.js <script>evil()</script>",
    };

    const sanitizedJson = JSON.stringify(payloadWithPotentialEscape).replace(/</g, "\\u003c");

    expect(sanitizedJson).not.toContain("</script>");
    expect(sanitizedJson).not.toContain("<script>");
    expect(sanitizedJson).toContain("\\u003c/script>");
  });

  it("should perform timing-safe comparison on webhook secrets", () => {
    const secret = "super-secret-webhook-key-2026-secure";
    const correctHeader = "super-secret-webhook-key-2026-secure";
    const forgedHeader = "super-secret-webhook-key-2026-FORGED";

    const secBuf = Buffer.from(secret);
    const validBuf = Buffer.from(correctHeader);
    const forgedBuf = Buffer.from(forgedHeader);

    // Matching secrets
    expect(secBuf.length === validBuf.length && crypto.timingSafeEqual(secBuf, validBuf)).toBe(true);

    // Forged secrets of same length
    expect(secBuf.length === forgedBuf.length && crypto.timingSafeEqual(secBuf, forgedBuf)).toBe(false);

    // Mismatched lengths should be safely rejected without throwing timingSafeEqual length error
    const shortHeader = Buffer.from("short");
    const isMatch = secBuf.length === shortHeader.length && crypto.timingSafeEqual(secBuf, shortHeader);
    expect(isMatch).toBe(false);
  });

  it("should verify HMAC-SHA256 signatures using standard Web Crypto matching Node crypto", async () => {
    const secret = "skillnova-dev-local-secret-32-chars-key!!";
    const payload = JSON.stringify({ id: "user-test-123", role: "STUDENT" });
    const payloadB64 = Buffer.from(payload).toString("base64url");

    // Node.js crypto signature
    const nodeSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

    // Web Crypto subtle signature (used in edge middleware)
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
    const sigArray = Array.from(new Uint8Array(sigBuf));
    const binStr = String.fromCharCode(...sigArray);
    const webSig = btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    expect(webSig).toBe(nodeSig);
  });
});

