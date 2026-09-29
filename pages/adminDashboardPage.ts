import type { Page } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      pageTitle: () => this.page.getByTestId('page-title'),
      userMenu: () => this.page.getByTestId('nav-menu'),
      invoiceTable: () => this.page.getByRole('table'),
      columnHeaders: () => this.page.getByRole('columnheader'),
      tableRows: () => this.locators.invoiceTable().locator('tbody').getByRole('row'),
    };
  }
}
