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
    };
  }
}
