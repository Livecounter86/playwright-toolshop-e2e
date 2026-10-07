import { BasePage } from './basePage';

export class ContactPage extends BasePage {
  get locators() {
    return {
      subjectSelector: () => this.page.getByTestId('subject'),
      messageInput: () => this.page.getByTestId('message'),
      buttonSend: () => this.page.getByTestId('contact-submit'),
      messageSentConfirmation: () => this.page.getByRole('alert').filter({ hasText: ' Thanks for your message! We will contact you shortly. ' }),
      firstNameInput: () => this.page.getByTestId('first-name'),
      lastNameInput: () => this.page.getByTestId('last-name'),
      emailInput: () => this.page.getByTestId('email'),
    };
  }

  async selectRandomSubject() {
    await this.locators.subjectSelector().waitFor();
    const subjects = await this.locators.subjectSelector().locator('option:not([disabled])').allTextContents();
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const [subjectValue] = await this.locators.subjectSelector().selectOption({ label: randomSubject });
    return subjectValue;
  }
}
