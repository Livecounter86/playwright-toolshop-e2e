import type { Page } from '@playwright/test';

export class AccountPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      userMenu: () => this.page.getByTestId('nav-menu'),
      pageTitle: () => this.page.getByTestId('page-title'),
      buttonFavorites: () => this.page.getByTestId('nav-favorites'),
      buttonProfile: () => this.page.getByTestId('nav-profile'),
      buttonInvoices: () => this.page.getByTestId('nav-invoices'),
      buttonMessages: () => this.page.getByTestId('nav-messages'),
    };
  }
};
