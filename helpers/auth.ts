import type { APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

export async function authStorageState(request: APIRequestContext, baseUrl: string, user: { email: string; password: string }) {
  const response = await request.post(`${API_URL}/users/login`, { data: user });
  if (!response.ok()) {
    throw new Error(`Failed to login via API: ${response.status()} ${await response.text()}`);
  }

  const { access_token } = await response.json();
  return {
    cookies: [],
    origins: [{ origin: new URL(baseUrl).origin, localStorage: [{ name: 'auth-token', value: access_token }] }],
  };
}
