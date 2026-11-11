# SauceDemo UI Automation Framework

![Playwright Tests](https://github.com/Masooma96/Masooma-Login-/actions/workflows/playwright.yml/badge.svg)

An end-to-end UI test automation framework for **[SauceDemo](https://www.saucedemo.com/)**, built with **Playwright** and **TypeScript** using the **Page Object Model (POM)** and a **data-driven** testing approach.

I built this as a portfolio project to show how I design a maintainable, scalable test framework from scratch: separating page logic from test logic, driving many test cases from one piece of code, and running everything automatically in CI.

**[View the latest test report](https://masooma96.github.io/Masooma-Login-/)** (24 of 24 tests passing)

---

## About the application under test

[SauceDemo](https://www.saucedemo.com/) (by Sauce Labs) is a demo e-commerce site made for practising test automation. It has a login page, a product catalogue, a shopping cart and a multi-step checkout, which makes it a good target for covering a full user journey.

| Page | URL | What I test |
| --- | --- | --- |
| Login | `/` | Valid and invalid credentials, error messages, logout, blocked direct access |
| Inventory | `/inventory.html` | Product list, sorting, add/remove to cart, cart badge |
| Cart | `/cart.html` | Cart contents |
| Checkout | `/checkout-step-one.html` to `/checkout-complete.html` | Form validation, order totals, full purchase |

---

## Tech stack

| Area | Choice |
| --- | --- |
| Test runner | [Playwright Test](https://playwright.dev/) |
| Language | TypeScript (strict mode) |
| Design pattern | Page Object Model with a shared `BasePage` |
| Test data | JSON files (data-driven) |
| CI/CD | GitHub Actions |
| Browsers | Chromium, Firefox, WebKit |
| Reports | Playwright HTML report, plus trace, screenshot and video on failure |

---

## How I built it

### 1. Page Object Model (POM)

Instead of writing selectors and clicks inside every test, each page of the site has its own class in [`pages/`](pages). The class holds the page's **locators** and the **actions** a user can take on it.

```
BasePage              shared behaviour (navigate, current URL)
 ├── LoginPage        username/password fields, login()
 ├── InventoryPage    sort, add to cart, logout
 ├── CartPage         cart items, checkout()
 └── CheckoutPage     fill form, finish()
```

A test then reads like a plain description of what a user does:

```ts
await loginPage.goto();
await loginPage.login('standard_user', 'secret_sauce');
await expect(inventoryPage.title).toHaveText('Products');
```

**Why it matters:** if the login button changes, I fix one line in `LoginPage.ts` and every test keeps working, with no edits across dozens of tests.

### 2. Data-driven testing

Test data lives in JSON files in [`test-data/`](test-data), not in the test code. A test loops over the data, and **each row becomes its own test** with its own name and result in the report.

From [`test-data/login.json`](test-data/login.json):

```json
{ "name": "wrong password", "username": "standard_user", "password": "wrong_password",
  "error": "Epic sadface: Username and password do not match any user in this service" }
```

From [`tests/login/login.spec.ts`](tests/login/login.spec.ts):

```ts
for (const user of data.invalid) {
  test(`fails for ${user.name} @negative`, async ({ page, loginPage }) => {
    await loginPage.login(user.username, user.password);
    await expect(loginPage.errorMessage).toHaveText(user.error);
  });
}
```

**Why it matters:** to add a new login case, I add one row to the JSON file. I don't write any new code.

### 3. Custom fixtures

[`fixtures/index.ts`](fixtures/index.ts) creates the page objects and hands them to each test. It also provides a `loggedInInventory` fixture that gives a ready, logged-in session, so tests for the cart and checkout don't repeat the login steps.

### 4. Tags, locators and diagnostics

- **Tags** (`@smoke`, `@negative`, `@login`, `@inventory`, `@checkout`) let me run any subset of tests.
- **Locators** use `getByTestId`, configured for the site's `data-test` attribute, which is more stable than CSS or XPath.
- **Failure diagnostics:** Playwright keeps a trace, screenshot and video when a test fails.

### 5. Continuous integration

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull request. It installs dependencies, type-checks the code, runs the whole suite in all three browsers and uploads the HTML report as an artifact.

---

## Project structure

```
.
├── pages/                 # Page Objects (BasePage, Login, Inventory, Cart, Checkout)
├── fixtures/              # Custom fixtures (page objects + logged-in session)
├── test-data/             # JSON data: users, login cases, checkout, products
├── tests/
│   ├── login/             # Valid and invalid login, logout, access control
│   ├── inventory/         # Product list, sorting, cart badge
│   └── checkout/          # Cart, end-to-end purchase, form validation
├── .github/workflows/     # CI pipeline
├── playwright.config.ts   # Browsers, reporters, trace/screenshot/video
└── tsconfig.json
```

---

## Test coverage (24 tests)

`npm test` runs everything in Google Chrome. Every input and expected value comes from a JSON file in [`test-data/`](test-data), and nothing is hardcoded in the tests.

| Area | Data file | Tests | What is checked |
| --- | --- | --- | --- |
| Login and logout | `login.json` | 7 | 2 valid users log in, 3 invalid users get the expected error, and each valid user can log out |
| Product sorting | `sorting.json`, `products.json` | 5 | Full catalog is listed, and name A-Z / Z-A and price low-high / high-low match the catalog |
| Add and remove from cart | `cart.json` | 6 | Cart badge and cart contents after adding 1, 2 or all 6 products. Removing from the inventory page or the cart page |
| Checkout and order validation | `checkout.json` | 6 | 3 missing-field errors. 3 full orders where item total, tax (8%) and total are calculated from the catalog and compared with the order summary, then the confirmation message is checked |

## Getting started

```bash
git clone https://github.com/Masooma96/Masooma-Login-.git
cd Masooma-Login-
npm install
npx playwright install
```

## Running tests

```bash
npm test                 # all 24 tests in Chrome
npm run test:all         # every test in Chromium, Firefox and WebKit
npm run test:chromium    # Chromium only
npm run test:headed      # watch the browser
npm run test:smoke       # @smoke tests only
npm run test:negative    # @negative tests only
npm run typecheck        # TypeScript check
npm run report           # open the last HTML report
```

Run a single test by name:

```bash
npx playwright test -g "succeeds for standard user" --project=chromium --headed
```

Point the suite at another environment with `BASE_URL`:

```bash
BASE_URL=https://staging.example.com npm test
```

---

## Author

**Masooma Fatima**, QA Automation Engineer
