import type { Page } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      adminDashboardPageTitle: () => this.page.getByTestId('page-title'),
      userAdminNavButton: () => this.page.getByTestId('nav-menu'),
      invoiceTable: () => this.page.getByRole('table'),
      columnHeaders: () => this.page.getByRole('columnheader'),
      tableRow: () => this.locators.invoiceTable().getByRole('row'),
    };
  }
}
