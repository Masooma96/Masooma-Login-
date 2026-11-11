import { test, expect } from '../../fixtures';
import products from '../../test-data/products.json';
import checkout from '../../test-data/checkout.json';

test.describe('Cart & Checkout @checkout', () => {
  test('cart lists the added products', async ({ loggedInInventory, cartPage }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.addToCart(products.boltTShirt);
    await loggedInInventory.openCart();
    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.itemNames).toContainText(['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt']);
  });

  test('complete purchase end to end @smoke', async ({ page, loggedInInventory, cartPage, checkoutPage }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(checkout.valid);
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.itemTotal).toContainText('$29.99');
    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  for (const c of checkout.invalid) {
    test(`checkout rejects ${c.name} @negative`, async ({ loggedInInventory, cartPage, checkoutPage }) => {
      await loggedInInventory.addToCart(products.backpack);
      await loggedInInventory.openCart();
      await cartPage.checkout();
      await checkoutPage.fillInformation(c);
      await expect(checkoutPage.errorMessage).toHaveText(c.error);
    });
  }
});
