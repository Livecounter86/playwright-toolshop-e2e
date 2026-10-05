import type { APIRequestContext, Page } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

export async function loginViaApi(page: Page, request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_URL}/users/login`, { data: { email, password } });
  if (!response.ok()) {
    throw new Error(`Failed to login via API: ${response.status()} ${await response.text()}`);
  }

  const { access_token } = await response.json();
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('auth-token', token);
  }, access_token);
  // The page was rendered before the token existed, so the header still shows a guest.
  // Reload once so the app reads the token and shows the signed-in header (user menu).
  await page.reload();
}
