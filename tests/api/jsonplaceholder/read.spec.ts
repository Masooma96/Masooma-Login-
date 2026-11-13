import { test, expect } from '../../../fixtures/jsonplaceholder';
import data from '../../../test-data/api/jsonplaceholder/data.json';
import { validateSchema } from '../../../utils/schema';

const status = data.expectedStatus;

test.describe('JSONPlaceholder - collections (GET) @api', () => {
  for (const r of data.resources) {
    test(`GET ${r.path} returns ${r.expectedCount} ${r.name} matching the schema @smoke`, async ({ api }) => {
      const started = Date.now();
      const response = await api.get(r.path);
      const elapsed = Date.now() - started;

      expect(response.status()).toBe(status.ok);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(elapsed).toBeLessThan(data.maxResponseTimeMs);

      const items: unknown[] = await response.json();
      expect(items).toHaveLength(r.expectedCount);
      for (const item of items) {
        expect(validateSchema(r.schema, item)).toEqual([]);
      }
    });
  }
});

test.describe('JSONPlaceholder - single resource (GET by id) @api', () => {
  for (const s of data.single) {
    test(`GET ${s.path} returns ${s.name}`, async ({ api }) => {
      const response = await api.get(s.path);

      expect(response.status()).toBe(status.ok);
      const body = await response.json();
      expect(body.id).toBe(s.id);
      expect(validateSchema(s.schema, body)).toEqual([]);
    });
  }
});

test.describe('JSONPlaceholder - missing resources @api @negative', () => {
  for (const n of data.notFound) {
    test(`GET ${n.path} returns 404 (${n.name})`, async ({ api }) => {
      const response = await api.get(n.path);
      expect(response.status()).toBe(status.notFound);
    });
  }
});
