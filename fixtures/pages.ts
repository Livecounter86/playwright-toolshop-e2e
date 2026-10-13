import { test as base, type BrowserContext } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';
import { AccountPage } from '../pages/accountPage';
import { AdminDashboardPage } from '../pages/adminDashboardPage';
import { authStorageState } from '../helpers/auth';
import { users } from '../helpers/users';
import { ContactPage } from '../pages/contactPage';
import { AdminMessagesPage } from '../pages/adminMessagesPage';
import { AdminOrdersPage } from '../pages/adminOrdersPage';
import { AccountMessagesPage } from '../pages/accountMessagesPage';
import { ProductPage } from '../pages/productPage';
import { CheckoutPage } from '../pages/checkoutPage';

type AdminSession = {
  homePage: HomePage;
  adminDashboardPage: AdminDashboardPage;
  adminMessagesPage: AdminMessagesPage;
  adminOrdersPage: AdminOrdersPage;
};

type Options = {
  authUser: 'admin' | 'customer' | undefined;
};

type Pages = {
  homePage: HomePage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
  contactPage: ContactPage;
  signInAsAdmin: () => Promise<AdminSession>;
  accountMessagesPage: AccountMessagesPage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Pages & Options>({
  authUser: [undefined, { option: true }],
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
  accountMessagesPage: async ({ page }, use) => {
    await use(new AccountMessagesPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  signInAsAdmin: async ({ browser, baseURL, request }, use) => {
    let context: BrowserContext | undefined;
    await use(async () => {
      context = await browser.newContext({
        storageState: await authStorageState(request, baseURL!, users.admin),
      });
      const page = await context.newPage();
      await page.goto('/');
      return {
        homePage: new HomePage(page),
        adminDashboardPage: new AdminDashboardPage(page),
        adminMessagesPage: new AdminMessagesPage(page),
        adminOrdersPage: new AdminOrdersPage(page),
      };
    });
    await context?.close();
  },
  storageState: async ({ authUser, request, baseURL, storageState }, use) => {
    if (!authUser) {
      await use(storageState);
      return;
    }
    await use(await authStorageState(request, baseURL!, users[authUser]));
  },
});

export { expect } from '@playwright/test';
