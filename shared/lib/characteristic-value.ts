import { CharacteristicFieldTypeEnum } from '@shared/dto/catalog/enums/characteristic-field-type.enum';

export class CharacteristicValueError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'CharacteristicValueError';
  }
}

/**
 * Сериализует типизированное значение характеристики в строку для БД
 * @param type - тип поля категории
 * @param value - значение с клиента/формы
 * @returns строковое представление
 */
export const serializeCharacteristicValue = (type: CharacteristicFieldTypeEnum, value: unknown): string => {
  if (type === CharacteristicFieldTypeEnum.BOOLEAN) {
    if (typeof value !== 'boolean') {
      throw new CharacteristicValueError('Ожидается boolean');
    }
    return value ? 'true' : 'false';
  }

  if (type === CharacteristicFieldTypeEnum.NUMBER) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new CharacteristicValueError('Ожидается конечное число');
    }
    return String(value);
  }

  if (typeof value !== 'string') {
    throw new CharacteristicValueError('Ожидается строка');
  }
  return value;
};

/**
 * Десериализует строку из БД в типизированное значение
 * @param type - тип поля категории
 * @param value - сырое значение из БД
 * @returns string | number | boolean
 */
export const deserializeCharacteristicValue = (type: CharacteristicFieldTypeEnum, value: string): string | number | boolean => {
  if (type === CharacteristicFieldTypeEnum.BOOLEAN) {
    return value === 'true';
  }
  if (type === CharacteristicFieldTypeEnum.NUMBER) {
    return Number(value);
  }
  return value;
};
