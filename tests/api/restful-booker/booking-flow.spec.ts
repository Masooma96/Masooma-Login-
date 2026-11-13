import { test, expect } from '../../../fixtures/booker';
import bookings from '../../../test-data/api/restful-booker/bookings.json';
import { Booking } from '../../../api/types';

const status = bookings.expectedStatus;

test.describe('API - End-to-end booking lifecycle @api', () => {
  test('create -> read -> update -> patch -> delete -> verify gone @smoke', async ({ bookingClient, authToken }) => {
    const original = bookings.create[0].payload as Booking;
    const patch = bookings.patch[0].changes;

    // 1. Create
    const created = await bookingClient.createBooking(original);
    expect(created.status()).toBe(status.created);
    const { bookingid } = await created.json();

    // 2. Read it back
    const read = await bookingClient.getBooking(bookingid);
    expect(await read.json()).toEqual(original);

    // 3. Full update (PUT)
    const updated = await bookingClient.updateBooking(bookingid, bookings.update.payload as Booking, authToken);
    expect(await updated.json()).toEqual(bookings.update.payload);

    // 4. Partial update (PATCH) keeps the earlier PUT values for untouched fields
    const patched = await bookingClient.patchBooking(bookingid, patch, authToken);
    expect(await patched.json()).toEqual({ ...bookings.update.payload, ...patch });

    // 5. Delete
    const deleted = await bookingClient.deleteBooking(bookingid, authToken);
    expect(deleted.status()).toBe(status.deleted);

    // 6. Verify it is gone
    const gone = await bookingClient.getBooking(bookingid);
    expect(gone.status()).toBe(status.notFound);
  });
});
