import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    const productCards = () => this.page.getByRole('link').filter({ has: this.page.getByTestId('product-price') });

    return {
      productCards,
      productName: () => productCards().getByTestId('product-name'),
      productPrice: () => productCards().getByTestId('product-price'),
      productCardByName: (name: string) => productCards().filter({
        has: this.page.getByTestId('product-name').getByText(name, { exact: true }),
      }),
      productCo2Rating: () => this.locators.productCards().getByTestId('co2-rating-badge').locator('.active'),
      sortSelect: () => this.page.getByTestId('sort'),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
