# CLAUDE.md

Guidance for AI assistants working in this repository.
Keep in sync with `.cursor/rules/project.mdc` (same rules for Cursor).
Docker and CI rules are in `.claude/rules/infra.md` (Cursor: `.cursor/rules/infra.mdc`); they load when you work with Docker or CI files.

## Project

Playwright + TypeScript end-to-end tests for Practice Software Testing ("Toolshop"),
a public demo e-commerce app built for test-automation practice: https://practicesoftwaretesting.com.
This is a portfolio project: readable, stable tests matter more than their number.
What to cover next and in which order: `docs/TEST_STRATEGY.md`. Check off items there when they are covered.

## Commands

```bash
cp .env.example .env                      # once after cloning, then fill in the values (see Test data)
npm test                                  # all tests in chromium, firefox and webkit
npx playwright test --project=chromium    # one browser, for quick checks
npx playwright test e2e/signIn.test.ts    # one file
npx playwright test -g "administrator"    # tests whose title matches
npx playwright show-report                # open the last HTML report
npm run lint                              # ESLint
npm run lint:fix                          # ESLint with autofix
npx tsc --noEmit                          # type check
```

Before committing: lint, type check and tests must pass.

## Structure

```
e2e/                  test specs (*.test.ts)
pages/                Page Objects, one class per page (camelCase file, PascalCase class)
pages/basePage.ts     base class of every page: holds `page` and the shared `header`
components/           parts shown on many pages (header), same shape as Page Objects
helpers/              plain functions that are neither pages nor fixtures (API login)
helpers/users.ts      test accounts read from environment variables
fixtures/pages.ts     custom fixtures that give tests the Page Objects; exports test and expect
playwright.config.ts  baseURL, testIdAttribute, timeouts, browser projects; loads .env
.env.example          names of the required environment variables, without values
docker-compose.yml    local Toolshop from prebuilt images
docker/nginx.conf     nginx config for the `web` service of docker-compose.yml
.github/workflows/    CI against Toolshop in Docker and Claude review of pull requests
.claude/rules/        rules that load only for matching files (infra.md: Docker and CI)
```

## Page Objects

Every Page Object extends `BasePage` and has the same shape (an illustration; the real locators are in `pages/`):

```ts
import { BasePage } from './basePage';

export class HomePage extends BasePage {
  get locators() {
    return {
      searchFieldInput: () => this.page.getByTestId('search-query'),
      productNamesContaining: (text: string) => this.page.getByTestId('product-name').filter({ hasText: text }),
    };
  }

  async searchFor(query: string) {
    await this.locators.searchFieldInput().fill(query);
    // ...
  }
}
```

- Pages don't declare `page` or a constructor: both come from `BasePage`, which also creates `this.header`.
- Locators live in the `locators` getter as arrow functions, static and parameterized ones together.
  No `readonly` Locator fields. Call them with parentheses: `homePage.locators.searchFieldInput()`.
- Locator names:
  - buttons and links start with `button` (`buttonSignIn`, `buttonFavorites`);
  - inputs end with `Input` (`emailInput`);
  - other elements are named by what they are, in the plural when the locator matches many
    (`pageTitle`, `loginErrorMessage`, `tableRows`, `productCards`).
- Methods are user actions (`navigate`, `userLogin`, ...). They are `async` and `await` every Playwright call.
  Add a method once an action is needed in a second place; until then keep the steps in the test.
- No `expect` inside Page Objects: pages describe what can be done, tests decide what to check.
- A new Page Object must be registered in `fixtures/pages.ts` (the `Pages` type and a fixture).

## Components

- Something shown on many pages is a component in `components/`, not a locator copied into every page.
- `HeaderComponent` (`components/headerComponent.ts`) holds the navigation bar: sign in, user menu,
  sign out, main links. `BasePage` creates it, so every page has it: `accountPage.header.locators.userMenu()`.
- Components have the same shape as pages (`page`, constructor, `get locators()`, actions),
  but don't extend `BasePage` and aren't fixtures.
- Only elements that really belong to a page stay in its Page Object. For example, the account page
  tiles (`nav-favorites`, ...) are page content, while the user menu items (`nav-my-favorites`, ...) are header.

## Tests

- Import `test` and `expect` from `../fixtures/pages`, never from `@playwright/test`,
  otherwise the page fixtures are not available.
- Take Page Objects from the test parameters: `async ({ loginPage, homePage }) => ...`. Don't `new` them in tests.
- Reach the header through the page the user is on: `homePage.header.locators.buttonSignIn()`.
- Shared setup steps go into `test.beforeEach` inside `test.describe`.
- Every assertion has a message: `expect(locator, 'Login error should be shown')`.
- Web-first assertions only (`toBeVisible`, `toHaveText`, `toHaveURL`, ...).
  No `waitForTimeout`. Don't read a value just to check it with a plain `expect(value)`: it doesn't retry.
  Reading a value to use as test input is fine, e.g. a product name to search for.
