# QA Automation Framework: UI + API

![QA Automation Pipeline](https://github.com/Masooma96/Masooma-Login-/actions/workflows/playwright.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A test automation framework built with **Playwright** and **TypeScript**. It covers two layers of a product:

- **UI tests** for [SauceDemo](https://www.saucedemo.com/), an e-commerce demo site: login, logout, sorting, cart and checkout.
- **API tests** for [JSONPlaceholder](https://jsonplaceholder.typicode.com/) and [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), public practice APIs: REST methods, filters, schema validation, authentication, negative and security checks.

It shows how I structure a maintainable test suite: page objects, API clients, data-driven tests, fixtures, contract testing, flaky-test controls and a CI pipeline.

**[See the latest pipeline runs](https://github.com/Masooma96/Masooma-Login-/actions)**. The HTML report is attached to each run as an artifact.

---

## What this framework demonstrates

| Concept                                                    | Where to look                                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Page Object Model (UI)                                     | [`pages/`](pages)                                                                                                                |
| API client layer (the API version of POM)                  | [`tests/api/clients/`](tests/api/clients)                                                                                        |
| Data-driven testing, with no hardcoded values in tests     | [`test-data/`](test-data)                                                                                                        |
| Custom fixtures, setup and teardown                        | [`fixtures/`](fixtures)                                                                                                          |
| Contract testing with JSON Schema                          | [`test-data/api/*/schemas`](test-data/api), [`utils/schema.ts`](utils/schema.ts)                                                 |
| End-to-end API flow (create, read, update, delete, verify) | [`tests/api/restful-booker/booking-flow.spec.ts`](tests/api/restful-booker/booking-flow.spec.ts)                                 |
| Positive, negative and security tests                      | tagged `@negative`                                                                                                               |
| Flaky-test controls                                        | [Flaky test strategy](#flaky-test-strategy)                                                                                      |
| Code quality gate                                          | ESLint, Prettier and TypeScript, run first in CI                                                                                 |
| CI/CD                                                      | [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml): quality gate, full regression, nightly cross-browser run |

---

## Tech stack

| Area             | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Test runner      | Playwright Test                                          |
| Language         | TypeScript (strict mode)                                 |
| UI pattern       | Page Object Model with a shared `BasePage`               |
| API pattern      | Client classes built on Playwright's `APIRequestContext` |
| Contract testing | Ajv (JSON Schema)                                        |
| Test data        | JSON files                                               |
| Code quality     | ESLint (with `eslint-plugin-playwright`) and Prettier    |
| CI/CD            | GitHub Actions                                           |

---

## Project structure

```
.
├── pages/                    # UI page objects (Base, Login, Inventory, Cart, Checkout...)
├── fixtures/                 # Fixtures: UI pages, API clients, logged-in session, auto-cleanup booking
├── utils/                    # Helpers and JSON-schema validator
├── test-data/
│   ├── *.json                # UI data: login, products, sorting, cart, checkout, page routes
│   └── api/
│       ├── jsonplaceholder/  # API data and schemas
│       └── restful-booker/   # API data and schemas
├── tests/
│   ├── ui/                   # login, sorting, cart, checkout
│   └── api/
│       ├── clients/          # API clients (JsonPlaceholderClient, BookingClient), retry helper, types
│       ├── jsonplaceholder/  # collections, single, filters, nested, CRUD
│       └── restful-booker/   # auth, CRUD, negative, end-to-end flow
├── .github/workflows/        # CI pipeline
└── playwright.config.ts      # Projects: UI browsers and the two API suites
```

---

## How it works

### UI: Page Object Model and data-driven tests

Each page of the site is a class holding its locators and actions. Page URLs and titles come from [`test-data/pages.json`](test-data/pages.json), and every page can check itself with `expectLoaded()`. A test reads like a description of what a user does:

```ts
await loginPage.open();
await loginPage.login(user.username, user.password);
await inventoryPage.expectLoaded();
```

Each row in a JSON file becomes its own test. To add a login case, add one row to [`test-data/login.json`](test-data/login.json) and write no code.

### API: client layer, schemas and data

A client class wraps each endpoint, so tests never build URLs or headers:

```ts
const response = await api.get('/posts', { userId: '1' });
expect(response.status()).toBe(status.ok);
```

Responses are checked for the status code, response time, JSON content type and **JSON Schema**, so a changed or missing field fails the test:

```ts
expect(validateSchema('post', item)).toEqual([]);
```

### Fixtures: setup and teardown

`createdBooking` creates a booking before a test and deletes it afterwards, so every test is independent and leaves no data behind. `loggedInInventory` gives a UI test an already logged-in session.

---

## Flaky test strategy

A flaky test passes and fails without a code change. These tests depend on live public websites, so I handle flakiness on purpose and never hide it:

| Control                           | How it works                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Independent tests**             | Each test creates and cleans up its own data, so tests never depend on each other or on run order.                                                            |
| **Auto-waiting, no fixed sleeps** | Playwright web-first assertions wait for the page. There is no `waitForTimeout` anywhere.                                                                     |
| **Explicit timeouts**             | Assertions wait up to 10s, actions 10s, navigation 30s. Slow enough for public sites, fast enough to fail clearly.                                            |
| **Retries in CI only**            | Failing tests are retried twice in CI. A test that fails and then passes is reported as **flaky** in the run, not as green, and its trace is kept.            |
| **Safe API retries**              | Read-only GET calls retry on network errors, 5xx and 429, with backoff ([`retry.ts`](tests/api/clients/retry.ts)). A 4xx result is real and is never retried. |
| **Diagnostics**                   | Trace on retry, screenshot and video on failure, and GitHub annotations in CI.                                                                                |
| **Stability check**               | A nightly job runs the whole suite 5 times without retries (`npm run test:stability`) to expose flaky tests before they spread.                               |
| **Quarantine**                    | A test that proves flaky gets the `@quarantine` tag. CI skips it, so it stops blocking the team, and it stays visible until it is fixed.                      |

---

## Test coverage

| Layer | Suite            | Tests | What is checked                                                                                                        |
| ----- | ---------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| UI    | Login and logout | 5     | 1 valid user logs in, 3 invalid users get the expected error, the valid user logs out                                  |
| UI    | Product sorting  | 5     | Full catalog, name A-Z / Z-A, price low-high / high-low                                                                |
| UI    | Cart             | 6     | Add 1, 2 or all products, remove from the inventory page and from the cart page                                        |
| UI    | Checkout         | 6     | Missing-field errors, full orders with item total, tax and total calculated from the catalog, confirmation message     |
| API   | JSONPlaceholder  | 28    | 5 collections with schema checks, single resources, query filters, nested resources, 404s, POST / PUT / PATCH / DELETE |
| API   | Restful-Booker   | 23    | Authentication, full CRUD, schema validation, filters, missing token (403), invalid payloads, end-to-end lifecycle     |

The UI tests use one valid user, `standard_user`. The data is in [`test-data/login.json`](test-data/login.json).

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
npm test                    # all 22 UI tests in Chrome (login, sorting, cart, checkout)
npm run test:headed         # same tests with the browser visible
npm run test:api            # JSONPlaceholder API tests
npm run test:api:booker     # Restful-Booker API tests
npm run test:api:all        # both API suites
npm run test:ci             # what CI runs: all UI tests + all API tests
npm run test:smoke          # only @smoke tests
npm run test:negative       # only @negative tests
npm run test:cross-browser  # UI tests in Chromium, Firefox and WebKit
npm run test:stability      # whole suite x5, to detect flaky tests
npm run lint                # ESLint
npm run format              # Prettier
npm run typecheck           # TypeScript check
npm run report              # open the last HTML report
```

Point the suites at another environment with `BASE_URL`, `API_BASE_URL` or `BOOKER_BASE_URL` (see [`.env.example`](.env.example)).

---

## Known limitations

- The tests run against **public demo sites**, so a slow or unavailable site can fail a run. The flaky-test controls above reduce this but cannot remove it.
- **JSONPlaceholder fakes write operations.** It answers POST, PUT, PATCH and DELETE like a real API but stores nothing, so those tests check the response contract and not saved data. The Restful-Booker tests do check real persistence.
- Public sites can change without notice. The tests would then need their data or locators updated in one place: a page object, an API client or a JSON file.

---

## Author

**Masooma Fatima**, QA Automation Engineer

Released under the [MIT license](LICENSE).
