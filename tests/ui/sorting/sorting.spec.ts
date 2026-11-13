import { test, expect } from '../../../fixtures';
import sorting from '../../../test-data/sorting.json';
import { catalog, namesOf, sortValues } from '../../../utils/helpers';

test.describe('Product sorting @sorting', () => {
  test('lists every product in the catalog', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.items).toHaveCount(catalog.length);
    expect((await loggedInInventory.getProductNames()).sort()).toEqual(namesOf(catalog).sort());
  });

  for (const c of sorting.cases) {
    test(`sorts by ${c.name} @smoke`, async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy(c.option);

      if (c.by === 'name') {
        const expected = sortValues(namesOf(catalog), c.direction);
        expect(await loggedInInventory.getProductNames()).toEqual(expected);
      } else {
        const expected = sortValues(
          catalog.map((p) => p.price),
          c.direction,
        );
        expect(await loggedInInventory.getProductPrices()).toEqual(expected);
      }
    });
  }
});
