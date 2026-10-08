// Prints what a test can locate on a page of the local Toolshop:
// the ARIA tree (roles, names, link URLs) and every data-test element.
//
//   node .claude/skills/writing-e2e-tests/inspect-page.mjs <path> [--as customer|admin]
//        [--fill <data-test>=<text>]... [--click <data-test>]... [--html <css>]
//
// --fill and --click run in the order given, to reach states that appear only after an action.
// Plain JavaScript: Node 20 can't run TypeScript, so the API login of helpers/auth.ts is repeated here.
import { parseArgs } from 'node:util';
import { chromium, selectors } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function fail(message) {
  console.error(message);
  process.exit(1);
}

const { values, positionals, tokens } = parseArgs({
  allowPositionals: true,
  tokens: true,
  options: {
    as: { type: 'string' },
    fill: { type: 'string', multiple: true },
    click: { type: 'string', multiple: true },
    html: { type: 'string' },
  },
});
const [path] = positionals;
if (!path) fail('Usage: inspect-page.mjs <path> [--as customer|admin] [--fill <data-test>=<text>]... [--click <data-test>]... [--html <css>]');

// The public site is behind a Cloudflare bot check, and it must not be bypassed
const baseURL = process.env.BASE_URL;
if (!baseURL?.startsWith('http://localhost')) {
  fail('BASE_URL must point to Toolshop in Docker (http://localhost:4200). Start it: see .claude/rules/infra.md');
}
const apiURL = process.env.API_URL || 'http://localhost:8091';

async function storageState(role) {
  if (!role) return undefined;
  const prefix = { customer: 'CUSTOMER', admin: 'ADMIN' }[role];
  if (!prefix) fail(`--as takes customer or admin, got "${role}"`);

  const response = await fetch(`${apiURL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env[`${prefix}_EMAIL`], password: process.env[`${prefix}_PASSWORD`] }),
  });
  if (!response.ok) fail(`API login as ${role} failed: ${response.status}`);

  const { access_token } = await response.json();
  return {
    cookies: [],
    origins: [{ origin: new URL(baseURL).origin, localStorage: [{ name: 'auth-token', value: access_token }] }],
  };
}

selectors.setTestIdAttribute('data-test');
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ baseURL, storageState: await storageState(values.as) });
  const page = await context.newPage();
  await page.goto(path, { waitUntil: 'networkidle' });

  for (const token of tokens.filter(t => t.kind === 'option' && ['fill', 'click'].includes(t.name))) {
    if (token.name === 'fill') {
      const [testId, ...text] = token.value.split('=');
      await page.getByTestId(testId).fill(text.join('='));
    }
    else {
      await page.getByTestId(token.value).click();
      await page.waitForLoadState('networkidle');
    }
  }

  console.log(`# ${page.url()}\n\n## ARIA tree\n`);
  console.log(await page.locator('body').ariaSnapshot());

  console.log('\n## data-test elements\n');
  const elements = await page.locator('[data-test]').evaluateAll(els => els.map(el => ({
    testId: el.getAttribute('data-test'),
    tag: el.localName,
    text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
    hidden: !el.checkVisibility(),
  })));
  for (const { testId, tag, text, hidden } of elements) {
    console.log(`${testId}  <${tag}>${hidden ? '  (hidden)' : ''}  ${text}`);
  }

  if (values.html) {
    console.log(`\n## HTML of the first "${values.html}"\n`);
    console.log(await page.locator(values.html).first().evaluate(el => el.outerHTML));
  }
}
finally {
  await browser.close();
}
