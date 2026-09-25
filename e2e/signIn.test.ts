import { test, expect } from '../fixtures/pages';

test.describe('Sign In Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.locators.signInButton().click();
  });

  test('sign in with valid credentials', async ({ loginPage, userAdminPage }) => {
    await loginPage.userLogin('customer2@practicesoftwaretesting.com', 'welcome01');
    await expect(userAdminPage.page, 'User should be redirected to account page').toHaveURL(/\/account$/);
    await expect(userAdminPage.locators.userAdminPageTitle(), 'Account page title should be shown').toHaveText('My account');
    await expect(userAdminPage.locators.userAdminNavButton(), 'Logged in user name should be shown in header').toHaveText('Jack Howe');
  });

  test('sign in as administrator', async ({ loginPage, adminDashboardPage }) => {
    const rows = adminDashboardPage.locators.tableRow();

    await loginPage.userLogin('admin@practicesoftwaretesting.com', 'welcome01');
    await expect(adminDashboardPage.page, 'User should be redirected to admin dashboard page').toHaveURL('/admin/dashboard');
    await expect(adminDashboardPage.locators.adminDashboardPageTitle(), 'Admin page title should be shown').toHaveText('Sales over the years');
    await expect(adminDashboardPage.locators.userAdminNavButton(), 'Logged in user name should be shown in header').toHaveText('John Doe');
    await expect(adminDashboardPage.locators.invoiceTable(), 'Invoice table should be shown').toBeVisible();
    await expect(adminDashboardPage.locators.columnHeaders(), 'Column headers should be shown').toHaveText(['Invoice Number', 'Billing Address', 'Invoice Date', 'Status', 'Total', '']);
    await expect(rows.first(), 'Invoice table should have 10 rows').toBeVisible();

    for (const row of await rows.all()) {
      for (const cell of await row.locator('td').all()) {
        await expect(cell, 'Table cell are filled with data').not.toBeEmpty();
      }
    }
  });

  // Non-existent email: repeated failed logins on a real demo account would lock it
  test('sign in with unregistered email', async ({ loginPage }) => {
    await loginPage.userLogin('not.registered@example.com', 'welcome01');
    await expect(loginPage.locators.loginErrorMessage(), 'Login error should be shown').toHaveText('Invalid email or password');
  });
});
