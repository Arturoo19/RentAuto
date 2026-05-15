export const AVAILABLE_CITIES = ['Barcelona', 'Madrid'] as const;

export type AvailableCity = (typeof AVAILABLE_CITIES)[number];

export function isAvailableCity(value: string): value is AvailableCity {
  return (AVAILABLE_CITIES as readonly string[]).includes(value);
}
