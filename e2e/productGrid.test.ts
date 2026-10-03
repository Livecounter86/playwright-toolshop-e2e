import { test, expect } from '../fixtures/pages';

test.describe('Product grid', () => {
  test('home page shows a product grid with a name and a price on each card', async ({ homePage }) => {
    await homePage.navigate();

    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();
    const cardCount = await homePage.locators.productCards().count();
    await expect(homePage.locators.productName(), 'Each product card should show a name').toHaveCount(cardCount);
    await expect(homePage.locators.productPrice(), 'Each product card should show a price').toHaveCount(cardCount);

    for (const name of await homePage.locators.productName().all()) {
      await expect(name, 'Product card should show a name').not.toBeEmpty();
    }
    for (const price of await homePage.locators.productPrice().all()) {
      await expect(price, 'Product price should be formatted as $0.00').toHaveText(/^\$\d+\.\d{2}$/);
    }
  });
});
