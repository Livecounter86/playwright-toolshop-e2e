import { test, expect } from '../fixtures/pages';
import { loginViaApi } from '../helpers/auth';

test.describe('Sign Out Tests', () => {
  test('sign out from account page', async ({ accountPage, request, page, loginPage }) => {
    await loginViaApi(page, request, 'customer2@practicesoftwaretesting.com', 'welcome01');
    await accountPage.navigate();

    await expect(accountPage.locators.userMenu(), 'Logged in user name should be shown in header').toHaveText('Jack Howe');
    await accountPage.locators.userMenu().click();
    await accountPage.locators.buttonSignOut().click();
    await expect(loginPage.page, 'User should be redirected to login page').toHaveURL(/\/login$/);
    await expect(accountPage.locators.userMenu(), 'Logged in user name should not be shown in header').not.toBeVisible();
  });
});
