# Playwright Toolshop E2E

End-to-end tests in Playwright and TypeScript for [Practice Software Testing](https://practicesoftwaretesting.com) ("Toolshop"),
a public demo e-commerce app built for test-automation practice.

The goal is a small, readable and stable suite that grows by risk:
the most critical and easiest flows first, every positive scenario paired with a negative one.
The coverage plan and progress are in [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md).

## Tech stack

- [Playwright Test](https://playwright.dev) with TypeScript, in Chromium, Firefox and WebKit
- ESLint with type-aware rules and `@stylistic` formatting
- dotenv for local configuration
- GitHub Actions for CI

## Approach

- **Page Object Model.** Every page extends `BasePage`; locators live in a `locators` getter,
  and parts shared by many pages (the header) are components. Page Objects hold no assertions.
- **Custom fixtures.** Tests receive ready Page Objects as parameters instead of creating them.
- **Sign in through the API.** Only the sign-in tests use the form; other tests get a fresh token from the API,
  which keeps them fast and independent.
- **Web-first assertions** with a message on every `expect`, no fixed waits.
- **Safe on a shared public site.** No wrong passwords for real demo accounts (that would lock them for everyone),
  no changes to demo users, and assertions check formats rather than data other people create.
- **No credentials in code.** Accounts come from environment variables: `.env` locally,
  GitHub Secrets and Variables in CI.
- **A missing `await` fails the lint.** The `no-floating-promises` and `await-thenable` rules catch it.

## Project structure

```
e2e/                  test specs
pages/                Page Objects, all extending pages/basePage.ts
components/           parts shown on many pages (header)
fixtures/pages.ts     custom fixtures that provide the Page Objects
helpers/              API sign-in and test accounts from environment variables
docs/                 test strategy
playwright.config.ts  base URL, test id attribute, timeouts, browsers
```

## Getting started

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/Livecounter86/playwright-toolshop-e2e.git
cd playwright-toolshop-e2e
npm ci
npx playwright install --with-deps
cp .env.example .env
```

Fill in `.env` with the demo accounts listed in the
[Toolshop README](https://github.com/testsmith-io/practice-software-testing):
a customer and the admin.

## Running tests

```bash
npm test                                  # all tests in all browsers
npx playwright test --project=chromium    # one browser
npx playwright test e2e/signIn.test.ts    # one file
npx playwright show-report                # HTML report of the last run
npm run lint                              # ESLint
npx tsc --noEmit                          # type check
```

## CI

The GitHub Actions workflow runs on manual trigger only: the public site shows a Cloudflare bot check
to GitHub-hosted runners. The next step is to start Toolshop in Docker inside CI, run the suite against it
and turn on push and pull request triggers.
