import { test, expect } from '@playwright/test';

test('T1: Login functionality complete flow', async ({ page }) => {
  await page.goto('/login');
  
  await expect(page.locator('.login-form-container')).toBeVisible();

  await page.fill('input[name="username"]', '');
  await page.fill('input[name="password"]', '');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('input[name="username"] + .error-message')).toHaveText('This field is required');
  await expect(page.locator('input[name="password"] + .error-message')).toHaveText('This field is required');
  
  await expect(page.locator('.error-message')).toHaveCount(2);
  await expect(page.locator('.error-message').first()).toHaveText('This field is required');

  await page.fill('input[name="username"]', 'integrationTest');
  await page.fill('input[name="password"]', '12345678');

  const responsePromise = page.waitForResponse('**/api/auth/login');
  await page.click('button[type="submit"]');
  const response = await responsePromise;
  
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.token).toBeDefined();
  expect(responseBody.user).toBeDefined();

  await expect(page.locator('.login-success-message')).toHaveText('Login successful!');
  
  await page.waitForURL('**/dashboard');
  await expect(page).toHaveURL(/\/(dashboard|admin)/);
});