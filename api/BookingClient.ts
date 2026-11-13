import { APIRequestContext, APIResponse } from '@playwright/test';
import { Booking } from './types';

/**
 * API "page object": one method per endpoint. Tests never build URLs or headers themselves,
 * so if an endpoint changes there is a single place to fix.
 */
export class BookingClient {
  private static readonly json = { Accept: 'application/json' };

  constructor(private readonly request: APIRequestContext) {}

  private authHeaders(token?: string) {
    return token ? { ...BookingClient.json, Cookie: `token=${token}` } : BookingClient.json;
  }

  authenticate(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async getToken(username: string, password: string): Promise<string> {
    const response = await this.authenticate(username, password);
    const body = await response.json();
    if (!body.token) throw new Error(`Authentication failed: ${JSON.stringify(body)}`);
    return body.token;
  }

  getBookingIds(query?: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/booking', { params: query, headers: BookingClient.json });
  }

  getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { headers: BookingClient.json });
  }

  createBooking(payload: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: payload, headers: BookingClient.json });
  }

  updateBooking(id: number, payload: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: payload, headers: this.authHeaders(token) });
  }

  patchBooking(id: number, changes: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: this.authHeaders(token) });
  }

  deleteBooking(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders(token) });
  }
}
