import { test, expect } from '../fixtures/pages';

test.describe('Sign Out Tests', () => {
  test.use({ authUser: 'customer' });

  test('sign out from account page', async ({ accountPage, loginPage }) => {
    await accountPage.navigate();

    await expect(accountPage.header.locators.userMenu(), 'Logged in user name should be shown in header').toHaveText('Jack Howe');
    await accountPage.header.locators.userMenu().click();
    await accountPage.header.locators.buttonSignOut().click();
    await expect(loginPage.page, 'User should be redirected to login page').toHaveURL(/\/login$/);
    await expect(accountPage.header.locators.userMenu(), 'Logged in user name should not be shown in header').not.toBeVisible();
    await expect(loginPage.header.locators.buttonSignIn(), 'Sign In button should be shown in header').toBeVisible();
  });
});
