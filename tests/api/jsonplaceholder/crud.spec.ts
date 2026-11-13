import { test, expect } from '../../../fixtures/jsonplaceholder';
import data from '../../../test-data/api/jsonplaceholder/data.json';

// JSONPlaceholder fakes write operations: it answers like a real API but does not store anything.
// So these tests check the response contract (status code and body), not persistence.
const status = data.expectedStatus;
const { crud } = data;

test.describe('JSONPlaceholder - create (POST) @api', () => {
  for (const c of crud.create) {
    test(`creates a post: ${c.name} @smoke`, async ({ api }) => {
      const response = await api.create(crud.postsPath, c.payload);

      expect(response.status()).toBe(status.created);
      const body = await response.json();
      expect(body).toMatchObject(c.payload);
      expect(body.id).toBe(crud.newPostId);
    });
  }
});

test.describe('JSONPlaceholder - update (PUT / PATCH) @api', () => {
  test('replaces a post with PUT', async ({ api }) => {
    const response = await api.replace(`${crud.postsPath}/${crud.update.id}`, crud.update.payload);

    expect(response.status()).toBe(status.ok);
    expect(await response.json()).toEqual(crud.update.payload);
  });

  for (const p of crud.patch) {
    test(`partially updates a post with PATCH: ${p.name}`, async ({ api }) => {
      const response = await api.update(`${crud.postsPath}/${p.id}`, p.changes);

      expect(response.status()).toBe(status.ok);
      const body = await response.json();
      expect(body).toMatchObject(p.changes); // changed field is returned
      expect(body.id).toBe(p.id); // the rest of the post is kept
      expect(body.userId).toBeDefined();
    });
  }
});

test.describe('JSONPlaceholder - delete (DELETE) @api', () => {
  test('deletes a post', async ({ api }) => {
    const response = await api.remove(`${crud.postsPath}/${crud.delete.id}`);

    expect(response.status()).toBe(status.ok);
    expect(await response.json()).toEqual({});
  });
});
