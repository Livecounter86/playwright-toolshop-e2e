import { BasePage } from './basePage';
import { cellInColumn } from '../helpers/table';

export class AdminOrdersPage extends BasePage {
  get locators() {
    return {
      searchInput: () => this.page.getByTestId('order-search-query'),
      buttonSearch: () => this.page.getByTestId('order-search-submit'),
      tableRows: () => this.page.locator('tbody').getByRole('row'),
      tableRow: (id: string) => this.locators.tableRows().filter({ has: this.locators.buttonEdit(id) }),
      tableCell: (id: string, column: string) => cellInColumn(this.locators.tableRow(id), column),
      buttonEdit: (id: string) => this.page.getByTestId(`order-edit-${id}`),
      paymentMethodInput: () => this.page.getByTestId('payment-method'),
      // Order details: the products table has no data-test, its column is found by the header title
      orderProductNames: () => cellInColumn(this.page.locator('tbody').getByRole('row'), 'Product'),
    };
  }
}
