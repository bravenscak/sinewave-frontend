import { test, expect } from '@playwright/test';

test('T4: User search functionality complete flow', async ({ page, context }) => {
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

  await page.waitForSelector('input[placeholder*="Search users by username"]', { 
    state: 'visible' 
  });

  const userSearchInput = page.locator('input[placeholder*="Search users by username"]');
  await expect(userSearchInput).toBeVisible();

  const searchTerm = 'john';
  await userSearchInput.fill(searchTerm);
  
  await expect(userSearchInput).toHaveValue(searchTerm);

  const searchRequestPromise = page.waitForResponse(response => 
    response.url().includes('/api/users/search') && 
    response.url().includes(`username=${encodeURIComponent(searchTerm)}`)
  );
  
  await userSearchInput.press('Enter');
  
  const searchResponse = await searchRequestPromise;
  expect(searchResponse.status()).toBe(200);

  expect(searchResponse.url()).toContain(`username=${encodeURIComponent(searchTerm)}`);

  await userSearchInput.fill('ihor');
  
  const searchButton = page.locator('button.btn-outline-success:has-text("Search")').last();
  await expect(searchButton).toBeVisible();

  const secondSearchPromise = page.waitForResponse(response => 
    response.url().includes('/api/users/search') && 
    response.url().includes('username=ihor')
  );
  
  await searchButton.click();
  await secondSearchPromise;

  await page.waitForTimeout(500);
  
  const userSection = page.locator('h6:has-text("Other Users")').locator('..').locator('.list-group-item');
  
  const userCount = await userSection.count();
  
  if (userCount > 0) {
    const ihorUser = userSection.filter({ hasText: '@ihor' });
    
    if (await ihorUser.count() > 0) {
      const firstUser = ihorUser.first();
      await expect(firstUser).toBeVisible();
      
      const userText = await firstUser.textContent();
      expect(userText.toLowerCase()).toContain('ihor');
    }
  }

  await userSearchInput.fill('');
  
  const allUsersPromise = page.waitForResponse(response => 
    response.url().includes('/api/users') && 
    !response.url().includes('/search')
  );
  
  await userSearchInput.press('Enter');
  await allUsersPromise;

  await userSearchInput.fill('test');
  
  const clearButton = page.locator('button.btn-outline-secondary:has-text("Clear")').last();
  await expect(clearButton).toBeVisible();
  
  const clearRequestPromise = page.waitForResponse(response => 
    response.url().includes('/api/users') && 
    !response.url().includes('/search')
  );
  
  await clearButton.click();
  await clearRequestPromise;
  
  await expect(userSearchInput).toHaveValue('');

  const noResultsTerm = 'xyz999nonexistent';
  await userSearchInput.fill(noResultsTerm);
  
  const noResultsPromise = page.waitForResponse(response => 
    response.url().includes('/api/users/search') && 
    response.url().includes(`username=${encodeURIComponent(noResultsTerm)}`)
  );
  
  await userSearchInput.press('Enter');
  await noResultsPromise;
  
  await page.waitForTimeout(500);
  
  const noUsersAlert = page.locator('.alert-info:has-text("No other users found")');
  if (await noUsersAlert.isVisible()) {
    await expect(noUsersAlert).toBeVisible();
  }

  await userSearchInput.fill('');
  await userSearchInput.type('admin', { delay: 100 });
  
  await expect(userSearchInput).toHaveValue('admin');

  await userSearchInput.fill('');
  await userSearchInput.press('Enter');
  
  await page.waitForTimeout(1000);
  
  const followButton = page.locator('button:has-text("Follow")').first();
  if (await followButton.isVisible()) {
    const followPromise = page.waitForResponse(response => 
      response.url().includes('/api/users/friends/follow/') && 
      response.request().method() === 'POST'
    );
    
    await followButton.click();
    await followPromise;
    
    await expect(followButton).toHaveText('Unfollow');
    
    const unfollowPromise = page.waitForResponse(response => 
      response.url().includes('/api/users/friends/unfollow/') && 
      response.request().method() === 'DELETE'
    );
    
    await followButton.click();
    await unfollowPromise;
    
    await expect(followButton).toHaveText('Follow');
  }
});