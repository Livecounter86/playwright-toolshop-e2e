import { BasePage } from './basePage';

export class ProductPage extends BasePage {
  get locators() {
    return {
      productName: () => this.page.getByTestId('product-name'),
      buttonAddToCart: () => this.page.getByTestId('add-to-cart'),
    };
  }
}
