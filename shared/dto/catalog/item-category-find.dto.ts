import * as yup from 'yup';

import { CharacteristicFieldSchemaDto, type CharacteristicFieldSchemaInterface } from '@shared/dto/catalog/characteristic-field-schema.dto';
import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Категория предмета залога (чтение) */
export interface ItemCategoryFindInterface {
  /** Идентификатор категории */
  id: number;
  /** Название категории */
  name: string;
  /** Поля характеристик категории */
  characteristicFields: CharacteristicFieldSchemaInterface[];
}

export const ItemCategoryFindDto = Dto.create<ItemCategoryFindInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
  name: {
    label: 'Название',
    schema: yup.string(),
  },
  characteristicFields: {
    label: 'Поля характеристик',
    nested: () => CharacteristicFieldSchemaDto,
    isArray: true,
  },
});
