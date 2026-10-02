# CLAUDE.md

Guidance for AI assistants working in this repository.
Keep in sync with `.cursor/rules/project.mdc` (same rules for Cursor).

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
docker-compose.yml    local Toolshop from prebuilt images (see Local Toolshop in Docker)
docker/nginx.conf     nginx config for the `web` service of docker-compose.yml
.github/workflows/    CI against Toolshop in Docker (see CI)
```

## Page Objects

Every Page Object extends `BasePage` and has the same shape:

```ts
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  get locators() {
    return {
      emailInput: () => this.page.getByTestId('email'),
      productCardByName: (name: string) => this.page.getByTestId('product-name').filter({ hasText: name }),
    };
  }

  async userLogin(email: string, password: string) {
    await this.locators.emailInput().fill(email);
    // ...
  }
}
```

- Pages don't declare `page` or a constructor: both come from `BasePage`, which also creates `this.header`.
- Locators live in the `locators` getter as arrow functions, static and parameterized ones together.
  No `readonly` Locator fields. Call them with parentheses: `loginPage.locators.emailInput()`.
- Locator names: buttons and links start with `button` (`buttonSignIn`, `buttonFavorites`),
  inputs end with `Input` (`emailInput`).
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
  No `waitForTimeout`, no reading a value and then comparing it.
- `locator.count()` and `locator.all()` don't wait. Assert that the first element is visible before using them.
- Page-level checks go on the page: `expect(page).toHaveURL('/admin/dashboard')`. Paths are relative to `baseURL`.
- Browser contexts are created and closed per test by Playwright. Close only contexts you create yourself
  with `browser.newContext()`, in the teardown part of a fixture.
- Navigate by clicks, as a user does: through the header, the user menu, account tiles, product cards, links.
  Tests of account pages (favorites, profile, invoices, messages) always reach the page this way,
  so navigation is covered by real page tests. Use `goto` only for the entry point (`/`) and in setup.
  If a `goto` shortcut looks tempting (the click path is long or flaky), don't apply it:
  suggest it to the owner, and only after the test is written.

## Signed-in tests

- The sign-in form is tested by `e2e/signIn.test.ts`. Other tests that need a signed-in user log in via the API:
  `loginViaApi(page, request, users.customer.email, users.customer.password)` from `helpers/auth.ts`. It opens `/` and puts the token
  into `localStorage['auth-token']` once; the test then navigates wherever it needs.
- Put the token once. Never re-inject it on every navigation (no `addInitScript` for auth):
  the app must keep the session itself, and a test must fail if it loses it.
- API tokens live 5 minutes (`expires_in: 300`). Each test gets its own fresh token;
  never save one token for the whole run.
- Sign-out tests use their own token and never share it with other tests.
- Planned: once many tests need a signed-in user, switch to a `storageState` fixture (`test.use({ authUser })`)
  built on the same API login, which also removes the extra `goto('/')`.

## Locators

- The app marks elements with `data-test`. The config sets `testIdAttribute: 'data-test'`,
  so `getByTestId('email')` matches `data-test="email"`.
- Preference order: `getByTestId`, then `getByRole`, then `locator(css)` only when nothing else exists.
- Table rows: search inside `tbody`. `getByRole('row')` on the whole table also matches the header row.

## Timeouts

`actionTimeout` is 10 s (config), `expect` 5 s and the test 30 s (defaults).
Don't add visibility assertions before actions just to fail faster; `actionTimeout` already covers that.

## Test data on a shared public site

- Tests use two demo accounts: customer (Jack Howe) and admin (John Doe).
  Take their credentials from `users` in `helpers/users.ts`; never write emails or passwords of real accounts in code.
- `users` reads `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` from the environment
  and throws `Missing env variable ...` if one is empty. Locally they come from `.env` (git-ignored),
  in CI from GitHub (see CI). The demo credentials are listed in the Toolshop README.
- Never submit a wrong password for a real demo account: repeated failures lock it for everyone.
  Negative login tests use a non-existent email, e.g. `not.registered@example.com`.
- Orders and invoices are created by everyone who practises on the site.
  Assert formats (`/^INV-\d+$/`), not specific values.

## Local Toolshop in Docker

`docker-compose.yml` runs Toolshop locally: UI on http://localhost:4200, API on http://localhost:8091.

```bash
docker compose up -d                                                    # start; the UI compiles for a few minutes
docker compose exec -T laravel-api php artisan migrate:fresh --seed     # create and fill the database, also a full reset
docker compose down                                                     # stop and remove the containers
BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test   # run the suite against it
```

- `BASE_URL` (UI) and `API_URL` (used by `loginViaApi`) choose the app under test. Empty or missing means
  the public site. Values set in the shell win over `.env`, because dotenv doesn't override existing variables.
- The database is empty after `up`: run the seed command once MariaDB is up. The seed creates the same demo accounts.
- The `web` service is plain `nginx` with `docker/nginx.conf`: the Toolshop `web` image exists only for arm64,
  the `api` and `ui` images only for amd64 (`platform: linux/amd64`, emulated on Apple Silicon).

Differences from the public site, all expected:
- No "Sign in with Google" button: the UI runs `ng serve` (development build), and the button is shown
  only when `environment.production` is true. Social login is out of scope anyway.
- The "Sales over the years" chart on the admin dashboard is empty. The report counts only `COMPLETED` invoices;
  the seed creates all invoices as `AWAITING_FULFILLMENT`, and on the public site a cron job (`order:update`,
  every 10 minutes) moves them on. The `cron` service is left out on purpose: data must not change on a timer,
  otherwise the dashboard's "awaiting fulfillment" table empties out mid-run. A test that needs completed orders
  runs `php artisan order:update` in its own setup.
- Data is the same after every seed: nobody else creates orders or invoices.

## CI

`.github/workflows/playwright.yml` runs on every pull request, on push to `main` and manually.
It starts Toolshop from `docker-compose.yml` on the runner, seeds the database, waits for the API (`/status`)
and the UI, then runs the suite with `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`.
On failure it prints the container logs. Merge a pull request only when CI is green.

CI never runs against the public site: it shows a Cloudflare bot check to GitHub-hosted runners.
Do not try to bypass it.

Credentials reach the tests through the `env:` block of the test step: passwords are repository Secrets
(`secrets.CUSTOMER_PASSWORD`, `secrets.ADMIN_PASSWORD`), emails are repository Variables (`vars.CUSTOMER_EMAIL`,
`vars.ADMIN_EMAIL`). A new variable must be added to `.env.example`, `helpers/users.ts`, GitHub settings and `env:`.

## Code style

ESLint flat config with `@stylistic`: 2-space indent, single quotes, semicolons.
Type-aware rules `no-floating-promises` and `await-thenable` catch a missing `await`.

## Working in this repo

The owner writes the tests and uses AI assistants for review and explanations.
Unfinished tests in the working tree are work in progress: keep them, don't rewrite or delete them unless asked.
Re-read a file right before editing it; it may have changed since you last saw it.

When a diff adds or changes a test (including when you only review it), check the matching item in
`docs/TEST_STRATEGY.md` (`- [ ]` to `- [x]`) in the same change. Match by what the test asserts, not by file name.
If the test covers an item only partly, leave it unchecked and tell the owner.
If no item matches, ask the owner whether to add one.
