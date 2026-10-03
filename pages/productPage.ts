import { BasePage } from './basePage';

export class ProductPage extends BasePage {
  get locators() {
    return {
      productName: () => this.page.getByTestId('product-name'),
      brandBadge: () => this.page.getByLabel('brand', { exact: true }),
    };
  }
}
