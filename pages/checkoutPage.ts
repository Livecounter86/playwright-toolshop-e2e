import { BasePage } from './basePage';

export class CheckoutPage extends BasePage {
  get locators() {
    return {
      productTitles: () => this.page.getByTestId('product-title'),
      buttonProceedFromCart: () => this.page.getByTestId('proceed-1'),
      buttonProceedFromSignIn: () => this.page.getByTestId('proceed-2'),
      countrySelector: () => this.page.getByTestId('country'),
      postalCodeInput: () => this.page.getByTestId('postal_code'),
      houseNumberInput: () => this.page.getByTestId('house_number'),
      streetInput: () => this.page.getByTestId('street'),
      cityInput: () => this.page.getByTestId('city'),
      stateInput: () => this.page.getByTestId('state'),
      buttonProceedFromAddress: () => this.page.getByTestId('proceed-3'),
      paymentMethodSelector: () => this.page.getByTestId('payment-method'),
      buttonConfirm: () => this.page.getByTestId('finish'),
      paymentSuccessMessage: () => this.page.getByTestId('payment-success-message'),
      // No data-test on the confirmation, only an id. The invoice number inside has no locator of its own:
      // Angular strips the id of its span when it renders the translated text
      orderConfirmation: () => this.page.locator('#order-confirmation'),
    };
  }
}
