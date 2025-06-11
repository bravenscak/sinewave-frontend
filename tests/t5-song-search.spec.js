import { test, expect } from '@playwright/test';

test('T5: Song search functionality complete flow', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/login');
  await page.evaluate(() => {
    if (typeof Storage !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  await page.waitForLoadState('networkidle');

  await page.fill('input[name="username"]', 'integrationTest');
  await page.fill('input[name="password"]', '12345678');

  const loginResponse = page.waitForResponse('**/api/auth/login');
  await page.click('button[type="submit"]');
  await loginResponse;

  await page.waitForURL(url => 
    url.pathname === '/dashboard' || url.pathname === '/admin', 
    { timeout: 5000 }
  );

  await page.waitForSelector('input[placeholder*="Search songs by title"]', { 
    state: 'visible' 
  });

  const songSearchInput = page.locator('input[placeholder*="Search songs by title"]');
  await expect(songSearchInput).toBeVisible();

  await songSearchInput.fill('so');
  
  const searchRequestPromise = page.waitForResponse(response => 
    response.url().includes('/api/songs/search') && 
    response.url().includes('title=so')
  );
  
  await songSearchInput.press('Enter');
  
  const searchResponse = await searchRequestPromise;
  expect(searchResponse.status()).toBe(200);

  await page.waitForTimeout(3000);

  await songSearchInput.fill('ti');
  
  const searchButton = page.locator('button.btn-success:has-text("Search")');
  await expect(searchButton).toBeVisible();

  const secondSearchPromise = page.waitForResponse(response => 
    response.url().includes('/api/songs/search') && 
    response.url().includes('title=ti')
  );
  
  await searchButton.click();
  await secondSearchPromise;

  await page.waitForTimeout(1000);

  await songSearchInput.fill('test');
  
  const clearButton = page.locator('button.btn-outline-secondary:has-text("Clear")');
  await expect(clearButton).toBeVisible();
  
  await clearButton.click();
  
  await expect(songSearchInput).toHaveValue('');

  const noResultsTerm = 'xyz999nonexistent';
  await songSearchInput.fill(noResultsTerm);
  
  const noResultsPromise = page.waitForResponse(response => 
    response.url().includes('/api/songs/search') && 
    response.url().includes(`title=${encodeURIComponent(noResultsTerm)}`)
  );
  
  await songSearchInput.press('Enter');
  await noResultsPromise;
  
  await page.waitForTimeout(3000);

  await songSearchInput.fill('');
  await songSearchInput.type('all', { delay: 100 });
  
  await expect(songSearchInput).toHaveValue('all');

  await songSearchInput.fill('');
  await songSearchInput.press('Enter');
  
  await page.waitForTimeout(3000);
  
  const tableHeaders = page.locator('table thead th');
  await expect(tableHeaders.nth(0)).toHaveText('Song');
  await expect(tableHeaders.nth(1)).toHaveText('Artist');
  await expect(tableHeaders.nth(2)).toHaveText('Genre');
  await expect(tableHeaders.nth(3)).toHaveText('Duration');
  await expect(tableHeaders.nth(4)).toHaveText('Actions');
});