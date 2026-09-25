import { test as base } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { UserAdminPage } from '../pages/userAdminPage';
import { AdminDashboardPage } from '../pages/adminDashboardPage';

type Pages = {
  homePage: HomePage;
  loginPage: LoginPage;
  userAdminPage: UserAdminPage;
  adminDashboardPage: AdminDashboardPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  userAdminPage: async ({ page }, use) => {
    await use(new UserAdminPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
});

export { expect } from '@playwright/test';
