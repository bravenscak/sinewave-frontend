import { test, expect } from '@playwright/test';

test('T1: Login functionality complete flow', async ({ page }) => {
  await page.goto('/login');
  
  await expect(page.locator('.login-form-container')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SINEWAVE' })).toBeVisible();

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'Password');

  await page.click('button[type="submit"]');

  await page.fill('input[name="username"]', '');
  await page.click('button[type="submit"]');
  await expect(page.locator('.error-message')).toHaveText('This field is required');

  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'Password');

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