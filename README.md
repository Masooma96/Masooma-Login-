# QA Automation Framework: UI + API

![UI Test Suite](https://github.com/Masooma96/Masooma-Login-/actions/workflows/playwright.yml/badge.svg)

A test automation framework built with **Playwright** and **TypeScript**. It covers two layers of a product:

- **UI tests** for [SauceDemo](https://www.saucedemo.com/), an e-commerce demo site (login, logout, sorting, cart, checkout).
- **API tests** for [JSONPlaceholder](https://jsonplaceholder.typicode.com/) and [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), public practice APIs (REST methods, filters, schema validation, authentication, negative and security checks).

It is designed to show how I structure a maintainable test suite: page objects, data-driven tests, fixtures, contract testing and a CI pipeline.

**[See the latest CI test runs](https://github.com/Masooma96/Masooma-Login-/actions)** (the HTML report is attached to each run as an artifact)

---

## What this framework demonstrates

| Concept | Where to look |
| --- | --- |
| Page Object Model (UI) | [`pages/`](pages) |
| API client layer (the API version of POM) | [`api/`](api) |
| Data-driven testing, with no hardcoded values in tests | [`test-data/`](test-data) |
| Custom fixtures, setup and teardown | [`fixtures/`](fixtures) |
| Contract testing with JSON Schema | [`test-data/api/*/schemas`](test-data/api), [`utils/schema.ts`](utils/schema.ts) |
| End-to-end API flow (create, read, update, delete, verify) | [`tests/api/restful-booker/booking-flow.spec.ts`](tests/api/restful-booker/booking-flow.spec.ts) |
| Positive, negative and security tests | tagged `@negative` |
| Test tagging and selective runs | `@smoke`, `@negative`, `@api`, `@login` and more |
| Cross-browser testing | Chromium, Firefox, WebKit |
| CI/CD | [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) |
| Failure diagnostics | trace, screenshot and video kept on failure |

---

## Tech stack

| Area | Choice |
| --- | --- |
| Test runner | Playwright Test |
| Language | TypeScript (strict mode) |
| UI pattern | Page Object Model with a shared `BasePage` |
| API pattern | Client classes built on Playwright's `APIRequestContext` |
| Contract testing | Ajv (JSON Schema) |
| Test data | JSON files |
| CI/CD | GitHub Actions |

---

## Project structure

```
.
├── pages/                    # UI page objects (Base, Login, Inventory, Cart, Checkout...)
├── api/                      # API clients (JsonPlaceholderClient, BookingClient) and types
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

### A note on JSONPlaceholder

JSONPlaceholder **fakes** write operations: it answers a POST, PUT, PATCH or DELETE like a real API but stores nothing. Its write tests therefore check the response contract and not saved data. The Restful-Booker tests do check real persistence, because that API stores data.

---

## Test coverage

| Layer | Suite | Tests | What is checked |
| --- | --- | --- | --- |
| UI | Login and logout | 7 | 2 valid users, 3 invalid users with the expected error, logout for each valid user |
| UI | Product sorting | 5 | Full catalog, name A-Z / Z-A, price low-high / high-low |
| UI | Cart | 6 | Add 1, 2 or all products, remove from the inventory page and from the cart page |
| UI | Checkout | 6 | Missing-field errors, full orders with item total, tax and total calculated from the catalog, confirmation message |
| API | JSONPlaceholder | 28 | 5 collections with schema checks, single resources, query filters, nested resources, 404s, POST / PUT / PATCH / DELETE |
| API | Restful-Booker | 23 | Authentication, full CRUD, schema validation, filters, missing token (403), invalid payloads, end-to-end lifecycle |

UI tests run in Chrome. `npm test` runs the 5 login tests only, and `npm run test:ui` runs all 24 UI tests.

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
npm test                  # 5 UI login tests in Chrome
npm run test:headed       # same 5 tests with the browser visible
npm run test:ui           # all 24 UI tests
npm run test:api          # JSONPlaceholder API tests
npm run test:api:booker   # Restful-Booker API tests
npm run test:api:all      # both API suites
npm run test:suite        # what CI runs: 5 UI login tests + all API tests
npm run test:smoke        # only @smoke tests
npm run test:negative     # only @negative tests
npm run test:cross-browser  # UI tests in Chromium, Firefox and WebKit
npm run typecheck         # TypeScript check
npm run report            # open the last HTML report
```

Point the suites at another environment with `BASE_URL`, `API_BASE_URL` or `BOOKER_BASE_URL`.

---

## Author

**Masooma Fatima**, QA Automation Engineer
