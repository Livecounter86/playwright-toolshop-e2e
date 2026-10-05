import { test as base, type BrowserContext } from '@playwright/test';
import { loginViaApi } from '../helpers/auth';
import { users } from '../helpers/users';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { AccountPage } from '../pages/accountPage';
import { AdminDashboardPage } from '../pages/adminDashboardPage';
import { ContactPage } from '../pages/contactPage';

type AdminSession = {
  homePage: HomePage;
  adminDashboardPage: AdminDashboardPage;
};

type Pages = {
  homePage: HomePage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
  contactPage: ContactPage;
  signInAsAdmin: () => Promise<AdminSession>;
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
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  signInAsAdmin: async ({ browser }, use) => {
    let context: BrowserContext | undefined;
    await use(async () => {
      context = await browser.newContext();
      const page = await context.newPage();
      await loginViaApi(page, context.request, users.admin.email, users.admin.password);
      return { homePage: new HomePage(page), adminDashboardPage: new AdminDashboardPage(page) };
    });
    await context?.close();
  },

});

export { expect } from '@playwright/test';
