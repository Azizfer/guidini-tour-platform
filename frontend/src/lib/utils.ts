import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 * This is useful for conditional and dynamic class names in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 * @param date The date to format
 * @param locale The locale to use for formatting (defaults to fr-FR)
 */
export function formatDate(date: Date, locale: string = 'fr-FR'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str The string to truncate
 * @param length The maximum length of the string
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
