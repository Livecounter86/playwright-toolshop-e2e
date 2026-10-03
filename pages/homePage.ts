import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    return {
      productCards: () => this.page.getByRole('link').filter({ has: this.page.getByTestId('product-price') }),
      productName: () => this.page.getByTestId('product-name'),
      productPrice: () => this.page.getByTestId('product-price'),
      productCardByName: (name: string) => this.page.getByRole('link').filter({
        has: this.page.getByTestId('product-name').getByText(name, { exact: true }),
      }),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
