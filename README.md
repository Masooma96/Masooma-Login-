# SauceDemo UI Automation Framework

![Playwright Tests](https://github.com/OWNER/REPO/actions/workflows/playwright.yml/badge.svg)

End-to-end UI test automation framework for [SauceDemo](https://www.saucedemo.com/), built with **Playwright** and **TypeScript**. It demonstrates a clean, scalable framework design: Page Object Model, data-driven testing, custom fixtures, tagging, cross-browser runs and CI.

## Tech stack

| Area | Choice |
| --- | --- |
| Test runner | [Playwright Test](https://playwright.dev/) |
| Language | TypeScript (strict mode) |
| Design pattern | Page Object Model (with a `BasePage`) |
| Data | Data-driven tests from JSON files |
| CI/CD | GitHub Actions |
| Browsers | Chromium, Firefox, WebKit |

## Project structure

```
.
├── pages/               # Page Objects (BasePage, Login, Inventory, Cart, Checkout)
├── fixtures/            # Custom fixtures: page objects + pre-logged-in state
├── test-data/           # JSON test data (users, login cases, checkout, products)
├── tests/
│   ├── login/           # Login: valid, invalid, logout, access control
│   ├── inventory/       # Product list, sorting, cart badge
│   └── checkout/        # Cart contents, end-to-end purchase, form validation
├── .github/workflows/   # CI pipeline
└── playwright.config.ts # Browsers, reporters, trace/screenshot/video settings
```

## Framework highlights

- **Page Object Model**: locators and actions live in `pages/`; tests only describe behaviour.
- **Data-driven**: each row in `test-data/*.json` becomes its own test. Add a row to add a test case, with no code change.
- **Custom fixtures**: page objects are injected into tests, and `loggedInInventory` gives a ready logged-in session.
- **Test tags**: `@smoke`, `@negative`, `@login`, `@inventory`, `@checkout` let you run subsets.
- **Stable locators**: uses `getByTestId` (configured to `data-test`) instead of brittle CSS/XPath.
- **Failure diagnostics**: traces, screenshots and video are kept on failure.
- **CI**: GitHub Actions runs type check and the full suite on every push and PR, then uploads the HTML report.

## Getting started

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
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

## Test coverage

| Feature | Scenarios |
| --- | --- |
| Login | 3 valid users, 6 invalid cases (locked out, wrong password, unknown user, empty fields), logout, direct access without login |
| Inventory | 6 products shown, sort by name and price (both directions), cart badge add/remove |
| Cart and checkout | Cart contents, full purchase end to end, 3 form-validation cases |

## Author

Masooma Fatima, QA Automation Engineer
