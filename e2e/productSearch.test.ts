import { test, expect } from '../fixtures/pages';
import { faker } from '@faker-js/faker';

test.describe('Product search', () => {
  test.beforeEach(async ({ homePage }) => {
    await Promise.all([
      homePage.page.waitForResponse('**/products'),
      homePage.navigate(),
    ]);
    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();
  });

  test('searching for a product shows only matching products', async ({ homePage }) => {
    // Site bug: search can't find a product by its full name if the name has a common word like "with"
    // ("Claw Hammer with Shock Reduction Grip") or a word shorter than 3 characters ("Tape Measure 5m").
    // MySQL full-text search ignores such words, but the API still requires every word to match.
    // Such names are skipped, otherwise the test fails at random.
    const unsearchableName = /\b(with|for|from|the|\w{1,2})\b/i;
    const productNames = (await homePage.locators.productName().allInnerTexts())
      .filter(name => !unsearchableName.test(name));
    const productName = faker.helpers.arrayElement(productNames);
    test.info().annotations.push({ type: 'Search query', description: productName });

    await homePage.searchFor(productName);
    await expect(homePage.locators.searchCompleted(), 'Search completed message should be shown').toBeVisible();
    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product after search').toBeVisible();

    for (const name of await homePage.locators.productName().all()) {
      await expect(name, 'Each product name should contain the search query').toContainText(productName);
    }
  });

  test('searching for a missing product shows a no results message', async ({ homePage }) => {
    // Random letters, so no product name contains them
    const query = faker.string.alpha(16);
    test.info().annotations.push({ type: 'Search query', description: query });

    await homePage.searchFor(query);
    await expect(homePage.locators.noResultsMessage(), 'No results message should be shown').toHaveText('There are no products found.');
    await expect(homePage.locators.productCards(), 'Product grid should be empty').toHaveCount(0);
  });
});
