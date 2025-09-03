import { test, expect } from "@playwright/test";

test.describe("Auth page UI", () => {
    test("has tabs and OAuth buttons", async ({ page }) => {
        await page.goto("/login");

        // Tabs
        const signInTab = page.getByRole("tab", { name: "Sign in" });
        const registerTab = page.getByRole("tab", { name: "Register" });
        await expect(signInTab).toBeVisible();
        await expect(registerTab).toBeVisible();

        // Switch tab
        await registerTab.click();
        await expect(page.getByRole("tabpanel")).toBeVisible();

        // OAuth buttons
        await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /GitHub/ })).toBeVisible();
    });
});


