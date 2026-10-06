---
paths:
  - docker-compose.yml
  - docker/**
  - .github/**
  - .env.example
---

# Docker and CI

Rules for the local Toolshop in Docker and for CI. They load when you work with the files listed above;
the general rules are in `CLAUDE.md`.
Keep in sync with `.cursor/rules/infra.mdc` (same rules for Cursor).

## Local Toolshop in Docker

`docker-compose.yml` runs Toolshop locally: UI on http://localhost:4200, API on http://localhost:8091.

```bash
docker compose up -d                                                    # start; the UI compiles for a few minutes
docker compose exec -T laravel-api php artisan migrate:fresh --seed     # create and fill the database, also a full reset
docker compose down                                                     # stop and remove the containers
BASE_URL=http://localhost:4200 API_URL=http://localhost:8091 npx playwright test   # run the suite against it
```

- `BASE_URL` (UI) and `API_URL` (used by the API login in `helpers/auth.ts`) choose the app under test. Empty or missing means
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
  otherwise the dashboard's "awaiting fulfillment" table empties out mid-run. In Docker, completed orders appear
  only after `php artisan order:update`. How a test that needs them prepares its data in both environments
  is decided when such a test is written.
- Data is the same after every seed: nobody else creates orders or invoices.

## CI

`.github/workflows/playwright.yml` runs on every pull request, on push to `main` and manually.
It starts Toolshop from `docker-compose.yml` on the runner, seeds the database, waits for the API (`/status`)
and the UI, then runs the suite with `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`.
On failure it prints the container logs.

CI uses Docker because the public site shows a Cloudflare bot check to GitHub-hosted runners.
Do not try to bypass it.

Credentials reach the tests through the `env:` block of the test step: passwords are repository Secrets
(`secrets.CUSTOMER_PASSWORD`, `secrets.ADMIN_PASSWORD`), emails are repository Variables (`vars.CUSTOMER_EMAIL`,
`vars.ADMIN_EMAIL`).

Claude reviews pull requests:
- `.github/workflows/claude-review.yml` reviews a pull request against `CLAUDE.md` and `.claude/rules/` when it is opened,
  marked ready for review or updated; drafts are skipped. It only leaves comments and commits nothing.
  With no findings it posts nothing: the green check of the job means the review passed.
- `.github/workflows/claude.yml` answers `@claude` in issue and pull request comments,
  only when the comment is written by the repository owner (`author_association == 'OWNER'`).
- Both use the Claude subscription token from the `CLAUDE_CODE_OAUTH_TOKEN` repository secret.
