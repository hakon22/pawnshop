import * as yup from 'yup';

import { ItemCategoryFindDto, type ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Предмет залога (чтение) */
export interface PledgeItemFindInterface {
  /** Идентификатор предмета */
  id: number;
  /** Категория предмета */
  category: ItemCategoryFindInterface;
  /** Наименование предмета */
  name: string;
  /** Характеристики по схеме категории */
  characteristics: Record<string, string | number | boolean>;
  /** Оценочная стоимость */
  appraisalAmount: number;
}

export const PledgeItemFindDto = Dto.create<PledgeItemFindInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
  category: {
    label: 'Категория',
    nested: () => ItemCategoryFindDto,
  },
  name: {
    label: 'Наименование',
    schema: yup.string(),
  },
  characteristics: {
    label: 'Характеристики',
    schema: yup
      .object()
      .unknown(true),
  },
  appraisalAmount: {
    label: 'Оценочная стоимость',
    integer: false,
    schema: yup.number(),
  },
});
