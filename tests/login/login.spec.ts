import { test, expect } from '../../fixtures';
import data from '../../test-data/login.json';

test.describe('Login @login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  for (const user of data.valid) {
    test(`succeeds for ${user.name} @smoke`, async ({ page, loginPage, inventoryPage }) => {
      await loginPage.login(user.username, user.password);
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.title).toHaveText('Products');
      await expect(inventoryPage.items.first()).toBeVisible();
    });
  }

  for (const user of data.invalid) {
    test(`fails for ${user.name} @negative`, async ({ page, loginPage }) => {
      await loginPage.login(user.username, user.password);
      await expect(loginPage.errorMessage).toHaveText(user.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});
