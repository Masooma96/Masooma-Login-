import { test, expect } from '../../../fixtures/booker';
import bookings from '../../../test-data/api/restful-booker/bookings.json';
import { Booking } from '../clients/types';
import { validateSchema } from '../../../utils/schema';

const status = bookings.expectedStatus;

test.describe('API - Create booking (POST) @api', () => {
  for (const c of bookings.create) {
    test(`creates ${c.name} @smoke`, async ({ bookingClient, authToken }) => {
      const started = Date.now();
      const response = await bookingClient.createBooking(c.payload as Booking);
      const elapsed = Date.now() - started;

      // Status, performance, contract and data
      expect(response.status()).toBe(status.created);
      expect(elapsed).toBeLessThan(bookings.maxResponseTimeMs);
      const body = await response.json();
      expect(validateSchema('createBooking', body)).toEqual([]);
      expect(body.booking).toEqual(c.payload);

      // The new booking can be read back
      const fetched = await bookingClient.getBooking(body.bookingid);
      expect(fetched.status()).toBe(status.ok);
      expect(await fetched.json()).toEqual(c.payload);

      await bookingClient.deleteBooking(body.bookingid, authToken); // clean up
    });
  }
});

test.describe('API - Read bookings (GET) @api', () => {
  test('lists booking ids @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.getBookingIds();

    expect(response.status()).toBe(status.ok);
    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toHaveProperty('bookingid');
  });

  test('returns a booking that matches the schema', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.getBooking(createdBooking.bookingid);

    expect(response.status()).toBe(status.ok);
    expect(validateSchema('booking', await response.json())).toEqual([]);
  });

  for (const f of bookings.filters) {
    test(`filters bookings ${f.name}`, async ({ bookingClient, createdBooking }) => {
      const value = createdBooking.booking[f.field as 'firstname' | 'lastname'];
      const response = await bookingClient.getBookingIds({ [f.field]: value });

      expect(response.status()).toBe(status.ok);
      const ids: { bookingid: number }[] = await response.json();
      expect(ids.map((i) => i.bookingid)).toContain(createdBooking.bookingid);
    });
  }
});

test.describe('API - Update booking (PUT / PATCH) @api', () => {
  test(`${bookings.update.name}`, async ({ bookingClient, authToken, createdBooking }) => {
    const response = await bookingClient.updateBooking(
      createdBooking.bookingid,
      bookings.update.payload as Booking,
      authToken,
    );

    expect(response.status()).toBe(status.ok);
    expect(await response.json()).toEqual(bookings.update.payload);
  });

  for (const c of bookings.patch) {
    test(`partial update: ${c.name}`, async ({ bookingClient, authToken, createdBooking }) => {
      const response = await bookingClient.patchBooking(
        createdBooking.bookingid,
        c.changes as Partial<Booking>,
        authToken,
      );

      expect(response.status()).toBe(status.ok);
      // Changed fields are updated, the untouched fields keep their value
      expect(await response.json()).toEqual({ ...createdBooking.booking, ...c.changes });
    });
  }
});

test.describe('API - Delete booking (DELETE) @api', () => {
  test('deletes a booking and it can no longer be read @smoke', async ({
    bookingClient,
    authToken,
    createdBooking,
  }) => {
    const deleted = await bookingClient.deleteBooking(createdBooking.bookingid, authToken);
    expect(deleted.status()).toBe(status.deleted);

    const fetched = await bookingClient.getBooking(createdBooking.bookingid);
    expect(fetched.status()).toBe(status.notFound);
  });
});
