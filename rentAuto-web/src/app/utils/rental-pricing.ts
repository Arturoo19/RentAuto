/** Must stay aligned with `rentAuto-api/src/rentals/rental-pricing.ts`. */

const PROMO_CODES: Record<string, number> = {
  RENT2026: 0.05,
};

const WEEKEND_SURCHARGE_RATE = 0.15;
const LONG_RENTAL_DISCOUNT_RATE = 0.1;
const LONG_RENTAL_MIN_DAYS = 7;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizePromoCode(raw?: string | null): string {
  return (raw ?? '').trim().toUpperCase();
}

export function getPromoDiscountRate(promoCode?: string | null): number {
  const key = normalizePromoCode(promoCode);
  if (!key) return 0;
  return PROMO_CODES[key] ?? 0;
}

function parseLocalDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

export function countWeekendDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = parseLocalDay(startDate);
  const end = parseLocalDay(endDate);
  let weekendDays = 0;
  const current = new Date(start);
  while (current < end) {
    const day = current.getDay();
    if (day === 0 || day === 6) weekendDays += 1;
    current.setDate(current.getDate() + 1);
  }
  return weekendDays;
}

export function rentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export type RentalPricingBreakdown = {
  days: number;
  pricePerDay: number;
  baseTotal: number;
  weekendDays: number;
  weekendSurcharge: number;
  longRentalDiscount: number;
  prePromoTotal: number;
  promoDiscountRate: number;
  promoDiscountAmount: number;
  finalTotal: number;
};

export function computeRentalPricingBreakdown(
  pricePerDay: number,
  startDate: string,
  endDate: string,
  promoCode?: string | null,
): RentalPricingBreakdown {
  const days = rentalDays(startDate, endDate);
  if (days <= 0 || pricePerDay <= 0) {
    return {
      days: 0,
      pricePerDay: 0,
      baseTotal: 0,
      weekendDays: 0,
      weekendSurcharge: 0,
      longRentalDiscount: 0,
      prePromoTotal: 0,
      promoDiscountRate: 0,
      promoDiscountAmount: 0,
      finalTotal: 0,
    };
  }

  const baseTotal = days * pricePerDay;
  const weekendDays = countWeekendDays(startDate, endDate);
  const weekendSurcharge = weekendDays * pricePerDay * WEEKEND_SURCHARGE_RATE;
  const longRentalDiscount =
    days > LONG_RENTAL_MIN_DAYS ? baseTotal * LONG_RENTAL_DISCOUNT_RATE : 0;
  const prePromoTotal = roundCurrency(baseTotal + weekendSurcharge - longRentalDiscount);
  const promoDiscountRate = getPromoDiscountRate(promoCode);
  const promoDiscountAmount =
    promoDiscountRate > 0 ? roundCurrency(prePromoTotal * promoDiscountRate) : 0;
  const finalTotal = roundCurrency(prePromoTotal - promoDiscountAmount);

  return {
    days,
    pricePerDay,
    baseTotal: roundCurrency(baseTotal),
    weekendDays,
    weekendSurcharge: roundCurrency(weekendSurcharge),
    longRentalDiscount: roundCurrency(longRentalDiscount),
    prePromoTotal,
    promoDiscountRate,
    promoDiscountAmount,
    finalTotal,
  };
}
