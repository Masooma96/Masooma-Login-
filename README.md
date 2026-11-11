# SauceDemo UI Automation Framework

![Playwright Tests](https://github.com/Masooma96/Masooma-Login-/actions/workflows/playwright.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.65-45ba4b?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

An end-to-end UI test automation framework for **[SauceDemo](https://www.saucedemo.com/)**, built with **Playwright** and **TypeScript** using the **Page Object Model (POM)** and a **data-driven** testing approach.

I built this as a portfolio project to show how I design a maintainable, scalable test framework from scratch: separating page logic from test logic, driving many test cases from one piece of code, and running everything automatically in CI.

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

## Test coverage (25 tests)

| Feature | Tests | Scenarios |
| --- | --- | --- |
| Login | 14 | 3 valid users, 9 invalid cases (locked out, wrong password, unknown and unregistered users, empty fields), logout, direct access without login |
| Inventory | 6 | 6 products shown, sort by name and price (both directions), cart badge add and remove |
| Cart and checkout | 5 | Cart contents, full purchase end to end, 3 form-validation cases |

### Login test data

| Username | Password | Expected result |
| --- | --- | --- |
| `standard_user` | `secret_sauce` | Login succeeds |
| `problem_user` | `secret_sauce` | Login succeeds |
| `performance_glitch_user` | `secret_sauce` | Login succeeds |
| `locked_out_user` | `secret_sauce` | Locked-out error |
| `masooma` | `test` | Invalid credentials error |
| `fatima` | `abc` | Invalid credentials error |
| `rizvi` | `223` | Invalid credentials error |
| empty username or password | any | "Username/Password is required" |

---

## Getting started

```bash
git clone https://github.com/Masooma96/Masooma-Login-.git
cd Masooma-Login-
npm install
npx playwright install
```

## Running tests

```bash
npm test                 # all tests, all browsers
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
