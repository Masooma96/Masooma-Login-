import data from '../test-data/products.json';

export interface Product {
  key: string;
  slug: string;
  name: string;
  price: number;
}

export const catalog: Product[] = data.items;

export function getProduct(key: string): Product {
  const found = catalog.find((p) => p.key === key);
  if (!found) throw new Error(`Unknown product key "${key}" - check test-data/products.json`);
  return found;
}

export const getProducts = (keys: string[]): Product[] => keys.map(getProduct);

export const namesOf = (products: Product[]): string[] => products.map((p) => p.name);

export const withoutKeys = (keys: string[], removed: string[]): string[] => keys.filter((k) => !removed.includes(k));

export const sumPrices = (products: Product[]): number =>
  products.reduce((total, p) => total + Math.round(p.price * 100), 0) / 100;

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function sortValues<T extends string | number>(values: T[], direction: string): T[] {
  const asc = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return direction === 'desc' ? asc.reverse() : asc;
}

export const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
