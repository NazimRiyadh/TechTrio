const { test, expect } = require('@playwright/test');

test.describe('TechTrio E-to-E UI Automation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3000');
  });

  test('User can successfully search via Pinecone and add to cart', async ({ page }) => {
    // 1. Perform semantic search
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('winter cold weather gear');
    await searchInput.press('Enter');

    // 2. Verify search results load (checking for vector matches)
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCountGreaterThan(0);
    
    // Check that at least one item contains related keywords (e.g., Jacket)
    const firstProductTitle = await productCards.first().locator('.product-title').innerText();
    expect(firstProductTitle.toLowerCase()).toMatch(/(jacket|coat|sweater)/);

    // 3. Add to cart
    await productCards.first().locator('button:has-text("Add to Cart")').click();

    // 4. Verify Cart Badge updates
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('1');

    // 5. Navigate to Cart and verify persistence
    await page.locator('a[href="/cart"]').click();
    await expect(page).toHaveURL(/.*cart/);
    await expect(page.locator('.cart-item-title')).toHaveText(firstProductTitle);
  });

  test('Redis Rate Limiter blocks excessive login attempts', async ({ request }) => {
    // API-level test integrated into Playwright framework
    const loginUrl = 'http://localhost:4000/api/v1/auth/login';
    const payload = { data: { email: 'test@techtrio.com', password: 'wrong' } };

    // Send 10 rapid requests to trigger Redis Limiter
    for (let i = 0; i < 10; i++) {
      await request.post(loginUrl, payload);
    }

    // The 11th request should be blocked
    const blockedResponse = await request.post(loginUrl, payload);
    expect(blockedResponse.status()).toBe(429);
    
    const responseBody = await blockedResponse.json();
    expect(responseBody.message).toContain('Too many login attempts');
  });

});
