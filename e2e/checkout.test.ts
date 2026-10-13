import { test, expect } from '../fixtures/pages';
import { faker } from '@faker-js/faker';

test.describe('Checkout', () => {
  test.use({ authUser: 'customer' });

  test('customer pays with cash on delivery, gets an invoice number and admin sees the order', async ({ homePage, productPage, checkoutPage, signInAsAdmin }) => {
    let productName: string;
    let orderId: string;
    let invoiceNumber: string;
    // Five digits: the server rejects other postcode formats for the US
    const postalCode = faker.location.zipCode('#####');
    const houseNumber = faker.location.buildingNumber();
    test.info().annotations.push({ type: 'Billing address', description: `US, ${postalCode}, ${houseNumber}` });

    await test.step('Customer pays with cash on delivery', async () => {
      await homePage.navigate();

      await expect(homePage.locators.productCards().first(), 'Product grid should show at least one product').toBeVisible();
      // Only a product in stock: the "Add to cart" button of an out-of-stock product is disabled
      productName = faker.helpers.arrayElement(await homePage.locators.productCards()
        .filter({ hasNot: homePage.locators.outOfStockLabels() })
        .locator(homePage.locators.productName())
        .allInnerTexts());
      test.info().annotations.push({ type: 'Product', description: productName });
      await homePage.locators.productNameHeading(productName).click();
      await expect(productPage.locators.productName(), 'Product page should show the chosen product').toHaveText(productName);
      await productPage.locators.buttonAddToCart().click();
      await expect(productPage.header.locators.cartQuantity(), 'Cart badge should show one product').toHaveText('1');
      await productPage.header.locators.buttonCart().click();
      await expect(checkoutPage.locators.productTitles(), 'Cart should hold the chosen product').toHaveText([productName]);
      await checkoutPage.locators.buttonProceedFromCart().click();
      // The address form gets the address from the profile. If the profile hasn't arrived when the address step
      // opens, the step asks for it again, and that late answer wipes the postcode and house number typed below.
      // So the test waits for the profile before it opens the address step.
      await expect(checkoutPage.locators.streetInput(), 'Address should be prefilled from the profile').not.toBeEmpty();
      await checkoutPage.locators.buttonProceedFromSignIn().click();
      // The server accepts only the city and state that the postcode lookup gives for the country and postcode.
      // The lookup replaces the address from the profile about half a second after the input,
      // so the test waits for the street to change before it goes on
      const profileStreet = await checkoutPage.locators.streetInput().inputValue();
      await checkoutPage.locators.countrySelector().selectOption('US');
      await checkoutPage.locators.postalCodeInput().fill(postalCode);
      await checkoutPage.locators.houseNumberInput().fill(houseNumber);
      await expect(checkoutPage.locators.streetInput(), 'Postcode lookup should replace the street from the profile').not.toHaveValue(profileStreet);
      await expect(checkoutPage.locators.cityInput(), 'Postcode lookup should fill the city').not.toBeEmpty();
      await expect(checkoutPage.locators.stateInput(), 'Postcode lookup should fill the state').not.toBeEmpty();
      await checkoutPage.locators.buttonProceedFromAddress().click();
      await checkoutPage.locators.paymentMethodSelector().selectOption('cash-on-delivery');
      await checkoutPage.locators.buttonConfirm().click();
      // The first click only checks the payment; the invoice is created by the second click, after the check passed
      await expect(checkoutPage.locators.paymentSuccessMessage(), 'Payment check should pass').toHaveText('Payment was successful');
      // Site bug: orders placed in the same second can get the same invoice number,
      // so the admin finds this order by its id from the response, not by the number alone
      const [response] = await Promise.all([
        checkoutPage.page.waitForResponse('**/invoices'),
        checkoutPage.locators.buttonConfirm().click(),
      ]);
      await expect(checkoutPage.locators.orderConfirmation(), 'Order confirmation should show an INV-<digits> invoice number')
        .toHaveText(/^Thanks for your order! Your invoice number is INV-\d+\.$/);
      ({ id: orderId, invoice_number: invoiceNumber } = await response.json());
      test.info().annotations.push({ type: 'Invoice number', description: invoiceNumber });
    });
    await test.step('Admin sees the new order', async () => {
      const admin = await signInAsAdmin();
      await admin.homePage.header.locators.userMenu().click();
      await admin.homePage.header.locators.buttonOrders().click();
      // Wait for the first page of orders: if it arrives after the search, it replaces the search results
      await expect(admin.adminOrdersPage.locators.tableRows().first(), 'Orders list should show at least one order').toBeVisible();
      // Search by number: on the public site the new order may already be past the first page
      await admin.adminOrdersPage.locators.searchInput().fill(invoiceNumber);
      await admin.adminOrdersPage.locators.buttonSearch().click();
      await expect(admin.adminOrdersPage.locators.tableCell(orderId, 'Invoice Number'), 'Admin should see the new order with its invoice number').toHaveText(invoiceNumber);
      await admin.adminOrdersPage.locators.buttonEdit(orderId).click();
      await expect(admin.adminOrdersPage.locators.orderProductNames(), 'Order should hold only the product the customer chose').toHaveText([productName]);
      await expect(admin.adminOrdersPage.locators.paymentMethodInput(), 'Order should be paid with cash on delivery').toHaveValue('Cash on Delivery');
    });
  });
});
