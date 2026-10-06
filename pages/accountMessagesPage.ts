import { BasePage } from './basePage';

export class AccountMessagesPage extends BasePage {
  get locators() {
    return {
      messageRows: () => this.page.locator('tbody').getByRole('row'),
      // Rows have no data-test; the message id is only in the href of the Details link
      messageRow: (id: string) => this.locators.messageRows()
        .filter({ has: this.page.locator(`a[href="/account/messages/${id}"]`) }),
      messageStatus: (id: string) => this.locators.messageRow(id).getByRole('cell').nth(2),
      buttonMessageDetails: (id: string) => this.locators.messageRow(id).getByRole('link', { name: 'Details' }),
      // Also matches the message text itself; the unique reply text keeps it to the reply
      replyText: (text: string) => this.page.locator('.card-text').filter({ hasText: text }),
    };
  }
}
