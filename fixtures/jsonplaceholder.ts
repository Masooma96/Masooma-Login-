import { test as base, expect } from '@playwright/test';
import { JsonPlaceholderClient } from '../api/JsonPlaceholderClient';

type Fixtures = {
  api: JsonPlaceholderClient;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => use(new JsonPlaceholderClient(request)),
});

export { expect };
