import { test, expect } from '../fixtures/pages';
import { loginViaApi } from '../helpers/auth';
import { users } from '../helpers/users';

test.describe('Sign Out Tests', () => {
  test('sign out from account page', async ({ accountPage, request, page, loginPage }) => {
    await loginViaApi(page, request, users.customer.email, users.customer.password);
    await accountPage.navigate();

    await expect(accountPage.header.locators.userMenu(), 'Logged in user name should be shown in header').toHaveText('Jack Howe');
    await accountPage.header.locators.userMenu().click();
    await accountPage.header.locators.buttonSignOut().click();
    await expect(loginPage.page, 'User should be redirected to login page').toHaveURL(/\/login$/);
    await expect(accountPage.header.locators.userMenu(), 'Logged in user name should not be shown in header').not.toBeVisible();
    await expect(loginPage.header.locators.buttonSignIn(), 'Sign In button should be shown in header').toBeVisible();
  });
});
