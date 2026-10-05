import { test, expect } from '../fixtures/pages';
import { loginViaApi } from '../helpers/auth';
import { users } from '../helpers/users';

test.describe('Client communication via messages', () => {
  test('Admin answers client message and client sees the answer', async ({ homePage, adminDashboardPage, contactPage, accountPage, request, page }) => {
    await test.step('Client sends a message', async () => {
      await loginViaApi(page, request, users.customer.email, users.customer.password);
      await homePage.header.locators.buttonContact().click();
      await expect(contactPage.locators.subjectSelector(), 'Subject selector should be displayed').toBeVisible();
      const subjectCount = await contactPage.locators.subjectSelector().locator('option').count();
      await contactPage.locators.subjectSelector().selectOption({ index: 1 + Math.floor(Math.random() * (subjectCount - 1)) });
      const subject = await contactPage.locators.subjectSelector().inputValue();
      test.info().annotations.push({ type: 'Subject', description: subject });
      await contactPage.locators.messageInput().fill('Test message from client. We need to figure out does the admin answer this message and does the client see the answer.');
      await contactPage.locators.buttonSend().click();
      await expect(contactPage.locators.messageSentConfirmation(), 'Message sent confirmation should be displayed').toBeVisible();
    });
    await test.step('Admin answers the message', async () => {

    });
  });
});
