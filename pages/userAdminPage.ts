import type { Page } from '@playwright/test';

export class UserAdminPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      userAdminNavButton: () => this.page.getByTestId('nav-menu'),
      userAdminPageTitle: () => this.page.getByTestId('page-title'),
      buttonFavorites: () => this.page.getByTestId('nav-favorites'),
      buttonProfile: () => this.page.getByTestId('nav-profile'),
      buttonInvoices: () => this.page.getByTestId('nav-invoices'),
      buttonMessages: () => this.page.getByTestId('nav-messages'),
    };
  }
};
