import { Page, Locator, expect } from '@playwright/test';
import pages from '../test-data/pages.json';
import { escapeRegExp } from '../utils/helpers';

export type PageKey = keyof typeof pages;

/** Shared behaviour for every page: URL and title come from test-data/pages.json. */
export abstract class BasePage {
  readonly title: Locator;

  constructor(protected readonly page: Page, private readonly pageKey: PageKey) {
    this.title = page.getByTestId('title');
  }

  private get config(): { path: string; title?: string } {
    return pages[this.pageKey];
  }

  get path(): string {
    return this.config.path;
  }

  async open() {
    await this.page.goto(this.path);
  }

  /** Asserts we are on this page: URL matches and (if the page has one) the title text. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(this.path)}$`));
    if (this.config.title) {
      await expect(this.title).toHaveText(this.config.title);
    }
  }
}
