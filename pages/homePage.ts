import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    return {
      productCards: () => this.page.getByTestId(/^product-[0-9A-HJKMNP-TV-Z]{26}$/),
      searchFieldInput: () => this.page.getByTestId('search-query'),
      productName: () => this.locators.productCards().getByTestId('product-name'),
      buttonSearch: () => this.page.getByTestId('search-submit'),
      searchCompleted: () => this.page.getByTestId('search_completed'),
      noResultsMessage: () => this.page.getByTestId('no-results'),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }

  async searchFor(query: string) {
    await this.locators.searchFieldInput().fill(query);
    await this.locators.buttonSearch().click();
  }
}
