import { test, expect } from '../../fixtures';
import products from '../../test-data/products.json';

test.describe('Inventory @inventory', () => {
  test('shows 6 products', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.items).toHaveCount(6);
  });

  test('sorts by name A to Z', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('az');
    const names = await loggedInInventory.getProductNames();
    expect(names).toEqual([...names].sort());
  });

  test('sorts by name Z to A', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');
    const names = await loggedInInventory.getProductNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('sorts by price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');
    const prices = await loggedInInventory.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts by price high to low', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');
    const prices = await loggedInInventory.getProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('cart badge updates on add and remove @smoke', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart(products.backpack);
    await loggedInInventory.addToCart(products.bikeLight);
    await expect(loggedInInventory.cartBadge).toHaveText('2');
    await loggedInInventory.removeFromCart(products.backpack);
    await expect(loggedInInventory.cartBadge).toHaveText('1');
  });
});
