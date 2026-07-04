import { test, expect } from '@playwright/test';

test('unauthenticated users are redirected to login', async ({ page }) => {
  // Try to access a protected admin route
  await page.goto('/');
  
  // The page should redirect us to the login page
  await expect(page).toHaveURL(/.*\/login/);
  
  // Ensure the login form is visible
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
