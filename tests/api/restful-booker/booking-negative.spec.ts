import { test, expect } from '../../../fixtures/booker';
import bookings from '../../../test-data/api/restful-booker/bookings.json';
import { Booking } from '../../../api/types';

const status = bookings.expectedStatus;

test.describe('API - Negative and security checks @api @negative', () => {
  test('GET a booking that does not exist returns 404', async ({ bookingClient }) => {
    const response = await bookingClient.getBooking(bookings.nonExistentId);
    expect(response.status()).toBe(status.notFound);
  });

  test('PUT without a token is forbidden', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.bookingid, bookings.update.payload as Booking);
    expect(response.status()).toBe(status.forbidden);
  });

  test('PATCH without a token is forbidden', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.patchBooking(createdBooking.bookingid, bookings.patch[0].changes);
    expect(response.status()).toBe(status.forbidden);
  });

  test('DELETE without a token is forbidden, and the booking is not removed', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.deleteBooking(createdBooking.bookingid);
    expect(response.status()).toBe(status.forbidden);

    const stillThere = await bookingClient.getBooking(createdBooking.bookingid);
    expect(stillThere.status()).toBe(status.ok);
  });

  for (const c of bookings.invalidCreate) {
    test(`POST rejects ${c.name}`, async ({ bookingClient }) => {
      const response = await bookingClient.createBooking(c.payload as Partial<Booking>);
      expect(response.status()).toBe(status.invalidPayload);
    });
  }
});
