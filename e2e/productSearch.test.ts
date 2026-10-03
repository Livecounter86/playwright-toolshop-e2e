import { test, expect } from '../fixtures/pages';

test.describe('Product search', () => {
  test.beforeEach(async ({ homePage }) => {
    await Promise.all([
      homePage.page.waitForResponse('**/products'),
      homePage.navigate(),
    ]);
    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();
  });

  test('searching for a product shows only matching products', async ({ homePage }) => {
    const cardsCount = await homePage.locators.productCards().count();
    const productName = await homePage.locators.productName().nth(Math.floor(Math.random() * cardsCount))
      .innerText();
    test.info().annotations.push({ type: 'Search query', description: productName });

    await homePage.locators.searchFieldInput().fill(productName);
    await Promise.all([
      homePage.page.waitForResponse('**/products/search'),
      homePage.locators.buttonSearch().click(),
    ]);
    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product after search').toBeVisible();

    for (const name of await homePage.locators.productName().all()) {
      await expect(name, 'Each product name should contain the search query').toContainText(productName);
    }
  });
});
