import { BasePage } from './basePage';
import { cellInColumn } from '../helpers/table';

export class AccountMessagesPage extends BasePage {
  get locators() {
    return {
      tableRows: () => this.page.locator('tbody').getByRole('row'),
      // Rows have no data-test; the message id is only in the href of the Details link
      tableRow: (id: string) => this.locators.tableRows()
        .filter({ has: this.page.locator(`a[href="/account/messages/${id}"]`) }),
      tableCell: (id: string, column: string) => cellInColumn(this.locators.tableRow(id), column),
      buttonMessageDetails: (id: string) => this.locators.tableRow(id).getByRole('link', { name: 'Details' }),
      // Also matches the message text itself; the unique reply text keeps it to the reply
      replyText: (text: string) => this.page.locator('.card-text').filter({ hasText: text }),
    };
  }
}
