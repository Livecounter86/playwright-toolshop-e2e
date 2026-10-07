import { test, expect } from '../fixtures/pages';
import { faker } from '@faker-js/faker';

test.describe('Client communication via messages, authorized user', () => {
  test.use({ authUser: 'customer' });
  test.skip(({ baseURL }) => !baseURL?.startsWith('http://localhost'), 'Admin replies change data: run only against Toolshop in Docker');

  test('Admin answers client message and client sees the answer', async ({ homePage, accountMessagesPage, contactPage, signInAsAdmin }) => {
    let messageId: string;
    // The form takes 50 to 250 characters: 9 sentences are always longer than 50, slice cuts the rest
    const clientMessage = faker.lorem.sentences(9).slice(0, 250).trim();
    // Unique per run: replies from earlier runs stay in the database and must not satisfy the checks
    const replyText = faker.lorem.sentence() + ` ${Date.now()}`;
    let subject: string;
    test.info().annotations.push({ type: 'Client message', description: clientMessage });
    test.info().annotations.push({ type: 'Admin reply', description: replyText });

    await test.step('Client sends a message', async () => {
      await homePage.navigate();
      await homePage.header.locators.buttonContact().click();
      subject = await contactPage.selectRandomSubject();
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
      await expect(admin.adminMessagesPage.locators.tableCell(messageId, 'Subject'), 'Admin should see the subject chosen by the client').toHaveText(subject);
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
      await expect(accountMessagesPage.locators.tableCell(messageId, 'Status'), 'Message status should be "In Progress"').toHaveText('IN_PROGRESS');
      await accountMessagesPage.locators.buttonMessageDetails(messageId).click();
      await expect(accountMessagesPage.locators.replyText(replyText), 'Client should see the answer from admin').toBeVisible();
    });
  });
});
test.describe('Unregistered user', () => {
  test.skip(({ baseURL }) => !baseURL?.startsWith('http://localhost'), 'Admin replies change data: run only against Toolshop in Docker');
  test('Unregistered user creates a message and admin sees it', async ({ homePage, contactPage, signInAsAdmin }) => {
    let messageId: string;
    let subject: string;
    // The form takes 50 to 250 characters: 9 sentences are always longer than 50, slice cuts the rest
    const clientMessage = faker.lorem.sentences(9).slice(0, 250).trim();
    const adminReply = faker.lorem.sentence() + ` ${Date.now()}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ provider: 'example.com' });
    test.info().annotations.push({ type: 'Client name', description: `${firstName} ${lastName} (${email})` });
    test.info().annotations.push({ type: 'Client message', description: clientMessage });
    test.info().annotations.push({ type: 'Admin reply', description: adminReply });

    await test.step('Unregistered user sends a message', async () => {
      await homePage.navigate();
      await homePage.header.locators.buttonContact().click();
      await contactPage.locators.firstNameInput().fill(firstName);
      await contactPage.locators.lastNameInput().fill(lastName);
      await contactPage.locators.emailInput().fill(email);
      subject = await contactPage.selectRandomSubject();
      test.info().annotations.push({ type: 'Subject', description: subject });
      await contactPage.locators.messageInput().fill(clientMessage);
      const [response] = await Promise.all([
        contactPage.page.waitForResponse('**/messages'),
        contactPage.locators.buttonSend().click(),
      ]);
      await expect(contactPage.locators.messageSentConfirmation(), 'Message sent confirmation should be displayed').toBeVisible();
      const { id } = await response.json();
      messageId = id as string;
    });
    await test.step('Admin sees the message', async () => {
      const admin = await signInAsAdmin();
      await admin.homePage.header.locators.userMenu().click();
      await admin.homePage.header.locators.buttonMessages().click();
      await expect(admin.adminMessagesPage.locators.tableCell(messageId, 'Subject'), 'Admin should see the subject chosen by the client').toHaveText(subject);
      await expect(admin.adminMessagesPage.locators.tableCell(messageId, 'Name'), 'Admin should see the guest name').toHaveText(`${firstName} ${lastName}`);
      await admin.adminMessagesPage.locators.buttonDetails(messageId).click();
      await expect(admin.adminMessagesPage.locators.initMessageText(), 'Admin should see the initial message from client').toHaveText(clientMessage);
      await admin.adminMessagesPage.locators.replyInput().fill(adminReply);
      await admin.adminMessagesPage.locators.buttonReply().click();
      await expect(admin.adminMessagesPage.locators.replyText(adminReply), 'Admin should see the reply text after sending it').toBeVisible();
      await expect(admin.adminMessagesPage.locators.conversationStatus(), 'Message status should be "In Progress"').toHaveValue('IN_PROGRESS');
    });
  });
});
