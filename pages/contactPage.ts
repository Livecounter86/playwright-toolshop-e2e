import { BasePage } from './basePage';

export class ContactPage extends BasePage {
  get locators() {
    return {
      subjectSelector: () => this.page.getByTestId('subject'),
      messageInput: () => this.page.getByTestId('message'),
      buttonSend: () => this.page.getByTestId('contact-submit'),
      messageSentConfirmation: () => this.page.getByRole('alert', { name: ' Thanks for your message! We will contact you shortly. ' }),
    };
  }
}
