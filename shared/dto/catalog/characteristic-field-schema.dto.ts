import * as yup from 'yup';

import { CharacteristicFieldTypeEnum } from '@shared/dto/catalog/enums/characteristic-field-type.enum';
import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Схема поля характеристики предмета по категории */
export interface CharacteristicFieldSchemaInterface {
  /** Идентификатор поля */
  id: number;
  /** Ключ поля в объекте характеристик */
  key: string;
  /** Подпись поля для UI */
  label: string;
  /** Тип значения */
  type: CharacteristicFieldTypeEnum;
  /** Обязательность поля */
  required?: boolean;
}

export const CharacteristicFieldSchemaDto = Dto.create<CharacteristicFieldSchemaInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
  key: {
    label: 'Ключ',
    schema: yup.string(),
  },
  label: {
    label: 'Подпись',
    schema: yup.string(),
  },
  type: {
    label: 'Тип',
    schema: yup
      .mixed<CharacteristicFieldTypeEnum>()
      .oneOf(Object.values(CharacteristicFieldTypeEnum)),
  },
  required: {
    label: 'Обязательность',
    optional: true,
    schema: yup.boolean(),
  },
});
