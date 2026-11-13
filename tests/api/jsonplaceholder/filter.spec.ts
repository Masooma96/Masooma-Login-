import { test, expect } from '../../../fixtures/jsonplaceholder';
import data from '../../../test-data/api/jsonplaceholder/data.json';

const status = data.expectedStatus;

test.describe('JSONPlaceholder - query-string filters @api', () => {
  for (const f of data.filters) {
    test(`filters ${f.name}`, async ({ api }) => {
      const response = await api.get(f.path, f.params as unknown as Record<string, string>);

      expect(response.status()).toBe(status.ok);
      const items: Record<string, unknown>[] = await response.json();
      expect(items).toHaveLength(f.expectedCount);
      // Every returned item really belongs to the filter value
      for (const item of items) expect(item[f.field]).toBe(f.value);
    });
  }
});

test.describe('JSONPlaceholder - nested resources @api', () => {
  for (const n of data.nested) {
    test(`GET ${n.path} returns ${n.name}`, async ({ api }) => {
      const response = await api.get(n.path);

      expect(response.status()).toBe(status.ok);
      const items: Record<string, unknown>[] = await response.json();
      expect(items).toHaveLength(n.expectedCount);
      for (const item of items) expect(item[n.field]).toBe(n.value);
    });
  }
});
