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
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
