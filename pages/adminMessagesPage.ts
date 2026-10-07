import { BasePage } from './basePage';
import { cellInColumn } from '../helpers/table';

export class AdminMessagesPage extends BasePage {
  get locators() {
    return {
      tableRows: () => this.page.locator('tbody').getByRole('row'),
      tableRow: (id: string) => this.locators.tableRows().filter({ has: this.locators.buttonDetails(id) }),
      tableCell: (id: string, column: string) => cellInColumn(this.locators.tableRow(id), column),
      buttonDetails: (id: string) => this.page.getByTestId(`message-details-${id}`),
      replyInput: () => this.page.getByTestId('message'),
      buttonReply: () => this.page.getByTestId('reply-submit'),
      // The message and the replies are look-alike cards without data-test;
      // only the message card holds the status select, and that is what tells them apart
      initMessageText: () => this.page.locator('.card').filter({ has: this.page.getByTestId('status') }).locator('.card-text'),
      replyText: (text: string) => this.page.locator('.card').filter({ hasNot: this.page.getByTestId('status') })
        .locator('.card-text').filter({ hasText: text }),
      conversationStatus: () => this.page.getByTestId('status'),
    };
  }
}
