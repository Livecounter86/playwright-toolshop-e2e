import type { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get locators() {
    return {
      signInButton: () => this.page.getByTestId('nav-sign-in'),
    };
  }

  async navigate() {
    await this.page.goto('/');
  }
}
