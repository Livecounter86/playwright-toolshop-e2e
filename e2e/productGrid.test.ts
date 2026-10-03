import { test, expect } from '../fixtures/pages';

test.describe('Product grid', () => {
  test('home page shows a product grid with a name and a price on each card', async ({ homePage }) => {
    await homePage.navigate();

    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();

    for (const card of await homePage.locators.productCards().all()) {
      await expect(card.getByTestId('product-name'), 'Product card should show a name').not.toBeEmpty();
      await expect(card.getByTestId('product-price'), 'Product price should be formatted as $0.00').toHaveText(/^\$\d+\.\d{2}$/);
    }
  });
});
