import { test, expect } from '../fixtures/pages';

test.describe('Catalog filters', () => {
  test('brand filter shows only products of the selected brand', async ({ homePage, productPage, page }) => {
    const brand = 'ForgeFlex Tools';
    const names = homePage.locators.productName();

    await homePage.navigate();
    await expect(names.first(), 'Product grid should show at least one product').toBeVisible();
    // The grid is rendered in one go, so the list is complete once its first card is visible.
    const unfilteredNames = await names.allTextContents();

    await homePage.locators.brandCheckbox(brand).check();
    await expect(names, 'Grid should switch to the products of the selected brand').not.toHaveText(unfilteredNames);
    // The grid has already switched, so this list is the filtered result.
    const brandNames = await names.allTextContents();

    // The grid does not show brands, so each product page is opened to read its brand.
    // Going back resets the filter, so it is selected again for every product.
    for (const name of brandNames) {
      await homePage.locators.productCardByName(name).click();
      await expect(productPage.locators.brandBadge(), `Product "${name}" should belong to ${brand}`).toHaveText(brand);

      await page.goBack();
      // Wait for the page to be rendered, otherwise the click on the checkbox can be lost.
      await expect(names, 'Unfiltered grid should be shown after going back').toHaveText(unfilteredNames);
      await homePage.locators.brandCheckbox(brand).check();
      await expect(names, 'Filtered grid should be shown again').toHaveText(brandNames);
    }
  });

  test('price range without products shows no products', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();

    // Home moves the upper handle to the start of the scale, so the range becomes $0-$1, which no product fits.
    // One key press means one request: several quick presses can return answers out of order
    // and the grid then shows the result of an intermediate range.
    await homePage.locators.priceMaxSlider().press('Home');

    await expect(homePage.locators.noResultsMessage(), 'Message about missing products should be shown').toHaveText('There are no products found.');
    await expect(homePage.locators.productCards(), 'No product cards should be shown').toHaveCount(0);
  });
});
