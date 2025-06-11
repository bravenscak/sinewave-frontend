import { test, expect } from "@playwright/test";

test("T3: Create playlist functionality complete flow", async ({
    page,
    context,
}) => {
    await context.clearCookies();
    await page.goto("/login");
    await page.evaluate(() => {
        if (typeof Storage !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
        }
    });

    await page.waitForLoadState("networkidle");

    await page.fill('input[name="username"]', "integrationTest");
    await page.fill('input[name="password"]', "12345678");

    const responsePromise = page.waitForResponse("**/api/auth/login");
    await page.click('button[type="submit"]');
    const response = await responsePromise;

    expect(response.status()).toBe(200);

    await page.waitForURL(
        (url) => url.pathname === "/dashboard" || url.pathname === "/admin",
        { timeout: 5000 }
    );

    await page.waitForSelector('button:has-text("Create New Playlist")', {
        state: "visible",
    });
    await page.click('button:has-text("Create New Playlist")');

    await expect(page.locator(".create-playlist-container")).toBeVisible();
    await expect(page.locator(".create-playlist-form-container")).toBeVisible();
    await expect(page.locator('h2:has-text("Create playlist")')).toBeVisible();

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="isPublic"]')).toBeVisible();
    await expect(
        page.locator('label:has-text("Make this playlist public")')
    ).toBeVisible();

    await expect(page.locator(".cancel-button")).toBeVisible();
    await expect(page.locator(".create-button")).toBeVisible();

    await page.click(".create-button");

    await page.waitForTimeout(100);
    await expect(
        page.locator('.error-message:has-text("Playlist name is required")')
    ).toBeVisible();

    const playlistName = `Test Playlist ${Date.now()}`;
    await page.fill('input[name="name"]', playlistName);

    await page.check('input[name="isPublic"]');

    await expect(page.locator('input[name="isPublic"]')).toBeChecked();

    const createPlaylistPromise = page.waitForResponse(
        (response) =>
            response.url().includes("/api/playlists") &&
            response.request().method() === "POST" &&
            response.status() === 201
    );

    await page.click(".create-button");

    const createResponse = await createPlaylistPromise;
    expect(createResponse.status()).toBe(201);

    const request = createResponse.request();
    const authHeader = request.headers()["authorization"];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toMatch(/^Bearer .+/);

    const requestBody = JSON.parse(request.postData());
    expect(requestBody.name).toBe(playlistName);
    expect(requestBody.isPublic).toBe(true);

    await page.waitForTimeout(2000);
    await expect(page.locator(".create-playlist-container")).not.toBeVisible();

    await expect(
        page.locator(`.list-group-item:has-text("${playlistName}")`)
    ).toBeVisible();

    await page.click('button:has-text("Create New Playlist")');
    await expect(page.locator(".create-playlist-container")).toBeVisible();

    const privatePlaylistName = `Private Playlist ${Date.now()}`;
    await page.fill('input[name="name"]', privatePlaylistName);

    await expect(page.locator('input[name="isPublic"]')).not.toBeChecked();

    const createPrivatePlaylistPromise = page.waitForResponse(
        (response) =>
            response.url().includes("/api/playlists") &&
            response.request().method() === "POST" &&
            response.status() === 201
    );

    await page.click(".create-button");
    await createPrivatePlaylistPromise;

    await page.waitForTimeout(2000);
    await expect(page.locator(".create-playlist-container")).not.toBeVisible();

    const privatePlaylistItem = page.locator(
        `.list-group-item:has-text("${privatePlaylistName}")`
    );
    await expect(privatePlaylistItem).toBeVisible();
    await expect(
        privatePlaylistItem.locator('.badge:has-text("Private")')
    ).toBeVisible();

    await page.click('button:has-text("Create New Playlist")');
    await expect(page.locator(".create-playlist-container")).toBeVisible();

    await page.fill('input[name="name"]', "Cancel Test Playlist");

    await page.click(".cancel-button");

    await expect(page.locator(".create-playlist-container")).not.toBeVisible();

    await expect(
        page.locator('.list-group-item:has-text("Cancel Test Playlist")')
    ).not.toBeVisible();

    await page.click('button:has-text("Create New Playlist")');
    await page.fill('input[name="name"]', `Loading Test ${Date.now()}`);

    await page.route("**/api/playlists", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
    });

    await page.click(".create-button");

    await expect(page.locator('input[name="name"]')).toBeDisabled();
    await expect(page.locator('input[name="isPublic"]')).toBeDisabled();
    await expect(page.locator(".cancel-button")).toBeDisabled();
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible();

    await page.waitForTimeout(1000);

    await page.unroute("**/api/playlists");
});
