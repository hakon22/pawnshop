/**
 * Округляет денежную сумму до копеек
 * @param value - исходное значение
 * @returns значение с двумя знаками после запятой
 */
export const roundMoney = (value: number): number => {
  return Math.round(value * 100) / 100;
};
