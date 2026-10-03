import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    return {
      productCards: () => this.page.getByTestId(/^product-(?!name$|price$)/),
      productName: () => this.locators.productCards().getByTestId('product-name'),
      productPrice: () => this.locators.productCards().getByTestId('product-price'),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
