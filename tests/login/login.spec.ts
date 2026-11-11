import { test, expect } from '../../fixtures';
import data from '../../test-data/login.json';

test.describe('Login @login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  for (const user of data.valid) {
    test(`succeeds for ${user.name} @smoke`, async ({ loginPage, inventoryPage }) => {
      await loginPage.login(user.username, user.password);
      await inventoryPage.expectLoaded();
      await expect(inventoryPage.items.first()).toBeVisible();
    });
  }

  for (const user of data.invalid) {
    test(`fails for ${user.name} @negative`, async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(user.username, user.password);
      await expect(loginPage.errorMessage).toHaveText(user.error);
      await expect(page).not.toHaveURL(new RegExp(inventoryPage.path));
    });
  }
});

test.describe('Logout @logout', () => {
  for (const user of data.valid) {
    test(`${user.name} can log out @smoke`, async ({ loginPage, inventoryPage }) => {
      await loginPage.open();
      await loginPage.login(user.username, user.password);
      await inventoryPage.expectLoaded();
      await inventoryPage.logout();
      await loginPage.expectLoaded();
      await expect(loginPage.loginButton).toBeVisible();
    });
  }
});
