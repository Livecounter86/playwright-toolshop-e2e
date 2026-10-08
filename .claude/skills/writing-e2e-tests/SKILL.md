---
name: writing-e2e-tests
description: Use when asked to write, add or automate a Playwright test in this repository, to cover an item from docs/TEST_STRATEGY.md or pick the next uncovered scenario, or when a test needs new locators or Page Objects.
---

# Writing E2E tests

## Overview

Turns one item of `docs/TEST_STRATEGY.md` into a finished, verified test, without help from the owner.
Simplicity and readability come first: the test reads as a user story without opening a Page Object.
Locators say **what** an element is (its `data-test`, its role and name, its content), never **where** it sits
in the DOM, so a layout change doesn't break them.

`CLAUDE.md` holds the conventions: Page Object shape, naming, waiting, signed-in tests, test data.
This skill doesn't repeat them. Read it first and follow it.

## Workflow

1. **Pick the item.** Take the item the user named. Without one, take the first `- [ ]` in `docs/TEST_STRATEGY.md`
   from the top. Skip Infrastructure and Milestone items, and items of a phase whose Infrastructure item is still
   unchecked: those need the owner's decisions.
2. **Read the context.** `CLAUDE.md`, the tests of the same area in `e2e/`, `pages/`, `components/headerComponent.ts`,
   `fixtures/pages.ts`, `helpers/`. Uncommitted changes in the working tree are the owner's work in progress: keep them.
3. **Branch.** On `main`: `git pull --ff-only`, then `git switch -c <short-item-name>`. On another branch, stay there.
4. **Toolshop in Docker.** Check `curl -sf http://localhost:4200` and `curl -sf http://localhost:8091/status`.
   If one fails, start and seed it with the commands in `.claude/rules/infra.md` and wait until both answer.
   The steps below need `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`, in `.env` or in the shell.
5. **Explore the flow.** Walk the user's path by clicks, from `/` through the header, the user menu, tiles or links,
   to every page the test checks. Inspect each page:
   ```bash
   node .claude/skills/writing-e2e-tests/inspect-page.mjs /contact --as customer
   node .claude/skills/writing-e2e-tests/inspect-page.mjs /contact --fill message=short --click contact-submit
   node .claude/skills/writing-e2e-tests/inspect-page.mjs /account/messages --as customer --html 'tbody tr'
   ```
   It prints the ARIA tree (roles, names, link URLs) and every `data-test` with its text; `(hidden)` marks elements
   not shown yet, such as closed menus. `--fill` and `--click` run in the order given, to reach states after an action;
   `--html` prints the markup of a block without `data-test`. Take exact texts from this output. A rule the page
   doesn't show (a length limit, a server message) is in the Toolshop source: `testsmith-io/practice-software-testing`
   on GitHub, folder `sprint5`. If the app doesn't do what the item says, stop and report: it is a bug or a wrong item.
6. **Choose the data** by the test-data rules of `CLAUDE.md`. Generate input with `faker` and record it in an annotation.
   Add `Date.now()` to a text that must not match leftovers of earlier runs.
7. **Add locators** by the rules below, to the class of the app section. Register a new class in `fixtures/pages.ts`.
8. **Write the test** in the shape of the example below. Use `test.step` only for several actors or a long story.
   Comment only what the code can't show: why a wait is needed, why the data is unique.
9. **Verify.** Run every check, in order:

   | Check | Command |
   |---|---|
   | Types and style | `npx tsc --noEmit && npm run lint` |
   | Passes in Docker | `npx playwright test <file> -g "<title>" --project=chromium` |
   | Passes on the public site (not for Docker-only tests) | `BASE_URL= API_URL= npx playwright test <file> -g "<title>" --project=chromium` |
   | Stable | `npx playwright test <file> -g "<title>" --repeat-each=5` (all three browsers) |
   | Can fail | change one expected value, run, see it fail with its assertion message, revert |

   On a failure, read the error and `error-context.md` in `test-results/` (or rerun with `--trace on`) and fix the cause.
   After three failed fixes, stop and report what you saw.
10. **Check off the item** in `docs/TEST_STRATEGY.md` if the test covers all of it. Otherwise leave it and say what is missing.
11. **Report:** the item, the changed files, each new locator and what makes it stable, the result of every check,
    anything skipped. Commit or open a pull request only when asked.

## Locator rules

Take the first option that exists:

| # | Use | Example |
|---|---|---|
| 1 | A locator already in `pages/` or `components/` | `homePage.header.locators.buttonContact()` |
| 2 | `getByTestId` | `getByTestId('contact-submit')` |
| 3 | `getByRole` with a name | `getByRole('link', { name: 'Details' })` |
| 4 | CSS on a meaningful attribute, with a comment why | ``locator(`a[href="/account/messages/${id}"]`)`` |

- **One of many** (a row, a card, a reply): find the container by something only it has, then search inside it:
  ``tableRows().filter({ has: getByTestId(`message-details-${id}`) })``, `filter({ hasText: uniqueText })`.
- **A table cell:** `cellInColumn(row, 'Status')` from `helpers/table.ts`. The column position comes from the header.
- **A `data-test` with an id in it:** a parameterized locator, or a regex of its format (`productCards` in `pages/homePage.ts`).
- **Look-alike blocks without `data-test`:** tell them apart by meaningful content and comment it
  (`initMessageText` and `replyText` in `pages/adminMessagesPage.ts`).
- `first()` and `nth()` only for "at least one" checks, never to pick a specific element.
- Never: chains of classes or structure (`.card > div:nth-child(2)`), positional XPath, generated ids, `_ngcontent-*`,
  Bootstrap utility classes (`btn-primary`, `mr-1`).

## Example

A one-actor test. For two users (customer and admin) see `e2e/clientCommunication.test.ts`.

```ts
import { test, expect } from '../fixtures/pages';
import { faker } from '@faker-js/faker';

test.describe('Contact form', () => {
  test.use({ authUser: 'customer' });

  test('customer sends a message', async ({ homePage, contactPage }) => {
    // The form takes 50 to 250 characters
    const message = faker.lorem.sentences(9).slice(0, 250).trim();
    test.info().annotations.push({ type: 'Message', description: message });

    await homePage.navigate();
    await homePage.header.locators.buttonContact().click();
    const subject = await contactPage.selectRandomSubject();
    test.info().annotations.push({ type: 'Subject', description: subject });
    await contactPage.locators.messageInput().fill(message);
    await contactPage.locators.buttonSend().click();
    await expect(contactPage.locators.messageSentConfirmation(), 'Message sent confirmation should be shown').toBeVisible();
  });
});
```

## Red flags

| Thought | Reality |
|---|---|
| "`goto('/account/messages')` is faster" | Clicks are how the suite tests navigation. Suggest the shortcut to the owner instead. |
| "A short `waitForTimeout` fixes it" | Wait for a condition: a response, or content that only the new state has. |
| "Loosen the assertion, it's close enough" | A green test that checks less hides the bug. Find the cause. |
| "`nth(2)` is the row I need" | Find the row by what it contains. |
| "I'll keep the locator in a const" | Call it where it is used. |
| "I'll assert the API response" | Wait for it, then assert the page. |
| "The item is mostly covered, I'll check it off" | Check off only what the test fully asserts. |
| "It passed once, done" | Run `--repeat-each=5` in all three browsers and see it fail once. |
