import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Order confirmation page. */
export class CheckoutCompletePage extends BasePage {
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page, 'checkoutComplete');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }
}
