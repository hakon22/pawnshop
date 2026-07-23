/**
 * Собирает отображаемое ФИО из частей
 */
export const formatClientFullName = (client: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
}): string => {
  return [client.lastName, client.firstName, client.middleName]
    .filter(part => typeof part === 'string' && part.trim().length)
    .join(' ')
    .trim();
};
