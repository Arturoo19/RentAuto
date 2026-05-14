/** Must stay aligned with `rentAuto-web/src/app/utils/rental-pricing.ts`. */

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
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Same rules as the reservation UI: base + weekend surcharge − long-rental discount − promo % of that subtotal.
 */
export function computeRentalTotalEur(
  pricePerDay: number,
  startDate: string,
  endDate: string,
  promoCode?: string | null,
): number {
  const days = rentalDays(startDate, endDate);
  if (days <= 0 || pricePerDay <= 0) return 0;

  const baseTotal = days * pricePerDay;
  const weekendDays = countWeekendDays(startDate, endDate);
  const weekendSurcharge = weekendDays * pricePerDay * WEEKEND_SURCHARGE_RATE;
  const longRentalDiscount =
    days > LONG_RENTAL_MIN_DAYS ? baseTotal * LONG_RENTAL_DISCOUNT_RATE : 0;
  const prePromo = baseTotal + weekendSurcharge - longRentalDiscount;
  const promoRate = getPromoDiscountRate(promoCode);
  const promoDiscount = promoRate > 0 ? prePromo * promoRate : 0;
  return roundCurrency(prePromo - promoDiscount);
}
