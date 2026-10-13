import type { Page } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      buttonSignIn: () => this.page.getByTestId('nav-sign-in'),
      buttonHome: () => this.page.getByTestId('nav-home'),
      buttonCategories: () => this.page.getByTestId('nav-categories'),
      userMenu: () => this.page.getByTestId('nav-menu'),
      buttonContact: () => this.page.getByTestId('nav-contact'),
      buttonSignOut: () => this.page.getByTestId('nav-sign-out'),
      buttonMyAccount: () => this.page.getByTestId('nav-my-account'),
      buttonMessages: () => this.page.getByTestId('nav-admin-messages'),
      buttonOrders: () => this.page.getByTestId('nav-admin-orders'),
      buttonMyMessages: () => this.page.getByTestId('nav-my-messages'),
      buttonCart: () => this.page.getByTestId('nav-cart'),
      cartQuantity: () => this.page.getByTestId('cart-quantity'),
    };
  }
}
