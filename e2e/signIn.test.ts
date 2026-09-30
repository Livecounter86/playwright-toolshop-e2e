import { test, expect } from '../fixtures/pages';

test.describe('Sign In Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.header.locators.buttonSignIn().click();
  });

  test('sign in with valid credentials', async ({ loginPage, accountPage }) => {
    await loginPage.userLogin('customer2@practicesoftwaretesting.com', 'welcome01');
    await expect(accountPage.page, 'User should be redirected to account page').toHaveURL(/\/account$/);
    await expect(accountPage.locators.pageTitle(), 'Account page title should be shown').toHaveText('My account');
    await expect(accountPage.header.locators.userMenu(), 'Logged in user name should be shown in header').toHaveText('Jack Howe');
  });

  test('sign in as administrator', async ({ loginPage, adminDashboardPage }) => {
    const rows = adminDashboardPage.locators.tableRows();

    await loginPage.userLogin('admin@practicesoftwaretesting.com', 'welcome01');
    await expect(adminDashboardPage.page, 'User should be redirected to admin dashboard page').toHaveURL('/admin/dashboard');
    await expect(adminDashboardPage.locators.pageTitle(), 'Admin page title should be shown').toHaveText('Sales over the years');
    await expect(adminDashboardPage.header.locators.userMenu(), 'Logged in user name should be shown in header').toHaveText('John Doe');
    await expect(adminDashboardPage.locators.invoiceTable(), 'Invoice table should be shown').toBeVisible();
    await expect(adminDashboardPage.locators.columnHeaders(), 'Column headers should be shown').toHaveText(['Invoice Number', 'Billing Address', 'Invoice Date', 'Status', 'Total', '']);
    await expect(rows.first(), 'Invoice table should have at least one row').toBeVisible();

    for (const row of await rows.all()) {
      for (const cell of await row.locator('td').all()) {
        await expect(cell, 'Table cell should not be empty').not.toBeEmpty();
      }
    }
  });

  // Non-existent email: repeated failed logins on a real demo account would lock it
  test('sign in with unregistered email', async ({ loginPage }) => {
    await loginPage.userLogin('not.registered@example.com', 'welcome01');
    await expect(loginPage.locators.loginErrorMessage(), 'Login error should be shown').toHaveText('Invalid email or password');
  });

  test('sign in with empty fields shows validation errors', async ({ loginPage }) => {
    await expect(loginPage.locators.emailInput(), 'Email input should be empty').toBeEmpty();
    await expect(loginPage.locators.passwordInput(), 'Password input should be empty').toBeEmpty();
    await loginPage.locators.loginSubmitButton().click();
    await expect(loginPage.locators.emailFieldError(), 'Email empty field error should be shown').toHaveText('Email is required');
    await expect(loginPage.locators.passwordFieldError(), 'Password empty field error should be shown').toHaveText('Password is required');
  });

  test('sign in with invalid email format shows validation error', async ({ loginPage }) => {
    await loginPage.userLogin('test@', 'welcome01');
    await expect(loginPage.locators.emailFieldError(), 'Email invalid format error should be shown').toHaveText('Email format is invalid');
    await expect(loginPage.locators.passwordFieldError(), 'Password field should not show error').not.toBeVisible();
  });
});
