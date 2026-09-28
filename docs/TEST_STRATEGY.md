# Test Strategy

What this suite covers, in what order, and why.
Coverage grows from the most critical and easiest areas to the less important and harder ones.
Every positive scenario `(+)` is paired with a negative one `(−)` as soon as it makes sense.

Features were mapped from the Toolshop source code
([testsmith-io/practice-software-testing](https://github.com/testsmith-io/practice-software-testing), sprint 5):
catalog, search and filters, product page, cart, checkout with five payment methods, invoices with PDF,
favorites, profile, contact messages, registration, password reset, TOTP 2FA, social login
and the admin area (brands, categories, products, orders, users, messages, reports).

## Prioritization principles

1. **Risk × effort.** First what the shop can't work without and what is cheap to cover.
2. **Positive and negative together.** Each `(+)` scenario gets its `(−)` counterpart.
3. **Infrastructure just in time.** Auth state, API client, test data factory and Docker
   are added right before the phase that needs them.
4. **Respect the shared public site.**
   - Never submit a wrong password for a demo account: repeated failures lock it for everyone.
   - Never change demo users' profiles or passwords; use freshly registered users.
   - Admin tests that create, edit or delete data run only against a local Docker instance.
5. **Assert formats, not values.** Orders, invoices and messages are created by everyone who practises on the site.

## Coverage plan

### Phase 0. Cleanup
- [ ] Invoice table rows are located inside `tbody` only (the header row must not count as data)
- [ ] Assertion messages match what is actually asserted
- [ ] `UserAdminPage` renamed to `AccountPage` to avoid confusion with the admin area

### Phase 1. Authentication and access control
Critical, easy.
- [x] (+) Customer signs in, lands on `/account`, name shown in header
- [x] (+) Admin signs in, lands on `/admin/dashboard`, invoice table is filled
- [x] (−) Unregistered email shows "Invalid email or password"
- [ ] (+) Logout returns the user to the guest state
- [ ] (−) Empty email and password show field validation errors
- [ ] (−) Malformed email shows a validation error
- [ ] (+) Customer sees the account menu: Favorites, Profile, Invoices, Messages
- [ ] (−) Guest opening `/account` is redirected to sign in
- [ ] (−) Customer opening `/admin/dashboard` is denied (role boundary)
- [ ] Infrastructure: setup project with `storageState` for customer and admin

### Phase 2. Catalog and search
Critical, easy, read-only, no login.
- [ ] (+) Home page shows a product grid; each card has a name and a `$0.00`-formatted price
- [ ] (+) Search by name returns only matching products
- [ ] (−) Search with no matches shows a "no results" message
- [ ] (+) Category filter returns products of that category
- [ ] (+) Brand filter returns products of that brand
- [ ] (+) Sorting by name and price, data-driven over all sort options
- [ ] (+) Pagination: page 2 shows different products
- [ ] (−) A price range with no products gives an empty result

### Phase 3. Product page
Critical, easy.
- [ ] (+) Opening a card shows the same name and price on the product page
- [ ] (+) Changing quantity and adding to cart shows a toast and updates the cart badge
- [ ] (−) Quantity can't go below 1; non-numeric input is rejected
- [ ] (+) Related products are shown
- [ ] (−) Guest adding to favorites is asked to sign in
- [ ] (+) Customer adds to favorites and sees the product in Account → Favorites (cleanup via API)

### Phase 4. API layer
High value, medium effort. Tests live in `e2e/api/`.
- [ ] Infrastructure: `APIRequestContext` fixture, `apiURL` in config, token helper
- [ ] (+) `POST /users/login` returns a token; `GET /users/me` returns the right user
- [ ] (−) `GET /users/me` without a token returns 401
- [ ] (−) Login with an unregistered email returns 401
- [ ] (+) `GET /products` with pagination and search, `GET /products/{id}`
- [ ] (−) `GET /products/{unknown id}` returns 404
- [ ] (+) `GET /categories/tree` and `GET /brands`
- [ ] (−) Customer token on an admin endpoint (`GET /users`) returns 403
- [ ] UI tests prepare their data through the API where it makes them faster and more stable

### Phase 5. Cart
Critical, medium effort.
- [ ] (+) Several products in the cart; total equals the sum of price × quantity
- [ ] (+) Changing quantity recalculates the total
- [ ] (+) Removing a product updates the lines and the total
- [ ] (−) Empty cart shows a message and checkout is not available

### Phase 6. Checkout and payment
Most critical, harder.
- [ ] (+) Signed-in customer pays with Cash on Delivery and gets an `INV-…` invoice number
- [ ] (+) Other payment methods, data-driven: Bank Transfer, Credit Card, Buy Now Pay Later, Gift Card
- [ ] (−) Credit card: invalid number, expired date, empty CVV show validation errors
- [ ] (−) Empty required billing address fields block the next step
- [ ] (+) Guest checkout (the API supports `POST /invoices/guest`)
- [ ] (+) The new invoice appears in Account → Invoices and in `GET /invoices`

### Milestone A. Docker in CI
- [ ] `baseURL` and `apiURL` come from environment variables, defaulting to the public site
- [ ] CI starts Toolshop with `docker compose -f docker-compose.prod.yml up`, waits for `/status`, runs against it
- [ ] Push and pull request triggers re-enabled; CI status badge in the README

### Milestone B. Bug hunt on the `with-bugs` version
- [ ] Run the suite against `with-bugs.practicesoftwaretesting.com` and document the bugs it catches in the README

### Phase 7. Registration and profile
Medium priority.
- [ ] Infrastructure: test data factory for unique users; fixture that creates a fresh user via the API
- [ ] (+) New user registers and can sign in
- [ ] (−) Already registered email is rejected
- [ ] (−) Weak password, invalid date of birth, empty required fields show validation errors
- [ ] (+) Profile edit is saved (fresh user only)
- [ ] (+) Password change works; the new password signs in (fresh user only)
- [ ] (−) Password change with a wrong current password is rejected
- [ ] (+) Invoice details page and PDF download

### Phase 8. Contact form
Lower priority.
- [ ] (+) Guest and customer can send a message
- [ ] (−) Missing subject, too short message, invalid email show validation errors
- [ ] (−) Attachment of a wrong type or size is rejected
- [ ] (+) Customer's message appears in Account → Messages

### Phase 9. Admin area
Harder. Data-changing tests run against Docker only.
- [ ] (+) Read-only lists: orders, users, messages
- [ ] (+) Brand and category CRUD through the UI, cleanup via the API
- [ ] (−) Empty name or duplicate slug is rejected
- [ ] (+) A product created by the admin is visible to a customer in the catalog
- [ ] (+) Admin changes an order status; the customer sees it on the invoice
- [ ] (+) Admin replies to a message; the customer sees the reply

### Phase 10. Nice to have
- [ ] Language switch changes menu labels
- [ ] Rentals with rental duration
- [ ] Password reset through MailCatcher (Docker only)
- [ ] TOTP two-factor sign-in
- [ ] Accessibility scans with `@axe-core/playwright` on key pages
- [ ] Visual regression with `toHaveScreenshot` (Docker only, for stable screenshots)
- [ ] Mobile viewport project
- [ ] Claude Skill in `.claude/skills/` that drafts test checklists or Page Object skeletons

## Out of scope

- Social login with Google and GitHub: third-party services outside the app under test.
- Load and performance testing.

## Definition of Done for a phase

- Tests pass in chromium, firefox and webkit.
- `npm run lint` and `npx tsc --noEmit` are clean.
- New Page Objects are registered in `fixtures/pages.ts` and follow the rules in `CLAUDE.md`.
- Covered items are checked off in this document.
