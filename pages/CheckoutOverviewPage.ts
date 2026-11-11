import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Checkout step two: order summary. */
export class CheckoutOverviewPage extends BasePage {
  readonly itemNames: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page, 'checkoutStepTwo');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  private async amountOf(label: Locator): Promise<number> {
    const text = (await label.textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  getItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  getItemTotal(): Promise<number> {
    return this.amountOf(this.itemTotalLabel);
  }

  getTax(): Promise<number> {
    return this.amountOf(this.taxLabel);
  }

  getTotal(): Promise<number> {
    return this.amountOf(this.totalLabel);
  }

  async finish() {
    await this.finishButton.click();
  }
}
