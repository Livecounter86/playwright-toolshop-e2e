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
});
