
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKRW(value: number): string {
  if (Math.abs(value) >= 1e8) return (value / 1e8).toFixed(1) + '억';
  if (Math.abs(value) >= 1e4) return (value / 1e4).toFixed(0) + '만';
  return value.toLocaleString('ko-KR');
}

export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(1) + '%';
}

export function formatCurrency(value: number, market: 'KR' | 'US'): string {
  if (market === 'US') return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '₩' + value.toLocaleString('ko-KR');
}
