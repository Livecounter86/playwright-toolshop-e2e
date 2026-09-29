import { BasePage } from './basePage';

export class HomePage extends BasePage {
  async navigate() {
    await this.page.goto('/');
  }
}
