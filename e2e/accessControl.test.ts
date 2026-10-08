import { test, expect } from '../fixtures/pages';

test.describe('Access Control Tests', () => {
  test('guest opening /account is redirected to sign in', async ({ accountPage, loginPage }) => {
    await accountPage.navigate();

    await expect(loginPage.page, 'Guest should be redirected to the sign-in page').toHaveURL(/\/login$/);
    await expect(loginPage.locators.loginForm(), 'Login form should be shown').toBeVisible();
    await expect(loginPage.locators.emailInput(), 'Email input should be empty').toBeEmpty();
    await expect(loginPage.locators.passwordInput(), 'Password input should be empty').toBeEmpty();
    await expect(loginPage.header.locators.buttonSignIn(), 'Sign In button should be shown in header').toBeVisible();
  });

  test.describe('as customer', () => {
    test.use({ authUser: 'customer' });

    test('customer opening /admin/dashboard is redirected to sign in', async ({ adminDashboardPage, loginPage, accountPage }) => {
      await adminDashboardPage.navigate();

      await expect(loginPage.page, 'Customer should be redirected to the sign-in page').toHaveURL(/\/auth\/login$/);
      await expect(adminDashboardPage.locators.invoiceTable(), 'Admin invoice table should not be shown').not.toBeVisible();
      // Access is denied, but the session must stay: the customer is still signed in
      await expect(loginPage.header.locators.userMenu(), 'Customer name should stay in header').toHaveText('Jack Howe');
      await expect(loginPage.header.locators.buttonSignIn(), 'Sign In button should not be shown in header').not.toBeVisible();
      await loginPage.header.locators.userMenu().click();
      await loginPage.header.locators.buttonMyAccount().click();
      await expect(accountPage.page, 'Customer should open the account page').toHaveURL(/\/account$/);
      await expect(accountPage.locators.pageTitle(), 'Account page title should be shown').toHaveText('My account');
    });
  });
});
