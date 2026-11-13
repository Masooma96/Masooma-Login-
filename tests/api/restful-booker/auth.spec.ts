import { test, expect } from '../../../fixtures/booker';
import auth from '../../../test-data/api/restful-booker/auth.json';
import bookings from '../../../test-data/api/restful-booker/bookings.json';

test.describe('API - Authentication @api', () => {
  test('valid credentials return a token @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.authenticate(auth.valid.username, auth.valid.password);

    expect(response.status()).toBe(bookings.expectedStatus.ok);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  for (const c of auth.invalid) {
    test(`rejects ${c.name} @negative`, async ({ bookingClient }) => {
      const response = await bookingClient.authenticate(c.username, c.password);
      const body = await response.json();

      expect(body.token).toBeUndefined();
      expect(body.reason).toBe(auth.badCredentialsMessage);
    });
  }
});
