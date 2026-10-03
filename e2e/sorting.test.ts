import { test, expect } from '../fixtures/pages';

const toPrice = (text: string) => Number(text.replace(/[$,]/g, ''));

const compareBy = {
  name: (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' }),
  price: (a: string, b: string) => toPrice(a) - toPrice(b),
  co2: (a: string, b: string) => a.localeCompare(b),
};

const sortOptions = [
  { label: 'Name (A - Z)', column: 'name', direction: 'asc' },
  { label: 'Name (Z - A)', column: 'name', direction: 'desc' },
  { label: 'Price (High - Low)', column: 'price', direction: 'desc' },
  { label: 'Price (Low - High)', column: 'price', direction: 'asc' },
  { label: 'CO₂ Rating (A - E)', column: 'co2', direction: 'asc' },
  { label: 'CO₂ Rating (E - A)', column: 'co2', direction: 'desc' },
] as const;

test.describe('Catalog sorting', () => {
  for (const { label, column, direction } of sortOptions) {
    test(`sorting by "${label}" orders the products`, async ({ homePage }) => {
      const columnValues = {
        name: homePage.locators.productName(),
        price: homePage.locators.productPrice(),
        co2: homePage.locators.productCo2Rating(),
      }[column];

      await homePage.navigate();
      await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();
      // The grid is rendered in one go, so the list is complete once its first card is visible.
      const defaultNames = await homePage.locators.productName().allTextContents();

      await homePage.locators.sortSelect().selectOption({ label });
      await expect(homePage.locators.productName(), 'Grid should show the products in a new order').not.toHaveText(defaultNames);

      // Products with an equal value (for example the same CO₂ rating) may come in any order,
      // so the check is that the values are sorted, not that the products are in a given order.
      await expect.poll(async () => {
        const values = (await columnValues.allTextContents()).map(value => value.trim());
        const expected = [...values].sort((a, b) => direction === 'asc' ? compareBy[column](a, b) : compareBy[column](b, a));
        return { isSorted: values.join(' | ') === expected.join(' | '), values };
      }, { message: `Products should be sorted by ${column} (${direction})` }).toMatchObject({ isSorted: true });
    });
  }
});
