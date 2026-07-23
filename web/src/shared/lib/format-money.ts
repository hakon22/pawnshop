const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

export const formatMoney = (amount: number | string): string => {
  return moneyFormatter.format(Number(amount));
};
