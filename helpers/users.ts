function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable ${name}. Copy .env.example to .env and fill in the values.`);
  }
  return value;
}

export const users = {
  customer: {
    email: requireEnv('CUSTOMER_EMAIL'),
    password: requireEnv('CUSTOMER_PASSWORD'),
  },
  admin: {
    email: requireEnv('ADMIN_EMAIL'),
    password: requireEnv('ADMIN_PASSWORD'),
  },
};
