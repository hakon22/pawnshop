import * as yup from 'yup';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Дата из body/query:
 * - Date как есть
 * - `YYYY-MM-DD` → календарный день (UTC noon, без сдвига суток по TZ)
 * - ISO-строка → Date
 */
export const dateSchema = yup.date().transform((_value, originalValue) => {
  if (originalValue instanceof Date) {
    return originalValue;
  }
  if (typeof originalValue === 'string' && originalValue.trim() !== '') {
    const trimmed = originalValue.trim();
    if (DATE_ONLY_PATTERN.test(trimmed)) {
      return new Date(`${trimmed}T12:00:00.000Z`);
    }
    return new Date(trimmed);
  }
  return undefined;
});
