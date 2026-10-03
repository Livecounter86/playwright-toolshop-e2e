import { test, expect } from '../fixtures/pages';

test.describe('Catalog pagination', () => {
  test('page 2 shows different products than page 1', async ({ homePage }) => {
    const names = homePage.locators.productName();

    await homePage.navigate();
    await expect(names.first(), 'Product grid should show at least one product').toBeVisible();
    // The grid is rendered in one go, so the list is complete once its first card is visible.
    const firstPageNames = await names.allTextContents();

    await homePage.locators.buttonPage(2).click();
    await expect(names, 'Page 2 should show a different list of products').not.toHaveText(firstPageNames);

    for (const name of firstPageNames) {
      await expect(homePage.locators.productCardByName(name.trim()), `"${name.trim()}" from page 1 should not be on page 2`).toHaveCount(0);
    }
  });
});
