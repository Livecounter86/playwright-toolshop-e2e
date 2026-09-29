import { test as base } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { AccountPage } from '../pages/accountPage';
import { AdminDashboardPage } from '../pages/adminDashboardPage';

type Pages = {
  homePage: HomePage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
});

export { expect } from '@playwright/test';
