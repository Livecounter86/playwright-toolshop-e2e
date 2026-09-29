import { BasePage } from './basePage';

export class AdminDashboardPage extends BasePage {
  get locators() {
    return {
      pageTitle: () => this.page.getByTestId('page-title'),
      invoiceTable: () => this.page.getByRole('table'),
      columnHeaders: () => this.page.getByRole('columnheader'),
      tableRows: () => this.locators.invoiceTable().locator('tbody').getByRole('row'),
    };
  }
}
