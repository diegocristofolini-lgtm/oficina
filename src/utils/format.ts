/**
 * Utility functions for formatting hours, currency, and percentages in OficinaPro
 * All hours are standardized to H:MM format (e.g. 1.5h -> 1:30, 0.5h -> 0:30)
 */

/**
 * Formats decimal hours into standard H:MM format (e.g. 1.5 -> "1:30", 0.01 -> "0:01", 0.25 -> "0:15")
 * @param hours Decimal hours to format
 * @param includeSign When true, prefixes positive values with "+" (e.g. "+1:30")
 */
export function formatHours(hours: number, includeSign = false): string {
  if (hours === undefined || hours === null || isNaN(hours) || !isFinite(hours)) {
    return '0:00';
  }

  const isNegative = hours < 0;
  const totalMinutes = Math.round(Math.abs(hours) * 60);

  if (totalMinutes === 0) {
    return '0:00';
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  const formatted = `${h}:${mStr}`;

  if (isNegative) {
    return `-${formatted}`;
  }

  if (includeSign && hours > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Formats decimal hours with explicit sign (+1:30 or -0:45 or 0:00)
 */
export function formatHoursWithSign(hours: number): string {
  return formatHours(hours, true);
}

/**
 * Parses "H:MM", "HH:MM", or decimal string into numeric decimal hours
 * e.g. "1:30" -> 1.5, "0:15" -> 0.25, "2" -> 2.0
 */
export function parseTimeToHours(input: string): number {
  if (!input) return 0;
  const trimmed = input.trim();
  if (trimmed.includes(':')) {
    const isNeg = trimmed.startsWith('-');
    const clean = trimmed.replace(/^[+-]/, '');
    const parts = clean.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const val = h + (m / 60);
    return isNeg ? -val : val;
  }
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? 0 : parsed;
}
