import { test, expect } from '../../../fixtures';
import checkout from '../../../test-data/checkout.json';
import { getProducts, namesOf, round2, sumPrices } from '../../../utils/helpers';

test.describe('Checkout validation @checkout', () => {
  for (const c of checkout.invalid) {
    test(`rejects ${c.name} @negative`, async ({ loggedInInventory, cartPage, checkoutPage }) => {
      for (const p of getProducts(checkout.defaultProducts)) await loggedInInventory.addToCart(p.slug);
      await loggedInInventory.openCart();
      await cartPage.checkout();
      await checkoutPage.expectLoaded();

      await checkoutPage.fillInformation(c);

      await expect(checkoutPage.errorMessage).toHaveText(c.error);
      await checkoutPage.expectLoaded();
    });
  }
});

test.describe('Checkout and order validation @checkout', () => {
  for (const order of checkout.orders) {
    test(`${order.name} @smoke`, async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
      overviewPage,
      completePage,
    }) => {
      const products = getProducts(order.products);
      const itemTotal = sumPrices(products);
      const tax = round2(itemTotal * checkout.taxRate);
      const total = round2(itemTotal + tax);

      for (const p of products) await loggedInInventory.addToCart(p.slug);
      await loggedInInventory.openCart();
      await cartPage.checkout();
      await checkoutPage.expectLoaded();
      await checkoutPage.fillInformation(checkout.customer);

      // Order summary: items, item total, tax and total all match the catalog
      await overviewPage.expectLoaded();
      expect((await overviewPage.getItemNames()).sort()).toEqual(namesOf(products).sort());
      expect(await overviewPage.getItemTotal()).toBeCloseTo(itemTotal, 2);
      expect(await overviewPage.getTax()).toBeCloseTo(tax, 2);
      expect(await overviewPage.getTotal()).toBeCloseTo(total, 2);

      // Confirmation, and the cart is emptied
      await overviewPage.finish();
      await completePage.expectLoaded();
      await expect(completePage.completeHeader).toHaveText(checkout.confirmation.header);
      await expect(loggedInInventory.cartBadge).toHaveCount(0);
    });
  }
});
