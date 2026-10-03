import { test, expect } from '../fixtures/pages';

test.describe('Product grid', () => {
  test('home page shows a product grid with a name and a price on each card', async ({ homePage }) => {
    await homePage.navigate();

    const cards = homePage.locators.productCards();
    const names = homePage.locators.productName();
    const prices = homePage.locators.productPrice();

    await expect(cards.first(), 'Product grid should show at least one product').toBeVisible();
    const cardCount = await cards.count();
    await expect(names, 'Each product card should show a name').toHaveCount(cardCount);
    await expect(prices, 'Each product card should show a price').toHaveCount(cardCount);

    for (const name of await names.all()) {
      await expect(name, 'Product card should show a name').not.toBeEmpty();
    }
    for (const price of await prices.all()) {
      await expect(price, 'Product price should be formatted as $0.00').toHaveText(/^\$\d+\.\d{2}$/);
    }
  });
});
