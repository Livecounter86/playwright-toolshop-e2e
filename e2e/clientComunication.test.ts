import { test, expect } from '../fixtures/pages';

test.describe('Client communication via messages', () => {
  test.use({ authUser: 'customer' });
  test.skip(({ baseURL }) => !baseURL?.startsWith('http://localhost'), 'Admin replies change data: run only against Toolshop in Docker');

  test('Admin answers client message and client sees the answer', async ({ homePage, accountMessagesPage, contactPage, signInAsAdmin }) => {
    let messageId: string;
    const clientMessage = 'Test message from client. We need to figure out does the admin answer this message and does the client see the answer.';
    // Unique per run: replies from earlier runs stay in the database and must not satisfy the checks
    const replyText = `Admin reply ${Date.now()}`;

    await test.step('Client sends a message', async () => {
      await homePage.navigate();
      await homePage.header.locators.buttonContact().click();
      await expect(contactPage.locators.subjectSelector(), 'Subject selector should be displayed').toBeVisible();
      const subjectCount = await contactPage.locators.subjectSelector().locator('option').count();
      // Option 0 is the "Select a subject" placeholder, so pick from 1
      await contactPage.locators.subjectSelector().selectOption({ index: 1 + Math.floor(Math.random() * (subjectCount - 1)) });
      const subject = await contactPage.locators.subjectSelector().inputValue();
      test.info().annotations.push({ type: 'Subject', description: subject });
      await contactPage.locators.messageInput().fill(clientMessage);
      // The admin list shows no message text, so the id from the response is the only way to find this message there
      const [response] = await Promise.all([
        contactPage.page.waitForResponse('**/messages'),
        contactPage.locators.buttonSend().click(),
      ]);
      await expect(contactPage.locators.messageSentConfirmation(), 'Message sent confirmation should be displayed').toBeVisible();
      const { id } = await response.json();
      messageId = id as string;
    });
    await test.step('Admin answers the message', async () => {
      const admin = await signInAsAdmin();
      await admin.homePage.header.locators.userMenu().click();
      await admin.homePage.header.locators.buttonMessages().click();
      await admin.adminMessagesPage.locators.buttonDetails(messageId).click();
      // Wait for the details to load: the reply form is rebuilt when they arrive, and an earlier reply is never sent
      await expect(admin.adminMessagesPage.locators.initMessageText(), 'Admin should see the initial message from client').toHaveText(clientMessage);
      await admin.adminMessagesPage.locators.replyInput().fill(replyText);
      await admin.adminMessagesPage.locators.buttonReply().click();
      // The reply is shown only after the server saved it, so the customer step below sees it
      await expect(admin.adminMessagesPage.locators.replyText(replyText), 'Admin should see the reply text after sending it').toBeVisible();
      await expect(admin.adminMessagesPage.locators.conversationStatus(), 'Message status should be "In Progress"').toHaveValue('IN_PROGRESS');
    });
    await test.step('Client sees the answer', async () => {
      // Open the list only now: it doesn't refresh by itself, a copy opened earlier would keep the old status
      await contactPage.header.locators.userMenu().click();
      await contactPage.header.locators.buttonMyMessages().click();
      await expect(accountMessagesPage.locators.messageStatus(messageId), 'Message status should be "In Progress"').toHaveText('IN_PROGRESS');
      await accountMessagesPage.locators.buttonMessageDetails(messageId).click();
      await expect(accountMessagesPage.locators.replyText(replyText), 'Client should see the answer from admin').toBeVisible();
    });
  });
});