- Wait for loaded content before reading it. Two cases:
  - First load, none of these elements is on the page yet: start `waitForResponse('**/<path>')` before the action
    that sends the request, then assert that the first element is visible. Take the path from DevTools → Network
    and match only the path, so the pattern works both locally and on the public site.
  - The action replaces elements that are already on the page (search, filters, sorting, pagination):
    the response is not enough, the old elements stay visible until the page re-renders.
    Assert something that is true only after the update: an element that appears only then,
    or a text or a count that only the new content has.

  Only after that use `locator.count()` or `locator.all()`: they don't wait.
  Wait for a response, don't inspect it: don't read its body, check its fields, or compare the page to it.
- If a test picks data at random, record the choice: `test.info().annotations.push({ type: 'Search query', description: productName })`.
  Without it a failure can't be reproduced.
- Call a locator where it is used: `homePage.locators.productCards()`. Don't store it in a local constant.
  A constant is a last resort, only when the call cannot be repeated. If it can be written inline, write it inline.
- Page-level checks go on the page: `expect(page).toHaveURL('/admin/dashboard')`. Paths are relative to `baseURL`.
- Browser contexts are created and closed per test by Playwright. Close only contexts you create yourself
  with `browser.newContext()`, in the teardown part of a fixture.
- Navigate by clicks, as a user does: through the header, the user menu, account tiles, product cards, links.
  Every page a test checks is reached this way, so navigation is covered by real page tests.
  Use `goto` only for the entry point (`/`) and in setup. The exception is access-control tests
  (a guest or a customer opens a protected URL): opening the URL directly is what they test.
  If a `goto` shortcut looks tempting (the click path is long or flaky), don't apply it:
  suggest it to the owner, and only after the test is written.

## Signed-in tests

- The sign-in form is tested by `e2e/signIn.test.ts`. Other tests that need a signed-in user log in via the API:
  `loginViaApi(page, request, users.customer.email, users.customer.password)` from `helpers/auth.ts`. It opens `/`, puts the token
  into `localStorage['auth-token']` once and reloads, so the header shows the signed-in user;
  the test then navigates by clicks wherever it needs.
- Put the token once. Never re-inject it on every navigation (no `addInitScript` for auth):
  the app must keep the session itself, and a test must fail if it loses it.
- API tokens live 5 minutes (`expires_in: 300`). Each test gets its own fresh token;
  never save one token for the whole run.
- Sign-out tests use their own token and never share it with other tests.
- Planned: once many tests need a signed-in user, switch to a `storageState` fixture (`test.use({ authUser })`)
  built on the same API login, which also removes the extra `goto('/')` and reload.

## Locators

- The app marks elements with `data-test`. The config sets `testIdAttribute: 'data-test'`,
  so `getByTestId('email')` matches `data-test="email"`.
- Preference order: `getByTestId`, then `getByRole`, then `locator(css)` only when nothing else exists.
- Table rows: search inside `tbody`. `getByRole('row')` on the whole table also matches the header row.

## Timeouts

`actionTimeout` is 10 s (config), `expect` 5 s and the test 30 s (defaults).
Don't add visibility assertions before actions just to fail faster; `actionTimeout` already covers that.

## Environments

- Locally the suite runs against the public site by default; CI runs it against Toolshop in Docker,
  never against the public site. `BASE_URL` and `API_URL` choose the app (see `.claude/rules/infra.md`).
- Tests must pass in both. Planned exception: admin tests that change data run only in Docker (`docs/TEST_STRATEGY.md`).
- Expected differences in Docker: no "Sign in with Google" button, an empty "Sales over the years" chart
  on the admin dashboard, and the same data after every seed.

## Test data on a shared public site

- Tests use two demo accounts: customer (Jack Howe) and admin (John Doe).
  Take their credentials from `users` in `helpers/users.ts`; never write emails or passwords of real accounts in code.
- `users` reads `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` from the environment
  and throws `Missing env variable ...` if one is empty. Locally they come from `.env` (git-ignored),
  in CI from GitHub Secrets and Variables (see `.claude/rules/infra.md`). The demo credentials are listed in the Toolshop README.
- A new account variable must be added to `.env.example`, `helpers/users.ts`, GitHub settings
  and the `env:` block of the test step in `.github/workflows/playwright.yml`.
- Never submit a wrong password for a real demo account: repeated failures lock it for everyone.
  Negative login tests use a non-existent email, e.g. `not.registered@example.com`.
- Any data on the public site can change: everyone who practises there creates orders, invoices and messages,
  and the admin credentials are public, so products, prices, brands and categories can change too.
  Assert formats (`/^INV-\d+$/`) and relations (every result contains the search query), not specific values.

## Code style

ESLint flat config with `@stylistic`: 2-space indent, single quotes, semicolons.
Type-aware rules `no-floating-promises` and `await-thenable` catch a missing `await`.

## Working in this repo

Tests are written by the owner and by AI agents (Claude Code, Cursor); the same rules apply to everyone.
AI assistants also review pull requests and explain the code.
Unfinished tests in the working tree are work in progress: keep them, don't rewrite or delete them unless asked.
Re-read a file right before editing it; it may have changed since you last saw it.
Merge a pull request only when CI is green.

When a diff adds or changes a test (including when you only review it), check the matching item in
`docs/TEST_STRATEGY.md` (`- [ ]` to `- [x]`) in the same change. Match by what the test asserts, not by file name.
If the test covers an item only partly, leave it unchecked and tell the owner.
If no item matches, ask the owner whether to add one.
