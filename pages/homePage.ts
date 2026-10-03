import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    return {
      productCards: () => this.page.getByTestId(/^product-[0-9A-HJKMNP-TV-Z]{26}$/),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
