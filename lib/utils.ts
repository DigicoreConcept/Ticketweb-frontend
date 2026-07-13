import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventPrice(tiers?: { base_price: number; is_free?: boolean }[] | null) {
  if (!tiers || tiers.length === 0) return "Free";
  const hasFree = tiers.some(t => t.is_free || t.base_price === 0);
  const paidPrices = tiers.filter(t => !t.is_free && t.base_price > 0).map(t => t.base_price);
  
  if (paidPrices.length === 0) {
    return "Free";
  }
  
  const minPrice = Math.min(...paidPrices);
  if (hasFree) {
    return "From Free";
  }
  
  return `From ₦${minPrice.toLocaleString()}`;
}

