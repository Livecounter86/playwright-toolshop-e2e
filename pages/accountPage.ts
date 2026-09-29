import { BasePage } from './basePage';

export class AccountPage extends BasePage {
  get locators() {
    return {
      pageTitle: () => this.page.getByTestId('page-title'),
      buttonFavorites: () => this.page.getByTestId('nav-favorites'),
      buttonProfile: () => this.page.getByTestId('nav-profile'),
      buttonInvoices: () => this.page.getByTestId('nav-invoices'),
      buttonMessages: () => this.page.getByTestId('nav-messages'),
      buttonSignOut: () => this.page.getByTestId('nav-sign-out'),
    };
  }

  async navigate() {
    await this.page.goto('/account');
  }
}
