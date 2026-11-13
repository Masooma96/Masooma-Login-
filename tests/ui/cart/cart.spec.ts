import { test, expect } from '../../../fixtures';
import cart from '../../../test-data/cart.json';
import { getProducts, namesOf, withoutKeys } from '../../../utils/helpers';

test.describe('Add products to cart @cart', () => {
  for (const c of cart.add) {
    test(`${c.name} @smoke`, async ({ loggedInInventory, cartPage }) => {
      const products = getProducts(c.products);

      for (const p of products) await loggedInInventory.addToCart(p.slug);
      await expect(loggedInInventory.cartBadge).toHaveText(String(products.length));

      await loggedInInventory.openCart();
      await cartPage.expectLoaded();
      await expect(cartPage.items).toHaveCount(products.length);
      expect((await cartPage.getItemNames()).sort()).toEqual(namesOf(products).sort());
    });
  }
});

test.describe('Remove products from cart @cart', () => {
  for (const c of cart.remove) {
    test(`${c.name}`, async ({ loggedInInventory, cartPage }) => {
      const remaining = getProducts(withoutKeys(c.add, c.remove));

      for (const p of getProducts(c.add)) await loggedInInventory.addToCart(p.slug);

      if (c.removeFrom === 'cart') {
        await loggedInInventory.openCart();
        await cartPage.expectLoaded();
        for (const p of getProducts(c.remove)) await cartPage.removeFromCart(p.slug);
      } else {
        for (const p of getProducts(c.remove)) await loggedInInventory.removeFromCart(p.slug);
        await loggedInInventory.openCart();
        await cartPage.expectLoaded();
      }

      await expect(cartPage.items).toHaveCount(remaining.length);
      expect((await cartPage.getItemNames()).sort()).toEqual(namesOf(remaining).sort());
      if (remaining.length === 0) {
        await expect(cartPage.cartBadge).toHaveCount(0);
      } else {
        await expect(cartPage.cartBadge).toHaveText(String(remaining.length));
      }
    });
  }
});
