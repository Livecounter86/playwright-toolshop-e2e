import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  get locators() {
    return {
      emailInput: () => this.page.getByTestId('email'),
      passwordInput: () => this.page.getByTestId('password'),
      loginSubmitButton: () => this.page.getByTestId('login-submit'),
      loginErrorMessage: () => this.page.getByTestId('login-error'),
    };
  }

  async userLogin(email: string, password: string) {
    await this.locators.emailInput().fill(email);
    await this.locators.passwordInput().fill(password);
    await this.locators.loginSubmitButton().click();
  }
}
