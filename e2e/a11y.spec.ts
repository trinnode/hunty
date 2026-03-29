import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { injectMockWallet, seedHuntData } from "./helpers/mock-wallet";

test.describe("Accessibility Audits", () => {
  test.beforeEach(async ({ page }) => {
    // Seed some data so pages aren't empty
    await seedHuntData(page);
    // Inject mock wallet for pages that require connection
    await injectMockWallet(page);
  });

  test("Home page should be accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
      console.log("A11y Violations (Home):", JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Dashboard should be accessible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
      console.log("A11y Violations (Dashboard):", JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Create Hunt page should be accessible", async ({ page }) => {
    await page.goto("/hunty");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
      console.log("A11y Violations (Create):", JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Hunt detail page should be accessible", async ({ page }) => {
    await page.goto("/hunt/1");
    // Wait for the "City Secrets" title or similar
    // We'll be more lenient here and wait for any heading if City Secrets fails
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
      console.log("A11y Violations (Hunt Detail):", JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
