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
      brandCheckbox: (brand: string) => this.page.getByRole('checkbox', { name: brand }),
      priceMaxSlider: () => this.page.getByRole('slider', { name: 'ngx-slider-max', exact: true }),
      noResultsMessage: () => this.page.getByTestId('no-results'),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
