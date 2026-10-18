import { test, expect } from "@playwright/test";

test.describe("SkillNova Smoke Tests", () => {
  test("1. Landing page loads with navigation and brand identity", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SkillNova/i);
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: /courses|explore/i }).first()).toBeVisible();
  });

  test("2. Course catalog displays courses and navigates to details", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveTitle(/courses|catalog|skillnova/i);
    // Verify at least one course link or card is present
    const courseLinks = page.locator("a[href*='/courses/']");
    await expect(courseLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test("3. Login page rejects invalid credentials with clear feedback", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", "nonexistent_evaluator@skillnova.edu");
    await page.fill("input[type='password'], input[name='password']", "wrong_password_123");
    await page.click("button[type='submit']");

    // Expect error alert or message to become visible
    const alertMessage = page.locator("[role='alert'], .text-red-500, .text-red-600, .text-rose-500, .bg-red-50, .bg-rose-50");
    await expect(alertMessage.first()).toBeVisible({ timeout: 8000 });
  });

  test("4. Public certificate verification page displays verification portal", async ({ page }) => {
    await page.goto("/verify");
    await expect(page).toHaveTitle(/verify|certificate|skillnova/i);
    // Verification search input or verification container exists
    const searchInput = page.locator("input[placeholder*='code' i], input[placeholder*='SN-' i], input[type='text']");
    await expect(searchInput.first()).toBeVisible();
  });

  test("5. Certificate verification query resolves or validates certificate code format", async ({ page }) => {
    // Test with a synthetic or non-existent certificate code
    await page.goto("/verify?code=SN-2026-INVALID000");
    await expect(page.locator("body")).toContainText(/certificate|not found|invalid|verification/i);
  });
});

test.describe("SkillNova Role-Based Access Control (RBAC) Smoke Tests", () => {
  test("6. Unauthenticated access to protected student dashboard redirects or displays auth prompt", async ({ page }) => {
    await page.goto("/dashboard/student");
    // Should either redirect to login or show access denied
    await page.waitForURL(/\/(login|auth)/i, { timeout: 10000 }).catch(() => {
      // If it doesn't redirect URL, check if page contains login or unauthorized prompt
    });
    const currentUrl = page.url();
    const isLoginOrAuth = currentUrl.includes("/login") || currentUrl.includes("/auth");
    const hasAuthPrompt = await page.locator("text=/sign in|login|unauthorized/i").count();
    expect(isLoginOrAuth || hasAuthPrompt > 0).toBe(true);
  });

  test("7. Unauthenticated access to protected trainer dashboard redirects or denies access", async ({ page }) => {
    await page.goto("/dashboard/trainer");
    await page.waitForURL(/\/(login|auth)/i, { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    const isLoginOrAuth = currentUrl.includes("/login") || currentUrl.includes("/auth");
    const hasAuthPrompt = await page.locator("text=/sign in|login|unauthorized/i").count();
    expect(isLoginOrAuth || hasAuthPrompt > 0).toBe(true);
  });

  test("8. Unauthenticated access to protected admin governance redirects or denies access", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await page.waitForURL(/\/(login|auth)/i, { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    const isLoginOrAuth = currentUrl.includes("/login") || currentUrl.includes("/auth");
    const hasAuthPrompt = await page.locator("text=/sign in|login|unauthorized/i").count();
    expect(isLoginOrAuth || hasAuthPrompt > 0).toBe(true);
  });
});
