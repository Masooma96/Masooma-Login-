import { APIRequestContext, APIResponse } from '@playwright/test';
import { withRetry } from './retry';

/**
 * API "page object" for https://jsonplaceholder.typicode.com.
 * Tests call these methods and never build URLs or headers themselves.
 */
export class JsonPlaceholderClient {
  private static readonly json = { Accept: 'application/json' };

  constructor(private readonly request: APIRequestContext) {}

  /** GET is safe to repeat, so it retries transient failures (network error, 5xx, 429). */
  get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return withRetry(() => this.request.get(path, { params, headers: JsonPlaceholderClient.json }));
  }

  create(path: string, payload: object): Promise<APIResponse> {
    return this.request.post(path, { data: payload, headers: JsonPlaceholderClient.json });
  }

  replace(path: string, payload: object): Promise<APIResponse> {
    return this.request.put(path, { data: payload, headers: JsonPlaceholderClient.json });
  }

  update(path: string, changes: object): Promise<APIResponse> {
    return this.request.patch(path, { data: changes, headers: JsonPlaceholderClient.json });
  }

  remove(path: string): Promise<APIResponse> {
    return this.request.delete(path, { headers: JsonPlaceholderClient.json });
  }
}
