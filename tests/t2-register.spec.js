import { test, expect } from '@playwright/test';

test('T2: Register functionality complete flow', async ({ browser  }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/register');
  
  await page.waitForLoadState('networkidle');
  
  await expect(page.locator('.register-form-container')).toBeVisible();

  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(100);
  
  await expect(page.locator('input[name="firstName"] + .error-message')).toHaveText('This field is required');
  await expect(page.locator('input[name="lastName"] + .error-message')).toHaveText('This field is required');
  await expect(page.locator('input[name="username"] + .error-message')).toHaveText('This field is required');
  await expect(page.locator('input[name="email"] + .error-message')).toHaveText('This field is required');
  await expect(page.locator('input[name="password"] + .error-message')).toHaveText('This field is required');

  await page.fill('input[name="email"]', 'invalid-email');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(100);
  await expect(page.locator('input[name="email"] + .error-message')).toHaveText('Please enter a valid email address');

  const timestamp = Date.now();
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="username"]', `testuser_${timestamp}`); 
  await page.fill('input[name="email"]', `test_${timestamp}@example.com`);
  await page.fill('input[name="password"]', 'testpassword123');

  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/api/auth/register') && response.status() === 201
  );
  
  await page.click('button[type="submit"]');
  
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  
  const responseBody = await response.json();
  expect(responseBody.token).toBeDefined();
  expect(responseBody.user).toBeDefined();

  await expect(page.locator('.registration-success-message')).toHaveText('Registration successful! Redirecting...');
  
  await page.waitForURL(url => 
    url.pathname === '/dashboard' || url.pathname === '/admin', 
    { timeout: 5000 }
  );
  
  const currentUrl = page.url();
  expect(currentUrl).toMatch(/\/(dashboard|admin)$/);

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  
  await expect(page.locator('.register-form-container')).toBeVisible();
  
  await expect(page.getByText('Already have an account?')).toBeVisible();
  
  const loginLink = page.getByRole('link', { name: 'Login here' });
  await expect(loginLink).toBeVisible();
  await expect(loginLink).toHaveAttribute('href', '/login');
});