import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path = '/') {
    await this.page.goto(path);
  }

  get currentUrl(): string {
    return this.page.url();
  }
}
